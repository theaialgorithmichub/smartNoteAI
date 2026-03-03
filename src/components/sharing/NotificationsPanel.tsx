'use client';

import React from 'react';
import { Bell, Share2, UserPlus, Check, X, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: 'notebook_shared' | 'friend_request' | 'friend_accepted';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionData?: {
    notebookId?: string;
    requestId?: string;
    userId?: string;
  };
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onAcceptFriendRequest: (requestId: string) => void;
  onRejectFriendRequest: (requestId: string) => void;
  onViewNotebook: (notebookId: string) => void;
}

export function NotificationsPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onViewNotebook
}: NotificationsPanelProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'notebook_shared':
        return <Share2 className="h-5 w-5 text-blue-500" />;
      case 'friend_request':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'friend_accepted':
        return <Check className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-neutral-500" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-neutral-900 dark:text-white" />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={onMarkAllAsRead}
            className="text-sm bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="p-12 bg-neutral-50 dark:bg-neutral-800 text-center">
          <Bell className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Notifications</h3>
          <p className="text-neutral-600 dark:text-neutral-400">You're all caught up!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <Card
              key={notification.id}
              className={`p-4 transition-all ${
                notification.read
                  ? 'bg-white dark:bg-neutral-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${
                  notification.read ? 'bg-neutral-100 dark:bg-neutral-700' : 'bg-white dark:bg-neutral-800'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-bold text-neutral-900 dark:text-white">{notification.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <Clock className="h-3 w-3" />
                      {getTimeAgo(notification.timestamp)}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{notification.message}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {notification.type === 'notebook_shared' && notification.actionData?.notebookId && (
                      <Button
                        onClick={() => {
                          onViewNotebook(notification.actionData!.notebookId!);
                          onMarkAsRead(notification.id);
                        }}
                        className="text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90"
                      >
                        View Notebook
                      </Button>
                    )}

                    {notification.type === 'friend_request' && notification.actionData?.requestId && (
                      <>
                        <Button
                          onClick={() => {
                            onAcceptFriendRequest(notification.actionData!.requestId!);
                            onMarkAsRead(notification.id);
                          }}
                          className="text-sm bg-green-500 text-white hover:bg-green-600"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => {
                            onRejectFriendRequest(notification.actionData!.requestId!);
                            onMarkAsRead(notification.id);
                          }}
                          className="text-sm bg-red-500 text-white hover:bg-red-600"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {!notification.read && (
                      <Button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="text-sm bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
