"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  FileCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (notebook: any) => void;
}

export function ImportDialog({ isOpen, onClose, onImportSuccess }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [template, setTemplate] = useState('document');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setSuccess(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError('');
      setSuccess(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleImport = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('template', template);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setSuccess(true);
      
      if (onImportSuccess) {
        onImportSuccess(data.notebook);
      }

      setTimeout(() => {
        onClose();
        resetState();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to import file');
    } finally {
      setUploading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setTemplate('document');
    setError('');
    setSuccess(false);
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-12 h-12 text-slate-400" />;
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'md':
      case 'markdown':
        return <FileCode className="w-12 h-12 text-blue-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-12 h-12 text-blue-600" />;
      default:
        return <File className="w-12 h-12 text-slate-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Import File
            </h2>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              file
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-300 dark:border-neutral-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-neutral-800'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt,.docx,.doc"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              {getFileIcon()}
              
              {file ? (
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Supports .md, .txt, and .docx files (max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Template Selection */}
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                Import as Template
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
              >
                <option value="document">Document</option>
                <option value="simple">Simple Notebook</option>
                <option value="meeting-notes">Meeting Notes</option>
                <option value="diary">Diary</option>
                <option value="journal">Journal</option>
                <option value="class-notes">Class Notes</option>
                <option value="book-notes">Book Notes</option>
              </select>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400">
                File imported successfully!
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleImport}
              disabled={!file || uploading || success}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import File
                </>
              )}
            </Button>
            <Button onClick={onClose} variant="outline" disabled={uploading}>
              Cancel
            </Button>
          </div>

          {/* Supported Formats Info */}
          <div className="mt-6 p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Supported Formats
            </h3>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <li>• <strong>Markdown (.md)</strong> - Preserves formatting and structure</li>
              <li>• <strong>Word (.docx)</strong> - Converts to plain text with sections</li>
              <li>• <strong>Text (.txt)</strong> - Plain text import</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
