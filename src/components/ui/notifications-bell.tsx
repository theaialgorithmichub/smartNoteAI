"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Check, UserPlus, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationsAPI } from '@/lib/api/sharing';

interface Notification {
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

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationsAPI.getNotifications();
      setNotifications(Array.isArray(data) ? (data as Notification[]) : []);
    } catch {
      // keep previous state on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Single fetch on mount for badge; no polling when closed (bookshelf hook polls)
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // When dropdown opens, refresh; poll only while open to avoid duplicate calls
  useEffect(() => {
    if (!open) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [open, fetchNotifications]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const markRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'notebook_shared': return <Share2 className="w-4 h-4 text-blue-500" />;
      case 'friend_request': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'friend_accepted': return <UserPlus className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        className="relative p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n._id}
                    onClick={() => markRead(n._id)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                      !n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? 'font-semibold text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                        {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
