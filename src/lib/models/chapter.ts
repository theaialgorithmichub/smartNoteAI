import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChapter extends Document {
  _id: mongoose.Types.ObjectId
  notebookId: mongoose.Types.ObjectId
  title: string
  orderIndex: number
  color: string
  createdAt: Date
  updatedAt: Date
}

const ChapterSchema = new Schema<IChapter>(
  {
    notebookId: {
      type: Schema.Types.ObjectId,
      ref: 'Notebook',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'New Chapter',
    },
    orderIndex: {
      type: Number,
      required: true,
      default: 0,
    },
    color: {
      type: String,
      default: '#3B82F6', // Blue
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for ordering chapters within a notebook
ChapterSchema.index({ notebookId: 1, orderIndex: 1 })

export const Chapter: Model<IChapter> =
  mongoose.models.Chapter || mongoose.model<IChapter>('Chapter', ChapterSchema)
