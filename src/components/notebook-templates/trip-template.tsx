"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateFooter } from './template-footer';
import {
  Plane, Plus, Loader2, Trash2, MapPin, Calendar, Clock, Hotel,
  Utensils, Car, Camera, ShoppingBag, CheckCircle2, Circle,
  ChevronDown, ChevronUp, Sparkles, Globe, Users, AlertCircle,
  ExternalLink, Pencil, X, Check, Star, DollarSign, List,
  ChevronLeft, ChevronRight, Luggage, Train, Info,
} from "lucide-react";

//  Types 

interface Activity {
  id: string; time: string; title: string; location: string;
  category: "transport"|"accommodation"|"food"|"activity"|"shopping"|"other";
  cost: number; notes: string; completed: boolean; booked: boolean; url: string;
}
interface DayPlan { id: string; date: string; activities: Activity[]; }
interface PackingItem { id: string; name: string; category: string; packed: boolean; }
interface TripExpense { id: string; category: string; description: string; amount: number; date: string; paid: boolean; }

interface FlightSuggestion {
  airline: string; flightNumber: string; departure: string; arrival: string;
  duration: string; stops: number; price: number; class: string; url: string; bookingTip: string;
}
interface HotelSuggestion {
  name: string; stars: number; area: string; pricePerNight: number;
  highlights: string[]; rating: number; url: string; description: string;
}
interface RestaurantSuggestion {
  name: string; cuisine: string; area: string; priceRange: string;
  mustTry: string; rating: number; url: string; description: string;
}
interface TrainSuggestion {
  operator: string; trainName: string; departure: string; arrival: string;
  duration: string; class: string; price: number; amenities: string[]; url: string; bookingTip: string;
}

interface CheckThisData {
  importantHotels: { name: string; area: string; url: string }[];
  importantRestaurants: { name: string; cuisine: string; url: string }[];
  importantPlaces: { name: string; type: string; url: string }[];
  airways: { airline: string; routes: string; url: string }[];
}

interface Trip {
  id: string; name: string; destination: string; source: string;
  startDate: string; endDate: string; budget: number; currency: string;
  travelers: number; notes: string; itinerary: DayPlan[];
  packingList: PackingItem[]; expenses: TripExpense[];
  flights: FlightSuggestion[]; hotels: HotelSuggestion[];
  restaurants: RestaurantSuggestion[]; trains: TrainSuggestion[];
  checkThis: CheckThisData | null;
  createdAt: string;
}

interface TripTemplateProps { title?: string; notebookId?: string; }

//  Constants 

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "", name: "Euro" },
  { code: "GBP", symbol: "", name: "British Pound" },
  { code: "INR", symbol: "", name: "Indian Rupee" },
  { code: "JPY", symbol: "", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "AED", symbol: "?.?", name: "UAE Dirham" },
  { code: "THB", symbol: "", name: "Thai Baht" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "KRW", symbol: "", name: "South Korean Won" },
  { code: "CNY", symbol: "", name: "Chinese Yuan" },
];

const ACTIVITY_CATEGORIES = [
  { id: "transport", name: "Transport", icon: Car, color: "#3b82f6" },
  { id: "accommodation", name: "Accommodation", icon: Hotel, color: "#8b5cf6" },
  { id: "food", name: "Food & Dining", icon: Utensils, color: "#f97316" },
  { id: "activity", name: "Activity", icon: Camera, color: "#22c55e" },
  { id: "shopping", name: "Shopping", icon: ShoppingBag, color: "#ec4899" },
  { id: "other", name: "Other", icon: Globe, color: "#64748b" },
];

const PACKING_CATEGORIES = ["Clothing","Toiletries","Electronics","Documents","Medicine","Other"];

const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const blankTrip = (): Partial<Trip> => ({
  name: "", destination: "", source: "", startDate: "", endDate: "",
  budget: 0, currency: "USD", travelers: 1, notes: "",
});

const getCurrencySymbol = (code: string) => CURRENCIES.find(c => c.code === code)?.symbol ?? code;

