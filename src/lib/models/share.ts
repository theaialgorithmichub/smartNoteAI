import mongoose from 'mongoose';

export interface IShare extends mongoose.Document {
  notebookId: string;
  userId: string;
  shareId: string;
  accessType: 'view' | 'edit' | 'comment';
  password?: string;
  expiresAt?: Date;
  maxViews?: number;
  currentViews: number;
  allowDownload: boolean;
  allowPrint: boolean;
  watermark?: string;
  isActive: boolean;
  createdAt: Date;
  lastAccessedAt?: Date;
  accessLog: {
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
  }[];
}

const ShareSchema = new mongoose.Schema<IShare>({
  notebookId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  shareId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  accessType: {
    type: String,
    enum: ['view', 'edit', 'comment'],
    default: 'view',
  },
  password: {
    type: String,
    select: false, // Don't return password by default
  },
  expiresAt: {
    type: Date,
  },
  maxViews: {
    type: Number,
  },
  currentViews: {
    type: Number,
    default: 0,
  },
  allowDownload: {
    type: Boolean,
    default: true,
  },
  allowPrint: {
    type: Boolean,
    default: true,
  },
  watermark: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastAccessedAt: {
    type: Date,
  },
  accessLog: [{
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
    userAgent: String,
  }],
});

// Index for cleanup of expired shares
ShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Share = mongoose.models.Share || mongoose.model<IShare>('Share', ShareSchema);
