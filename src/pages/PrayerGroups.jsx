import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, Lock, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CATEGORIES = ['general', 'healing', 'families', 'work', 'faith', 'missions'];

export default function PrayerGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false,
    category: 'general',
  });

  useEffect(() => {
    checkAuthAndLoadGroups();
  }, []);

  const checkAuthAndLoadGroups = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setIsLoggedIn(!!currentUser);
      setUser(currentUser);

      const allGroups = await base44.entities.PrayerGroup.filter({}, '-created_at', 50);
      setGroups(allGroups || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a group name');
      return;
    }

    try {
      setLoading(true);
      const newGroup = await base44.entities.PrayerGroup.create({
        name: formData.name,
        description: formData.description,
        creator_email: user.email,
        is_public: formData.is_public,
        category: formData.category,
        created_at: new Date().toISOString(),
        member_count: 1,
      });

      setGroups([newGroup, ...groups]);
      setFormData({ name: '', description: '', is_public: false, category: 'general' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">🙏 Prayer Groups</h1>
            <p className="text-gray-600">Connect with others in prayer circles</p>
          </div>
          {isLoggedIn && (
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          )}
        </div>

        {/* Create Group Form */}
        {showCreateForm && isLoggedIn && (
          <Card className="p-6 mb-8">
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name</label>
                <Input
                  placeholder="e.g., Faith Warriors Prayer Circle"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  placeholder="What is this prayer group about?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="capitalize">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 pt-8 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  />
                  <span className="text-sm font-medium">Make Public</span>
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-purple-600">Create</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Groups List */}
        {loading ? (
          <div className="text-center py-12">Loading groups...</div>
        ) : groups.length > 0 ? (
          <div className="grid gap-4">
            {groups.map((group) => (
              <Link key={group.id} to={createPageUrl('PrayerGroupDetail') + `?id=${group.id}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{group.name}</h3>
                        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          group.is_public
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {group.is_public ? (
                            <>
                              <Globe className="w-3 h-3" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              Private
                            </>
                          )}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full capitalize">
                          {group.category}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {group.member_count || 1} members
                        </span>
                      </div>
                    </div>
                    {isLoggedIn && (
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        View
                      </Button>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No prayer groups yet. Create one to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
}