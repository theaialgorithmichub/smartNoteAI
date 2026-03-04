'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Star, Trash2, Edit2, X, Info, Search, Bookmark, Quote, Save, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';

interface BookNotesTemplateProps {
  title: string;
  notebookId?: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  progress: number;
  rating: number;
}

interface ChapterNote {
  id: number;
  bookId: number;
  chapter: string;
  content: string;
}

interface FavoriteQuote {
  id: number;
  bookId: number;
  quote: string;
  chapter: string;
}

export function BookNotesTemplate({ title }: BookNotesTemplateProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBookId, setCurrentBookId] = useState<number | null>(null);
  const [chapterNotes, setChapterNotes] = useState<ChapterNote[]>([]);
  const [quotes, setQuotes] = useState<FavoriteQuote[]>([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({ title: '', author: '', progress: 0, rating: 0 });
  const [noteForm, setNoteForm] = useState({ chapter: '', content: '' });
  const [quoteForm, setQuoteForm] = useState({ quote: '', chapter: '' });

  const currentBook = books.find(b => b.id === currentBookId);
  const currentNotes = chapterNotes.filter(n => n.bookId === currentBookId);
  const currentQuotes = quotes.filter(q => q.bookId === currentBookId);

  const handleAddBook = () => {
    if (!bookForm.title.trim() || !bookForm.author.trim()) return;
    
    const newBook: Book = {
      id: Date.now(),
      title: bookForm.title,
      author: bookForm.author,
      progress: bookForm.progress,
      rating: bookForm.rating
    };
    
    setBooks(prev => [...prev, newBook]);
    setCurrentBookId(newBook.id);
    setBookForm({ title: '', author: '', progress: 0, rating: 0 });
    setShowBookForm(false);
  };

  const handleUpdateBook = () => {
    if (!editingBook || !bookForm.title.trim() || !bookForm.author.trim()) return;
    
    setBooks(prev => prev.map(b => 
      b.id === editingBook.id ? { ...b, ...bookForm } : b
    ));
    
    setBookForm({ title: '', author: '', progress: 0, rating: 0 });
    setEditingBook(null);
    setShowBookForm(false);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setBookForm({ title: book.title, author: book.author, progress: book.progress, rating: book.rating });
    setShowBookForm(true);
  };

  const handleDeleteBook = (id: number) => {
    setBooks(books.filter(b => b.id !== id));
    setChapterNotes(chapterNotes.filter(n => n.bookId !== id));
    setQuotes(quotes.filter(q => q.bookId !== id));
    if (currentBookId === id) setCurrentBookId(null);
  };

  const handleAddNote = () => {
    if (!currentBookId || !noteForm.chapter.trim() || !noteForm.content.trim()) return;
    
    const newNote: ChapterNote = {
      id: Date.now(),
      bookId: currentBookId,
      chapter: noteForm.chapter,
      content: noteForm.content
    };
    
    setChapterNotes(prev => [...prev, newNote]);
    setNoteForm({ chapter: '', content: '' });
    setShowNoteForm(false);
  };

  const handleDeleteNote = (id: number) => {
    setChapterNotes(chapterNotes.filter(n => n.id !== id));
  };

  const handleAddQuote = () => {
    if (!currentBookId || !quoteForm.quote.trim() || !quoteForm.chapter.trim()) return;
    
    const newQuote: FavoriteQuote = {
      id: Date.now(),
      bookId: currentBookId,
      quote: quoteForm.quote,
      chapter: quoteForm.chapter
    };
    
    setQuotes(prev => [...prev, newQuote]);
    setQuoteForm({ quote: '', chapter: '' });
    setShowQuoteForm(false);
  };

  const handleDeleteQuote = (id: number) => {
    setQuotes(quotes.filter(q => q.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 to-orange-50 dark:from-neutral-900 dark:to-neutral-800">
      <TemplateHeader title={title} />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <button
              onClick={() => setShowDocumentation(true)}
              className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              title="Know More"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Track your reading journey</p>
        </div>

        {/* Current Book */}
        {currentBook ? (
        <Card className="p-6 bg-white dark:bg-neutral-800 border-2 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-6">
            <div className="w-32 h-48 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                {currentBook.title}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">by {currentBook.author}</p>
              
              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Reading Progress</span>
                  <span className="text-sm font-bold text-amber-600">{currentBook.progress}%</span>
                </div>
                <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                    style={{ width: `${currentBook.progress}%` }}
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= currentBook.rating
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-neutral-300 dark:text-neutral-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditBook(currentBook)}
                  className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors text-sm"
                >
                  <Edit2 className="h-3 w-3 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteBook(currentBook.id)}
                  className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
                >
                  <Trash2 className="h-3 w-3 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Card>
        ) : (
          <Card className="p-12 bg-white dark:bg-neutral-800 text-center">
            <BookOpen className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Book Selected</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">Add a book to start tracking your reading</p>
            <button
              onClick={() => setShowBookForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add Your First Book
            </button>
          </Card>
        )}

        {/* Sections Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Chapter Notes */}
          <Card className="p-6 bg-white dark:bg-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-amber-600" />
                Chapter Notes
              </h3>
              <button
                onClick={() => setShowNoteForm(true)}
                disabled={!currentBook}
                className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5 text-amber-600" />
              </button>
            </div>
            {currentNotes.length === 0 ? (
              <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">No chapter notes yet</p>
            ) : (
              <div className="space-y-3">
                {currentNotes.map(note => (
                  <div key={note.id} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-sm text-amber-900 dark:text-amber-200">{note.chapter}</p>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Favorite Quotes */}
          <Card className="p-6 bg-white dark:bg-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Quote className="h-5 w-5 text-orange-600" />
                Favorite Quotes
              </h3>
              <button
                onClick={() => setShowQuoteForm(true)}
                disabled={!currentBook}
                className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5 text-orange-600" />
              </button>
            </div>
            {currentQuotes.length === 0 ? (
              <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">No favorite quotes yet</p>
            ) : (
              <div className="space-y-3">
                {currentQuotes.map(quote => (
                  <div key={quote.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm italic text-neutral-700 dark:text-neutral-300 flex-1">"{quote.quote}"</p>
                      <button
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors ml-2"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">— {quote.chapter}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Reading List */}
        <Card className="p-6 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Reading List</h3>
            <button
              onClick={() => setShowBookForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add Book
            </button>
          </div>
          {books.length === 0 ? (
            <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">No books in your reading list yet</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {books.map(book => (
                <div
                  key={book.id}
                  onClick={() => setCurrentBookId(book.id)}
                  className={`p-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg cursor-pointer hover:scale-105 transition-transform ${
                    currentBookId === book.id ? 'ring-2 ring-amber-500' : ''
                  }`}
                >
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                  <p className="text-sm font-medium text-neutral-900 dark:text-white text-center">{book.title}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">{book.author}</p>
                  <div className="mt-2 flex justify-center">
                    {[...Array(book.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Book Form Modal */}
        {showBookForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full bg-white dark:bg-neutral-800">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {editingBook ? 'Edit Book' : 'Add New Book'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Book Title *</label>
                  <input
                    type="text"
                    value={bookForm.title}
                    onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                    placeholder="Enter book title"
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Author *</label>
                  <input
                    type="text"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="Enter author name"
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Reading Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={bookForm.progress}
                    onChange={(e) => setBookForm({ ...bookForm, progress: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Rating (0-5 stars)</label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setBookForm({ ...bookForm, rating })}
                        className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded transition-colors"
                      >
                        <Star className={`h-6 w-6 ${
                          rating <= bookForm.rating ? 'fill-amber-500 text-amber-500' : 'text-neutral-300'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
                <button
                  onClick={() => { setShowBookForm(false); setEditingBook(null); setBookForm({ title: '', author: '', progress: 0, rating: 0 }); }}
                  className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  Cancel
                </button>
                <button
                  onClick={editingBook ? handleUpdateBook : handleAddBook}
                  disabled={!bookForm.title.trim() || !bookForm.author.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 inline mr-2" />
                  {editingBook ? 'Update' : 'Add'} Book
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Note Form Modal */}
        {showNoteForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full bg-white dark:bg-neutral-800">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Add Chapter Note</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Chapter *</label>
                  <input
                    type="text"
                    value={noteForm.chapter}
                    onChange={(e) => setNoteForm({ ...noteForm, chapter: e.target.value })}
                    placeholder="e.g., Chapter 3: The Party"
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Note Content *</label>
                  <textarea
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    placeholder="Write your notes about this chapter..."
                    rows={4}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
                <button
                  onClick={() => { setShowNoteForm(false); setNoteForm({ chapter: '', content: '' }); }}
                  className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!noteForm.chapter.trim() || !noteForm.content.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 inline mr-2" />
                  Add Note
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Quote Form Modal */}
        {showQuoteForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full bg-white dark:bg-neutral-800">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Add Favorite Quote</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Quote *</label>
                  <textarea
                    value={quoteForm.quote}
                    onChange={(e) => setQuoteForm({ ...quoteForm, quote: e.target.value })}
                    placeholder="Enter the quote..."
                    rows={3}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Chapter/Page Reference *</label>
                  <input
                    type="text"
                    value={quoteForm.chapter}
                    onChange={(e) => setQuoteForm({ ...quoteForm, chapter: e.target.value })}
                    placeholder="e.g., Chapter 9 or Page 180"
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
                <button
                  onClick={() => { setShowQuoteForm(false); setQuoteForm({ quote: '', chapter: '' }); }}
                  className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddQuote}
                  disabled={!quoteForm.quote.trim() || !quoteForm.chapter.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 inline mr-2" />
                  Add Quote
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Documentation Modal */}
        {showDocumentation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800">
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Book Notes Guide</h2>
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Overview */}
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-amber-600" />
                    Overview
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Track your reading journey with a comprehensive book management system. Add books to your reading list, 
                    monitor your progress, take chapter notes, save favorite quotes, and rate your reads—all in one place.
                  </p>
                </div>

                {/* Key Features */}
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Book Management
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Add, edit, and delete books with title, author, reading progress, and star ratings
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-2 flex items-center gap-2">
                        <Bookmark className="h-4 w-4" />
                        Chapter Notes
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Take detailed notes for each chapter to capture key insights and themes
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                        <Quote className="h-4 w-4" />
                        Favorite Quotes
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Save memorable quotes with chapter references for easy recall
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Progress Tracking
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Monitor reading progress with visual progress bars and percentage tracking
                      </p>
                    </div>
                  </div>
                </div>

                {/* How to Use */}
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">How to Use</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Add a Book</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Click "Add Book" button, enter the book title and author (required), optionally set reading progress (0-100%) 
                          and rating (0-5 stars), then save.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Select a Book</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Click on any book card in your reading list to view its details. The selected book will have an amber ring 
                          and its details will appear at the top.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Add Chapter Notes</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          With a book selected, click the + button in the Chapter Notes section. Enter the chapter name 
                          (e.g., "Chapter 3: The Party") and your notes about that chapter.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Save Favorite Quotes</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Click the + button in Favorite Quotes section. Enter the quote text and chapter/page reference 
                          (e.g., "Chapter 9" or "Page 180").
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        5
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Edit & Delete</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Use the Edit button to update book details. Click trash icons to delete notes, quotes, or entire books. 
                          Deleting a book removes all associated notes and quotes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Pro Tips</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        <strong>Update Progress Regularly:</strong> Keep your reading progress current to visualize how far you've come
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        <strong>Detailed Chapter Notes:</strong> Write comprehensive notes while reading to better retain information
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        <strong>Quote Context:</strong> Always include chapter or page references with quotes for easy lookup later
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        <strong>Rate After Completion:</strong> Update your rating once you finish the book for accurate reflection
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        <strong>Build Your Library:</strong> Add books you plan to read with 0% progress to create a reading queue
                      </p>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Perfect For</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">📚 Book Club Members</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Track discussions and insights</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">🎓 Students & Researchers</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Organize academic reading</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">✍️ Writers & Authors</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Study craft and collect inspiration</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">📖 Avid Readers</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Build a personal reading journal</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Got it!
                </button>
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
