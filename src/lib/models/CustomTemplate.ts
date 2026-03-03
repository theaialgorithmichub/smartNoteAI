import mongoose from 'mongoose';

const customTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  icon: { type: String, default: 'FileText' },
  color: { type: String, default: '#8B4513' },
  
  // Template structure
  fields: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'list'], required: true },
    label: { type: String, required: true },
    placeholder: String,
    required: { type: Boolean, default: false },
    options: [String], // For select type
  }],
  
  // Publishing
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  
  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  usageCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
customTemplateSchema.index({ isPublished: 1 });
customTemplateSchema.index({ createdBy: 1 });
customTemplateSchema.index({ category: 1 });

export default mongoose.models.CustomTemplate || mongoose.model('CustomTemplate', customTemplateSchema);
