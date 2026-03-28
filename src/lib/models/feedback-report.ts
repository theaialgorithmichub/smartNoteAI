import mongoose from 'mongoose';

export type FeedbackType = 'glitch' | 'feature' | 'improvement';
export type FeedbackPriority = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type FeedbackStatus = 'submitted' | 'acknowledged' | 'in_progress' | 'completed' | 'declined';
export type AgentAction = 'fix' | 'implement' | 'improve';

const feedbackReportSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    submitterName: { type: String, required: true },
    submitterEmail: { type: String, required: true },
    type: {
      type: String,
      enum: ['glitch', 'feature', 'improvement'],
      required: true,
      index: true,
    },
    description: { type: String, required: true, maxlength: 20000 },
    imageUrl: { type: String },
    priority: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical'],
      default: 'none',
    },
    status: {
      type: String,
      enum: ['submitted', 'acknowledged', 'in_progress', 'completed', 'declined'],
      default: 'submitted',
      index: true,
    },
    acknowledgedAt: { type: Date },
    resolutionSummary: { type: String, maxlength: 4000 },
    repoUrl: { type: String },
    branch: { type: String },
    lastAgentAction: { type: String, enum: ['fix', 'implement', 'improve'] },
    lastCursorPrompt: { type: String, maxlength: 100000 },
    lastCursorDispatchAt: { type: Date },
    cursorWebhookStatus: { type: String },
    cursorWebhookDetail: { type: String, maxlength: 4000 },
    adminInternalNote: { type: String, maxlength: 8000 },
  },
  { timestamps: true }
);

feedbackReportSchema.index({ createdAt: -1 });

if (mongoose.models.FeedbackReport) {
  delete mongoose.models.FeedbackReport;
}

export default mongoose.model('FeedbackReport', feedbackReportSchema);
