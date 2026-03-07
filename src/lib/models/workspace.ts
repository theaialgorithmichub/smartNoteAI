import mongoose, { Schema, Document, Model } from 'mongoose';

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceRole;
  joinedAt: Date;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface IWorkspace extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  ownerId: string;
  members: WorkspaceMember[];
  notebookIds: mongoose.Types.ObjectId[];
  inviteCode: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceMemberSchema = new Schema<WorkspaceMember>({
  userId: { type: String, required: true },
  role: { type: String, enum: ['owner', 'admin', 'editor', 'viewer'], default: 'viewer' },
  joinedAt: { type: Date, default: Date.now },
  name: String,
  email: String,
  avatar: String,
}, { _id: false });

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true },
    description: String,
    ownerId: { type: String, required: true, index: true },
    members: [WorkspaceMemberSchema],
    notebookIds: [{ type: Schema.Types.ObjectId, ref: 'Notebook' }],
    inviteCode: { type: String, unique: true, sparse: true },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

WorkspaceSchema.index({ ownerId: 1 });
WorkspaceSchema.index({ 'members.userId': 1 });
WorkspaceSchema.index({ inviteCode: 1 });

if (mongoose.models.Workspace) delete mongoose.models.Workspace;

export const Workspace: Model<IWorkspace> = mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
