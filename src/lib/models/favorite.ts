import mongoose from 'mongoose';
import { NotebookTemplateType } from '@/types/notebook-templates';

export interface IFavorite extends mongoose.Document {
  userId: string;
  templateId: NotebookTemplateType;
  createdAt: Date;
}

const FavoriteSchema = new mongoose.Schema<IFavorite>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  templateId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate favorites
FavoriteSchema.index({ userId: 1, templateId: 1 }, { unique: true });

export const Favorite = mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);
