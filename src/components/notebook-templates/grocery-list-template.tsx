'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Check, Trash2, Apple, Carrot, Milk, Package, Info, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';
import { Button } from '@/components/ui/button';

interface GroceryListTemplateProps {
  title: string;
  notebookId?: string;
}

interface GroceryItem {
  id: number;
  name: string;
  quantity: string;
  category: string;
  completed: boolean;
}

interface DateList {
  date: string;
  items: GroceryItem[];
}

interface GroceryData {
  lists: { [date: string]: GroceryItem[] };
}

export function GroceryListTemplate({ title, notebookId }: GroceryListTemplateProps) {
  const [allLists, setAllLists] = useState<{ [date: string]: GroceryItem[] }>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', category: 'Vegetables' });
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const categories = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Snacks', 'Beverages'];

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`grocery-list-${notebookId}`, JSON.stringify({ lists: allLists }));
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setSaving(false);
      }
    }, 500);
  };

  useEffect(() => {
    if (!notebookId) return;
    try {
      const saved = localStorage.getItem(`grocery-list-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setAllLists(data.lists || {});
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [allLists]);

  const items = allLists[selectedDate] || [];

  const setItems = (newItems: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => {
    setAllLists(prev => {
      const currentItems = prev[selectedDate] || [];
      const updatedItems = typeof newItems === 'function' ? newItems(currentItems) : newItems;
      return {
        ...prev,
        [selectedDate]: updatedItems
      };
    });
  };

  const toggleComplete = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const changeDate = (days: number) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const getDateDisplay = () => {
    const date = new Date(selectedDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (selectedDate === today.toISOString().split('T')[0]) return 'Today';
    if (selectedDate === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    if (selectedDate === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Vegetables': return <Carrot className="h-5 w-5" />;
      case 'Fruits': return <Apple className="h-5 w-5" />;
      case 'Dairy': return <Milk className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    
    const item: GroceryItem = {
      id: Date.now(),
      name: newItem.name,
      quantity: newItem.quantity || '1',
      category: newItem.category,
      completed: false
    };
    
    setItems(prev => [...prev, item]);
    setNewItem({ name: '', quantity: '', category: 'Vegetables' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-neutral-900 dark:to-neutral-800">
      <TemplateHeader title={title} />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <button
              onClick={() => setShowDocumentation(true)}
              className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              title="Know More"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Your shopping companion</p>
        </div>

        {/* Date Navigator */}
        <Card className="p-4 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            
            <div className="text-center flex-1">
              <div className="flex items-center gap-2 justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {getDateDisplay()}
                </h3>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              title="Next day"
            >
              <ChevronRight className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
          
          {!isToday && (
            <div className="mt-3 text-center">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium"
              >
                Jump to Today
              </button>
            </div>
          )}
        </Card>

        {/* Progress Card */}
        <Card className="p-6 bg-white dark:bg-neutral-800 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Shopping Progress</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {completedCount} / {totalCount} items
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">{progress}%</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Complete</p>
            </div>
          </div>
          <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>

        {/* Add New Item */}
        <Card className="p-4 bg-white dark:bg-neutral-800">
          <div className="flex gap-3">
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              onKeyPress={handleKeyPress}
              placeholder="Item name..."
              className="flex-1 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              onKeyPress={handleKeyPress}
              placeholder="Quantity"
              className="w-32 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Button
              onClick={handleAddItem}
              disabled={!newItem.name.trim()}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </Card>

        {/* Empty State */}
        {items.length === 0 ? (
          <Card className="p-12 bg-white dark:bg-neutral-800 text-center">
            <ShoppingCart className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              No items for {getDateDisplay()}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">Start adding items to your shopping list</p>
          </Card>
        ) : (
          <>
        {/* Shopping List by Category */}
        {categories.map(category => {
          const categoryItems = items.filter(item => item.category === category);
          if (categoryItems.length === 0) return null;

          return (
            <Card key={category} className="p-6 bg-white dark:bg-neutral-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{category}</h3>
                <span className="ml-auto text-sm text-neutral-500 dark:text-neutral-400">
                  {categoryItems.filter(i => i.completed).length}/{categoryItems.length}
                </span>
              </div>

              <div className="space-y-2">
                {categoryItems.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      item.completed
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-60'
                        : 'bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-600'
                    }`}
                  >
                    <button
                      onClick={() => toggleComplete(item.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-neutral-300 dark:border-neutral-600 hover:border-green-500'
                      }`}
                    >
                      {item.completed && <Check className="h-4 w-4 text-white" />}
                    </button>
                    
                    <div className="flex-1">
                      <p className={`font-medium ${
                        item.completed
                          ? 'line-through text-neutral-500 dark:text-neutral-400'
                          : 'text-neutral-900 dark:text-white'
                      }`}>
                        {item.name}
                      </p>
                    </div>
                    
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
          </>
        )}

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Items</p>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{totalCount}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Remaining</p>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{totalCount - completedCount}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Categories</p>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">
              {new Set(items.map(i => i.category)).size}
            </p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Lists</p>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">
              {Object.keys(allLists).length}
            </p>
          </Card>
        </div>

        {/* Documentation Modal */}
        {showDocumentation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800">
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6 text-green-600" />
                    Grocery List - Template Documentation
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Complete guide to features and capabilities</p>
                </div>
                <button onClick={() => setShowDocumentation(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                  <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">📋 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Grocery List is your smart shopping companion that helps you organize and track your grocery shopping. 
                    Organize items by category, track your shopping progress, and never forget an item again.
                  </p>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">✨ Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Category Organization</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Items automatically grouped by 8 categories: Vegetables, Fruits, Dairy, Meat, Bakery, Pantry, Snacks, Beverages</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Progress Tracking</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Visual progress bar shows completion percentage as you shop</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Check Off Items</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Tap items to mark as purchased with visual strikethrough</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Quantity Tracking</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Add specific quantities for each item (e.g., 2 kg, 1 L, 6 pcs)</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-pink-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Quick Stats</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">See total items, remaining items, and active categories at a glance</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Easy Delete</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Remove items you no longer need with one click</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">1. Add Items</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Enter item name, quantity (optional), select category, and click "Add" or press Enter. Items are automatically organized by category.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">2. While Shopping</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Tap the circle next to each item as you add it to your cart. The item will be marked with a checkmark and crossed out.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">3. Track Progress</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Watch the progress bar at the top fill up as you check off items. See your completion percentage in real-time.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">4. Remove Items</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the trash icon next to any item to remove it from your list if you change your mind.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">5. View Stats</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Check the bottom cards to see total items, remaining items, and number of categories you're shopping from.</p>
                    </div>
                  </div>
                </section>
                <section className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">💎 Pro Tips</h3>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span><strong>Plan Ahead:</strong> Add all items before going to the store to ensure you don't forget anything.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span><strong>Use Categories:</strong> Items are grouped by category, making it easier to navigate the store efficiently.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span><strong>Specify Quantities:</strong> Add quantities like "2 kg", "1 L", or "6 pcs" to remember exactly how much you need.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span><strong>Check As You Go:</strong> Mark items as you add them to your cart to track what's left to find.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span><strong>Quick Entry:</strong> Press Enter after typing to quickly add items without clicking the Add button.</span>
                    </li>
                  </ul>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">🎯 Use Cases</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white mb-1">Weekly Shopping</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Plan your weekly grocery run</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white mb-1">Recipe Ingredients</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">List ingredients for specific recipes</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white mb-1">Party Planning</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Organize shopping for events</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white mb-1">Meal Prep</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Stock up for meal preparation</p>
                    </div>
                  </div>
                </section>
              </div>
              <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <Button onClick={() => setShowDocumentation(false)} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90">Got It!</Button>
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
