"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Calendar, 
  Zap, 
  Crown, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Coins,
  BookOpen,
  Settings,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface SubscriptionData {
  subscription: {
    planType: 'free' | 'pro' | 'ultra';
    billingCycle?: 'monthly' | 'yearly';
    status: string;
    credits: number;
    notebooksCreated: number;
    selectedTemplates: string[];
    currentPeriodEnd?: string;
    cancelAtPeriodEnd: boolean;
  };
  planConfig: {
    name: string;
    maxNotebooks: number;
    maxTemplates: number;
    features: string[];
  };
  limits: {
    canCreateNotebook: boolean;
    remainingNotebooks: number;
    canSelectMoreTemplates: boolean;
    remainingTemplateSlots: number;
  };
}

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    if (isLoaded && user) {
      fetchSubscriptionData();
    }
  }, [isLoaded, user]);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      const data = await response.json();
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async (action: string) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/subscription/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (action === 'billing-portal' && data.url) {
        window.location.href = data.url;
      } else {
        await fetchSubscriptionData();
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !subscriptionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading your account...</p>
        </div>
      </div>
    );
  }

  const { subscription, planConfig, limits } = subscriptionData;
  const isPaidPlan = subscription.planType !== 'free';

  const getPlanIcon = () => {
    switch (subscription.planType) {
      case 'ultra':
        return <Crown className="w-8 h-8 text-purple-500" />;
      case 'pro':
        return <Zap className="w-8 h-8 text-blue-500" />;
      default:
        return <Shield className="w-8 h-8 text-slate-500" />;
    }
  };

  const getPlanColor = () => {
    switch (subscription.planType) {
      case 'ultra':
        return 'from-purple-500 to-pink-500';
      case 'pro':
        return 'from-blue-500 to-indigo-500';
      default:
        return 'from-slate-400 to-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-neutral-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            My Account
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your subscription and account settings
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Plan Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className={`p-8 bg-gradient-to-br ${
                subscription.planType === 'ultra' 
                  ? 'from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-500' 
                  : subscription.planType === 'pro'
                  ? 'from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-500'
                  : 'from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-800 border-slate-300'
              } border-2`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getPlanColor()} rounded-2xl flex items-center justify-center shadow-lg`}>
                      {getPlanIcon()}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {planConfig.name} Plan
                      </h2>
                      {isPaidPlan && subscription.billingCycle && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 capitalize">
                          {subscription.billingCycle} billing
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {subscription.status === 'active' ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  ) : subscription.status === 'past_due' ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Past Due</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-medium capitalize">{subscription.status}</span>
                    </div>
                  )}
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <div className="mb-6 p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          Your subscription will be canceled on{' '}
                          {subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          You'll still have access to your plan until then
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-white/50 dark:bg-neutral-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Notebooks</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {subscription.notebooksCreated}
                      </span>
                      <span className="text-sm text-slate-500">
                        / {planConfig.maxNotebooks === -1 ? '∞' : planConfig.maxNotebooks}
                      </span>
                    </div>
                    {limits.remainingNotebooks > 0 && limits.remainingNotebooks !== -1 && (
                      <p className="text-xs text-slate-500 mt-1">
                        {limits.remainingNotebooks} remaining
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-white/50 dark:bg-neutral-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Credits</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {subscription.credits}
                      </span>
                      <span className="text-sm text-slate-500">available</span>
                    </div>
                  </div>
                </div>

                {isPaidPlan && subscription.currentPeriodEnd && (
                  <div className="mb-6 p-4 bg-white/50 dark:bg-neutral-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Next billing date
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {subscription.planType === 'free' ? (
                    <Button
                      onClick={() => router.push('/pricing')}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  ) : (
                    <>
                      {!subscription.cancelAtPeriodEnd ? (
                        <Button
                          onClick={() => handleManageSubscription('cancel')}
                          disabled={actionLoading}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          Cancel Subscription
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleManageSubscription('resume')}
                          disabled={actionLoading}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          Resume Subscription
                        </Button>
                      )}
                      <Button
                        onClick={() => handleManageSubscription('billing-portal')}
                        disabled={actionLoading}
                        variant="outline"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Manage Billing
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => router.push('/pricing')}
                    variant="outline"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Buy Credits
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Features Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Your Plan Features
                </h3>
                <ul className="space-y-3">
                  {planConfig.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-200">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            {/* Selected Templates (Pro Plan) */}
            {subscription.planType === 'pro' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Selected Templates
                    </h3>
                    <span className="text-sm text-slate-500">
                      {subscription.selectedTemplates.length} / {planConfig.maxTemplates}
                    </span>
                  </div>
                  {subscription.selectedTemplates.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {subscription.selectedTemplates.map((template) => (
                        <div
                          key={template}
                          className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center"
                        >
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300 capitalize">
                            {template.replace(/-/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      No templates selected yet
                    </p>
                  )}
                  <Button
                    onClick={() => router.push('/templates')}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Templates
                  </Button>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Plan Status</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                      {subscription.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Total Notebooks</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {subscription.notebooksCreated}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Available Credits</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {subscription.credits}
                    </span>
                  </div>
                  {subscription.planType === 'pro' && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                      <span className="text-sm text-slate-600 dark:text-slate-300">Templates Selected</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {subscription.selectedTemplates.length} / {planConfig.maxTemplates}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Upgrade CTA */}
            {subscription.planType !== 'ultra' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <Crown className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    {subscription.planType === 'free' ? 'Upgrade to Pro' : 'Upgrade to Ultra'}
                  </h3>
                  <p className="text-sm text-white/90 mb-4">
                    {subscription.planType === 'free' 
                      ? 'Unlock 10 templates and create up to 10 notebooks'
                      : 'Get unlimited notebooks and access to all templates'}
                  </p>
                  <Button
                    onClick={() => router.push('/pricing')}
                    className="w-full bg-white text-purple-600 hover:bg-white/90"
                  >
                    View Plans
                  </Button>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
