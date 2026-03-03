import { useState, useEffect, useCallback } from 'react';
import { friendsAPI, notebooksAPI, notificationsAPI } from '@/lib/api/sharing';
import type { User, FriendRequest, Notification, SharedNotebook } from '@/lib/api/sharing';

// Friends Hook
export function useFriends() {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true);
      const data = await friendsAPI.getFriends();
      setFriends(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch friends');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const removeFriend = useCallback(async (friendId: string) => {
    try {
      await friendsAPI.removeFriend(friendId);
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to remove friend');
    }
  }, []);

  return { friends, loading, error, refetch: fetchFriends, removeFriend };
}

// Friend Requests Hook
export function useFriendRequests() {
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await friendsAPI.getRequests();
      setIncoming(data.incoming);
      setSent(data.sent);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const sendRequest = useCallback(async (userId: string) => {
    try {
      const request = await friendsAPI.sendRequest(userId);
      setSent(prev => [...prev, request]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to send request');
    }
  }, []);

  const acceptRequest = useCallback(async (requestId: string) => {
    try {
      await friendsAPI.acceptRequest(requestId);
      setIncoming(prev => prev.filter(r => r.id !== requestId));
      await fetchRequests(); // Refresh to update friends list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to accept request');
    }
  }, [fetchRequests]);

  const rejectRequest = useCallback(async (requestId: string) => {
    try {
      await friendsAPI.rejectRequest(requestId);
      setIncoming(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to reject request');
    }
  }, []);

  return {
    incoming,
    sent,
    loading,
    error,
    refetch: fetchRequests,
    sendRequest,
    acceptRequest,
    rejectRequest
  };
}

// User Search Hook
export function useUserSearch() {
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const data = await friendsAPI.searchUsers(query);
      setResults(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}

// Notifications Hook
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationsAPI.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only set up polling once on mount

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to mark all as read');
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}

// Shared Notebooks Hook
export function useSharedNotebooks() {
  const [publicNotebooks, setPublicNotebooks] = useState<SharedNotebook[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<SharedNotebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotebooks = useCallback(async () => {
    try {
      setLoading(true);
      const [publicData, sharedData] = await Promise.all([
        notebooksAPI.getPublicNotebooks(),
        notebooksAPI.getSharedNotebooks()
      ]);
      setPublicNotebooks(publicData);
      setSharedWithMe(sharedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notebooks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotebooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return {
    publicNotebooks,
    sharedWithMe,
    loading,
    error,
    refetch: fetchNotebooks
  };
}

// Share Notebook Hook
export function useShareNotebook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareNotebook = useCallback(async (
    notebookId: string,
    shareData: { isPublic: boolean; sharedWith: string[] }
  ) => {
    try {
      setLoading(true);
      await notebooksAPI.shareNotebook(notebookId, shareData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share notebook');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { shareNotebook, loading, error };
}
