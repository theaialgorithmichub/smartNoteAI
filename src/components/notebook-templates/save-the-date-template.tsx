'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Bell, Trash2, X, Info, BellRing, AlertCircle, CalendarDays, Clock, MapPin, Check, Search, Layers2, Settings2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateFooter } from './template-footer';
import { Button } from '@/components/ui/button';
import AnimatedCardStack, { AnimatedCardItem } from '@/components/ui/animate-card-animation';

export interface SaveTheDateProfile {
  id: string;
  name: string;
  /** Keys with entries in ACCENT_CLASSES */
  accent: string;
}

export interface SaveTheDateEvent {
  id: number;
  title: string;
  date: string;
  rawDate: string;
  time: string;
  location?: string;
  description?: string;
  url?: string;
  reminder: boolean;
  daysUntil: number;
  /** Kept in sync with profile name for older filters / exports */
  category: string;
  /** Workspace / lane for this event (Personal, Official, AI Film, …) */
  profileId: string;
}

const ACCENT_CLASSES: Record<string, { card: string; badge: string }> = {
  purple: {
    card: 'bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/10 border-2 border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-200 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200',
  },
  blue: {
    card: 'bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/10 border-2 border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-200 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200',
  },
  cyan: {
    card: 'bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/10 border-2 border-cyan-200 dark:border-cyan-800',
    badge: 'bg-cyan-200 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-200',
  },
  amber: {
    card: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10 border-2 border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200',
  },
  indigo: {
    card: 'bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/10 border-2 border-indigo-200 dark:border-indigo-800',
    badge: 'bg-indigo-200 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200',
  },
  pink: {
    card: 'bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/10 border-2 border-pink-200 dark:border-pink-800',
    badge: 'bg-pink-200 dark:bg-pink-900/40 text-pink-800 dark:text-pink-200',
  },
  green: {
    card: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border-2 border-green-200 dark:border-green-800',
    badge: 'bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-200',
  },
  neutral: {
    card: 'bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-900/30 dark:to-neutral-800/20 border-2 border-neutral-200 dark:border-neutral-700',
    badge: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200',
  },
};

export const SAVE_THE_DATE_DEFAULT_PROFILES: SaveTheDateProfile[] = [
  { id: 'personal', name: 'Personal', accent: 'purple' },
  { id: 'official', name: 'Official', accent: 'blue' },
  { id: 'ai-film', name: 'AI Film', accent: 'cyan' },
  { id: 'ai-ads', name: 'AI Ads', accent: 'amber' },
  { id: 'work', name: 'Work', accent: 'indigo' },
  { id: 'social', name: 'Social', accent: 'pink' },
];

