import mongoose, { Schema, Document, Model } from 'mongoose'

export type NotebookTemplateType = 
  | 'simple'
  | 'meeting-notes'
  | 'document'
  | 'dashboard'
  | 'code-notebook'
  | 'planner'
  | 'ai-research'
  | 'diary'
  | 'journal'
  | 'custom'
  | 'doodle'
  | 'project'
  | 'loop'
  | 'story'
  | 'storytelling'
  | 'typewriter'
  | 'n8n'
  | 'image-prompt'
  | 'video-prompt'
  | 'link'
  | 'studybook'
  | 'flashcard'
  | 'whiteboard'
  | 'recipe'
  | 'expense'
  | 'trip'
  | 'todo'

export interface INotebook extends Document {
  _id: mongoose.Types.ObjectId
  userId: string
  title: string
  category: string
  template: NotebookTemplateType
  appearance: {
    coverImageUrl?: string
    themeColor: string
    pageColor: string
    paperPattern: 'lined' | 'grid' | 'dotted' | 'blank'
    fontStyle: 'sans' | 'serif' | 'handwritten'
  }
  tags: string[]
  isTrashed: boolean
  trashedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const NotebookSchema = new Schema<INotebook>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Untitled Notebook',
    },
    category: {
      type: String,
      default: 'Personal',
    },
    template: {
      type: String,
      enum: ['simple', 'meeting-notes', 'document', 'dashboard', 'code-notebook', 'planner', 'ai-research', 'diary', 'journal', 'custom', 'doodle', 'project', 'loop', 'story', 'storytelling', 'typewriter', 'n8n', 'image-prompt', 'video-prompt', 'link', 'studybook', 'flashcard', 'whiteboard', 'recipe', 'expense', 'trip', 'todo'],
      default: 'simple',
    },
    appearance: {
      coverImageUrl: String,
      themeColor: {
        type: String,
        default: '#8B4513', // Leather brown
      },
      pageColor: {
        type: String,
        default: '#fffbeb', // Warm cream/amber-50
      },
      paperPattern: {
        type: String,
        enum: ['lined', 'grid', 'dotted', 'blank'],
        default: 'lined',
      },
      fontStyle: {
        type: String,
        enum: ['sans', 'serif', 'handwritten'],
        default: 'sans',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    isTrashed: {
      type: Boolean,
      default: false,
    },
    trashedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Index for trash cleanup (30 days)
NotebookSchema.index({ trashedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })

// Compound index for user queries
NotebookSchema.index({ userId: 1, isTrashed: 1, createdAt: -1 })

// Delete cached model to ensure schema updates are picked up in development
if (mongoose.models.Notebook) {
  delete mongoose.models.Notebook
}

export const Notebook: Model<INotebook> = mongoose.model<INotebook>('Notebook', NotebookSchema)
