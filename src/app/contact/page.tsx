'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquareText } from 'lucide-react';
import { UnifiedHeader } from '@/components/layout/unified-header';
import { Footer } from '@/components/home/footer';
import { ContactFeedbackForm } from '@/components/contact/contact-feedback-form';
import { UserFeedbackStatus } from '@/components/contact/user-feedback-status';

export default function ContactPage() {
  const [reloadSignal, setReloadSignal] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50 via-white to-pink-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <UnifiedHeader fixed />
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30 mx-auto">
              <Mail className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-600">
              Contact us
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto flex items-start justify-center gap-2 text-sm md:text-base">
              <MessageSquareText className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
              Share glitches, feature ideas, or improvements. Our team reviews every submission—track status here after
              you sign in.
            </p>
          </motion.div>

          <ContactFeedbackForm onSubmitted={() => setReloadSignal((n) => n + 1)} />
          <UserFeedbackStatus reloadSignal={reloadSignal} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
