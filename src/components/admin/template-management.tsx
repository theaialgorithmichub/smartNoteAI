'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateTemplateDialog } from './create-template-dialog';

interface CustomTemplate {
  _id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  isPublished: boolean;
  usageCount: number;
  createdAt: string;
}

export function TemplateManagement() {
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (templateId: string, currentStatus: boolean) => {
    try {
      setPublishing(templateId);
      const response = await fetch(`/api/admin/templates/${templateId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });
      const updatedTemplate = await response.json();
      
      setTemplates(templates.map(t => t._id === templateId ? updatedTemplate : t));
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    } finally {
      setPublishing(null);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      setDeleting(templateId);
      await fetch(`/api/admin/templates/${templateId}`, { method: 'DELETE' });
      setTemplates(templates.filter(t => t._id !== templateId));
    } catch (error) {
      console.error('Failed to delete template:', error);
    } finally {
      setDeleting(null);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Template Management</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Create and manage custom notebook templates
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template._id}
            className="border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div
              className="h-32 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${template.color} 0%, ${template.color}cc 100%)` }}
            >
              <FileText className="h-12 w-12 text-white" />
            </div>

            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold">{template.name}</h4>
                  {template.isPublished ? (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                      Published
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {template.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{template.category}</span>
                <span>{template.usageCount} uses</span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <Button
                  onClick={() => togglePublish(template._id, template.isPublished)}
                  disabled={publishing === template._id}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {publishing === template._id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : template.isPublished ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Publish
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => deleteTemplate(template._id)}
                  disabled={deleting === template._id}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {deleting === template._id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-12 text-center">
          <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            No custom templates yet
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Template
          </Button>
        </div>
      )}

      <CreateTemplateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          fetchTemplates();
          setIsCreateOpen(false);
        }}
      />
    </div>
  );
}
