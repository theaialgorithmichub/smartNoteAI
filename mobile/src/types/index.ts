export interface NotebookAppearance {
  coverImageUrl?: string;
  themeColor: string;
  pageColor: string;
  paperPattern: 'lined' | 'grid' | 'dotted' | 'blank';
  fontStyle: 'sans' | 'serif' | 'handwritten';
}

export interface Notebook {
  _id: string;
  userId: string;
  title: string;
  category: string;
  template: string;
  appearance: NotebookAppearance;
  tags: string[];
  isTrashed: boolean;
  trashedAt?: string;
  isPublic: boolean;
  sharedWith: string[];
  pageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  _id: string;
  notebookId: string;
  chapterId?: string;
  pageNumber: number;
  title: string;
  content: string;
  contentPlainText?: string;
  attachments?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  _id: string;
  notebookId: string;
  title: string;
  orderIndex: number;
  color: string;
}

export interface Share {
  _id: string;
  notebookId: string;
  userId: string;
  shareId: string;
  accessType: 'view' | 'edit' | 'comment';
  password?: string;
  expiresAt?: string;
  maxViews?: number;
  currentViews: number;
  allowDownload: boolean;
  allowPrint: boolean;
  watermark?: string;
  createdAt: string;
}

export interface User {
  _id: string;
  clerkId: string;
  email: string;
  name: string;
  avatar?: string;
  isAdmin: boolean;
  friends: string[];
  createdAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  ownerId: string;
  members: Array<{ userId: string; role: 'owner' | 'admin' | 'editor' | 'viewer' }>;
  notebookIds: string[];
  inviteCode: string;
  isPublic: boolean;
  createdAt: string;
}

export interface FriendRequest {
  _id: string;
  from: User;
  to: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionData?: Record<string, unknown>;
  createdAt: string;
}

export interface Subscription {
  _id: string;
  userId: string;
  planType: 'free' | 'pro' | 'ultra';
  credits: number;
  selectedTemplates: string[];
  status: string;
  createdAt: string;
}

export interface AnalyticsStats {
  totalNotebooks: number;
  totalPages: number;
  totalWords: number;
  streak: number;
  lastActivity: string;
  notebooksByCategory: Record<string, number>;
}
