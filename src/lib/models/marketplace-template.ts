import mongoose from 'mongoose';
import { NotebookTemplateType } from '@/types/notebook-templates';

export interface IMarketplaceTemplate extends mongoose.Document {
  title: string;
  description: string;
  templateType: NotebookTemplateType;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  category: 'productivity' | 'creative' | 'business' | 'education' | 'personal' | 'other';
  tags: string[];
  content: any; // Template structure/configuration
  preview: {
    images: string[];
    description: string;
  };
  pricing: {
    type: 'free' | 'premium';
    price?: number;
    credits?: number;
  };
  stats: {
    downloads: number;
    rating: number;
    ratingCount: number;
    views: number;
  };
  reviews: mongoose.Types.ObjectId[];
  featured: boolean;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceTemplateSchema = new mongoose.Schema<IMarketplaceTemplate>({
  title: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  templateType: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
    index: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  authorAvatar: String,
  category: {
    type: String,
    enum: ['productivity', 'creative', 'business', 'education', 'personal', 'other'],
    default: 'other',
    index: true,
  },
  tags: [{
    type: String,
  }],
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  preview: {
    images: [String],
    description: String,
  },
  pricing: {
    type: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    price: Number,
    credits: Number,
  },
  stats: {
    downloads: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TemplateReview',
  }],
  featured: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for search and filtering
MarketplaceTemplateSchema.index({ title: 'text', description: 'text', tags: 'text' });
MarketplaceTemplateSchema.index({ 'stats.rating': -1, 'stats.downloads': -1 });
MarketplaceTemplateSchema.index({ featured: 1, 'stats.rating': -1 });

export const MarketplaceTemplate = mongoose.models.MarketplaceTemplate || 
  mongoose.model<IMarketplaceTemplate>('MarketplaceTemplate', MarketplaceTemplateSchema);

// Template Review Model
export interface ITemplateReview extends mongoose.Document {
  templateId: mongoose.Types.ObjectId;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: Date;
}

const TemplateReviewSchema = new mongoose.Schema<ITemplateReview>({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'MarketplaceTemplate',
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userAvatar: String,
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  helpful: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const TemplateReview = mongoose.models.TemplateReview || 
  mongoose.model<ITemplateReview>('TemplateReview', TemplateReviewSchema);

// User's purchased/downloaded templates
export interface IUserTemplate extends mongoose.Document {
  userId: string;
  templateId: mongoose.Types.ObjectId;
  purchaseType: 'free' | 'credits' | 'subscription';
  purchaseDate: Date;
}

const UserTemplateSchema = new mongoose.Schema<IUserTemplate>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'MarketplaceTemplate',
  },
  purchaseType: {
    type: String,
    enum: ['free', 'credits', 'subscription'],
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
});

UserTemplateSchema.index({ userId: 1, templateId: 1 }, { unique: true });

export const UserTemplate = mongoose.models.UserTemplate || 
  mongoose.model<IUserTemplate>('UserTemplate', UserTemplateSchema);
