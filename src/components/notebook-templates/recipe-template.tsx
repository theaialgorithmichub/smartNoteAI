"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ChefHat,
  Plus,
  Loader2,
  Clock,
  Users,
  Flame,
  Trash2,
  Search,
  Heart,
  Star,
  Sparkles,
  ShoppingCart,
  ChevronRight,
  Timer,
  UtensilsCrossed,
  Scale
} from "lucide-react";

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  inCart: boolean;
}

interface Step {
  id: string;
  instruction: string;
  duration?: string;
  completed: boolean;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  ingredients: Ingredient[];
  steps: Step[];
  notes: string;
  isFavorite: boolean;
  rating: number;
  createdAt: string;
}

interface RecipeTemplateProps {
  title?: string;
  notebookId?: string;
}

export function RecipeTemplate({ title = "Recipe Book", notebookId }: RecipeTemplateProps) {
  const [activeTab, setActiveTab] = useState<'recipes' | 'shopping' | 'generate'>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCuisine, setFilterCuisine] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    title: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: 4,
    difficulty: 'medium',
    cuisine: '',
    ingredients: [],
    steps: [],
    notes: ''
  });
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cuisines = ['Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'American', 'French', 'Thai', 'Mediterranean', 'Other'];
  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`recipe-${notebookId}`, JSON.stringify({ recipes }));
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setSaving(false);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!notebookId) return;
    try {
      const saved = localStorage.getItem(`recipe-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [recipes]);

  const addIngredient = () => {
    setNewRecipe({
      ...newRecipe,
      ingredients: [...(newRecipe.ingredients || []), { id: Date.now().toString(), name: '', amount: '', unit: '', inCart: false }]
    });
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: (newRecipe.ingredients || []).map(ing => ing.id === id ? { ...ing, ...updates } : ing)
    });
  };

  const removeIngredient = (id: string) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: (newRecipe.ingredients || []).filter(ing => ing.id !== id)
    });
  };

  const addStep = () => {
    setNewRecipe({
      ...newRecipe,
      steps: [...(newRecipe.steps || []), { id: Date.now().toString(), instruction: '', completed: false }]
    });
  };

  const updateStep = (id: string, updates: Partial<Step>) => {
    setNewRecipe({
      ...newRecipe,
      steps: (newRecipe.steps || []).map(step => step.id === id ? { ...step, ...updates } : step)
    });
  };

  const removeStep = (id: string) => {
    setNewRecipe({
      ...newRecipe,
      steps: (newRecipe.steps || []).filter(step => step.id !== id)
    });
  };

  const saveRecipe = () => {
    if (!newRecipe.title?.trim()) return;
    
    const recipe: Recipe = {
      id: Date.now().toString(),
      title: newRecipe.title || '',
      description: newRecipe.description || '',
      image: `https://picsum.photos/seed/${Date.now()}/400/300`,
      prepTime: newRecipe.prepTime || '15 min',
      cookTime: newRecipe.cookTime || '30 min',
      servings: newRecipe.servings || 4,
      difficulty: newRecipe.difficulty || 'medium',
      cuisine: newRecipe.cuisine || 'Other',
      ingredients: newRecipe.ingredients || [],
      steps: newRecipe.steps || [],
      notes: newRecipe.notes || '',
      isFavorite: false,
      rating: 0,
      createdAt: new Date().toISOString()
    };
    
    setRecipes([recipe, ...recipes]);
    setNewRecipe({
      title: '', description: '', prepTime: '', cookTime: '', servings: 4,
      difficulty: 'medium', cuisine: '', ingredients: [], steps: [], notes: ''
    });
    setIsAddingRecipe(false);
    setSelectedRecipe(recipe);
  };

  const deleteRecipe = (id: string) => {
    setRecipes(recipes.filter(r => r.id !== id));
    if (selectedRecipe?.id === id) setSelectedRecipe(null);
  };

  const toggleFavorite = (id: string) => {
    setRecipes(recipes.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
  };

  const setRating = (id: string, rating: number) => {
    setRecipes(recipes.map(r => r.id === id ? { ...r, rating } : r));
  };

  const toggleStepComplete = (recipeId: string, stepId: string) => {
    setRecipes(recipes.map(r => {
      if (r.id !== recipeId) return r;
      return {
        ...r,
        steps: r.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s)
      };
    }));
    if (selectedRecipe?.id === recipeId) {
      setSelectedRecipe(recipes.find(r => r.id === recipeId) || null);
    }
  };

  const toggleIngredientInCart = (recipeId: string, ingredientId: string) => {
    setRecipes(recipes.map(r => {
      if (r.id !== recipeId) return r;
      return {
        ...r,
        ingredients: r.ingredients.map(i => i.id === ingredientId ? { ...i, inCart: !i.inCart } : i)
      };
    }));
  };

  const generateRecipe = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebookId,
          message: `Create a detailed recipe for: "${aiPrompt}"

Include:
- Title
- Brief description
- Prep time and cook time
- Servings
- Difficulty (easy/medium/hard)
- Cuisine type
- List of ingredients with amounts and units
- Step by step instructions

Format as JSON:
{
  "title": "...",
  "description": "...",
  "prepTime": "15 min",
  "cookTime": "30 min",
  "servings": 4,
  "difficulty": "medium",
  "cuisine": "...",
  "ingredients": [{"name": "...", "amount": "1", "unit": "cup"}],
  "steps": [{"instruction": "..."}]
}

Only return the JSON.`,
          context: []
        })
      });

      const data = await response.json();
      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const generated = JSON.parse(jsonMatch[0]);
        
        const recipe: Recipe = {
          id: Date.now().toString(),
          title: generated.title || aiPrompt,
          description: generated.description || '',
          image: `https://picsum.photos/seed/${Date.now()}/400/300`,
          prepTime: generated.prepTime || '15 min',
          cookTime: generated.cookTime || '30 min',
          servings: generated.servings || 4,
          difficulty: generated.difficulty || 'medium',
          cuisine: generated.cuisine || 'Other',
          ingredients: (generated.ingredients || []).map((i: any, idx: number) => ({
            id: `ing-${Date.now()}-${idx}`,
            name: i.name,
            amount: i.amount,
            unit: i.unit,
            inCart: false
          })),
          steps: (generated.steps || []).map((s: any, idx: number) => ({
            id: `step-${Date.now()}-${idx}`,
            instruction: s.instruction,
            duration: s.duration,
            completed: false
          })),
          notes: '',
          isFavorite: false,
          rating: 0,
          createdAt: new Date().toISOString()
        };
        
        setRecipes([recipe, ...recipes]);
        setSelectedRecipe(recipe);
        setActiveTab('recipes');
      }
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
      setAiPrompt("");
    }
  };

  const filteredRecipes = recipes.filter(r => {
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCuisine !== 'all' && r.cuisine !== filterCuisine) return false;
    if (showFavoritesOnly && !r.isFavorite) return false;
    return true;
  });

  const shoppingList = recipes.flatMap(r => 
    r.ingredients.filter(i => !i.inCart).map(i => ({ ...i, recipeName: r.title, recipeId: r.id }))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-neutral-950 dark:to-neutral-900">
      {saving && (
        <div className="fixed top-20 right-6 flex items-center gap-2 text-sm text-neutral-500 bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg shadow-lg z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-neutral-900 dark:text-white">{title}</h1>
                <p className="text-xs text-neutral-500">{recipes.length} recipes</p>
              </div>
            </div>
            
            <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
              {[
                { id: 'recipes', label: 'Recipes', icon: UtensilsCrossed },
                { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
                { id: 'generate', label: 'AI Chef', icon: Sparkles },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-neutral-700 text-orange-600 dark:text-orange-400 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="flex gap-6">
            {/* Recipe List */}
            <div className="w-80 space-y-4">
              {/* Search & Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search recipes..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-800 rounded-xl outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterCuisine}
                    onChange={(e) => setFilterCuisine(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg text-sm outline-none"
                  >
                    <option value="all">All Cuisines</option>
                    {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`p-2 rounded-lg ${showFavoritesOnly ? 'bg-red-100 text-red-500' : 'bg-white dark:bg-neutral-800'}`}
                  >
                    <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsAddingRecipe(true)}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Recipe
              </button>

              {/* Recipe Cards */}
              <div className="space-y-3 max-h-[60vh] overflow-auto">
                {filteredRecipes.map(recipe => (
                  <button
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
                    className={`w-full text-left rounded-xl overflow-hidden transition-all ${
                      selectedRecipe?.id === recipe.id
                        ? 'ring-2 ring-orange-500'
                        : 'hover:shadow-lg'
                    } bg-white dark:bg-neutral-900`}
                  >
                    <div className="relative h-32">
                      <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full"
                      >
                        <Heart className={`w-4 h-4 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-400'}`} />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-neutral-900 dark:text-white">{recipe.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.cookTime}</span>
                        <span className={`px-2 py-0.5 rounded-full ${difficultyColors[recipe.difficulty]}`}>
                          {recipe.difficulty}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipe Detail / Add Form */}
            <div className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              {isAddingRecipe ? (
                <div className="p-6 max-h-[80vh] overflow-auto">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Add New Recipe</h2>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newRecipe.title}
                      onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                      placeholder="Recipe Title"
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-lg font-medium"
                    />
                    
                    <textarea
                      value={newRecipe.description}
                      onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                      placeholder="Description"
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={2}
                    />
                    
                    <div className="grid grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={newRecipe.prepTime}
                        onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: e.target.value })}
                        placeholder="Prep time"
                        className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none text-sm"
                      />
                      <input
                        type="text"
                        value={newRecipe.cookTime}
                        onChange={(e) => setNewRecipe({ ...newRecipe, cookTime: e.target.value })}
                        placeholder="Cook time"
                        className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none text-sm"
                      />
                      <input
                        type="number"
                        value={newRecipe.servings}
                        onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) })}
                        placeholder="Servings"
                        className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none text-sm"
                      />
                      <select
                        value={newRecipe.difficulty}
                        onChange={(e) => setNewRecipe({ ...newRecipe, difficulty: e.target.value as Recipe['difficulty'] })}
                        className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none text-sm"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    
                    <select
                      value={newRecipe.cuisine}
                      onChange={(e) => setNewRecipe({ ...newRecipe, cuisine: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none"
                    >
                      <option value="">Select Cuisine</option>
                      {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    
                    {/* Ingredients */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Ingredients</h3>
                        <button onClick={addIngredient} className="text-orange-500 text-sm flex items-center gap-1">
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(newRecipe.ingredients || []).map(ing => (
                          <div key={ing.id} className="flex gap-2">
                            <input
                              type="text"
                              value={ing.amount}
                              onChange={(e) => updateIngredient(ing.id, { amount: e.target.value })}
                              placeholder="Amount"
                              className="w-20 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 rounded text-sm outline-none"
                            />
                            <input
                              type="text"
                              value={ing.unit}
                              onChange={(e) => updateIngredient(ing.id, { unit: e.target.value })}
                              placeholder="Unit"
                              className="w-20 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 rounded text-sm outline-none"
                            />
                            <input
                              type="text"
                              value={ing.name}
                              onChange={(e) => updateIngredient(ing.id, { name: e.target.value })}
                              placeholder="Ingredient"
                              className="flex-1 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 rounded text-sm outline-none"
                            />
                            <button onClick={() => removeIngredient(ing.id)} className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Steps */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Instructions</h3>
                        <button onClick={addStep} className="text-orange-500 text-sm flex items-center gap-1">
                          <Plus className="w-4 h-4" /> Add Step
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(newRecipe.steps || []).map((step, idx) => (
                          <div key={step.id} className="flex gap-2 items-start">
                            <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                              {idx + 1}
                            </span>
                            <textarea
                              value={step.instruction}
                              onChange={(e) => updateStep(step.id, { instruction: e.target.value })}
                              placeholder="Step instruction..."
                              className="flex-1 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 rounded text-sm outline-none resize-none"
                              rows={2}
                            />
                            <button onClick={() => removeStep(step.id)} className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <button onClick={saveRecipe} className="px-6 py-2 bg-orange-500 text-white rounded-lg">
                        Save Recipe
                      </button>
                      <button onClick={() => setIsAddingRecipe(false)} className="px-6 py-2 text-neutral-500">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedRecipe ? (
                <div className="max-h-[80vh] overflow-auto">
                  <div className="relative h-64">
                    <img src={selectedRecipe.image} alt={selectedRecipe.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedRecipe.title}</h2>
                      <div className="flex items-center gap-4 text-white/80 text-sm">
                        <span className="flex items-center gap-1"><Timer className="w-4 h-4" />{selectedRecipe.prepTime} prep</span>
                        <span className="flex items-center gap-1"><Flame className="w-4 h-4" />{selectedRecipe.cookTime} cook</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" />{selectedRecipe.servings} servings</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteRecipe(selectedRecipe.id)}
                      className="absolute top-4 right-4 p-2 bg-white/80 rounded-full text-red-500 hover:bg-white"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setRating(selectedRecipe.id, star)}>
                          <Star className={`w-6 h-6 ${star <= selectedRecipe.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`} />
                        </button>
                      ))}
                    </div>
                    
                    <p className="text-neutral-600 dark:text-neutral-400">{selectedRecipe.description}</p>
                    
                    {/* Ingredients */}
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-orange-500" />
                        Ingredients
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedRecipe.ingredients.map(ing => (
                          <label key={ing.id} className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ing.inCart}
                              onChange={() => toggleIngredientInCart(selectedRecipe.id, ing.id)}
                              className="rounded"
                            />
                            <span className={ing.inCart ? 'line-through text-neutral-400' : ''}>
                              {ing.amount} {ing.unit} {ing.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* Steps */}
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <ChevronRight className="w-5 h-5 text-orange-500" />
                        Instructions
                      </h3>
                      <div className="space-y-3">
                        {selectedRecipe.steps.map((step, idx) => (
                          <div
                            key={step.id}
                            onClick={() => toggleStepComplete(selectedRecipe.id, step.id)}
                            className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                              step.completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-neutral-50 dark:bg-neutral-800'
                            }`}
                          >
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                              step.completed ? 'bg-green-500 text-white' : 'bg-orange-100 text-orange-600'
                            }`}>
                              {step.completed ? '✓' : idx + 1}
                            </span>
                            <p className={step.completed ? 'line-through text-neutral-400' : 'text-neutral-700 dark:text-neutral-300'}>
                              {step.instruction}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-400 p-12">
                  <div className="text-center">
                    <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a recipe or add a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shopping Tab */}
        {activeTab === 'shopping' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-orange-500" />
                Shopping List
              </h2>
              
              {shoppingList.length > 0 ? (
                <div className="space-y-2">
                  {shoppingList.map(item => (
                    <label
                      key={`${item.recipeId}-${item.id}`}
                      className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <input
                        type="checkbox"
                        onChange={() => toggleIngredientInCart(item.recipeId, item.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <span className="font-medium">{item.amount} {item.unit} {item.name}</span>
                        <span className="text-sm text-neutral-500 ml-2">({item.recipeName})</span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Shopping list is empty</p>
                  <p className="text-sm">Uncheck ingredients in recipes to add them here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-orange-500" />
                AI Recipe Generator
              </h2>
              <p className="text-neutral-500 mb-6">Describe what you want to cook and AI will create a complete recipe</p>
              
              <div className="space-y-4">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., A healthy vegetarian pasta with spinach and sun-dried tomatoes..."
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                  rows={4}
                />
                <button
                  onClick={generateRecipe}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isGenerating ? 'Creating Recipe...' : 'Generate Recipe'}
                </button>
              </div>
              
              {/* Quick Ideas */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-neutral-500 mb-3">Quick Ideas</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Quick weeknight dinner',
                    'Healthy breakfast',
                    'Comfort food',
                    'Date night special',
                    'Kids favorite',
                    'Low carb meal'
                  ].map(idea => (
                    <button
                      key={idea}
                      onClick={() => setAiPrompt(idea)}
                      className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm hover:bg-orange-100 dark:hover:bg-orange-900/30"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
