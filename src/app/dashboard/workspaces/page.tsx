"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Settings, Copy, Check, Trash2, Crown,
  Shield, Edit2, Eye, X, UserPlus, Link2, BookOpen, LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type Role = "owner" | "admin" | "editor" | "viewer";

interface Member {
  userId: string;
  role: Role;
  name?: string;
  email?: string;
  avatar?: string;
  joinedAt: string;
}

interface Workspace {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: Member[];
  notebookIds: string[];
  inviteCode: string;
  createdAt: string;
}

const ROLE_CONFIG: Record<Role, { label: string; icon: any; color: string; perms: string }> = {
  owner:  { label: "Owner",  icon: Crown,  color: "text-amber-500",  perms: "Full control" },
  admin:  { label: "Admin",  icon: Shield, color: "text-purple-500", perms: "Manage members & notebooks" },
  editor: { label: "Editor", icon: Edit2,  color: "text-blue-500",   perms: "Edit notebooks" },
  viewer: { label: "Viewer", icon: Eye,    color: "text-green-500",  perms: "View only" },
};

export default function WorkspacesPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Workspace | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchWorkspaces(); }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch("/api/workspaces");
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
        if (data.length > 0 && !selected) setSelected(data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setWorkspaces(prev => [data, ...prev]);
      setSelected(data);
      setShowCreate(false);
      setNewName(""); setNewDesc("");
    } finally { setSaving(false); }
  };

  const joinWorkspace = async () => {
    if (!joinCode.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/workspaces/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: joinCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid code"); return; }
      await fetchWorkspaces();
      setSelected(data.workspace);
      setShowJoin(false);
      setJoinCode("");
    } finally { setSaving(false); }
  };

  const deleteWorkspace = async (id: string) => {
    if (!confirm("Delete this workspace? This cannot be undone.")) return;
    await fetch(`/api/workspaces/${id}`, { method: "DELETE" });
    setWorkspaces(prev => prev.filter(w => w._id !== id));
    setSelected(workspaces.find(w => w._id !== id) || null);
  };

  const updateMemberRole = async (workspaceId: string, memberId: string, role: Role) => {
    const res = await fetch(`/api/workspaces/${workspaceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updateMember: { memberId, role } }),
    });
    if (res.ok) {
      const updated = await res.json();
      setWorkspaces(prev => prev.map(w => w._id === workspaceId ? updated : w));
      setSelected(updated);
    }
  };

  const removeMember = async (workspaceId: string, memberId: string) => {
    const res = await fetch(`/api/workspaces/${workspaceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removeMember: memberId }),
    });
    if (res.ok) {
      const updated = await res.json();
      setWorkspaces(prev => prev.map(w => w._id === workspaceId ? updated : w));
      setSelected(updated);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyInviteLink = (code: string) => {
    const url = `${window.location.origin}/dashboard/workspaces?join=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" /> Team Workspaces
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Collaborate on notebooks with your team. Assign roles to control access.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowJoin(true)}>
            <LogIn className="w-4 h-4 mr-2" /> Join
          </Button>
          <Button onClick={() => setShowCreate(true)} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> New Workspace
          </Button>
        </div>
      </div>

      {workspaces.length === 0 ? (
        <Card className="p-16 text-center">
          <Users className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">No workspaces yet</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">Create a workspace to collaborate with your team</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setShowCreate(true)} className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="w-4 h-4 mr-2" /> Create Workspace
            </Button>
            <Button variant="outline" onClick={() => setShowJoin(true)}>
              <LogIn className="w-4 h-4 mr-2" /> Join with Code
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex gap-6">
          {/* Sidebar — workspace list */}
          <div className="w-64 flex-shrink-0 space-y-2">
            {workspaces.map(ws => (
              <button
                key={ws._id}
                onClick={() => setSelected(ws)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selected?._id === ws._id
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"
                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-amber-300"
                }`}
              >
                <div className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{ws.name}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {ws.members.length} member{ws.members.length !== 1 ? "s" : ""} · {ws.notebookIds.length} notebook{ws.notebookIds.length !== 1 ? "s" : ""}
                </div>
              </button>
            ))}
          </div>

          {/* Main panel */}
          {selected && (
            <div className="flex-1 space-y-5">
              {/* Workspace header */}
              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{selected.name}</h2>
                    {selected.description && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{selected.description}</p>
                    )}
                  </div>
                  {selected.ownerId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => deleteWorkspace(selected._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Invite code */}
                <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Invite Code</p>
                    <code className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">{selected.inviteCode}</code>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyInviteCode(selected.inviteCode)}>
                      {copiedCode ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => copyInviteLink(selected.inviteCode)} title="Copy invite link">
                      <Link2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Members */}
              <Card className="p-5">
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" /> Members ({selected.members.length})
                </h3>
                <div className="space-y-3">
                  {selected.members.map(member => {
                    const cfg = ROLE_CONFIG[member.role];
                    const Icon = cfg.icon;
                    return (
                      <div key={member.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 group">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                          {member.avatar
                            ? <img src={member.avatar} className="w-8 h-8 rounded-full object-cover" alt={member.name} />
                            : <span className="text-sm font-bold text-amber-600">{member.name?.[0]?.toUpperCase() || "?"}</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                            {member.name || "Unknown"}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{member.email}</div>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </div>
                        {/* Role change dropdown — only for owner managing non-owners */}
                        {selected.ownerId && member.role !== "owner" && (
                          <select
                            value={member.role}
                            onChange={e => updateMemberRole(selected._id, member.userId, e.target.value as Role)}
                            className="text-xs border rounded px-1 py-0.5 dark:bg-neutral-800 dark:border-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {(["admin", "editor", "viewer"] as Role[]).map(r => (
                              <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                            ))}
                          </select>
                        )}
                        {selected.ownerId && member.role !== "owner" && (
                          <button
                            onClick={() => removeMember(selected._id, member.userId)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Role legend */}
              <Card className="p-5">
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" /> Role Permissions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([role, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <div key={role} className="flex items-start gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                        <div>
                          <div className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">{cfg.perms}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Create Workspace Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Create Workspace</h2>
                <button onClick={() => setShowCreate(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Workspace Name *</label>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. Product Team"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Description</label>
                  <textarea
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                    rows={2}
                    placeholder="What is this workspace for?"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={createWorkspace}
                    disabled={!newName.trim() || saving}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {saving ? "Creating…" : "Create Workspace"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Workspace Modal */}
      <AnimatePresence>
        {showJoin && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowJoin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Join a Workspace</h2>
                <button onClick={() => setShowJoin(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Invite Code</label>
                  <input
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value)}
                    className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Enter 10-character invite code"
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={joinWorkspace}
                    disabled={!joinCode.trim() || saving}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {saving ? "Joining…" : "Join Workspace"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowJoin(false)}>Cancel</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