const formatMoney = (amount: number, currency: string) => {
  const sym = getCurrencySymbol(currency);
  return `${sym}${amount.toLocaleString()}`;
};

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const generateDates = (start: string, end: string): string[] => {
  const dates: string[] = [];
  const cur = new Date(start + "T00:00:00");
  const endD = new Date(end + "T00:00:00");
  while (cur <= endD) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

const getCategoryInfo = (id: string) => ACTIVITY_CATEGORIES.find(c => c.id === id) ?? ACTIVITY_CATEGORIES[5];

// ── TripForm (top-level to prevent remount on parent re-render) ───────────────

interface TripFormProps {
  isEdit?: boolean;
  formData: Partial<Trip>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Trip>>>;
  onSubmit: () => void;
  onClose: () => void;
}

function TripForm({ isEdit, formData, setFormData, onSubmit, onClose }: TripFormProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl p-8 w-full max-w-lg border border-neutral-200 dark:border-neutral-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{isEdit ? "Edit Trip" : "Create New Trip"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"><X className="w-5 h-5"/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-500 mb-1 block uppercase tracking-wide">Trip Name</label>
            <input value={formData.name || ""} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Summer in Paris" className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-500 mb-1 block uppercase tracking-wide">From (Source City)</label>
              <input value={formData.source || ""} onChange={e => setFormData(p => ({ ...p, source: e.target.value }))}
                placeholder="e.g. New York" className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 mb-1 block uppercase tracking-wide">Destination *</label>
              <input value={formData.destination || ""} onChange={e => setFormData(p => ({ ...p, destination: e.target.value }))}
                placeholder="e.g. Paris, France" className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-500 mb-1 block uppercase tracking-wide">Start Date *</label>
              <input type="date" value={formData.startDate || ""} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 mb-1 block uppercase tracking-wide">End Date *</label>
              <input type="date" value={formData.endDate || ""} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-500 mb-1 block uppercase tracking-wide">Budget</label>
              <input type="number" value={formData.budget || ""} onChange={e => setFormData(p => ({ ...p, budget: parseFloat(e.target.value) || 0 }))}
                placeholder="0" className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 mb-1 block uppercase tracking-wide">Currency</label>
              <select value={formData.currency || "USD"} onChange={e => setFormData(p => ({ ...p, currency: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 mb-1 block uppercase tracking-wide">Travelers</label>
            <input type="number" min={1} value={formData.travelers || 1} onChange={e => setFormData(p => ({ ...p, travelers: parseInt(e.target.value) || 1 }))}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 mb-1 block uppercase tracking-wide">Notes</label>
            <textarea value={formData.notes || ""} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              placeholder="Any special notes..." rows={2}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm resize-none"/>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onSubmit}
              disabled={!formData.destination || !formData.startDate || !formData.endDate}
              className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white rounded-xl font-semibold text-sm transition-colors">
              {isEdit ? "Save Changes" : "Create Trip ✈️"}
            </button>
            <button onClick={onClose} className="px-6 py-3 text-neutral-500 hover:text-neutral-700 text-sm">Cancel</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


//  Main Component 

export function TripTemplate({ title = "Trip Planner", notebookId }: TripTemplateProps) {
  //  State 
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview"|"itinerary"|"packing"|"budget"|"flights"|"hotels"|"restaurants"|"trains">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Create / edit form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Trip>>(blankTrip());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Itinerary
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [addingActivityDay, setAddingActivityDay] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({ time: "09:00", title: "", location: "", category: "activity", cost: 0, notes: "", booked: false, url: "" });
  const [generatingDay, setGeneratingDay] = useState<string | null>(null);

  // Packing
  const [addingPackingItem, setAddingPackingItem] = useState(false);
  const [newPackingItem, setNewPackingItem] = useState({ name: "", category: "Clothing" });

  // Budget
  const [addingExpense, setAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<TripExpense>>({ category: "transport", description: "", amount: 0, date: new Date().toISOString().split("T")[0], paid: false });

  // AI loading states
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [loadingMoreFlights, setLoadingMoreFlights] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingMoreHotels, setLoadingMoreHotels] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [loadingMoreRestaurants, setLoadingMoreRestaurants] = useState(false);
  const [loadingTrains, setLoadingTrains] = useState(false);
  const [loadingMoreTrains, setLoadingMoreTrains] = useState(false);
  const [loadingCheckThis, setLoadingCheckThis] = useState(false);
  const [loadingPacking, setLoadingPacking] = useState(false);

  // Refs
  const pageIdRef = useRef<string | null>(null);
  const saveRef = useRef<NodeJS.Timeout | null>(null);
  const tripsRef = useRef<Trip[]>([]);
  const activeIdRef = useRef<string | null>(null);
  const [saveVersion, setSaveVersion] = useState(0);
  const bumpSave = useCallback(() => setSaveVersion(v => v + 1), []);

  // Keep activeIdRef in sync
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  const trip = trips.find(t => t.id === activeId) ?? null;

  //  DB Load 
  useEffect(() => {
    if (!notebookId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages`);
        const json = await res.json();
        const pages: any[] = json.pages ?? [];
        const existing = pages.find((p: any) => p.title === "__trip_template__");
        if (existing) {
          pageIdRef.current = existing._id;
          try {
            const data = JSON.parse(existing.content || "{}");
            const loaded: Trip[] = data.trips ?? [];
            setTrips(loaded);
            tripsRef.current = loaded;
            setActiveId(data.activeId ?? loaded[0]?.id ?? null);
          } catch {}
        } else {
          const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "__trip_template__", content: JSON.stringify({ trips: [], activeId: null }) }),
          });
          const created = await cr.json();
          pageIdRef.current = created.page?._id ?? null;
        }
      } catch (err) { console.error("Load failed:", err); }
      finally { setLoading(false); }
    })();
  }, [notebookId]);

  //  DB Save 
  useEffect(() => {
    if (saveVersion === 0 || !notebookId) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(async () => {
      const pid = pageIdRef.current; if (!pid) return;
      setSaving(true);
      try {
        await fetch(`/api/notebooks/${notebookId}/pages/${pid}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "__trip_template__",
            content: JSON.stringify({ trips: tripsRef.current, activeId: activeIdRef.current }),
          }),
        });
      } catch (err) { console.error("Save failed:", err); }
      finally { setSaving(false); }
    }, 1200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveVersion, notebookId]);

  // Save immediately on unmount to prevent data loss on navigation
  useEffect(() => {
    return () => {
      const pid = pageIdRef.current;
      if (pid && notebookId && tripsRef.current.length > 0) {
        // Clear any pending timeout
        if (saveRef.current) clearTimeout(saveRef.current);
        // Save immediately using navigator.sendBeacon for reliability during unmount
        const data = JSON.stringify({
          title: "__trip_template__",
          content: JSON.stringify({ trips: tripsRef.current, activeId: activeIdRef.current }),
        });
        // Try fetch with keepalive flag first
        fetch(`/api/notebooks/${notebookId}/pages/${pid}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: data,
          keepalive: true,
        }).catch(() => {
          // Fallback to sendBeacon if fetch fails
          const blob = new Blob([data], { type: 'application/json' });
          navigator.sendBeacon(`/api/notebooks/${notebookId}/pages/${pid}`, blob);
        });
      }
    };
  }, [notebookId]);

  const setAndSave = useCallback((list: Trip[]) => {
    setTrips(list); tripsRef.current = list; bumpSave();
  }, [bumpSave]);

  const updateTrip = useCallback((patch: Partial<Trip> | ((t: Trip) => Trip)) => {
    setTrips(prev => {
      const id = activeIdRef.current;
      const next = prev.map(t => t.id === id
        ? (typeof patch === "function" ? patch(t) : { ...t, ...patch })
        : t
      );
      tripsRef.current = next;
      return next;
    });
    bumpSave();
  }, [bumpSave]);

  //  Trip CRUD 
  const createTrip = () => {
    if (!formData.destination || !formData.startDate || !formData.endDate) return;
    const dates = generateDates(formData.startDate, formData.endDate);
    const itinerary: DayPlan[] = dates.map(date => ({ id: `day-${date}`, date, activities: [] }));
    const newTrip: Trip = {
      id: makeId(), name: formData.name || formData.destination,
      destination: formData.destination!, source: formData.source || "",
      startDate: formData.startDate!, endDate: formData.endDate!,
      budget: formData.budget || 0, currency: formData.currency || "USD",
      travelers: formData.travelers || 1, notes: formData.notes || "",
      itinerary, packingList: [], expenses: [],
      flights: [], hotels: [], restaurants: [], trains: [], checkThis: null,
      createdAt: new Date().toISOString(),
    };
    const next = [...tripsRef.current, newTrip];
    setAndSave(next); setActiveId(newTrip.id);
    setShowCreateForm(false); setFormData(blankTrip());
    setExpandedDays(new Set([`day-${dates[0]}`]));
    setActiveTab("overview");
  };

  const saveEditTrip = () => {
    if (!editingTrip || !formData.destination || !formData.startDate || !formData.endDate) return;
    setTrips(prev => {
      const next = prev.map(t => {
        if (t.id !== editingTrip) return t;
        const dates = generateDates(formData.startDate!, formData.endDate!);
        const existingMap = new Map(t.itinerary.map(d => [d.date, d]));
        const itinerary: DayPlan[] = dates.map(date => existingMap.get(date) ?? { id: `day-${date}`, date, activities: [] });
        return { ...t, ...formData, itinerary, trains: t.trains ?? [], flights: t.flights ?? [], hotels: t.hotels ?? [], restaurants: t.restaurants ?? [], checkThis: t.checkThis ?? null };
      });
      tripsRef.current = next; return next;
    });
    bumpSave(); setEditingTrip(null); setFormData(blankTrip());
  };

  const deleteTrip = (id: string) => {
    const next = tripsRef.current.filter(t => t.id !== id);
    setAndSave(next);
    setConfirmDeleteId(null);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  };

  //  Trip stats 
  const tripStats = useMemo(() => {
    if (!trip) return { days: 0, spent: 0, remaining: 0, activitiesCount: 0, packedCount: 0, totalPacking: 0 };
    const dates = generateDates(trip.startDate, trip.endDate);
    const days = dates.length;
    const spent = trip.expenses.reduce((s, e) => s + e.amount, 0);
    const activitiesCount = trip.itinerary.reduce((s, d) => s + d.activities.length, 0);
    const packedCount = trip.packingList.filter(i => i.packed).length;
    return { days, spent, remaining: trip.budget - spent, activitiesCount, packedCount, totalPacking: trip.packingList.length };
  }, [trip]);

  //  Itinerary helpers 
  const addActivity = (dayId: string) => {
    if (!newActivity.title) return;
    const act: Activity = {
      id: makeId(), time: newActivity.time || "09:00", title: newActivity.title,
      location: newActivity.location || "", category: newActivity.category as Activity["category"] || "activity",
      cost: newActivity.cost || 0, notes: newActivity.notes || "",
      completed: false, booked: newActivity.booked || false, url: newActivity.url || "",
    };
    updateTrip(t => ({
      ...t, itinerary: t.itinerary.map(d => d.id === dayId
        ? { ...d, activities: [...d.activities, act].sort((a, b) => a.time.localeCompare(b.time)) }
        : d)
    }));
    setNewActivity({ time: "09:00", title: "", location: "", category: "activity", cost: 0, notes: "", booked: false, url: "" });
    setAddingActivityDay(null);
  };

  const deleteActivity = (dayId: string, actId: string) =>
    updateTrip(t => ({ ...t, itinerary: t.itinerary.map(d => d.id === dayId ? { ...d, activities: d.activities.filter(a => a.id !== actId) } : d) }));

  const toggleActivityComplete = (dayId: string, actId: string) =>
    updateTrip(t => ({ ...t, itinerary: t.itinerary.map(d => d.id === dayId ? { ...d, activities: d.activities.map(a => a.id === actId ? { ...a, completed: !a.completed } : a) } : d) }));

  //  Packing helpers 
  const addPackingItem = () => {
    if (!newPackingItem.name) return;
    updateTrip(t => ({ ...t, packingList: [...t.packingList, { id: makeId(), name: newPackingItem.name, category: newPackingItem.category, packed: false }] }));
    setNewPackingItem({ name: "", category: "Clothing" }); setAddingPackingItem(false);
  };
  const togglePackingItem = (id: string) => updateTrip(t => ({ ...t, packingList: t.packingList.map(i => i.id === id ? { ...i, packed: !i.packed } : i) }));
  const deletePackingItem = (id: string) => updateTrip(t => ({ ...t, packingList: t.packingList.filter(i => i.id !== id) }));

  //  Expense helpers 
  const addExpense = () => {
    if (!newExpense.amount) return;
    updateTrip(t => ({ ...t, expenses: [...t.expenses, { id: makeId(), category: newExpense.category || "other", description: newExpense.description || "", amount: newExpense.amount!, date: newExpense.date || new Date().toISOString().split("T")[0], paid: newExpense.paid || false }] }));
    setNewExpense({ category: "transport", description: "", amount: 0, date: new Date().toISOString().split("T")[0], paid: false });
    setAddingExpense(false);
  };
  const deleteExpense = (id: string) => updateTrip(t => ({ ...t, expenses: t.expenses.filter(e => e.id !== id) }));
  const toggleExpensePaid = (id: string) => updateTrip(t => ({ ...t, expenses: t.expenses.map(e => e.id === id ? { ...e, paid: !e.paid } : e) }));

  //  AI helpers 
  const aiCall = async (planType: string, extra: Record<string, any> = {}) => {
    if (!trip) return null;
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: planType, mode: "trip_plan", planType,
        destination: trip.destination, source: trip.source,
        days: tripStats.days, travelers: trip.travelers,
        budget: trip.budget, currency: trip.currency,
        notebookId, ...extra,
      }),
    });
    return res.json();
  };

  const generateFlights = async (append = false) => {
    append ? setLoadingMoreFlights(true) : setLoadingFlights(true);
    try {
      const existing = append ? tripsRef.current.find(t => t.id === activeIdRef.current)?.flights.map(f => f.airline + " " + f.flightNumber) ?? [] : [];
      const data = await aiCall("flights", { existingItems: existing });
      if (data?.flights) updateTrip(t => {
        if (!append) return { ...t, flights: data.flights };
        const existingKeys = new Set(t.flights.map((f: FlightSuggestion) => f.airline + f.flightNumber));
        const fresh = data.flights.filter((f: FlightSuggestion) => !existingKeys.has(f.airline + f.flightNumber));
        return { ...t, flights: [...t.flights, ...fresh] };
      });
    } catch (e) { console.error(e); } finally { append ? setLoadingMoreFlights(false) : setLoadingFlights(false); }
  };

  const generateHotels = async (append = false) => {
    append ? setLoadingMoreHotels(true) : setLoadingHotels(true);
    try {
      const existing = append ? tripsRef.current.find(t => t.id === activeIdRef.current)?.hotels.map(h => h.name) ?? [] : [];
      const data = await aiCall("hotels", { existingItems: existing });
      if (data?.hotels) updateTrip(t => {
        if (!append) return { ...t, hotels: data.hotels };
        const existingNames = new Set(t.hotels.map((h: HotelSuggestion) => h.name.toLowerCase()));
        const fresh = data.hotels.filter((h: HotelSuggestion) => !existingNames.has(h.name.toLowerCase()));
        return { ...t, hotels: [...t.hotels, ...fresh] };
      });
    } catch (e) { console.error(e); } finally { append ? setLoadingMoreHotels(false) : setLoadingHotels(false); }
  };

  const generateRestaurants = async (append = false) => {
    append ? setLoadingMoreRestaurants(true) : setLoadingRestaurants(true);
    try {
      const existing = append ? tripsRef.current.find(t => t.id === activeIdRef.current)?.restaurants.map(r => r.name) ?? [] : [];
      const data = await aiCall("restaurants", { existingItems: existing });
      if (data?.restaurants) updateTrip(t => {
        if (!append) return { ...t, restaurants: data.restaurants };
        const existingNames = new Set(t.restaurants.map((r: RestaurantSuggestion) => r.name.toLowerCase()));
        const fresh = data.restaurants.filter((r: RestaurantSuggestion) => !existingNames.has(r.name.toLowerCase()));
        return { ...t, restaurants: [...t.restaurants, ...fresh] };
      });
    } catch (e) { console.error(e); } finally { append ? setLoadingMoreRestaurants(false) : setLoadingRestaurants(false); }
  };

  const generateTrains = async (append = false) => {
    append ? setLoadingMoreTrains(true) : setLoadingTrains(true);
    try {
      const existing = append ? tripsRef.current.find(t => t.id === activeIdRef.current)?.trains?.map(tr => tr.operator + " " + tr.trainName) ?? [] : [];
      const data = await aiCall("trains", { existingItems: existing });
      if (data?.trains) updateTrip(t => {
        if (!append) return { ...t, trains: data.trains };
        const existingKeys = new Set((t.trains || []).map((tr: TrainSuggestion) => (tr.operator + tr.trainName).toLowerCase()));
        const fresh = data.trains.filter((tr: TrainSuggestion) => !existingKeys.has((tr.operator + tr.trainName).toLowerCase()));
        return { ...t, trains: [...(t.trains || []), ...fresh] };
      });
    } catch (e) { console.error(e); } finally { append ? setLoadingMoreTrains(false) : setLoadingTrains(false); }
  };

  const generateCheckThis = async () => {
    setLoadingCheckThis(true);
    try { const data = await aiCall("check_this"); if (data) updateTrip(t => ({ ...t, checkThis: data })); }
    catch (e) { console.error(e); } finally { setLoadingCheckThis(false); }
  };

  const generateDayItinerary = async (dayId: string, dayNumber: number, date: string) => {
    setGeneratingDay(dayId);
    try {
      const data = await aiCall("itinerary_day", { dayNumber, date });
      if (data?.activities) {
        const activities: Activity[] = data.activities.map((a: any, i: number) => ({
          id: makeId(), time: a.time || "09:00", title: a.title || "Activity",
          location: a.location || "", category: a.category || "activity",
          cost: a.cost || 0, notes: a.notes || "", completed: false,
          booked: false, url: a.url || "",
        }));
        updateTrip(t => ({
          ...t, itinerary: t.itinerary.map(d => d.id === dayId
            ? { ...d, activities: [...d.activities, ...activities].sort((a, b) => a.time.localeCompare(b.time)) }
            : d)
        }));
        setExpandedDays(prev => new Set([...prev, dayId]));
      }
    } catch (e) { console.error(e); } finally { setGeneratingDay(null); }
  };

  const generatePacking = async () => {
    setLoadingPacking(true);
    try {
      const data = await aiCall("packing");
      if (data?.items) {
        const items: PackingItem[] = data.items.map((item: any, i: number) => ({ id: makeId(), name: item.name, category: item.category || "Other", packed: false }));
        updateTrip(t => ({ ...t, packingList: [...t.packingList, ...items] }));
      }
    } catch (e) { console.error(e); } finally { setLoadingPacking(false); }
  };

  //  Grouped helpers 
  const packingByCategory = useMemo(() => {
    if (!trip) return {} as Record<string, PackingItem[]>;
    const g: Record<string, PackingItem[]> = {};
    trip.packingList.forEach(i => { if (!g[i.category]) g[i.category] = []; g[i.category].push(i); });
    return g;
  }, [trip]);

  const expensesByCategory = useMemo(() => {
    if (!trip) return {} as Record<string, number>;
    const g: Record<string, number> = {};
    trip.expenses.forEach(e => { g[e.category] = (g[e.category] || 0) + e.amount; });
    return g;
  }, [trip]);


  //  Loading 
  if (loading) return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-sky-50 to-blue-50 dark:from-neutral-950 dark:to-neutral-900">
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500"/>
      </div>
      <TemplateFooter />
    </div>
  );

  const closeForm = () => { setShowCreateForm(false); setEditingTrip(null); setFormData(blankTrip()); };

  return (
    <div className="h-full min-h-0 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-neutral-950 dark:to-neutral-900 flex flex-col">
      <div className="flex-1 min-h-0 flex overflow-hidden">
      {/* Modals */}
      {showCreateForm && <TripForm formData={formData} setFormData={setFormData} onSubmit={createTrip} onClose={closeForm}/>}
      {editingTrip && <TripForm isEdit formData={formData} setFormData={setFormData} onSubmit={saveEditTrip} onClose={closeForm}/>}

      {/* Saving indicator */}
      {saving && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 text-xs px-3 py-2 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500"/> Saving...
        </div>
      )}

      {/*  Sidebar  */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Plane className="w-4 h-4 text-white"/>
                  </div>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">{title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowDocumentation(true)}
                    className="p-1.5 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 text-sky-600 dark:text-sky-400 transition-colors"
                    title="Documentation"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                    <ChevronLeft className="w-4 h-4"/>
                  </button>
                </div>
              </div>
              <button onClick={() => { setFormData(blankTrip()); setShowCreateForm(true); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4"/> New Trip
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 min-h-0">
              {trips.length === 0 && <p className="text-xs text-neutral-400 italic px-2 py-4">No trips yet</p>}
              {trips.map(t => (
                <div key={t.id} className={`rounded-xl mb-1.5 transition-all ${t.id === activeId ? "bg-sky-50 dark:bg-sky-900/20 ring-1 ring-sky-200 dark:ring-sky-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}>
                  <div className="flex items-center gap-2 p-3 group cursor-pointer" onClick={() => { setActiveId(t.id); setActiveTab("overview"); }}>
                    <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Plane className="w-3.5 h-3.5 text-white"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${t.id === activeId ? "text-sky-700 dark:text-sky-300" : "text-neutral-800 dark:text-neutral-200"}`}>{t.name || t.destination}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{t.destination}</p>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); setFormData({ ...t }); setEditingTrip(t.id); }}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400"><Pencil className="w-3 h-3"/></button>
                      <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(confirmDeleteId === t.id ? null : t.id); }}
                        className={`p-1 rounded transition-colors ${confirmDeleteId === t.id ? "bg-red-100 dark:bg-red-900/30 text-red-500" : "hover:bg-red-50 text-neutral-400 hover:text-red-500"}`}>
                        <Trash2 className="w-3 h-3"/>
                      </button>
                    </div>
                  </div>
                  {confirmDeleteId === t.id && (
                    <div className="px-3 pb-3">
                      <p className="text-[11px] text-red-500 font-medium mb-2">Delete &quot;{t.name || t.destination}&quot;?</p>
                      <div className="flex gap-2">
                        <button onClick={() => deleteTrip(t.id)} className="flex-1 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium">Delete</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 rounded-lg text-xs">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*  Main  */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <div className="px-6 py-3 flex items-center gap-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                <ChevronRight className="w-4 h-4"/>
              </button>
            )}
            {trip ? (
              <>
                <div className="flex-1 min-w-0">
                  <h1 className="font-bold text-neutral-900 dark:text-white truncate">{trip.name || trip.destination}</h1>
                  <p className="text-xs text-neutral-500">
                    {trip.source && <span>{trip.source}  </span>}{trip.destination}  {tripStats.days} days  {trip.travelers} traveler{trip.travelers > 1 ? "s" : ""}  Budget: {formatMoney(trip.budget, trip.currency)}
                  </p>
                </div>
                <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl overflow-x-auto">
                  {([
                    ["overview","Overview",Globe],
                    ["itinerary","Itinerary",Calendar],
                    ["flights","Flights",Plane],
                    ["trains","Trains",Train],
                    ["hotels","Hotels",Hotel],
                    ["restaurants","Restaurants",Utensils],
                    ["packing","Packing",Luggage],
                    ["budget","Budget",DollarSign],
                  ] as const).map(([id, label, Icon]) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === id ? "bg-white dark:bg-neutral-700 text-sky-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
                      <Icon className="w-3.5 h-3.5"/><span className="hidden lg:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <h1 className="font-bold text-neutral-900 dark:text-white">{title}</h1>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* No trip */}
          {!trip && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Plane className="w-10 h-10 text-sky-500"/>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Plan Your Next Adventure</h2>
              <p className="text-neutral-500 mb-8 max-w-sm">Create a trip to start planning your itinerary, flights, hotels, restaurants, packing list and budget.</p>
              <button onClick={() => { setFormData(blankTrip()); setShowCreateForm(true); }}
                className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl font-semibold text-lg hover:opacity-90 flex items-center gap-2 transition-opacity">
                <Plus className="w-5 h-5"/> Create New Trip
              </button>
            </div>
          )}

          {trip && (
            <div className="max-w-5xl mx-auto space-y-6">

              {/*  Overview Tab  */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Hero card */}
                  <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div>
                        <h2 className="text-3xl font-bold mb-1">{trip.name || trip.destination}</h2>
                        {trip.source && <p className="text-sky-200 text-sm mb-2"> {trip.source}  {trip.destination}</p>}
                        <p className="text-sky-100 flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4"/> {formatDate(trip.startDate)}  {formatDate(trip.endDate)} ({tripStats.days} days)
                        </p>
                        <p className="text-sky-100 flex items-center gap-2 text-sm mt-1">
                          <Users className="w-4 h-4"/> {trip.travelers} traveler{trip.travelers > 1 ? "s" : ""}
                        </p>
                        <p className="text-sky-100 flex items-center gap-2 text-sm mt-1">
                          <DollarSign className="w-4 h-4"/> Budget: {formatMoney(trip.budget, trip.currency)} ({trip.currency})
                        </p>
                      </div>
                      <button onClick={() => { setFormData({ ...trip }); setEditingTrip(trip.id); }}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                        <Pencil className="w-4 h-4"/> Edit
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Budget", value: formatMoney(trip.budget, trip.currency), color: "text-neutral-900 dark:text-white" },
                      { label: "Spent", value: formatMoney(tripStats.spent, trip.currency), color: "text-red-600" },
                      { label: "Remaining", value: formatMoney(tripStats.remaining, trip.currency), color: tripStats.remaining >= 0 ? "text-green-600" : "text-red-600" },
                      { label: "Activities", value: String(tripStats.activitiesCount), color: "text-sky-600" },
                    ].map(s => (
                      <div key={s.label} className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800">
                        <p className="text-neutral-500 text-xs font-medium mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI Quick Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: "Suggest Flights", icon: Plane, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600", action: () => { generateFlights(); setActiveTab("flights"); }, loading: loadingFlights },
                      { label: "Suggest Hotels", icon: Hotel, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600", action: () => { generateHotels(); setActiveTab("hotels"); }, loading: loadingHotels },
                      { label: "Suggest Restaurants", icon: Utensils, color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600", action: () => { generateRestaurants(); setActiveTab("restaurants"); }, loading: loadingRestaurants },
                      { label: "Generate Packing List", icon: Luggage, color: "bg-green-100 dark:bg-green-900/30 text-green-600", action: () => { generatePacking(); setActiveTab("packing"); }, loading: loadingPacking },
                      { label: "Check This! (Must-Know)", icon: List, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600", action: () => { generateCheckThis(); setActiveTab("packing"); }, loading: loadingCheckThis },
                    ].map(({ label, icon: Icon, color, action, loading: l }) => (
                      <button key={label} onClick={action} disabled={l}
                        className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-sky-300 transition-all text-left flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                          {l ? <Loader2 className="w-5 h-5 animate-spin"/> : <Icon className="w-5 h-5"/>}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-neutral-900 dark:text-white">{label}</p>
                          <p className="text-xs text-neutral-400 flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI powered</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Packing progress */}
                  {trip.packingList.length > 0 && (
                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Packing Progress</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all"
                            style={{ width: `${tripStats.totalPacking > 0 ? (tripStats.packedCount / tripStats.totalPacking) * 100 : 0}%` }}/>
                        </div>
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{tripStats.packedCount}/{tripStats.totalPacking} packed</span>
                      </div>
                    </div>
                  )}
                  {trip.notes && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Notes</p>
                      <p className="text-sm text-amber-700 dark:text-amber-400">{trip.notes}</p>
                    </div>
                  )}
                </div>
              )}


              {/*  Itinerary Tab  */}
              {activeTab === "itinerary" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Day-by-Day Itinerary</h2>
                    <p className="text-xs text-neutral-400">Click  to AI-plan any day</p>
                  </div>
                  {trip.itinerary.map((day, dayIndex) => {
                    const isExpanded = expandedDays.has(day.id);
                    const dayTotal = day.activities.reduce((s, a) => s + a.cost, 0);
                    return (
                      <div key={day.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                        <div className="flex items-center px-5 py-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 gap-3"
                          onClick={() => setExpandedDays(prev => { const n = new Set(prev); n.has(day.id) ? n.delete(day.id) : n.add(day.id); return n; })}>
                          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">D{dayIndex + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-neutral-900 dark:text-white">{formatDate(day.date)}</p>
                            <p className="text-xs text-neutral-400">{day.activities.length} activities  {formatMoney(dayTotal, trip.currency)}</p>
                          </div>
                          <button onClick={e => { e.stopPropagation(); generateDayItinerary(day.id, dayIndex + 1, day.date); }}
                            disabled={generatingDay === day.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors mr-2">
                            {generatingDay === day.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Sparkles className="w-3.5 h-3.5"/>}
                            AI Plan Day
                          </button>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400"/> : <ChevronDown className="w-4 h-4 text-neutral-400"/>}
                        </div>
                        {isExpanded && (
                          <div className="px-5 pb-5 border-t border-neutral-100 dark:border-neutral-800">
                            {day.activities.length > 0 ? (
                              <div className="space-y-2 mt-4">
                                {day.activities.map(act => {
                                  const cat = getCategoryInfo(act.category);
                                  return (
                                    <div key={act.id} className={`flex items-start gap-3 p-4 rounded-xl group transition-colors ${act.completed ? "bg-green-50 dark:bg-green-900/20" : "bg-neutral-50 dark:bg-neutral-800"}`}>
                                      <button onClick={() => toggleActivityComplete(day.id, act.id)} className="mt-0.5 flex-shrink-0">
                                        {act.completed ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <Circle className="w-5 h-5 text-neutral-300"/>}
                                      </button>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                          <span className="text-xs font-mono text-sky-600 font-bold">{act.time}</span>
                                          <cat.icon className="w-3.5 h-3.5" style={{ color: cat.color }}/>
                                          <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: cat.color + "cc" }}>{cat.name}</span>
                                          {act.booked && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"> Booked</span>}
                                        </div>
                                        <p className={`font-semibold text-sm ${act.completed ? "line-through text-neutral-400" : "text-neutral-900 dark:text-white"}`}>{act.title}</p>
                                        {act.location && <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/>{act.location}</p>}
                                        {act.notes && <p className="text-xs text-neutral-400 mt-1 italic">{act.notes}</p>}
                                        {act.url && (
                                          <a href={act.url} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-sky-500 hover:text-sky-600 mt-1 transition-colors">
                                            <ExternalLink className="w-3 h-3"/> View on map
                                          </a>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        {act.cost > 0 && <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{formatMoney(act.cost, trip.currency)}</span>}
                                        <button onClick={() => deleteActivity(day.id, act.id)} className="p-1 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                          <Trash2 className="w-4 h-4"/>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-neutral-400 text-sm text-center py-6">No activities yet. Click &quot;AI Plan Day&quot; or add manually.</p>
                            )}
                            {/* Add activity form */}
                            {addingActivityDay === day.id ? (
                              <div className="mt-4 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800 space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  <input type="time" value={newActivity.time} onChange={e => setNewActivity(p => ({ ...p, time: e.target.value }))}
                                    className="px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg outline-none text-sm"/>
                                  <select value={newActivity.category} onChange={e => setNewActivity(p => ({ ...p, category: e.target.value as Activity["category"] }))}
                                    className="px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg outline-none text-sm">
                                    {ACTIVITY_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                  </select>
                                  <input value={newActivity.title} onChange={e => setNewActivity(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Activity name *" className="px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg outline-none text-sm md:col-span-2"/>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  <input value={newActivity.location} onChange={e => setNewActivity(p => ({ ...p, location: e.target.value }))}
                                    placeholder="Location" className="px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg outline-none text-sm md:col-span-2"/>
                                  <input type="number" value={newActivity.cost || ""} onChange={e => setNewActivity(p => ({ ...p, cost: parseFloat(e.target.value) || 0 }))}
                                    placeholder="Cost" className="px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg outline-none text-sm"/>
                                  <input value={newActivity.url} onChange={e => setNewActivity(p => ({ ...p, url: e.target.value }))}
                                    placeholder="URL (optional)" className="px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg outline-none text-sm"/>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => addActivity(day.id)} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium">Add</button>
                                  <button onClick={() => setAddingActivityDay(null)} className="px-4 py-2 text-neutral-500 text-sm">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setAddingActivityDay(day.id)}
                                className="mt-4 w-full py-3 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-400 hover:border-sky-300 hover:text-sky-500 flex items-center justify-center gap-2 text-sm transition-colors">
                                <Plus className="w-4 h-4"/> Add Activity Manually
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/*  Flights Tab  */}
              {activeTab === "flights" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Flight Suggestions</h2>
                      {trip.source && <p className="text-sm text-neutral-500">{trip.source}  {trip.destination}</p>}
                    </div>
                    <button onClick={() => generateFlights(false)} disabled={loadingFlights}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                      {loadingFlights ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                      {trip.flights.length > 0 ? "Refresh" : "Get AI Suggestions"}
                    </button>
                  </div>
                  {!trip.source && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0"/>
                      <p className="text-sm text-amber-700 dark:text-amber-300">Set a source city in your trip settings for better flight suggestions.</p>
                    </div>
                  )}
                  {loadingFlights && (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3"/>
                        <p className="text-neutral-500 text-sm">Finding best flights...</p>
                      </div>
                    </div>
                  )}
                  {!loadingFlights && trip.flights.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <Plane className="w-12 h-12 mx-auto mb-4 text-neutral-300"/>
                      <p className="text-neutral-400 mb-4">No flight suggestions yet</p>
                      <button onClick={() => generateFlights(false)} className="px-6 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600">Get AI Suggestions</button>
                    </div>
                  )}
                  <div className="space-y-3">
                    {trip.flights.map((f, i) => ( // flights list
                      <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Plane className="w-6 h-6 text-blue-600"/>
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900 dark:text-white">{f.airline}</p>
                              <p className="text-xs text-neutral-400">{f.flightNumber}  {f.class}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-center">
                            <div>
                              <p className="text-xl font-bold text-neutral-900 dark:text-white">{f.departure}</p>
                              <p className="text-xs text-neutral-400">{trip.source || "Origin"}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-neutral-400">{f.duration}</p>
                              <div className="flex items-center gap-1 my-1">
                                <div className="w-8 h-px bg-neutral-300"/>
                                <Plane className="w-3 h-3 text-neutral-400"/>
                                <div className="w-8 h-px bg-neutral-300"/>
                              </div>
                              <p className="text-xs text-neutral-400">{f.stops === 0 ? "Non-stop" : `${f.stops} stop${f.stops > 1 ? "s" : ""}`}</p>
                            </div>
                            <div>
                              <p className="text-xl font-bold text-neutral-900 dark:text-white">{f.arrival}</p>
                              <p className="text-xs text-neutral-400">{trip.destination}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-sky-600">{formatMoney(f.price, trip.currency)}</p>
                            <p className="text-xs text-neutral-400">per person</p>
                          </div>
                        </div>
                        {f.bookingTip && <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg"> {f.bookingTip}</p>}
                        <div className="mt-3 flex justify-end">
                          <a href={f.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">
                            <ExternalLink className="w-4 h-4"/> Search Flights
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  {trip.flights.length > 0 && (
                    <button onClick={() => generateFlights(true)} disabled={loadingMoreFlights}
                      className="w-full py-3 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl text-blue-500 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-50">
                      {loadingMoreFlights ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>}
                      {loadingMoreFlights ? "Loading more flights..." : "Load More Flights"}
                    </button>
                  )}
                </div>
              )}

              {/*  Hotels Tab  */}
              {activeTab === "hotels" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Hotel Suggestions</h2>
                    <button onClick={() => generateHotels(false)} disabled={loadingHotels}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                      {loadingHotels ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                      {trip.hotels.length > 0 ? "Refresh" : "Get AI Suggestions"}
                    </button>
                  </div>
                  {loadingHotels && <div className="flex items-center justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto"/></div>}
                  {!loadingHotels && trip.hotels.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <Hotel className="w-12 h-12 mx-auto mb-4 text-neutral-300"/>
                      <p className="text-neutral-400 mb-4">No hotel suggestions yet</p>
                      <button onClick={() => generateHotels(false)} className="px-6 py-3 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600">Get AI Suggestions</button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trip.hotels.map((h, i) => (
                      <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-purple-300 transition-colors flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-white">{h.name}</p>
                            <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/>{h.area}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-purple-600">{formatMoney(h.pricePerNight, trip.currency)}</p>
                            <p className="text-xs text-neutral-400">per night</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, si) => (
                              <Star key={si} className={`w-3.5 h-3.5 ${si < h.stars ? "text-yellow-400 fill-yellow-400" : "text-neutral-200"}`}/>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">{h.rating}/10</span>
                        </div>
                        <p className="text-xs text-neutral-500 mb-3 flex-1">{h.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {h.highlights.map((hl, hi) => (
                            <span key={hi} className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-full">{hl}</span>
                          ))}
                        </div>
                        <a href={h.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors">
                          <ExternalLink className="w-4 h-4"/> Book on Booking.com
                        </a>
                      </div>
                    ))}
                  </div>
                  {trip.hotels.length > 0 && (
                    <button onClick={() => generateHotels(true)} disabled={loadingMoreHotels}
                      className="w-full py-3 border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-xl text-purple-500 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-50">
                      {loadingMoreHotels ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>}
                      {loadingMoreHotels ? "Loading more hotels..." : "Load More Hotels"}
                    </button>
                  )}
                </div>
              )}

              {/*  Restaurants Tab  */}
              {activeTab === "restaurants" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Restaurant Suggestions</h2>
                    <button onClick={() => generateRestaurants(false)} disabled={loadingRestaurants}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                      {loadingRestaurants ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                      {trip.restaurants.length > 0 ? "Refresh" : "Get AI Suggestions"}
                    </button>
                  </div>
                  {loadingRestaurants && <div className="flex items-center justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto"/></div>}
                  {!loadingRestaurants && trip.restaurants.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <Utensils className="w-12 h-12 mx-auto mb-4 text-neutral-300"/>
                      <p className="text-neutral-400 mb-4">No restaurant suggestions yet</p>
                      <button onClick={() => generateRestaurants(false)} className="px-6 py-3 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600">Get AI Suggestions</button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trip.restaurants.map((r, i) => (
                      <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-orange-300 transition-colors flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-white">{r.name}</p>
                            <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/>{r.area}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-sm font-bold text-orange-600">{r.priceRange}</span>
                            <div className="flex items-center gap-1 justify-end mt-0.5">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400"/>
                              <span className="text-xs font-semibold">{r.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2 py-0.5 rounded-full">{r.cuisine}</span>
                        </div>
                        <p className="text-xs text-neutral-500 mb-2 flex-1">{r.description}</p>
                        {r.mustTry && <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg mb-3"> Must try: <span className="font-semibold">{r.mustTry}</span></p>}
                        <a href={r.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
                          <ExternalLink className="w-4 h-4"/> View on TripAdvisor
                        </a>
                      </div>
                    ))}
                  </div>
                  {trip.restaurants.length > 0 && (
                    <button onClick={() => generateRestaurants(true)} disabled={loadingMoreRestaurants}
                      className="w-full py-3 border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-xl text-orange-500 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-50">
                      {loadingMoreRestaurants ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>}
                      {loadingMoreRestaurants ? "Loading more restaurants..." : "Load More Restaurants"}
                    </button>
                  )}
                </div>
              )}

              {/* ── Trains Tab ── */}
              {activeTab === "trains" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Train Suggestions</h2>
                      {trip.source && <p className="text-sm text-neutral-500">{trip.source} → {trip.destination}</p>}
                    </div>
                    <button onClick={() => generateTrains(false)} disabled={loadingTrains}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                      {loadingTrains ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                      {(trip.trains || []).length > 0 ? "Refresh" : "Get AI Suggestions"}
                    </button>
                  </div>
                  {!trip.source && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0"/>
                      <p className="text-sm text-amber-700 dark:text-amber-300">Set a source city in your trip settings for better train suggestions.</p>
                    </div>
                  )}
                  {loadingTrains && (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto mb-3"/><p className="text-neutral-500 text-sm">Finding best trains...</p></div>
                    </div>
                  )}
                  {!loadingTrains && (trip.trains || []).length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <Train className="w-12 h-12 mx-auto mb-4 text-neutral-300"/>
                      <p className="text-neutral-400 mb-4">No train suggestions yet</p>
                      <button onClick={() => generateTrains(false)} className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600">Get AI Suggestions</button>
                    </div>
                  )}
                  <div className="space-y-3">
                    {(trip.trains || []).map((tr, i) => (
                      <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-300 transition-colors">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Train className="w-6 h-6 text-emerald-600"/>
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900 dark:text-white">{tr.operator}</p>
                              <p className="text-xs text-neutral-400">{tr.trainName} · {tr.class}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-center">
                            <div><p className="text-xl font-bold text-neutral-900 dark:text-white">{tr.departure}</p><p className="text-xs text-neutral-400">{trip.source || "Origin"}</p></div>
                            <div className="text-center">
                              <p className="text-xs text-neutral-400">{tr.duration}</p>
                              <div className="flex items-center gap-1 my-1"><div className="w-8 h-px bg-neutral-300"/><Train className="w-3 h-3 text-neutral-400"/><div className="w-8 h-px bg-neutral-300"/></div>
                              <p className="text-xs text-emerald-600 font-medium">Direct</p>
                            </div>
                            <div><p className="text-xl font-bold text-neutral-900 dark:text-white">{tr.arrival}</p><p className="text-xs text-neutral-400">{trip.destination}</p></div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600">{formatMoney(tr.price, trip.currency)}</p>
                            <p className="text-xs text-neutral-400">per person</p>
                          </div>
                        </div>
                        {tr.amenities && tr.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {tr.amenities.map((a, ai) => <span key={ai} className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-2 py-0.5 rounded-full">{a}</span>)}
                          </div>
                        )}
                        {tr.bookingTip && <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">💡 {tr.bookingTip}</p>}
                        <div className="mt-3 flex justify-end">
                          <a href={tr.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors">
                            <ExternalLink className="w-4 h-4"/> Search Trains
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(trip.trains || []).length > 0 && (
                    <button onClick={() => generateTrains(true)} disabled={loadingMoreTrains}
                      className="w-full py-3 border-2 border-dashed border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-500 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-50">
                      {loadingMoreTrains ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>}
                      {loadingMoreTrains ? "Loading more trains..." : "Load More Trains"}
                    </button>
                  )}
                </div>
              )}

              {/*  Packing + Check This Tab  */}
              {activeTab === "packing" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Packing List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Packing List</h2>
                      <div className="flex gap-2">
                        <button onClick={generatePacking} disabled={loadingPacking}
                          className="flex items-center gap-1.5 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl text-xs font-medium hover:bg-purple-200 transition-colors disabled:opacity-50">
                          {loadingPacking ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Sparkles className="w-3.5 h-3.5"/>} AI Suggest
                        </button>
                        <button onClick={() => setAddingPackingItem(true)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-sky-500 text-white rounded-xl text-xs font-medium hover:bg-sky-600 transition-colors">
                          <Plus className="w-3.5 h-3.5"/> Add Item
                        </button>
                      </div>
                    </div>
                    {addingPackingItem && (
                      <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 flex gap-2">
                        <input value={newPackingItem.name} onChange={e => setNewPackingItem(p => ({ ...p, name: e.target.value }))}
                          placeholder="Item name" className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none text-sm"/>
                        <select value={newPackingItem.category} onChange={e => setNewPackingItem(p => ({ ...p, category: e.target.value }))}
                          className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none text-sm">
                          {PACKING_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button onClick={addPackingItem} className="px-3 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium">Add</button>
                        <button onClick={() => setAddingPackingItem(false)} className="px-3 py-2 text-neutral-400 text-sm"></button>
                      </div>
                    )}
                    {/* Progress bar */}
                    {trip.packingList.length > 0 && (
                      <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                        <div className="flex justify-between text-xs text-neutral-500 mb-2">
                          <span>Packing progress</span>
                          <span>{tripStats.packedCount}/{tripStats.totalPacking} packed</span>
                        </div>
                        <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all"
                            style={{ width: `${tripStats.totalPacking > 0 ? (tripStats.packedCount / tripStats.totalPacking) * 100 : 0}%` }}/>
                        </div>
                      </div>
                    )}
                    {Object.keys(packingByCategory).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(packingByCategory).map(([category, items]) => (
                          <div key={category} className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                            <h3 className="font-semibold text-neutral-900 dark:text-white text-sm mb-3">{category}</h3>
                            <div className="space-y-2">
                              {items.map(item => (
                                <div key={item.id} className="flex items-center gap-3 group">
                                  <button onClick={() => togglePackingItem(item.id)}>
                                    {item.packed ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <Circle className="w-5 h-5 text-neutral-300"/>}
                                  </button>
                                  <span className={`flex-1 text-sm ${item.packed ? "line-through text-neutral-400" : "text-neutral-700 dark:text-neutral-300"}`}>{item.name}</span>
                                  <button onClick={() => deletePackingItem(item.id)} className="p-1 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 className="w-3.5 h-3.5"/>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-neutral-300"/>
                        <p className="text-neutral-400 text-sm">No items yet. Use AI Suggest or add manually.</p>
                      </div>
                    )}
                  </div>

                  {/* Check This! */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-neutral-900 dark:text-white"> Check This!</h2>
                      <button onClick={generateCheckThis} disabled={loadingCheckThis}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-medium transition-colors disabled:opacity-50">
                        {loadingCheckThis ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Sparkles className="w-3.5 h-3.5"/>}
                        {trip.checkThis ? "Refresh" : "Generate"}
                      </button>
                    </div>
                    {loadingCheckThis && (
                      <div className="flex items-center justify-center py-16 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2"/>
                          <p className="text-sm text-neutral-400">Building your essential checklist...</p>
                        </div>
                      </div>
                    )}
                    {!loadingCheckThis && !trip.checkThis && (
                      <div className="text-center py-10 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <List className="w-10 h-10 mx-auto mb-3 text-neutral-300"/>
                        <p className="text-neutral-400 text-sm mb-4">Get AI-curated must-know info for your trip</p>
                        <button onClick={generateCheckThis} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors">Generate Check This!</button>
                      </div>
                    )}
                    {!loadingCheckThis && trip.checkThis && (
                      <div className="space-y-4">
                        {/* Important Hotels */}
                        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                          <h3 className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-3 text-sm">
                            <Hotel className="w-4 h-4"/> Important Hotels
                          </h3>
                          <div className="space-y-2">
                            {(trip.checkThis.importantHotels || []).map((h, i) => (
                              <div key={i} className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{h.name}</p>
                                  <p className="text-xs text-neutral-400">{h.area}</p>
                                </div>
                                <a href={h.url} target="_blank" rel="noopener noreferrer"
                                  className="flex-shrink-0 p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
                                  <ExternalLink className="w-3.5 h-3.5"/>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Important Restaurants */}
                        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                          <h3 className="font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2 mb-3 text-sm">
                            <Utensils className="w-4 h-4"/> Important Restaurants
                          </h3>
                          <div className="space-y-2">
                            {(trip.checkThis.importantRestaurants || []).map((r, i) => (
                              <div key={i} className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{r.name}</p>
                                  <p className="text-xs text-neutral-400">{r.cuisine}</p>
                                </div>
                                <a href={r.url} target="_blank" rel="noopener noreferrer"
                                  className="flex-shrink-0 p-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors">
                                  <ExternalLink className="w-3.5 h-3.5"/>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Important Places */}
                        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-green-200 dark:border-green-800">
                          <h3 className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2 mb-3 text-sm">
                            <MapPin className="w-4 h-4"/> Important Places to Visit
                          </h3>
                          <div className="space-y-2">
                            {(trip.checkThis.importantPlaces || []).map((p, i) => (
                              <div key={i} className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{p.name}</p>
                                  <p className="text-xs text-neutral-400">{p.type}</p>
                                </div>
                                <a href={p.url} target="_blank" rel="noopener noreferrer"
                                  className="flex-shrink-0 p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                                  <ExternalLink className="w-3.5 h-3.5"/>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Airways */}
                        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                          <h3 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-3 text-sm">
                            <Plane className="w-4 h-4"/> Airways Connecting {trip.source || "Origin"}  {trip.destination}
                          </h3>
                          <div className="space-y-2">
                            {(trip.checkThis.airways || []).map((a, i) => (
                              <div key={i} className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{a.airline}</p>
                                  <p className="text-xs text-neutral-400">{a.routes}</p>
                                </div>
                                <a href={a.url} target="_blank" rel="noopener noreferrer"
                                  className="flex-shrink-0 p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                                  <ExternalLink className="w-3.5 h-3.5"/>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/*  Budget Tab  */}
              {activeTab === "budget" && (
                <div className="space-y-6">
                  {/* Summary cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Total Budget", value: formatMoney(trip.budget, trip.currency), color: "text-neutral-900 dark:text-white", sub: trip.currency },
                      { label: "Total Spent", value: formatMoney(tripStats.spent, trip.currency), color: "text-red-600", sub: `${tripStats.spent > 0 ? ((tripStats.spent / trip.budget) * 100).toFixed(1) : 0}% of budget` },
                      { label: "Remaining", value: formatMoney(tripStats.remaining, trip.currency), color: tripStats.remaining >= 0 ? "text-green-600" : "text-red-600", sub: tripStats.remaining < 0 ? " Over budget!" : "Available" },
                    ].map(s => (
                      <div key={s.label} className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
                        <p className="text-neutral-500 text-xs font-medium mb-1">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-neutral-400 mt-1">{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Budget bar */}
                  <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">Budget Usage</span>
                      <span className="text-neutral-500">{trip.budget > 0 ? ((tripStats.spent / trip.budget) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${tripStats.spent > trip.budget ? "bg-red-500" : tripStats.spent > trip.budget * 0.8 ? "bg-amber-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(trip.budget > 0 ? (tripStats.spent / trip.budget) * 100 : 0, 100)}%` }}/>
                    </div>
                  </div>

                  {/* Add expense */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Expenses</h2>
                    <button onClick={() => setAddingExpense(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">
                      <Plus className="w-4 h-4"/> Add Expense
                    </button>
                  </div>
                  {addingExpense && (
                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <select value={newExpense.category} onChange={e => setNewExpense(p => ({ ...p, category: e.target.value }))}
                          className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none text-sm">
                          {ACTIVITY_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input value={newExpense.description} onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))}
                          placeholder="Description" className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none text-sm md:col-span-2"/>
                        <input type="number" value={newExpense.amount || ""} onChange={e => setNewExpense(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                          placeholder={`Amount (${getCurrencySymbol(trip.currency)})`} className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none text-sm"/>
                        <div className="flex gap-2">
                          <button onClick={addExpense} className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium">Add</button>
                          <button onClick={() => setAddingExpense(false)} className="px-3 py-2 text-neutral-400 text-sm"></button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expense list */}
                  {trip.expenses.length > 0 ? (
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {trip.expenses.map(expense => {
                          const cat = getCategoryInfo(expense.category);
                          return (
                            <div key={expense.id} className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 group">
                              <button onClick={() => toggleExpensePaid(expense.id)}>
                                {expense.paid ? <CheckCircle2 className="w-6 h-6 text-green-500"/> : <Circle className="w-6 h-6 text-neutral-300"/>}
                              </button>
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + "20" }}>
                                <cat.icon className="w-5 h-5" style={{ color: cat.color }}/>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm ${expense.paid ? "text-neutral-400 line-through" : "text-neutral-900 dark:text-white"}`}>{expense.description || cat.name}</p>
                                <p className="text-xs text-neutral-400">{formatDate(expense.date)}</p>
                              </div>
                              <span className="font-semibold text-neutral-900 dark:text-white">{formatMoney(expense.amount, trip.currency)}</span>
                              <button onClick={() => deleteExpense(expense.id)} className="p-2 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 className="w-4 h-4"/>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 text-neutral-300"/>
                      <p className="text-neutral-400">No expenses recorded yet</p>
                    </div>
                  )}

                  {/* Spending by category */}
                  {Object.keys(expensesByCategory).length > 0 && (
                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Spending by Category</h3>
                      <div className="space-y-3">
                        {Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).map(([category, amount]) => {
                          const cat = getCategoryInfo(category);
                          const pct = tripStats.spent > 0 ? (amount / tripStats.spent) * 100 : 0;
                          return (
                            <div key={category} className="flex items-center gap-3">
                              <cat.icon className="w-4 h-4 flex-shrink-0" style={{ color: cat.color }}/>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-neutral-700 dark:text-neutral-300">{cat.name}</span>
                                  <span className="font-medium text-neutral-900 dark:text-white">{formatMoney(amount, trip.currency)}</span>
                                </div>
                                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color }}/>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Documentation Modal */}
      <AnimatePresence>
        {showDocumentation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDocumentation(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="sticky top-0 bg-gradient-to-r from-sky-500 to-blue-600 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Trip Planner Guide</h2>
                    <p className="text-sky-100 text-sm">Plan your perfect journey</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✈️ Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Trip Planner is a comprehensive travel planning tool. Create detailed itineraries, manage packing lists, track expenses, get AI-powered flight and hotel suggestions, discover restaurants, plan train journeys, and organize all aspects of your trip in one place.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
                      <h4 className="font-semibold text-sky-900 dark:text-sky-400 mb-1">📅 Day-by-Day Itinerary</h4>
                      <p className="text-sm text-sky-800 dark:text-sky-300">Plan activities with times, locations, costs, and booking status.</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">🧳 Packing List</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">Organize items by category and track what's packed.</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">💰 Budget Tracking</h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">Track expenses by category and monitor spending vs budget.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">🤖 AI Suggestions</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">Get flight, hotel, restaurant, and train recommendations with AI.</p>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                      <h4 className="font-semibold text-pink-900 dark:text-pink-400 mb-1">🌍 Multi-Currency</h4>
                      <p className="text-sm text-pink-800 dark:text-pink-300">Support for 15+ currencies for international travel.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create a Trip</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "New Trip" and enter destination, dates, budget, and travelers.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Plan Itinerary</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Go to Itinerary tab, add activities for each day with times and costs.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create Packing List</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Packing tab lets you add items by category and check them off.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Track Expenses</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Budget tab shows spending breakdown and tracks against your budget.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Get AI Suggestions</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Use Flights, Hotels, Restaurants, and Trains tabs for AI recommendations.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Generate Itinerary</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Generate Day Plan" for AI-powered daily itinerary suggestions.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Book early</strong> - Mark activities as "booked" to track reservations</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Buffer time</strong> - Add travel time between activities in your itinerary</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Pack smart</strong> - Use AI to generate packing list based on destination</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Track everything</strong> - Log all expenses to stay within budget</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Save links</strong> - Add booking URLs to activities for quick access</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Multiple trips</strong> - Plan multiple trips simultaneously in separate projects</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your trip data is automatically saved to the server.</strong> All trips, itineraries, packing lists, expenses, and AI suggestions are stored in the database and synced across devices. Look for the "Saving..." indicator to confirm storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      <TemplateFooter />
    </div>
  );
}

