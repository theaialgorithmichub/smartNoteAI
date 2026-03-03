'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Field {
  name: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
}

interface CreateTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateTemplateDialog({ isOpen, onClose, onCreated }: CreateTemplateDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Personal',
    icon: 'FileText',
    color: '#8B4513',
  });
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);

  const addField = () => {
    setFields([...fields, {
      name: '',
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
      options: []
    }]);
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, fields }),
      });

      if (response.ok) {
        onCreated();
        setFormData({ name: '', description: '', category: 'Personal', icon: 'FileText', color: '#8B4513' });
        setFields([]);
      }
    } catch (error) {
      console.error('Failed to create template:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create Custom Template</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                >
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="School">School</option>
                  <option value="Research">Research</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 border border-neutral-300 dark:border-neutral-700 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Template Fields</h3>
              <Button type="button" onClick={addField} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Field {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Field Name (e.g., title)"
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                      className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Label (e.g., Title)"
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>

                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="list">List</option>
                  </select>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                      className="rounded"
                    />
                    Required field
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              {loading ? 'Creating...' : 'Create Template'}
            </Button>
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
