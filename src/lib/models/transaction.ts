import mongoose from 'mongoose';

export type TransactionType = 'subscription' | 'credit_purchase' | 'notebook_purchase' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface ITransaction extends mongoose.Document {
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  credits?: number;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  status: TransactionStatus;
  metadata?: {
    planType?: string;
    billingCycle?: string;
    notebookId?: string;
    templateType?: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['subscription', 'credit_purchase', 'notebook_purchase', 'refund'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'usd',
    },
    credits: {
      type: Number,
    },
    stripePaymentIntentId: {
      type: String,
    },
    stripeInvoiceId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ stripePaymentIntentId: 1 });

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);
