'use client';

import { useState } from 'react';
import { Users, FileText, Settings } from 'lucide-react';
import { SyncUsersButton } from './sync-users-button';
import { UserManagement } from './user-management';
import { TemplateManagement } from './template-management';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Custom Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'users' && (
          <div className="space-y-6">
            <SyncUsersButton />
            <UserManagement />
          </div>
        )}

        {activeTab === 'templates' && <TemplateManagement />}

        {activeTab === 'settings' && (
          <div className="p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
            <h3 className="text-lg font-semibold mb-4">System Settings</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Additional system settings will be available here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
