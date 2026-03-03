import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['notebook_shared', 'friend_request', 'friend_accepted'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  
  // Action data
  actionData: {
    notebookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notebook' },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'FriendRequest' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  
  createdAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
