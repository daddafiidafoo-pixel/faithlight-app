import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Heart, Plus, Check } from 'lucide-react';

export default function PrayerGroupDetail() {
  const [group, setGroup] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [showAddPrayer, setShowAddPrayer] = useState(false);
  const [prayerData, setPrayerData] = useState({ title: '', description: '' });

  const groupId = new URLSearchParams(window.location.search).get('id');

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setIsLoggedIn(!!currentUser);
      setUser(currentUser);

      if (groupId) {
        const groupData = await base44.entities.PrayerGroup.filter({ id: groupId });
        if (groupData && groupData.length > 0) {
          setGroup(groupData[0]);
        }

        const groupRequests = await base44.entities.PrayerGroupRequest.filter({
          group_id: groupId,
        }, '-created_at', 50);
        setRequests(groupRequests || []);

        if (currentUser) {
          const member = await base44.entities.PrayerGroupMember.filter({
            group_id: groupId,
            user_email: currentUser.email,
          });
          setIsMember(member && member.length > 0);
        }
      }
    } catch (error) {
      console.error('Error loading group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      await base44.functions.invoke('joinPrayerGroup', { group_id: groupId });
      setIsMember(true);
      await loadGroupData();
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    }
  };

  const handleAddPrayer = async (e) => {
    e.preventDefault();
    if (!prayerData.title.trim()) {
      alert('Please enter a prayer title');
      return;
    }

    try {
      await base44.functions.invoke('addPrayerToGroup', {
        group_id: groupId,
        title: prayerData.title,
        description: prayerData.description,
      });
      setPrayerData({ title: '', description: '' });
      setShowAddPrayer(false);
      await loadGroupData();
    } catch (error) {
      console.error('Error adding prayer:', error);
      alert('Failed to add prayer request');
    }
  };

  const handlePrayFor = async (requestId) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (request) {
        await base44.entities.PrayerGroupRequest.update(requestId, {
          prayer_count: (request.prayer_count || 0) + 1,
        });
        setRequests(requests.map(r =>
          r.id === requestId ? { ...r, prayer_count: (r.prayer_count || 0) + 1 } : r
        ));
      }
    } catch (error) {
      console.error('Error updating prayer count:', error);
    }
  };

  if (loading) return <div className="text-center py-12">Loading group...</div>;
  if (!group) return <div className="text-center py-12">Group not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
          <p className="text-gray-600">{group.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            {group.member_count || 1} members • {group.is_public ? 'Public' : 'Private'}
          </p>
        </div>

        {/* Join Button */}
        {isLoggedIn && !isMember && (
          <Card className="p-4 mb-8 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">Join this prayer group to participate</p>
              <Button onClick={handleJoin} className="bg-blue-600 hover:bg-blue-700">
                Join Group
              </Button>
            </div>
          </Card>
        )}

        {/* Add Prayer Form */}
        {isMember && !showAddPrayer && (
          <Button
            onClick={() => setShowAddPrayer(true)}
            className="mb-8 bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Prayer Request
          </Button>
        )}

        {showAddPrayer && isMember && (
          <Card className="p-6 mb-8">
            <form onSubmit={handleAddPrayer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prayer Title</label>
                <Input
                  placeholder="What should we pray for?"
                  value={prayerData.title}
                  onChange={(e) => setPrayerData({ ...prayerData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Details (optional)</label>
                <Textarea
                  placeholder="Share more details about your prayer request..."
                  value={prayerData.description}
                  onChange={(e) => setPrayerData({ ...prayerData, description: e.target.value })}
                  className="h-20"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-purple-600">Post Request</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddPrayer(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Prayer Requests */}
        <h2 className="text-xl font-semibold mb-4">Prayer Requests</h2>
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      By {request.user_email.split('@')[0]}
                    </p>
                  </div>
                  {request.is_answered && (
                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <Check className="w-3 h-3" />
                      Answered
                    </span>
                  )}
                </div>

                {request.description && (
                  <p className="text-gray-700 text-sm mb-3">{request.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {request.prayer_count || 0} people praying
                  </span>
                  {isMember && (
                    <Button
                      onClick={() => handlePrayFor(request.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Join Prayer
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No prayer requests yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}