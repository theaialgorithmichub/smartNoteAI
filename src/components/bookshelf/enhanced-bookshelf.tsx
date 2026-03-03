"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Filter, Sparkles, Users, Globe, Bell, UserPlus } from "lucide-react"
import { NotebookCard } from "./notebook-card"
import { CreateNotebookDialog } from "./create-notebook-dialog"
import { CubeLoaderCard } from "./cube-loader-card"
import { FriendsPanel } from "@/components/sharing/FriendsPanel"
import { NotificationsPanel } from "@/components/sharing/NotificationsPanel"
import { SharedNotebooksView } from "@/components/sharing/SharedNotebooksView"
import { SyncUsersButton } from "@/components/admin/sync-users-button"
import { useFriends, useFriendRequests, useNotifications, useSharedNotebooks, useUserSearch } from "@/hooks/useSharing"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Notebook {
  _id: string
  title: string
  category: string
  appearance: {
    coverImageUrl?: string
    themeColor: string
    paperPattern: string
    fontStyle: string
  }
  tags: string[]
  pageCount: number
  updatedAt: string
}

interface EnhancedBookshelfProps {
  userId: string
}

export function EnhancedBookshelf({ userId }: EnhancedBookshelfProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'my-notebooks' | 'shared' | 'friends' | 'notifications'>('my-notebooks')

  // Sharing hooks
  const { friends, removeFriend } = useFriends()
  const { incoming, sent, sendRequest, acceptRequest, rejectRequest } = useFriendRequests()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { publicNotebooks, sharedWithMe } = useSharedNotebooks()
  const { results: searchResults, search } = useUserSearch()

  useEffect(() => {
    if (activeTab === 'my-notebooks') {
      fetchNotebooks()
    }
  }, [filter, activeTab])

  const fetchNotebooks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/notebooks?filter=${filter}`)
      const data = await res.json()
      setNotebooks(data.notebooks || [])
    } catch (error) {
      console.error("Failed to fetch notebooks:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ["all", "Personal", "Work", "School", "Research"]

  const tabs = [
    { id: 'my-notebooks', label: 'My Notebooks', icon: Sparkles },
    { id: 'shared', label: 'Shared', icon: Globe, badge: sharedWithMe.length + publicNotebooks.length },
    { id: 'friends', label: 'Friends', icon: Users, badge: incoming.length },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount }
  ]

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200 dark:border-neutral-700">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap relative ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id 
                    ? 'bg-white text-amber-600' 
                    : 'bg-red-500 text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* My Notebooks Tab */}
      {activeTab === 'my-notebooks' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <Filter className="h-5 w-5 text-amber-500 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  filter === cat
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700"
                }`}
              >
                {cat === "all" ? "All Notebooks" : cat}
              </button>
            ))}
          </div>

          {/* Bookshelf Grid */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
              {/* Create New Notebook Card */}
              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreateOpen(true)}
                className="aspect-square rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:border-amber-500/50 flex flex-col items-center justify-center gap-4 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/25">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <span className="text-neutral-500 dark:text-neutral-400 font-medium text-sm group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">New Notebook</span>
              </motion.button>

              {/* Loading Animation */}
              {loading && (
                <>
                  {[...Array(4)].map((_, i) => (
                    <CubeLoaderCard key={i} />
                  ))}
                </>
              )}

              {/* Notebook Cards */}
              <AnimatePresence>
                {!loading &&
                  notebooks.map((notebook, index) => (
                    <motion.div
                      key={notebook._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <NotebookCard notebook={notebook} onUpdate={fetchNotebooks} />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {!loading && notebooks.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-amber-500" />
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-lg">No notebooks yet.</p>
                <p className="text-neutral-500 mt-1">Create your first notebook to get started!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shared Notebooks Tab */}
      {activeTab === 'shared' && (
        <SharedNotebooksView
          publicNotebooks={publicNotebooks}
          sharedWithMe={sharedWithMe}
          onOpenNotebook={(id) => window.location.href = `/dashboard/notebook/${id}`}
        />
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="space-y-6">
          {/* Sync Users Button */}
          <SyncUsersButton />
          
          {/* Friends Panel */}
          <FriendsPanel
            friends={friends}
            friendRequests={incoming}
            sentRequests={sent}
            onSendRequest={sendRequest}
            onAcceptRequest={acceptRequest}
            onRejectRequest={rejectRequest}
            onRemoveFriend={removeFriend}
          />
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <NotificationsPanel
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onAcceptFriendRequest={acceptRequest}
          onRejectFriendRequest={rejectRequest}
          onViewNotebook={(id) => window.location.href = `/notebook/${id}`}
        />
      )}

      {/* Create Dialog */}
      <CreateNotebookDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={fetchNotebooks}
      />
    </div>
  )
}
