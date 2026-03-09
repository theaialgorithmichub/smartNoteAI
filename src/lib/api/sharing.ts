// API service layer for sharing features

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface FriendRequest {
  id: string;
  from: User;
  to?: User;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

export interface Notification {
  _id: string;
  type: 'notebook_shared' | 'friend_request' | 'friend_accepted';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionData?: {
    notebookId?: string;
    requestId?: string;
    userId?: string;
  };
}

export interface SharedNotebook {
  id: string;
  title: string;
  template: string;
  owner: User;
  sharedAt: string;
  isPublic: boolean;
  pageCount: number;
  lastModified: string;
  content?: any;
}

// In-flight deduplication + short-lived cache (avoids duplicate calls from Strict Mode / rapid mounts)
const CACHE_TTL_MS = 2000;

let friendsInFlight: Promise<User[]> | null = null;
let friendsCache: { data: User[]; at: number } | null = null;
let requestsInFlight: Promise<{ incoming: FriendRequest[]; sent: FriendRequest[] }> | null = null;
let requestsCache: { data: { incoming: FriendRequest[]; sent: FriendRequest[] }; at: number } | null = null;
let notificationsInFlight: Promise<Notification[]> | null = null;
let notificationsCache: { data: Notification[]; at: number } | null = null;

// Friends API
export const friendsAPI = {
  // Search for users
  async searchUsers(query: string): Promise<User[]> {
    const response = await fetch(`/api/friends/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search users');
    return response.json();
  },

  // Send friend request
  async sendRequest(userId: string): Promise<FriendRequest> {
    const response = await fetch('/api/friends/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!response.ok) throw new Error('Failed to send friend request');
    return response.json();
  },

  // Accept friend request
  async acceptRequest(requestId: string): Promise<void> {
    const response = await fetch(`/api/friends/accept/${requestId}`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to accept friend request');
  },

  // Reject friend request
  async rejectRequest(requestId: string): Promise<void> {
    const response = await fetch(`/api/friends/reject/${requestId}`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to reject friend request');
  },

  // Get friends list (deduped + 2s cache to avoid duplicate calls from Strict Mode / rapid mounts)
  async getFriends(): Promise<User[]> {
    const now = Date.now();
    if (friendsCache && now - friendsCache.at < CACHE_TTL_MS) return Promise.resolve(friendsCache.data);
    if (friendsInFlight) return friendsInFlight;
    friendsInFlight = (async () => {
      try {
        const response = await fetch('/api/friends');
        if (!response.ok) throw new Error('Failed to get friends');
        const data = await response.json();
        friendsCache = { data, at: Date.now() };
        return data;
      } finally {
        friendsInFlight = null;
      }
    })();
    return friendsInFlight;
  },

  invalidateFriends(): void {
    friendsInFlight = null;
    friendsCache = null;
  },

  // Get friend requests (deduped + 2s cache)
  async getRequests(): Promise<{ incoming: FriendRequest[]; sent: FriendRequest[] }> {
    const now = Date.now();
    if (requestsCache && now - requestsCache.at < CACHE_TTL_MS) return Promise.resolve(requestsCache.data);
    if (requestsInFlight) return requestsInFlight;
    requestsInFlight = (async () => {
      try {
        const response = await fetch('/api/friends/requests');
        if (!response.ok) throw new Error('Failed to get friend requests');
        const data = await response.json();
        requestsCache = { data, at: Date.now() };
        return data;
      } finally {
        requestsInFlight = null;
      }
    })();
    return requestsInFlight;
  },

  invalidateRequests(): void {
    requestsInFlight = null;
    requestsCache = null;
  },

  // Remove friend
  async removeFriend(friendId: string): Promise<void> {
    const response = await fetch(`/api/friends/${friendId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove friend');
  }
};

// Notebooks API
export const notebooksAPI = {
  // Share notebook
  async shareNotebook(notebookId: string, shareData: { isPublic: boolean; sharedWith: string[] }): Promise<void> {
    const response = await fetch(`/api/notebooks/${notebookId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shareData)
    });
    if (!response.ok) throw new Error('Failed to share notebook');
  },

  // Unshare notebook (revoke access)
  async unshareNotebook(notebookId: string, userIds?: string[]): Promise<void> {
    const response = await fetch(`/api/notebooks/${notebookId}/unshare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds })
    });
    if (!response.ok) throw new Error('Failed to unshare notebook');
  },

  // Get public notebooks
  async getPublicNotebooks(): Promise<SharedNotebook[]> {
    const response = await fetch('/api/notebooks/public');
    if (!response.ok) throw new Error('Failed to get public notebooks');
    return response.json();
  },

  // Get shared notebooks
  async getSharedNotebooks(): Promise<SharedNotebook[]> {
    const response = await fetch('/api/notebooks/shared');
    if (!response.ok) throw new Error('Failed to get shared notebooks');
    return response.json();
  },

  // Create notebook
  async createNotebook(data: { title: string; template: string; content: any }): Promise<SharedNotebook> {
    const response = await fetch('/api/notebooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create notebook');
    return response.json();
  },

  // Update notebook
  async updateNotebook(notebookId: string, data: Partial<SharedNotebook>): Promise<SharedNotebook> {
    const response = await fetch(`/api/notebooks/${notebookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update notebook');
    return response.json();
  },

  // Get notebook by ID
  async getNotebook(notebookId: string): Promise<SharedNotebook> {
    const response = await fetch(`/api/notebooks/${notebookId}`);
    if (!response.ok) throw new Error('Failed to get notebook');
    return response.json();
  },

  // Get my notebooks
  async getMyNotebooks(): Promise<SharedNotebook[]> {
    const response = await fetch('/api/notebooks/my');
    if (!response.ok) throw new Error('Failed to get notebooks');
    return response.json();
  }
};

// Notifications API
export const notificationsAPI = {
  // Get notifications (deduped + 2s cache to avoid duplicate calls from multiple consumers / Strict Mode)
  async getNotifications(): Promise<Notification[]> {
    const now = Date.now();
    if (notificationsCache && now - notificationsCache.at < CACHE_TTL_MS) return Promise.resolve(notificationsCache.data);
    if (notificationsInFlight) return notificationsInFlight;
    notificationsInFlight = (async () => {
      try {
        const response = await fetch('/api/notifications');
        if (!response.ok) throw new Error('Failed to get notifications');
        const data = await response.json();
        notificationsCache = { data, at: Date.now() };
        return data;
      } finally {
        notificationsInFlight = null;
      }
    })();
    return notificationsInFlight;
  },

  invalidateNotifications(): void {
    notificationsInFlight = null;
    notificationsCache = null;
  },

  // Mark as read
  async markAsRead(notificationId: string): Promise<void> {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    this.invalidateNotifications();
  },

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    const response = await fetch('/api/notifications/read-all', {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to mark all as read');
    this.invalidateNotifications();
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await fetch('/api/notifications/unread-count');
    if (!response.ok) throw new Error('Failed to get unread count');
    const data = await response.json();
    return data.count;
  }
};
