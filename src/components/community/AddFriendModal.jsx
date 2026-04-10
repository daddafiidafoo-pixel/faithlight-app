import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Search, Loader2, Check, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AddFriendModal({ open, onOpenChange, onFriendAdded, currentUserId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [friendshipStates, setFriendshipStates] = useState({});

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const searchResults = await base44.entities.User.filter(
        {},
        '-created_date',
        100
      );

      const filtered = searchResults.filter(
        u => u.username.includes(query.toLowerCase()) && u.id !== currentUserId
      );

      setResults(filtered);
      
      // Check friendship status for each result
      for (const user of filtered) {
        const pairKey = [currentUserId, user.id].sort().join(':');
        const friendship = await base44.entities.Friend.filter(
          { pair_key: pairKey },
          '-created_date',
          1
        );
        
        if (friendship.length > 0) {
          setFriendshipStates(prev => ({
            ...prev,
            [user.id]: friendship[0].status
          }));
        }
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (targetUser) => {
    setLoadingStates(prev => ({ ...prev, [targetUser.id]: true }));
    
    try {
      const pairKey = [currentUserId, targetUser.id].sort().join(':');

      await base44.entities.Friend.create({
        requester_id: currentUserId,
        receiver_id: targetUser.id,
        status: 'pending',
        pair_key: pairKey
      });

      setFriendshipStates(prev => ({
        ...prev,
        [targetUser.id]: 'pending'
      }));

      toast.success('Friend request sent!');
      onFriendAdded?.();
    } catch (error) {
      console.error('Error adding friend:', error);
      toast.error('Failed to send friend request');
    } finally {
      setLoadingStates(prev => ({ ...prev, [targetUser.id]: false }));
    }
  };

  const getStatusDisplay = (userId) => {
    const status = friendshipStates[userId];
    
    if (status === 'pending') {
      return (
        <div className="flex items-center gap-2 text-yellow-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Request sent</span>
        </div>
      );
    }
    
    if (status === 'accepted') {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <Check className="w-4 h-4" />
          <span className="text-sm">Already friends</span>
        </div>
      );
    }
    
    if (status === 'blocked') {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Blocked</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {searching && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          )}

          {!searching && results.length === 0 && searchQuery.trim() && (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-600 text-sm">
                  No users found matching "{searchQuery}"
                </p>
              </CardContent>
            </Card>
          )}

          {!searching && results.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((user) => {
                const status = friendshipStates[user.id];
                const isLoading = loadingStates[user.id];
                const canAdd = !status || (status === 'blocked');

                return (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {user.photo_url && (
                          <img
                            src={user.photo_url}
                            alt={user.display_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">
                            {user.display_name}
                          </p>
                          <p className="text-xs text-gray-600">@{user.username}</p>
                        </div>
                        {status ? (
                          getStatusDisplay(user.id)
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAddFriend(user)}
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Add'
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!searching && searchQuery.trim() === '' && results.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-600 text-sm">
                  Type a username to search
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}