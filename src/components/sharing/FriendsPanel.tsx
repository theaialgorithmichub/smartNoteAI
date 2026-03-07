'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Search, Check, X, Clock, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface FriendRequest {
  id: string;
  from: User;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface FriendsPanelProps {
  friends: User[];
  friendRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  onSendRequest: (userId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onRemoveFriend: (friendId: string) => void;
}

export function FriendsPanel({
  friends,
  friendRequests,
  sentRequests,
  onSendRequest,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend
}: FriendsPanelProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'find'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) {
      return;
    }

    try {
      setSearching(true);
      const response = await fetch(`/api/friends/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(Array.isArray(data) ? data : []);
      } else {
        console.error('Search failed:', data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      setSendingRequest(userId);
      await onSendRequest(userId);
      // Remove from search results after sending request
      setSearchResults(prev => prev.filter(u => u.id !== userId));
      alert('Friend request sent!');
    } catch (error) {
      console.error('Failed to send friend request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send friend request';
      
      if (errorMessage.includes('already exists')) {
        alert('You have already sent a friend request to this user.');
      } else if (errorMessage.includes('Already friends')) {
        alert('You are already friends with this user.');
      } else {
        alert(errorMessage);
      }
    } finally {
      setSendingRequest(null);
    }
  };

  const tabs = [
    { id: 'friends', label: 'My Friends', count: friends.length },
    { id: 'requests', label: 'Requests', count: friendRequests.length + sentRequests.length },
    { id: 'find', label: 'Find Friends', count: null }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
              />
            )}
          </button>
        ))}
      </div>

      {/* Friends List */}
      {activeTab === 'friends' && (
        <div>
          {friends.length === 0 ? (
            <Card className="p-12 bg-neutral-50 dark:bg-neutral-800 text-center">
              <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Friends Yet</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">Start by finding and adding friends</p>
              <Button
                onClick={() => setActiveTab('find')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Find Friends
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {friends.map(friend => (
                <Card key={friend.id} className="p-4 bg-white dark:bg-neutral-800 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-white">{friend.name}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{friend.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveFriend(friend.id)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Remove friend"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Friend Requests: Received and Sent sections always visible */}
      {activeTab === 'requests' && (
        <div className="space-y-8">
          {/* Received Requests (incoming) */}
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Received Requests</h3>
            {friendRequests.length === 0 ? (
              <Card className="p-8 bg-neutral-50 dark:bg-neutral-800 text-center">
                <Mail className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600 dark:text-neutral-400">No pending friend requests</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {friendRequests.map(request => (
                  <Card key={request.id} className="p-4 bg-white dark:bg-neutral-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                          {request.from.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">{request.from.name}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{request.from.email}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                            {new Date(request.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => onAcceptRequest(request.id)}
                          className="bg-green-500 text-white hover:bg-green-600"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => onRejectRequest(request.id)}
                          className="bg-red-500 text-white hover:bg-red-600"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sent Requests - always show section */}
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Sent Requests</h3>
            {sentRequests.length === 0 ? (
              <Card className="p-8 bg-neutral-50 dark:bg-neutral-800 text-center">
                <UserPlus className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600 dark:text-neutral-400">No sent requests</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">Requests you send will appear here</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {sentRequests.map(request => (
                  <Card key={request.id} className="p-4 bg-neutral-50 dark:bg-neutral-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                          {request.from.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">{request.from.name}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{request.from.email}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                            Sent {new Date(request.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Pending</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Find Friends */}
      {activeTab === 'find' && (
        <div>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching || searchQuery.length < 2}
              className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-50"
            >
              <Search className="h-4 w-4 mr-2" />
              {searching ? 'Searching...' : 'Search Users'}
            </Button>
          </div>

          {searchResults.length === 0 ? (
            <Card className="p-12 bg-neutral-50 dark:bg-neutral-800 text-center">
              <UserPlus className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Find Friends</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Search for users by name or email to send friend requests</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {searchResults.map(user => (
                <Card key={user.id} className="p-4 bg-white dark:bg-neutral-800 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddFriend(user.id)}
                      disabled={sendingRequest === user.id}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-50"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {sendingRequest === user.id ? 'Sending...' : 'Add Friend'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
