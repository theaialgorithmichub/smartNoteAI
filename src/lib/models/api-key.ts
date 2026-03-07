import mongoose from 'mongoose';
import crypto from 'crypto';

export interface IAPIKey extends mongoose.Document {
  userId: string;
  name: string;
  key: string;
  keyHash: string;
  permissions: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  usage: {
    totalRequests: number;
    lastUsed?: Date;
    requestsToday: number;
    lastResetDate: Date;
  };
  ipWhitelist: string[];
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const APIKeySchema = new mongoose.Schema<IAPIKey>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
    select: false, // Don't return in queries
  },
  keyHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  permissions: [{
    type: String,
    enum: [
      'notebooks.read',
      'notebooks.write',
      'notebooks.delete',
      'templates.read',
      'templates.write',
      'analytics.read',
      'share.create',
      'share.manage',
      'ai.use',
      'marketplace.read',
      'marketplace.write',
    ],
  }],
  rateLimit: {
    requestsPerMinute: {
      type: Number,
      default: 60,
    },
    requestsPerDay: {
      type: Number,
      default: 10000,
    },
  },
  usage: {
    totalRequests: {
      type: Number,
      default: 0,
    },
    lastUsed: Date,
    requestsToday: {
      type: Number,
      default: 0,
    },
    lastResetDate: {
      type: Date,
      default: Date.now,
    },
  },
  ipWhitelist: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate API key
APIKeySchema.statics.generateKey = function(): string {
  return 'sk_' + crypto.randomBytes(32).toString('hex');
};

// Hash API key
APIKeySchema.statics.hashKey = function(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
};

export const APIKey = mongoose.models.APIKey || 
  mongoose.model<IAPIKey>('APIKey', APIKeySchema);

// Webhook configuration
export interface IWebhook extends mongoose.Document {
  userId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggered?: Date;
  failureCount: number;
  createdAt: Date;
}

const WebhookSchema = new mongoose.Schema<IWebhook>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  url: {
    type: String,
    required: true,
  },
  events: [{
    type: String,
    enum: [
      'notebook.created',
      'notebook.updated',
      'notebook.deleted',
      'share.created',
      'template.downloaded',
      'subscription.updated',
    ],
  }],
  secret: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastTriggered: Date,
  failureCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Webhook = mongoose.models.Webhook || 
  mongoose.model<IWebhook>('Webhook', WebhookSchema);
