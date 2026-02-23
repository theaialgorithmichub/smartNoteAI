import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAttachment {
  url: string
  type: 'image' | 'file'
  name?: string
}

export interface IPage extends Document {
  _id: mongoose.Types.ObjectId
  notebookId: mongoose.Types.ObjectId
  chapterId?: mongoose.Types.ObjectId
  pageNumber: number
  title: string
  content: string // HTML content from Tiptap
  contentPlainText: string // Plain text for search
  vector?: number[] // For AI/RAG search
  attachments: IAttachment[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const PageSchema = new Schema<IPage>(
  {
    notebookId: {
      type: Schema.Types.ObjectId,
      ref: 'Notebook',
      required: true,
      index: true,
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
      index: true,
    },
    pageNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    contentPlainText: {
      type: String,
      default: '',
    },
    vector: {
      type: [Number],
      default: undefined,
    },
    attachments: {
      type: [
        {
          url: String,
          type: {
            type: String,
            enum: ['image', 'file'],
          },
          name: String,
        },
      ],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for page ordering within a notebook
PageSchema.index({ notebookId: 1, pageNumber: 1 })

// Text index for full-text search
PageSchema.index(
  { title: 'text', contentPlainText: 'text' },
  { weights: { title: 10, contentPlainText: 5 } }
)

export const Page: Model<IPage> =
  mongoose.models.Page || mongoose.model<IPage>('Page', PageSchema)
