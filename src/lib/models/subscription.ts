import mongoose from 'mongoose';

export type PlanType = 'free' | 'pro' | 'ultra';
export type BillingCycle = 'monthly' | 'yearly';

export interface ISubscription extends mongoose.Document {
  userId: string;
  planType: PlanType;
  billingCycle?: BillingCycle;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  credits: number;
  notebooksCreated: number;
  selectedTemplates: string[];
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new mongoose.Schema<ISubscription>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    planType: {
      type: String,
      enum: ['free', 'pro', 'ultra'],
      default: 'free',
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true,
    },
    stripePriceId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing'],
      default: 'active',
    },
    currentPeriodStart: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    credits: {
      type: Number,
      default: 0,
      min: 0,
    },
    notebooksCreated: {
      type: Number,
      default: 0,
      min: 0,
    },
    selectedTemplates: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });

export const Subscription = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', subscriptionSchema);
