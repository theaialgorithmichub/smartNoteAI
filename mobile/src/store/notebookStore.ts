import { create } from 'zustand';
import { Notebook, Page, Chapter } from '../types';

interface NotebookState {
  notebooks: Notebook[];
  trashedNotebooks: Notebook[];
  currentNotebook: Notebook | null;
  currentPages: Page[];
  currentPage: Page | null;
  chapters: Chapter[];
  isLoading: boolean;
  error: string | null;
  setNotebooks: (notebooks: Notebook[]) => void;
  setTrashedNotebooks: (notebooks: Notebook[]) => void;
  setCurrentNotebook: (notebook: Notebook | null) => void;
  setCurrentPages: (pages: Page[]) => void;
  setCurrentPage: (page: Page | null) => void;
  setChapters: (chapters: Chapter[]) => void;
  addNotebook: (notebook: Notebook) => void;
  updateNotebook: (id: string, data: Partial<Notebook>) => void;
  removeNotebook: (id: string) => void;
  addPage: (page: Page) => void;
  updatePage: (id: string, data: Partial<Page>) => void;
  removePage: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNotebookStore = create<NotebookState>((set) => ({
  notebooks: [],
  trashedNotebooks: [],
  currentNotebook: null,
  currentPages: [],
  currentPage: null,
  chapters: [],
  isLoading: false,
  error: null,
  setNotebooks: (notebooks) => set({ notebooks }),
  setTrashedNotebooks: (notebooks) => set({ trashedNotebooks: notebooks }),
  setCurrentNotebook: (notebook) => set({ currentNotebook: notebook }),
  setCurrentPages: (pages) => set({ currentPages: pages }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setChapters: (chapters) => set({ chapters }),
  addNotebook: (notebook) =>
    set((state) => ({ notebooks: [notebook, ...state.notebooks] })),
  updateNotebook: (id, data) =>
    set((state) => ({
      notebooks: state.notebooks.map((n) =>
        n._id === id ? { ...n, ...data } : n
      ),
      currentNotebook:
        state.currentNotebook?._id === id
          ? { ...state.currentNotebook, ...data }
          : state.currentNotebook,
    })),
  removeNotebook: (id) =>
    set((state) => ({
      notebooks: state.notebooks.filter((n) => n._id !== id),
    })),
  addPage: (page) =>
    set((state) => ({ currentPages: [...state.currentPages, page] })),
  updatePage: (id, data) =>
    set((state) => ({
      currentPages: state.currentPages.map((p) =>
        p._id === id ? { ...p, ...data } : p
      ),
      currentPage:
        state.currentPage?._id === id
          ? { ...state.currentPage, ...data }
          : state.currentPage,
    })),
  removePage: (id) =>
    set((state) => ({
      currentPages: state.currentPages.filter((p) => p._id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
