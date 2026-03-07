import { useState, useEffect } from 'react';
import { NotebookTemplateType } from '@/types/notebook-templates';

export function useFavorites() {
  const [favorites, setFavorites] = useState<NotebookTemplateType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (templateId: NotebookTemplateType) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });

      if (response.ok) {
        setFavorites(prev => [...prev, templateId]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  };

  const removeFavorite = async (templateId: NotebookTemplateType) => {
    try {
      const response = await fetch(`/api/favorites?templateId=${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(id => id !== templateId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  };

  const toggleFavorite = async (templateId: NotebookTemplateType) => {
    if (isFavorite(templateId)) {
      return await removeFavorite(templateId);
    } else {
      return await addFavorite(templateId);
    }
  };

  const isFavorite = (templateId: NotebookTemplateType) => {
    return favorites.includes(templateId);
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
