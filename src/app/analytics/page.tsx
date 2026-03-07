"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Award,
  Flame,
  Clock,
  FileText,
  Target,
  Activity,
  Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [templateUsage, setTemplateUsage] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    if (isLoaded && user) {
      fetchAnalytics();
    }
  }, [isLoaded, user]);

  const fetchAnalytics = async () => {
    try {
      const [statsRes, insightsRes] = await Promise.all([
        fetch('/api/analytics/stats'),
        fetch('/api/analytics/insights'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data.insights);
        setTemplateUsage(data.templateUsage || []);
        setHeatmap(data.heatmap || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

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
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Track your productivity and usage patterns
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Total Notebooks</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalNotebooks}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Total Words</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalWords.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Time Spent</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {Math.round(stats.totalTimeSpent / 60)}h
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Current Streak</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.streakDays} days
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Productivity Insights */}
          {insights && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Productivity Insights
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Avg Activity/Day</span>
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      {insights.averageActivityPerDay}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Active Days (30d)</span>
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      {insights.activeDaysLast30}/30
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Consistency Score</span>
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      {insights.consistencyScore}%
                    </span>
                  </div>

                  {insights.favoriteTemplate && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                      <span className="text-sm text-slate-600 dark:text-slate-300">Favorite Template</span>
                      <span className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                        {insights.favoriteTemplate.replace(/-/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Template Usage */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Template Usage
              </h2>

              <div className="space-y-3">
                {templateUsage.slice(0, 5).map((item, index) => {
                  const maxCount = templateUsage[0]?.count || 1;
                  const percentage = (item.count / maxCount) * 100;

                  return (
                    <div key={item.template}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize">
                          {item.template.replace(/-/g, ' ')}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {item.count}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Activity Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Activity Heatmap (Last 90 Days)
            </h2>

            <div className="grid grid-cols-10 gap-2">
              {heatmap.map((day, index) => {
                const maxCount = Math.max(...heatmap.map(d => d.count));
                const intensity = day.count / maxCount;
                const opacity = intensity * 0.8 + 0.2;

                return (
                  <motion.div
                    key={day.date}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    className="aspect-square rounded"
                    style={{
                      backgroundColor: day.count > 0 
                        ? `rgba(59, 130, 246, ${opacity})`
                        : 'rgb(226, 232, 240)',
                    }}
                    title={`${day.date}: ${day.count} activities`}
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
              <span>Less</span>
              <div className="flex gap-1">
                {[0.2, 0.4, 0.6, 0.8, 1].map(opacity => (
                  <div
                    key={opacity}
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
