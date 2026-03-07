import mongoose from 'mongoose';

// Custom Template Component
export interface ITemplateComponent {
  id: string;
  type: 'text' | 'heading' | 'list' | 'table' | 'image' | 'divider' | 'code' | 'quote' | 'custom';
  props: Record<string, any>;
  children?: ITemplateComponent[];
  styles?: Record<string, any>;
}

// Custom Template
export interface ICustomTemplate extends mongoose.Document {
  userId: string;
  teamId?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  tags: string[];
  components: ITemplateComponent[];
  settings: {
    width: 'full' | 'contained';
    spacing: 'compact' | 'normal' | 'relaxed';
    theme: 'light' | 'dark' | 'auto';
  };
  version: number;
  versions: {
    version: number;
    components: ITemplateComponent[];
    createdAt: Date;
    createdBy: string;
  }[];
  isPublic: boolean;
  publishedToMarketplace: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomTemplateSchema = new mongoose.Schema<ICustomTemplate>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  category: {
    type: String,
    default: 'custom',
  },
  tags: [String],
  components: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  settings: {
    width: {
      type: String,
      enum: ['full', 'contained'],
      default: 'contained',
    },
    spacing: {
      type: String,
      enum: ['compact', 'normal', 'relaxed'],
      default: 'normal',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
  },
  version: {
    type: Number,
    default: 1,
  },
  versions: [{
    version: Number,
    components: [mongoose.Schema.Types.Mixed],
    createdAt: Date,
    createdBy: String,
  }],
  isPublic: {
    type: Boolean,
    default: false,
  },
  publishedToMarketplace: {
    type: Boolean,
    default: false,
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

export const CustomTemplate = mongoose.models.CustomTemplate || 
  mongoose.model<ICustomTemplate>('CustomTemplate', CustomTemplateSchema);
