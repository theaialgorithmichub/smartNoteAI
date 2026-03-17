import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-smartnote-api.com';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Notebooks
export const NotebooksAPI = {
  list: (params?: { category?: string }) => api.get('/notebooks', { params }),
  get: (id: string) => api.get(`/notebooks/${id}`),
  create: (data: { title: string; category: string; template: string; appearance?: object }) =>
    api.post('/notebooks', data),
  update: (id: string, data: object) => api.patch(`/notebooks/${id}`, data),
  delete: (id: string) => api.delete(`/notebooks/${id}`),
  trash: () => api.get('/notebooks/trash'),
  restore: (id: string) => api.post(`/notebooks/${id}/restore`),
  permanentDelete: (id: string) => api.delete(`/notebooks/${id}/permanent`),
  shared: () => api.get('/notebooks/shared'),
  sharedByMe: () => api.get('/notebooks/shared-by-me'),
  public: () => api.get('/notebooks/public'),
};

// Pages
export const PagesAPI = {
  list: (notebookId: string) => api.get(`/notebooks/${notebookId}/pages`),
  get: (notebookId: string, pageId: string) =>
    api.get(`/notebooks/${notebookId}/pages/${pageId}`),
  create: (notebookId: string, data: { title: string; content?: string }) =>
    api.post(`/notebooks/${notebookId}/pages`, data),
  update: (notebookId: string, pageId: string, data: object) =>
    api.patch(`/notebooks/${notebookId}/pages/${pageId}`, data),
  delete: (notebookId: string, pageId: string) =>
    api.delete(`/notebooks/${notebookId}/pages/${pageId}`),
};

// Chapters
export const ChaptersAPI = {
  list: (notebookId: string) => api.get(`/notebooks/${notebookId}/chapters`),
  create: (notebookId: string, data: { title: string; color?: string }) =>
    api.post(`/notebooks/${notebookId}/chapters`, data),
};

// Share
export const ShareAPI = {
  create: (notebookId: string, data: object) =>
    api.post(`/notebooks/${notebookId}/share`, data),
  unshare: (notebookId: string) => api.post(`/notebooks/${notebookId}/unshare`),
  getByShareId: (shareId: string, password?: string) =>
    api.get(`/share/${shareId}`, { params: { password } }),
  getNotebook: (shareId: string) => api.get(`/share/${shareId}/notebook`),
};

// AI
export const AIAPI = {
  complete: (text: string, context?: string) =>
    api.post('/ai/complete', { text, context }),
  improve: (text: string, instruction?: string) =>
    api.post('/ai/improve', { text, instruction }),
  outline: (text: string) => api.post('/ai/outline', { text }),
  ask: (question: string, context?: string) =>
    api.post('/ai/ask', { question, context }),
  transcribe: (audioUrl: string) => api.post('/ai/transcribe', { audioUrl }),
  generateImage: (prompt: string) => api.post('/ai/generate-image', { prompt }),
  suggestions: (text: string) => api.post('/ai/suggestions', { text }),
  autoTag: (text: string) => api.post('/ai/auto-tag', { text }),
  chat: (messages: Array<{ role: string; content: string }>, notebookId?: string) =>
    api.post('/chat', { messages, notebookId }),
  publicChat: (messages: Array<{ role: string; content: string }>) =>
    api.post('/chat/public', { messages }),
};

// Friends
export const FriendsAPI = {
  list: () => api.get('/friends'),
  search: (query: string) => api.get('/friends/search', { params: { query } }),
  sendRequest: (userId: string) => api.post('/friends/request', { userId }),
  requests: () => api.get('/friends/requests'),
  accept: (requestId: string) => api.post(`/friends/accept/${requestId}`),
  reject: (requestId: string) => api.post(`/friends/reject/${requestId}`),
};

// Workspaces
export const WorkspacesAPI = {
  list: () => api.get('/workspaces'),
  get: (id: string) => api.get(`/workspaces/${id}`),
  create: (data: { name: string; isPublic?: boolean }) => api.post('/workspaces', data),
  update: (id: string, data: object) => api.patch(`/workspaces/${id}`, data),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
  join: (inviteCode: string) => api.post('/workspaces/join', { inviteCode }),
};

// Notifications
export const NotificationsAPI = {
  list: () => api.get('/notifications'),
  unreadCount: () => api.get('/notifications/unread-count'),
  readAll: () => api.patch('/notifications/read-all'),
  read: (id: string) => api.patch(`/notifications/${id}/read`),
};

// Subscription
export const SubscriptionAPI = {
  status: () => api.get('/subscription/status'),
  createCheckout: (planType: string, billingCycle: string) =>
    api.post('/subscription/create-checkout', { planType, billingCycle }),
  manage: () => api.post('/subscription/manage'),
  selectTemplates: (templateIds: string[]) =>
    api.post('/subscription/select-templates', { templateIds }),
};

// Analytics
export const AnalyticsAPI = {
  stats: () => api.get('/analytics/stats'),
  insights: () => api.get('/analytics/insights'),
  timeline: () => api.get('/analytics/timeline'),
};

// Search
export const SearchAPI = {
  search: (query: string, type?: string) =>
    api.get('/search', { params: { query, type } }),
};

// Upload
export const UploadAPI = {
  upload: (formData: FormData) =>
    api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Favorites
export const FavoritesAPI = {
  list: () => api.get('/favorites'),
  add: (templateId: string) => api.post('/favorites', { templateId }),
  remove: (templateId: string) =>
    api.delete('/favorites', { data: { templateId } }),
};

// Marketplace
export const MarketplaceAPI = {
  templates: (params?: { category?: string; search?: string }) =>
    api.get('/marketplace/templates', { params }),
  get: (templateId: string) => api.get(`/marketplace/${templateId}`),
  download: (templateId: string) =>
    api.post(`/marketplace/${templateId}/download`),
  review: (templateId: string, data: { rating: number; comment: string }) =>
    api.post(`/marketplace/${templateId}/review`, data),
};

export default api;
