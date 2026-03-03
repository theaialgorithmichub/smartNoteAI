'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldOff, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  createdAt: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string) => {
    try {
      setToggling(userId);
      const response = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: 'POST',
      });
      const updatedUser = await response.json();
      
      setUsers(users.map(u => u._id === userId ? updatedUser : u));
    } catch (error) {
      console.error('Failed to toggle admin:', error);
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold">User Management</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Manage user roles and permissions
        </p>
      </div>

      <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
        {users.map((user) => (
          <div key={user._id} className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{user.name}</p>
                  {user.isAdmin && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{user.email}</p>
              </div>
            </div>

            <Button
              onClick={() => toggleAdmin(user._id)}
              disabled={toggling === user._id}
              variant={user.isAdmin ? 'destructive' : 'default'}
              size="sm"
              className={!user.isAdmin ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              {toggling === user._id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : user.isAdmin ? (
                <>
                  <ShieldOff className="h-4 w-4 mr-2" />
                  Remove Admin
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Make Admin
                </>
              )}
            </Button>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="p-12 text-center text-neutral-500">
          No users found
        </div>
      )}
    </div>
  );
}
