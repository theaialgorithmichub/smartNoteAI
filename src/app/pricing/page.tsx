"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Crown, Sparkles, ArrowRight, Star, Shield, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PLAN_CONFIG, CREDIT_PACKAGES, calculateDiscount } from '@/config/template-points';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/home/footer';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useUser();

  const handleSubscribe = async (planType: 'pro' | 'ultra') => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/pricing');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          planType,
          billingCycle,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyCredits = async (packageId: string) => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/pricing');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'credits',
          creditPackageId: packageId,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const proDiscount = calculateDiscount(billingCycle, 'pro');
  const ultraDiscount = calculateDiscount(billingCycle, 'ultra');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-neutral-950 dark:via-blue-950 dark:to-indigo-950">
      <Navbar />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Special Launch Pricing
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
              Unlock the full potential of smartDigitalNotes with powerful features and unlimited creativity
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-14 h-7 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 hover:shadow-lg"
              >
                <motion.div
                  className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
                  animate={{ x: billingCycle === 'yearly' ? 28 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full"
                >
                  Save up to 17%
                </motion.span>
              )}
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="relative p-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-2 border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Free</h3>
                    <p className="text-sm text-slate-500">Get started</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">$0</span>
                    <span className="text-slate-500">/forever</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {PLAN_CONFIG.free.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="w-full"
                >
                  Get Started Free
                </Button>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="relative p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-2 border-blue-500 dark:border-blue-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full shadow-lg">
                    MOST POPULAR
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Pro</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">For professionals</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      ${billingCycle === 'monthly' ? PLAN_CONFIG.pro.monthlyPrice : (PLAN_CONFIG.pro.yearlyPrice / 12).toFixed(2)}
                    </span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      ${PLAN_CONFIG.pro.yearlyPrice}/year • Save {proDiscount}%
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {PLAN_CONFIG.pro.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe('pro')}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                >
                  {isLoading ? 'Processing...' : 'Upgrade to Pro'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </motion.div>

            {/* Ultra Plan */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="relative p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-2 border-purple-500 dark:border-purple-600 hover:border-purple-600 dark:hover:border-purple-500 transition-all duration-300">
                <div className="absolute -top-4 -right-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Crown className="w-8 h-8 text-purple-500" />
                  </motion.div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Ultra</h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Unlimited power</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      ${billingCycle === 'monthly' ? PLAN_CONFIG.ultra.monthlyPrice : (PLAN_CONFIG.ultra.yearlyPrice / 12).toFixed(2)}
                    </span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      ${PLAN_CONFIG.ultra.yearlyPrice}/year • Save {ultraDiscount}%
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {PLAN_CONFIG.ultra.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe('ultra')}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg"
                >
                  {isLoading ? 'Processing...' : 'Upgrade to Ultra'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Credit Packages Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Need More Credits?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Purchase credit packages to unlock premium templates anytime
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-6">
          {CREDIT_PACKAGES.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative p-6 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                pkg.popular 
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-2 border-amber-500' 
                  : 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-slate-200 dark:border-neutral-700'
              }`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
                      BEST VALUE
                    </span>
                  </div>
                )}
                {pkg.discount && !pkg.popular && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {pkg.discount}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <Star className={`w-12 h-12 mx-auto ${pkg.popular ? 'text-amber-500' : 'text-slate-400'}`} />
                </div>

                <div className="mb-1">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {pkg.credits}
                  </span>
                  <span className="text-sm text-slate-500 ml-1">credits</span>
                </div>

                {/* Show base credits + bonus for 100 and 250 packages */}
                {pkg.id === 'credits_100' && (
                  <div className="mb-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                    100 + 15 bonus credits
                  </div>
                )}
                {pkg.id === 'credits_250' && (
                  <div className="mb-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                    250 + 50 bonus credits
                  </div>
                )}
                {pkg.id !== 'credits_100' && pkg.id !== 'credits_250' && (
                  <div className="mb-2" />
                )}

                <div className="mb-4">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${pkg.price}
                  </span>
                </div>

                <Button
                  onClick={() => handleBuyCredits(pkg.id)}
                  disabled={isLoading}
                  variant={pkg.popular ? "default" : "outline"}
                  className={`w-full ${pkg.popular ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white' : ''}`}
                >
                  Purchase
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {[
            {
              q: "Can I change my plan later?",
              a: "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
            },
            {
              q: "What happens to my credits when I upgrade?",
              a: "All your existing credits are preserved when you upgrade. Plus, you'll receive bonus credits based on your new plan."
            },
            {
              q: "Can I use credits to purchase notebooks?",
              a: "Yes! Credits can be used to unlock premium templates and create notebooks beyond your plan's limit."
            },
            {
              q: "Is there a refund policy?",
              a: "We offer a 14-day money-back guarantee for all paid plans. No questions asked."
            }
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">{faq.q}</h3>
                <p className="text-slate-600 dark:text-slate-300">{faq.a}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