function slugifyProfileId(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `${base || 'profile'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Migrate legacy `{ events }` to `{ profiles, events }` and assign profileId + category. */
export function normalizeSaveTheDatePayload(
  raw: Record<string, unknown> | null | undefined,
  seedProfiles?: SaveTheDateProfile[]
): { profiles: SaveTheDateProfile[]; events: SaveTheDateEvent[] } {
  const seed = seedProfiles?.length ? seedProfiles : SAVE_THE_DATE_DEFAULT_PROFILES;
  let profiles: SaveTheDateProfile[] =
    Array.isArray(raw?.profiles) && (raw!.profiles as unknown[]).length > 0
      ? (raw!.profiles as SaveTheDateProfile[]).map((p) => ({
          id: String(p.id || slugifyProfileId(String(p.name || 'profile'))),
          name: String(p.name || 'Profile'),
          accent: typeof p.accent === 'string' && ACCENT_CLASSES[p.accent] ? p.accent : 'neutral',
        }))
      : seed.map((p) => ({ ...p }));

  const list = Array.isArray(raw?.events) ? (raw!.events as Record<string, unknown>[]) : [];
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const resolveProfileIdForLegacy = (category: string, existingId: unknown): string => {
    if (typeof existingId === 'string' && profileById.has(existingId)) return existingId;
    const cat = category.trim();
    if (cat) {
      const byName = profiles.find((p) => p.name.toLowerCase() === cat.toLowerCase());
      if (byName) return byName.id;
      const migrated: SaveTheDateProfile = {
        id: slugifyProfileId(cat),
        name: cat,
        accent: 'neutral',
      };
      profiles = [...profiles, migrated];
      profileById.set(migrated.id, migrated);
      return migrated.id;
    }
    const fallback = profiles.find((p) => p.id === 'personal') || profiles[0];
    return fallback?.id ?? 'personal';
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events: SaveTheDateEvent[] = list.map((e) => {
    const rawDate = String(e.rawDate || e.date || '');
    const eventDate = new Date(rawDate);
    eventDate.setHours(0, 0, 0, 0);
    const diffDays = Number.isFinite(eventDate.getTime())
      ? Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const category = String(e.category || 'Personal');
    const profileId = resolveProfileIdForLegacy(category, e.profileId);
    const prof = profileById.get(profileId);
    return {
      id: typeof e.id === 'number' ? e.id : Number(e.id) || Date.now() + Math.floor(Math.random() * 1000),
      title: String(e.title || ''),
      date: String(e.date || ''),
      rawDate,
      time: String(e.time || ''),
      location: e.location != null ? String(e.location) : undefined,
      description: e.description != null ? String(e.description) : undefined,
      url: e.url != null ? String(e.url) : undefined,
      reminder: Boolean(e.reminder),
      daysUntil: typeof e.daysUntil === 'number' ? e.daysUntil : diffDays,
      category: prof?.name || category,
      profileId,
    };
  });

  return { profiles, events };
}

interface SaveTheDateTemplateProps {
  title: string;
  notebookId?: string;
  /** Read-only mode for shared links: no API calls, no add/edit/delete */
  readOnly?: boolean;
  /** Pre-loaded events when in read-only mode (e.g. from shared page) */
  initialEvents?: SaveTheDateEvent[];
  /** Pre-loaded profiles from shared JSON (optional) */
  initialProfiles?: SaveTheDateProfile[];
}

type Event = SaveTheDateEvent;

const ACCENT_ROTATE = ['purple', 'cyan', 'amber', 'indigo', 'pink', 'green', 'blue', 'neutral'] as const;

export function SaveTheDateTemplate({ title, notebookId, readOnly, initialEvents, initialProfiles }: SaveTheDateTemplateProps) {
  const readonlyNormalized = React.useMemo(() => {
    if (!readOnly) return null;
    return normalizeSaveTheDatePayload(
      { events: (initialEvents ?? []) as unknown as Record<string, unknown>[], profiles: initialProfiles as unknown[] },
      initialProfiles
    );
  }, [readOnly, initialEvents, initialProfiles]);

  const [profiles, setProfiles] = useState<SaveTheDateProfile[]>(
    () => readonlyNormalized?.profiles ?? SAVE_THE_DATE_DEFAULT_PROFILES.map((p) => ({ ...p }))
  );
  const [events, setEvents] = useState<Event[]>(() => readonlyNormalized?.events ?? []);
  const [selectedProfileFilter, setSelectedProfileFilter] = useState<string>('all');
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [bulkAssignProfileId, setBulkAssignProfileId] = useState<string>('');
  const [reassignPick, setReassignPick] = useState<Record<string, string>>({});
  const defaultProfileId = profiles.find((p) => p.id === 'personal')?.id ?? profiles[0]?.id ?? 'personal';
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    category: 'Personal',
    profileId: defaultProfileId,
    description: '',
    url: '',
  });
  const [upcomingAlerts, setUpcomingAlerts] = useState<Event[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; eventId: number | null; eventTitle: string }>({ show: false, eventId: null, eventTitle: '' });
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchDate, setSearchDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchEventTitle, setSearchEventTitle] = useState('');
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [showAddEventPopup, setShowAddEventPopup] = useState(false);
  const [showSearchFilterPopup, setShowSearchFilterPopup] = useState(false);
  const [showUpcomingCards, setShowUpcomingCards] = useState(false);
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const pageIdRef = React.useRef<string | null>(null);

  const normalizeUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
  };

  const isSafeUrl = (value?: string) => !!value && /^https?:\/\//i.test(value);

  const TEMPLATE_PAGE_TITLE = '__save_the_date_template__';
  const [loadDone, setLoadDone] = useState(false);

  // Ensure we have a template page (find or create) and return its id
  const ensureTemplatePage = useCallback(async (): Promise<string | null> => {
    if (!notebookId) return null;
    const res = await fetch(`/api/notebooks/${notebookId}/pages`);
    if (!res.ok) return null;
    const json = await res.json();
    const pages: any[] = json.pages ?? [];
    const existing = pages.find((p: any) => p.title === TEMPLATE_PAGE_TITLE);
    if (existing) {
      const id = typeof existing._id === 'string' ? existing._id : String(existing._id);
      return id;
    }
    const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: TEMPLATE_PAGE_TITLE,
        content: JSON.stringify({
          profiles: SAVE_THE_DATE_DEFAULT_PROFILES.map((p) => ({ ...p })),
          events: [],
        }),
      }),
    });
    if (!cr.ok) return null;
    const created = await cr.json();
    const page = created.page ?? created;
    const id = page?._id != null ? String(page._id) : null;
    return id;
  }, [notebookId]);

  // Load from DB on mount (skip when readOnly — data comes from props)
  useEffect(() => {
    if (readOnly) {
      setLoadDone(true);
      return;
    }
    if (!notebookId) {
      setLoadDone(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages`);
        if (!res.ok) {
          setLoadDone(true);
          return;
        }
        const json = await res.json();
        const pages: any[] = json.pages ?? [];
        const existing = pages.find((p: any) => p.title === TEMPLATE_PAGE_TITLE);
        if (cancelled) return;
        if (existing) {
          const id = typeof existing._id === 'string' ? existing._id : String(existing._id);
          pageIdRef.current = id;
          try {
            const data =
              typeof existing.content === 'string' ? JSON.parse(existing.content || '{}') : existing.content || {};
            const { profiles: loadedProfiles, events: loadedEvents } = normalizeSaveTheDatePayload(data);
            setProfiles(loadedProfiles);
            setEvents(loadedEvents);
          } catch {
            await fetch(`/api/notebooks/${notebookId}/pages/${existing._id}`, { method: 'DELETE' });
          }
        } else {
          const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: TEMPLATE_PAGE_TITLE,
              content: JSON.stringify({
                profiles: SAVE_THE_DATE_DEFAULT_PROFILES.map((p) => ({ ...p })),
                events: [],
              }),
            }),
          });
          if (!cr.ok) {
            setLoadDone(true);
            return;
          }
          const created = await cr.json();
          const page = created.page ?? created;
          const id = page?._id != null ? String(page._id) : null;
          if (!cancelled) {
            pageIdRef.current = id;
            setProfiles(SAVE_THE_DATE_DEFAULT_PROFILES.map((p) => ({ ...p })));
            setEvents([]);
          }
        }
      } catch (err) {
        console.error('Save the Date load failed:', err);
      } finally {
        if (!cancelled) setLoadDone(true);
      }
    })();
    return () => { cancelled = true; };
  }, [notebookId, readOnly]);

  const persistToDb = useCallback(() => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      let pageId = pageIdRef.current;
      if (!pageId) {
        pageId = await ensureTemplatePage();
        if (pageId) pageIdRef.current = pageId;
      }
      if (!pageId) {
        console.error('Save the Date: no template page id');
        setSaving(false);
        return;
      }
      setSaving(true);
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages/${pageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: TEMPLATE_PAGE_TITLE, content: JSON.stringify({ profiles, events }) }),
        });
        if (res.status === 404) {
          pageIdRef.current = null;
          const newId = await ensureTemplatePage();
          if (newId) {
            pageIdRef.current = newId;
            await fetch(`/api/notebooks/${notebookId}/pages/${newId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: TEMPLATE_PAGE_TITLE, content: JSON.stringify({ profiles, events }) }),
            });
          }
        }
      } catch (err) {
        console.error('Save the Date persist failed:', err);
      } finally {
        setSaving(false);
      }
    }, 500);
  }, [notebookId, events, profiles, ensureTemplatePage]);

  useEffect(() => {
    if (readOnly) return;
    if (loadDone) persistToDb();
  }, [events, profiles, loadDone, persistToDb, readOnly]);

  // Calculate days until event
  const calculateDaysUntil = (eventDate: string) => {
    if (!eventDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    const diffTime = event.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Update days until for all events
  useEffect(() => {
    const updateDaysUntil = () => {
      setEvents(prevEvents => 
        prevEvents.map(event => ({
          ...event,
          daysUntil: calculateDaysUntil(event.rawDate || event.date)
        }))
      );
    };
    
    updateDaysUntil();
    const interval = setInterval(updateDaysUntil, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const eventsInView =
    selectedProfileFilter === 'all' ? events : events.filter((e) => e.profileId === selectedProfileFilter);

  // Check for upcoming events with reminders (scoped to selected profile)
  useEffect(() => {
    const alerts = eventsInView.filter((e) => e.reminder && e.daysUntil >= 0 && e.daysUntil <= 3);
    setUpcomingAlerts(alerts);
  }, [eventsInView]);

  const profileLabel = useCallback(
    (profileId: string) => profiles.find((p) => p.id === profileId)?.name ?? 'Profile',
    [profiles]
  );

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    const prettyDate = new Date(newEvent.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const safeUrl = normalizeUrl(newEvent.url || '');
    const prof = profiles.find((p) => p.id === newEvent.profileId);
    const categoryLabel = prof?.name ?? newEvent.category;

    const event: Event = {
      id: editingEventId ?? Date.now(),
      title: newEvent.title,
      date: prettyDate,
      rawDate: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      description: newEvent.description,
      url: safeUrl,
      reminder: true,
      daysUntil: calculateDaysUntil(newEvent.date),
      category: categoryLabel,
      profileId: newEvent.profileId,
    };

    if (editingEventId) {
      setEvents(events.map((e) => (e.id === editingEventId ? event : e)));
    } else {
      setEvents([...events, event]);
    }

    setEditingEventId(null);
    const nextProfile =
      selectedProfileFilter !== 'all' ? selectedProfileFilter : defaultProfileId;
    setNewEvent({
      title: '',
      date: '',
      time: '',
      location: '',
      category: profileLabel(nextProfile),
      profileId: nextProfile,
      description: '',
      url: '',
    });
    setShowAddEventPopup(false);
  };

  const addCustomProfile = () => {
    const name = newProfileName.trim();
    if (!name) return;
    if (profiles.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    const accent = ACCENT_ROTATE[profiles.length % ACCENT_ROTATE.length];
    setProfiles((prev) => [...prev, { id: slugifyProfileId(name), name, accent }]);
    setNewProfileName('');
  };

  const deleteProfile = (id: string, reassignToId: string) => {
    if (profiles.length <= 1) return;
    if (id === reassignToId) return;
    const target = profiles.find((p) => p.id === reassignToId);
    setEvents((ev) =>
      ev.map((e) =>
        e.profileId === id
          ? { ...e, profileId: reassignToId, category: target?.name ?? e.category }
          : e
      )
    );
    setProfiles((p) => p.filter((x) => x.id !== id));
    if (selectedProfileFilter === id) setSelectedProfileFilter('all');
  };

  const applyBulkAssign = () => {
    if (!bulkAssignProfileId || !profiles.some((p) => p.id === bulkAssignProfileId)) return;
    const label = profileLabel(bulkAssignProfileId);
    setEvents((ev) => ev.map((e) => ({ ...e, profileId: bulkAssignProfileId, category: label })));
    setBulkAssignProfileId('');
  };

  const getReassignDefault = (profileId: string) => {
    const other = profiles.find((x) => x.id !== profileId);
    return other?.id ?? '';
  };

  const toggleReminder = (id: number) => {
    setEvents(events.map(e => e.id === id ? { ...e, reminder: !e.reminder } : e));
  };

  const deleteEvent = (id: number, eventTitle: string) => {
    setDeleteConfirm({ show: true, eventId: id, eventTitle });
  };

  const confirmDelete = () => {
    if (deleteConfirm.eventId) {
      setEvents(events.filter(e => e.id !== deleteConfirm.eventId));
    }
    setDeleteConfirm({ show: false, eventId: null, eventTitle: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, eventId: null, eventTitle: '' });
  };

  // Filter events: profile (header), title, date, category (legacy)
  const filteredEvents = eventsInView.filter((event) => {
    const matchesTitle =
      !searchEventTitle || event.title.toLowerCase().includes(searchEventTitle.toLowerCase());
    const matchesDate =
      !searchDate ||
      event.date.includes(
        new Date(searchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      );
    const matchesCategory = filterCategory === 'All' || event.category === filterCategory;
    return matchesTitle && matchesDate && matchesCategory;
  });

  // Sort: upcoming first (soonest first), then past (most recent past first)
  const sortedFilteredEvents = [...filteredEvents].sort((a, b) => {
    if (a.daysUntil >= 0 && b.daysUntil >= 0) return a.daysUntil - b.daysUntil;
    if (a.daysUntil < 0 && b.daysUntil < 0) return b.daysUntil - a.daysUntil;
    return a.daysUntil >= 0 ? -1 : 1;
  });

  // This Week: only future/current (0 <= daysUntil <= 7), exclude past
  const thisWeekCount = eventsInView.filter((e) => e.daysUntil >= 0 && e.daysUntil <= 7).length;

  // Upcoming events for animated cards (only events with valid URLs and in the future)
  const upcomingEventsForCards = eventsInView
    .filter((e) => e.daysUntil >= 0 && isSafeUrl(e.url))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const upcomingCardItems: AnimatedCardItem[] = upcomingEventsForCards.map((e) => ({
    id: e.id,
    title: e.title,
    description: `${e.date}${e.time ? ` • ${e.time}` : ''}${e.category ? ` • ${e.category}` : ''}`,
    iframeUrl: e.url,
  }));

  // Quick date selection helper
  const setQuickDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const formattedDate = date.toISOString().split('T')[0];
    setNewEvent({ ...newEvent, date: formattedDate });
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-rose-50 to-pink-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-8">
        <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              {title}
            </h1>
            {!readOnly && (
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                title="Know More"
              >
                <Info className="h-5 w-5" />
              </button>
            )}
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Never miss an important date</p>
        </div>

        <Card className="p-4 md:p-5 bg-white/75 dark:bg-neutral-800/85 backdrop-blur-md border border-rose-200/70 dark:border-rose-900/50 shadow-lg shadow-rose-500/10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 shrink-0">
              <Layers2 className="h-5 w-5" />
              <span className="font-semibold text-sm uppercase tracking-wide">Profile</span>
            </div>
            <div className="flex flex-col sm:flex-row flex-1 gap-3 w-full">
              <select
                value={selectedProfileFilter}
                onChange={(e) => setSelectedProfileFilter(e.target.value)}
                className="flex-1 min-w-[220px] px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                aria-label="Filter events by profile"
              >
                <option value="all">All profiles ({events.length})</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({events.filter((e) => e.profileId === p.id).length})
                  </option>
                ))}
              </select>
              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 shrink-0"
                  onClick={() => setShowProfileManager(true)}
                >
                  <Settings2 className="h-4 w-4 mr-2" />
                  Manage profiles
                </Button>
              )}
            </div>
          </div>
          {selectedProfileFilter !== 'all' && (
            <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
              Showing dates for <strong>{profileLabel(selectedProfileFilter)}</strong>. Stats, reminders, and the list below
              follow this profile; switch to <strong>All profiles</strong> for the full notebook.
            </p>
          )}
        </Card>

        {/* Reminder Alerts */}
        {upcomingAlerts.length > 0 && (
          <Card className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-2 border-amber-600">
            <div className="flex items-center gap-3">
              <BellRing className="h-6 w-6 animate-pulse" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Upcoming Events!</h3>
                <p className="text-sm opacity-90">
                  You have {upcomingAlerts.length} event{upcomingAlerts.length > 1 ? 's' : ''} coming up in the next 3 days:
                </p>
                <div className="mt-2 space-y-1">
                  {upcomingAlerts.map(alert => (
                    <div key={alert.id} className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span><strong>{alert.title}</strong> - {alert.daysUntil === 0 ? 'Today' : alert.daysUntil === 1 ? 'Tomorrow' : `in ${alert.daysUntil} days`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-rose-500 to-pink-500 text-white">
            <p className="text-sm opacity-90 mb-1">Total Events</p>
            <p className="text-3xl font-bold">{eventsInView.length}</p>
            {selectedProfileFilter !== 'all' && (
              <p className="text-xs opacity-80 mt-1">in this profile</p>
            )}
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <p className="text-sm opacity-90 mb-1">This Week</p>
            <p className="text-3xl font-bold">{thisWeekCount}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <p className="text-sm opacity-90 mb-1">Reminders Set</p>
            <p className="text-3xl font-bold">{eventsInView.filter((e) => e.reminder).length}</p>
          </Card>
        </div>

        {/* Upcoming events section - always visible */}
        <Card className="mt-4 p-4 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Upcoming events</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {upcomingCardItems.length > 0
                  ? 'Shows your next events with live website previews.'
                  : 'Events with a future date and a link appear here.'}
              </p>
            </div>
            {upcomingCardItems.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-300"
                onClick={() => setShowUpcomingCards(prev => !prev)}
              >
                {showUpcomingCards ? 'Hide' : 'Show'} upcoming events
              </Button>
            )}
          </div>
          {upcomingCardItems.length > 0 ? (
            showUpcomingCards && (
              <div className="mt-2">
                <AnimatedCardStack items={upcomingCardItems} />
              </div>
            )
          ) : (
            <div className="mt-4 py-6 text-center rounded-lg bg-neutral-50 dark:bg-neutral-700/30 border border-dashed border-neutral-200 dark:border-neutral-600">
              <CalendarDays className="h-10 w-10 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400">No upcoming events</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">Create an event with a future date and a URL to see it here with a live preview.</p>
            </div>
          )}
        </Card>

        {!readOnly && (
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setEditingEventId(null);
              const pid = selectedProfileFilter !== 'all' ? selectedProfileFilter : defaultProfileId;
              setNewEvent({
                title: '',
                date: '',
                time: '',
                location: '',
                category: profileLabel(pid),
                profileId: pid,
                description: '',
                url: '',
              });
              setShowAddEventPopup(true);
            }}
            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create event
          </Button>
          <Button
            onClick={() => setShowSearchFilterPopup(true)}
            variant="outline"
            className="border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
          >
            <Search className="h-4 w-4 mr-2" />
            Search and Filter Events
          </Button>
        </div>
        )}

        {events.length === 0 ? (
          <Card className="p-12 bg-white dark:bg-neutral-800 text-center">
            <CalendarDays className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Events Yet</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Add your first event to start tracking important dates</p>
          </Card>
        ) : eventsInView.length === 0 && selectedProfileFilter !== 'all' ? (
          <Card className="p-12 bg-white dark:bg-neutral-800 text-center border-2 border-dashed border-rose-200 dark:border-rose-900/50">
            <Layers2 className="h-16 w-16 text-rose-300 dark:text-rose-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No dates in this profile</h3>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              <strong>{profileLabel(selectedProfileFilter)}</strong> does not have any events yet. Switch to another profile,
              choose <strong>All profiles</strong>, or create a new event while this profile is selected.
            </p>
          </Card>
        ) : filteredEvents.length === 0 ? (
          <Card className="p-12 bg-white dark:bg-neutral-800 text-center">
            <CalendarDays className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Events Found</h3>
            <p className="text-neutral-600 dark:text-neutral-400">No events match your search criteria. Try adjusting your filters.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedFilteredEvents.map((event) => {
              const eventProfile = profiles.find((p) => p.id === event.profileId);
              const accentKey =
                eventProfile?.accent && ACCENT_CLASSES[eventProfile.accent]
                  ? eventProfile.accent
                  : 'neutral';
              const look = ACCENT_CLASSES[accentKey] ?? ACCENT_CLASSES.neutral;
              const isPast = event.daysUntil < 0;
              return (
                <Card key={event.id} className={`p-5 ${look.card} ${isPast ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{event.title}</h3>
                        {!readOnly && (
                          <>
                            <button
                              onClick={() => {
                                const isoDate = event.rawDate || new Date(event.date).toISOString().split('T')[0];
                                setNewEvent({
                                  title: event.title,
                                  date: isoDate,
                                  time: event.time,
                                  location: event.location || '',
                                  category: event.category,
                                  profileId: event.profileId,
                                  description: event.description || '',
                                  url: event.url || '',
                                });
                                setEditingEventId(event.id);
                                setShowAddEventPopup(true);
                              }}
                              className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => toggleReminder(event.id)}
                              className={`p-1 rounded transition-colors ${
                                event.reminder 
                                  ? 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30' 
                                  : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                              }`}
                              title={event.reminder ? 'Reminder ON' : 'Reminder OFF'}
                            >
                              <Bell className={`h-4 w-4 ${event.reminder ? 'fill-amber-600' : ''}`} />
                            </button>
                          </>
                        )}
                        <span className={`px-2 py-1 ${look.badge} rounded text-xs font-medium`}>
                          {profileLabel(event.profileId)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.time}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                      </div>
                      {event.description && (
                        <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
                          {event.description}
                        </p>
                      )}
                      {isSafeUrl(event.url) && (
                        <div className="mt-3 space-y-2">
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-rose-600 dark:text-rose-400 hover:underline break-all"
                          >
                            {event.url}
                          </a>
                          <div className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-900/5 h-48">
                            <iframe
                              src={event.url}
                              title={event.title}
                              className="w-full h-full border-0"
                              loading="lazy"
                              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`px-4 py-2 rounded-lg ${
                          isPast ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400' :
                          event.daysUntil === 0 ? 'bg-red-500 text-white animate-pulse' :
                          event.daysUntil <= 3 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          event.daysUntil <= 7 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        }`}>
                          <p className="text-2xl font-bold">
                            {isPast ? 'Past' : event.daysUntil === 0 ? 'Today!' : event.daysUntil}
                          </p>
                          {!isPast && event.daysUntil > 0 && <p className="text-xs">days left</p>}
                        </div>
                      </div>
                      {!readOnly && (
                        <button
                          onClick={() => deleteEvent(event.id, event.title)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete event"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add New Event popup */}
        {showAddEventPopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800">
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {editingEventId ? 'Edit event' : 'Add event'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddEventPopup(false);
                    setEditingEventId(null);
                    setNewEvent({
                      title: '',
                      date: '',
                      time: '',
                      location: '',
                      category: profileLabel(defaultProfileId),
                      profileId: defaultProfileId,
                      description: '',
                      url: '',
                    });
                  }}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" placeholder="Event title..." value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Profile</label>
                    <select
                      value={newEvent.profileId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        setNewEvent({
                          ...newEvent,
                          profileId: pid,
                          category: profileLabel(pid),
                        });
                      }}
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <textarea placeholder="Description (optional)" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" rows={2} />
                <input type="url" placeholder="Event website URL (optional)" value={newEvent.url} onChange={(e) => setNewEvent({ ...newEvent, url: e.target.value })} className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500" />
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setQuickDate(0)} className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">Today</button>
                  <button onClick={() => setQuickDate(1)} className="px-3 py-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg">Tomorrow</button>
                  <button onClick={() => setQuickDate(7)} className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">Next Week</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  <input type="text" placeholder="Location (optional)" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <Button onClick={handleSaveEvent} className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  {editingEventId ? 'Save Changes' : 'Add Event'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Profile manager */}
        {showProfileManager && !readOnly && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800 border border-rose-200 dark:border-rose-900/40 shadow-2xl">
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Layers2 className="h-5 w-5 text-rose-600" />
                    Profiles
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Stored in your notebook page JSON alongside events.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileManager(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-5">
                <div className="rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/30 border border-rose-200/80 dark:border-rose-900/50 p-4 space-y-2">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Add lanes like <strong>AI Film</strong>, <strong>Official</strong>, or custom clients. Existing events keep
                    their labels; use bulk assign to line everything up under one profile.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="New profile name…"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="flex-1 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomProfile())}
                  />
                  <Button
                    type="button"
                    onClick={addCustomProfile}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90 shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Your profiles</h4>
                  <ul className="space-y-2">
                    {profiles.map((p) => {
                      const count = events.filter((e) => e.profileId === p.id).length;
                      const reassignTo = reassignPick[p.id] ?? getReassignDefault(p.id);
                      return (
                        <li
                          key={p.id}
                          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-700"
                        >
                          <div>
                            <span className="font-medium text-neutral-900 dark:text-white">{p.name}</span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2">{count} event(s)</span>
                          </div>
                          {profiles.length > 1 && (
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={reassignTo}
                                onChange={(e) =>
                                  setReassignPick((m) => ({
                                    ...m,
                                    [p.id]: e.target.value,
                                  }))
                                }
                                className="text-sm px-2 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                                aria-label={`Move events from ${p.name} to another profile`}
                              >
                                {profiles
                                  .filter((x) => x.id !== p.id)
                                  .map((x) => (
                                    <option key={x.id} value={x.id}>
                                      Move to: {x.name}
                                    </option>
                                  ))}
                              </select>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                                onClick={() => {
                                  const target = reassignPick[p.id] ?? getReassignDefault(p.id);
                                  if (target) deleteProfile(p.id, target);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Bulk assign (existing data)</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Set every event in this notebook to one profile—handy after turning on profiles or importing old dates.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={bulkAssignProfileId}
                      onChange={(e) => setBulkAssignProfileId(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                    >
                      <option value="">Choose profile…</option>
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-amber-400 text-amber-800 dark:text-amber-300"
                      disabled={!bulkAssignProfileId}
                      onClick={applyBulkAssign}
                    >
                      Apply to all events
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  className="w-full bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900"
                  onClick={() => setShowProfileManager(false)}
                >
                  Done
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Search and Filter Events popup */}
        {showSearchFilterPopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-xl bg-white dark:bg-neutral-800">
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Search and filter events</h3>
                <button onClick={() => setShowSearchFilterPopup(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">Filter by event title</label>
                  <input type="text" placeholder="Event title..." value={searchEventTitle} onChange={(e) => setSearchEventTitle(e.target.value)} className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">Search by date</label>
                  <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">Filter by category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="All">All labels (profile names)</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Events are ordered with upcoming first, then past. This week counts only future events (0–7 days).</p>
                <div className="flex gap-2">
                  <Button onClick={() => { setSearchEventTitle(''); setSearchDate(''); setFilterCategory('All'); }} className="flex-1 bg-neutral-500 text-white hover:bg-neutral-600">Clear filters</Button>
                  <Button onClick={() => setShowSearchFilterPopup(false)} className="flex-1 bg-rose-500 text-white hover:bg-rose-600">Done</Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Documentation Modal */}
        {showDocumentation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800">
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <CalendarDays className="h-6 w-6 text-rose-600" />
                    Save the Date - Template Documentation
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Complete guide to features and capabilities</p>
                </div>
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Overview */}
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">📋 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Save the Date is a comprehensive event management template designed to help you track important dates, deadlines, and appointments. 
                    With smart reminder notifications and automatic countdown tracking, you'll never miss an important event again.
                  </p>
                </section>

                {/* Key Features */}
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">✨ Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-rose-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Smart Reminders</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Visual alert banner shows events coming up in the next 3 days with animated notifications</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Automatic Countdown</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Real-time countdown shows days remaining until each event, updates automatically</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Category Organization</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Organize events by Personal, Work, Health, or Social categories with color coding</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Toggle Reminders</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the bell icon to turn reminders on/off for individual events</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Color-Coded Urgency</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Red for urgent (0-3 days), amber for soon (4-7 days), green for future events</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-pink-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Event Details</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Track date, time, location, and category for each event</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-cyan-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Auto-Sort Events</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Events automatically sorted by date with upcoming events shown first</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Delete Events</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Remove past or cancelled events with beautiful confirmation dialog</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* How to Use */}
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">1. Adding a New Event</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Fill in the event title, select a category, choose the date and time, optionally add a location, then click "Add Event". The event will appear in your list with an automatic countdown.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">2. Understanding the Reminder Alert</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">When events are 3 days or less away, an orange alert banner appears at the top showing all upcoming events. This helps you stay aware of imminent deadlines and appointments.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">3. Managing Reminders</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the bell icon next to any event to toggle reminders on/off. When ON, the bell is filled and amber-colored. When OFF, it's gray and outlined. Only events with reminders ON will appear in the alert banner.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">4. Reading the Countdown</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Each event shows a countdown badge. Red with pulse animation means TODAY. Red means 1-3 days. Amber means 4-7 days. Green means more than a week away. Past events show "Past" in gray.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">5. Deleting Events</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the trash icon on any event to delete it. A confirmation dialog will appear showing the event title to prevent accidental deletions.</p>
                    </div>
                  </div>
                </section>

                {/* Use Cases */}
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">💡 Use Cases</h3>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">•</span>
                      <span><strong>Work Deadlines:</strong> Track project milestones, submission dates, and important meetings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">•</span>
                      <span><strong>Personal Events:</strong> Remember birthdays, anniversaries, and social gatherings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">•</span>
                      <span><strong>Health Appointments:</strong> Never miss doctor visits, dental checkups, or medication refills</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">•</span>
                      <span><strong>Social Activities:</strong> Keep track of concerts, events, and plans with friends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">•</span>
                      <span><strong>Travel Planning:</strong> Track flight dates, hotel bookings, and trip itineraries</span>
                    </li>
                  </ul>
                </section>

                {/* Tips */}
                <section className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-rose-200 dark:border-rose-800">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">💎 Pro Tips</h3>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">✓</span>
                      <span>Turn on reminders for critical events to ensure you see the alert banner</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">✓</span>
                      <span>Use categories to color-code and organize different types of events</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">✓</span>
                      <span>Add locations to events so you know where to go at a glance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">✓</span>
                      <span>Check the "This Week" stat to see how many events are coming up soon</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">✓</span>
                      <span>Delete past events regularly to keep your list clean and focused on the future</span>
                    </li>
                  </ul>
                </section>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <Button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90"
                >
                  Got It!
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white dark:bg-neutral-800 p-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Delete Event?</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                  Are you sure you want to delete:
                </p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  "{deleteConfirm.eventTitle}"
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={cancelDelete}
                    className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Event
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
        </div>
      </div>
      <TemplateFooter />
    </div>
  );
}
