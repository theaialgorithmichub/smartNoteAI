import mongoose from 'mongoose';

export interface IAnalyticsEvent extends mongoose.Document {
  userId: string;
  eventType: 'notebook_created' | 'notebook_viewed' | 'notebook_edited' | 'notebook_deleted' | 
              'template_used' | 'share_created' | 'export_pdf' | 'import_file' | 
              'ai_suggestion' | 'subscription_upgrade' | 'credit_purchase';
  metadata: {
    notebookId?: string;
    templateType?: string;
    duration?: number;
    fileSize?: number;
    aiAction?: string;
    planType?: string;
    amount?: number;
    [key: string]: any;
  };
  timestamp: Date;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

const AnalyticsEventSchema = new mongoose.Schema<IAnalyticsEvent>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    required: true,
    index: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  sessionId: String,
  ipAddress: String,
  userAgent: String,
});

// Compound indexes for common queries
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ userId: 1, eventType: 1, timestamp: -1 });

export const AnalyticsEvent = mongoose.models.AnalyticsEvent || 
  mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);

// User statistics model
export interface IUserStats extends mongoose.Document {
  userId: string;
  totalNotebooks: number;
  totalWords: number;
  totalTimeSpent: number; // in minutes
  templatesUsed: Map<string, number>;
  lastActive: Date;
  streakDays: number;
  achievements: string[];
  favoriteTemplate?: string;
  mostProductiveHour?: number;
  updatedAt: Date;
}

const UserStatsSchema = new mongoose.Schema<IUserStats>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  totalNotebooks: {
    type: Number,
    default: 0,
  },
  totalWords: {
    type: Number,
    default: 0,
  },
  totalTimeSpent: {
    type: Number,
    default: 0,
  },
  templatesUsed: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  streakDays: {
    type: Number,
    default: 0,
  },
  achievements: [{
    type: String,
  }],
  favoriteTemplate: String,
  mostProductiveHour: Number,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const UserStats = mongoose.models.UserStats || 
  mongoose.model<IUserStats>('UserStats', UserStatsSchema);
