'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Globe, Lock, Search, UserPlus, Check, UserMinus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Friend {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ShareNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId: string;
  notebookTitle: string;
  currentSharing: {
    isPublic: boolean;
    sharedWith: string[];
  };
  friends: Friend[];
  onShare: (shareData: { isPublic: boolean; sharedWith: string[] }) => void;
}

export function ShareNotebookModal({
  isOpen,
  onClose,
  notebookId,
  notebookTitle,
  currentSharing,
  friends,
  onShare
}: ShareNotebookModalProps) {
  const [shareType, setShareType] = useState<'private' | 'friends' | 'public'>(
    currentSharing.isPublic ? 'public' : currentSharing.sharedWith.length > 0 ? 'friends' : 'private'
  );
  const [selectedFriends, setSelectedFriends] = useState<string[]>(currentSharing.sharedWith);
  const [searchQuery, setSearchQuery] = useState('');
  const [revokingFriend, setRevokingFriend] = useState<string | null>(null);

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleRevokeFriend = async (friendId: string) => {
    setRevokingFriend(friendId);
    try {
      await fetch(`/api/notebooks/${notebookId}/unshare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: [friendId] })
      });
      setSelectedFriends(prev => prev.filter(id => id !== friendId));
    } catch (error) {
      console.error('Failed to revoke sharing:', error);
      alert('Failed to revoke sharing');
    } finally {
      setRevokingFriend(null);
    }
  };

  const sharedFriends = friends.filter(f => currentSharing.sharedWith.includes(f.id));

  const handleShare = () => {
    const shareData = {
      isPublic: shareType === 'public',
      sharedWith: shareType === 'friends' ? selectedFriends : []
    };
    onShare(shareData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-white">Share Notebook</h2>
              <p className="text-blue-100 text-sm mt-1">{notebookTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Currently Shared With Section */}
            {sharedFriends.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Currently Shared With</h3>
                <div className="space-y-2">
                  {sharedFriends.map(friend => (
                    <Card
                      key={friend.id}
                      className="p-3 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {friend.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">{friend.name}</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">{friend.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevokeFriend(friend.id)}
                          disabled={revokingFriend === friend.id}
                          className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors disabled:opacity-50 flex items-center gap-1 text-sm"
                          title="Revoke access"
                        >
                          <UserMinus className="h-4 w-4" />
                          <span>Revoke</span>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Share Type Selection */}
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Who can access this notebook?</h3>
              <div className="space-y-3">
                {/* Private */}
                <Card
                  onClick={() => setShareType('private')}
                  className={`p-4 cursor-pointer transition-all ${
                    shareType === 'private'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${shareType === 'private' ? 'bg-blue-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}>
                      <Lock className={`h-5 w-5 ${shareType === 'private' ? 'text-white' : 'text-neutral-600 dark:text-neutral-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Private</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Only you can access this notebook</p>
                    </div>
                    {shareType === 'private' && (
                      <Check className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </Card>

                {/* Friends */}
                <Card
                  onClick={() => setShareType('friends')}
                  className={`p-4 cursor-pointer transition-all ${
                    shareType === 'friends'
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${shareType === 'friends' ? 'bg-purple-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}>
                      <Users className={`h-5 w-5 ${shareType === 'friends' ? 'text-white' : 'text-neutral-600 dark:text-neutral-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Share with Friends</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Select specific friends to share with</p>
                    </div>
                    {shareType === 'friends' && (
                      <Check className="h-5 w-5 text-purple-500" />
                    )}
                  </div>
                </Card>

                {/* Public */}
                <Card
                  onClick={() => setShareType('public')}
                  className={`p-4 cursor-pointer transition-all ${
                    shareType === 'public'
                      ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${shareType === 'public' ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}>
                      <Globe className={`h-5 w-5 ${shareType === 'public' ? 'text-white' : 'text-neutral-600 dark:text-neutral-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Public</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Anyone can view this notebook</p>
                    </div>
                    {shareType === 'public' && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* Friends Selection */}
            {shareType === 'friends' && (
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Select Friends</h3>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search friends..."
                    className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Friends List */}
                {friends.length === 0 ? (
                  <Card className="p-8 bg-neutral-50 dark:bg-neutral-800 text-center">
                    <UserPlus className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-600 dark:text-neutral-400">No friends yet</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">Add friends to share notebooks</p>
                  </Card>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredFriends.map(friend => (
                      <Card
                        key={friend.id}
                        onClick={() => toggleFriend(friend.id)}
                        className={`p-3 cursor-pointer transition-all ${
                          selectedFriends.includes(friend.id)
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500'
                            : 'bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {friend.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-white">{friend.name}</p>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400">{friend.email}</p>
                            </div>
                          </div>
                          {selectedFriends.includes(friend.id) && (
                            <Check className="h-5 w-5 text-purple-500" />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {selectedFriends.length > 0 && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3">
                    {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6 flex gap-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={shareType === 'friends' && selectedFriends.length === 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {shareType === 'private' ? 'Make Private' : shareType === 'public' ? 'Share Publicly' : `Share with ${selectedFriends.length} Friend${selectedFriends.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
