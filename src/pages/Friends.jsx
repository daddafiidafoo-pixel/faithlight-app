import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Search, UserPlus, Users } from 'lucide-react';

function UserCard({ name, subtitle, mutualFriends, onView, onAddFriend }) {
  const initials = name.slice(0, 1).toUpperCase();
  
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted font-semibold">
          {initials}
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          {mutualFriends ? (
            <p className="text-xs text-muted-foreground">{mutualFriends} mutual friends</p>
          ) : null}
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={onView}
          className="h-10 rounded-xl px-4 border text-sm font-semibold hover:bg-muted transition-colors"
        >
          View
        </button>
        <button 
          onClick={onAddFriend}
          className="h-10 rounded-xl px-4 bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Add Friend
        </button>
      </div>
    </div>
  );
}

export default function FriendsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [secondaryTab, setSecondaryTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('discover');

  // Placeholder data - replace with actual API calls
  const mockFriends = [];
  const mockPending = [];
  const mockRequests = [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
        
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Friends & Community</h1>
            <p className="mt-2 text-muted-foreground">
              Connect with other believers and expand your network
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => { setActiveTab('discover'); setFilterMode('discover'); }}
              className="h-11 rounded-xl px-4 font-medium border hover:bg-muted transition-colors"
            >
              Find People
            </button>
            <button 
              onClick={() => { setActiveTab('discover'); setFilterMode('discover'); }}
              className="h-11 rounded-xl px-4 font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Discover People
            </button>
          </div>
        </div>

        {/* Main tabs */}
        <div className="mb-4 flex gap-2">
          <button 
            onClick={() => { setActiveTab('friends'); setSecondaryTab('friends'); }}
            className={`h-10 rounded-xl px-4 font-semibold transition-colors ${
              activeTab === 'friends' 
                ? 'bg-primary text-primary-foreground' 
                : 'border hover:bg-muted'
            }`}
          >
            My Friends
          </button>
          <button 
            onClick={() => { setActiveTab('discover'); setSecondaryTab('friends'); }}
            className={`h-10 rounded-xl px-4 font-semibold transition-colors ${
              activeTab === 'discover' 
                ? 'bg-primary text-primary-foreground' 
                : 'border hover:bg-muted'
            }`}
          >
            Discover People
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <input
            className="h-12 flex-1 rounded-2xl border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="h-12 rounded-2xl px-5 bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
            <Search size={18} aria-hidden="true" />
            <span>Search</span>
          </button>
        </div>

        {/* Secondary tabs */}
        {activeTab === 'friends' && (
          <div className="mb-6 flex gap-2 overflow-x-auto">
            <button 
              onClick={() => setSecondaryTab('friends')}
              className={`h-10 rounded-xl px-4 font-semibold whitespace-nowrap transition-colors ${
                secondaryTab === 'friends' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'border hover:bg-muted'
              }`}
            >
              Friends ({mockFriends.length})
            </button>
            <button 
              onClick={() => setSecondaryTab('pending')}
              className={`h-10 rounded-xl px-4 font-semibold whitespace-nowrap transition-colors ${
                secondaryTab === 'pending' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'border hover:bg-muted'
              }`}
            >
              Pending ({mockPending.length})
            </button>
            <button 
              onClick={() => setSecondaryTab('requests')}
              className={`h-10 rounded-xl px-4 font-semibold whitespace-nowrap transition-colors ${
                secondaryTab === 'requests' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'border hover:bg-muted'
              }`}
            >
              Requests ({mockRequests.length})
            </button>
          </div>
        )}

        {/* Empty State */}
        {mockFriends.length === 0 && activeTab === 'friends' && (
          <div className="rounded-3xl border bg-card p-8 text-center">
            <div className="flex justify-center mb-4">
              <Users size={48} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">No friends yet</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Search for believers, discover new people, and start building your FaithLight community.
            </p>

            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <button 
                onClick={() => { setActiveTab('discover'); setFilterMode('discover'); }}
                className="h-11 rounded-xl px-4 bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Find People
              </button>
              <button 
                onClick={() => { setActiveTab('discover'); setFilterMode('discover'); }}
                className="h-11 rounded-xl px-4 border font-semibold hover:bg-muted transition-colors"
              >
                Discover People
              </button>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {activeTab === 'discover' && (
          <div className="space-y-3">
            {/* Placeholder - replace with actual search results */}
            <div className="rounded-3xl border bg-card p-8 text-center py-12">
              <p className="text-muted-foreground">No people found. Try a different search.</p>
            </div>
          </div>
        )}

        {/* Friends List */}
        {activeTab === 'friends' && mockFriends.length > 0 && (
          <div className="space-y-3">
            {mockFriends.map((friend, i) => (
              <UserCard
                key={i}
                name={friend.name}
                subtitle={friend.subtitle}
                mutualFriends={friend.mutualFriends}
                onView={() => console.log('View', friend.name)}
                onAddFriend={() => console.log('Add', friend.name)}
              />
            ))}
          </div>
        )}

        {/* Pending List */}
        {activeTab === 'friends' && secondaryTab === 'pending' && mockPending.length === 0 && (
          <div className="rounded-3xl border bg-card p-8 text-center py-12">
            <p className="text-muted-foreground">No pending friend requests</p>
          </div>
        )}

        {/* Requests List */}
        {activeTab === 'friends' && secondaryTab === 'requests' && mockRequests.length === 0 && (
          <div className="rounded-3xl border bg-card p-8 text-center py-12">
            <p className="text-muted-foreground">No incoming friend requests</p>
          </div>
        )}
      </div>
    </div>
  );
}