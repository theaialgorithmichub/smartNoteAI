import { AnalyticsEvent, UserStats } from './models/analytics';
import connectDB from './mongodb';

export interface AnalyticsEventData {
  userId: string;
  eventType: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class Analytics {
  // Track an event
  static async trackEvent(data: AnalyticsEventData): Promise<void> {
    try {
      await connectDB();
      
      await AnalyticsEvent.create({
        ...data,
        timestamp: new Date(),
      });

      // Update user stats asynchronously
      this.updateUserStats(data.userId, data.eventType, data.metadata).catch(console.error);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Update user statistics
  private static async updateUserStats(
    userId: string, 
    eventType: string, 
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await connectDB();

      const stats = await UserStats.findOne({ userId }) || await UserStats.create({
        userId,
        totalNotebooks: 0,
        totalWords: 0,
        totalTimeSpent: 0,
        templatesUsed: new Map(),
        lastActive: new Date(),
        streakDays: 0,
        achievements: [],
      });

      // Update based on event type
      switch (eventType) {
        case 'notebook_created':
          stats.totalNotebooks += 1;
          if (metadata?.templateType) {
            const count = stats.templatesUsed.get(metadata.templateType) || 0;
            stats.templatesUsed.set(metadata.templateType, count + 1);
          }
          break;

        case 'notebook_edited':
          if (metadata?.duration) {
            stats.totalTimeSpent += metadata.duration;
          }
          if (metadata?.wordCount) {
            stats.totalWords += metadata.wordCount;
          }
          break;

        case 'notebook_deleted':
          stats.totalNotebooks = Math.max(0, stats.totalNotebooks - 1);
          break;
      }

      // Update streak
      const lastActive = new Date(stats.lastActive);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        stats.streakDays += 1;
      } else if (daysDiff > 1) {
        stats.streakDays = 1;
      }

      stats.lastActive = now;
      stats.updatedAt = now;

      // Find favorite template
      if (stats.templatesUsed.size > 0) {
        let maxCount = 0;
        let favorite = '';
        stats.templatesUsed.forEach((count: number, template: string) => {
          if (count > maxCount) {
            maxCount = count;
            favorite = template;
          }
        });
        stats.favoriteTemplate = favorite;
      }

      await stats.save();
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<any> {
    try {
      await connectDB();

      const stats = await UserStats.findOne({ userId });
      if (!stats) {
        return {
          totalNotebooks: 0,
          totalWords: 0,
          totalTimeSpent: 0,
          templatesUsed: {},
          streakDays: 0,
          achievements: [],
        };
      }

      return {
        totalNotebooks: stats.totalNotebooks,
        totalWords: stats.totalWords,
        totalTimeSpent: stats.totalTimeSpent,
        templatesUsed: Object.fromEntries(stats.templatesUsed),
        streakDays: stats.streakDays,
        achievements: stats.achievements,
        favoriteTemplate: stats.favoriteTemplate,
        mostProductiveHour: stats.mostProductiveHour,
        lastActive: stats.lastActive,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  // Get activity timeline
  static async getActivityTimeline(userId: string, days: number = 30): Promise<any[]> {
    try {
      await connectDB();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const events = await AnalyticsEvent.find({
        userId,
        timestamp: { $gte: startDate },
      })
        .sort({ timestamp: -1 })
        .limit(100);

      return events.map(event => ({
        type: event.eventType,
        timestamp: event.timestamp,
        metadata: event.metadata,
      }));
    } catch (error) {
      console.error('Error getting activity timeline:', error);
      return [];
    }
  }

  // Get usage by template
  static async getTemplateUsage(userId: string): Promise<any[]> {
    try {
      await connectDB();

      const stats = await UserStats.findOne({ userId });
      if (!stats || !stats.templatesUsed) return [];

      return Array.from(stats.templatesUsed.entries() as Iterable<[string, number]>)
        .map(([template, count]) => ({ template, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error getting template usage:', error);
      return [];
    }
  }

  // Get activity heatmap data
  static async getActivityHeatmap(userId: string, days: number = 90): Promise<any> {
    try {
      await connectDB();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const events = await AnalyticsEvent.aggregate([
        {
          $match: {
            userId,
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.date': 1 },
        },
      ]);

      return events.map(e => ({
        date: e._id.date,
        count: e.count,
      }));
    } catch (error) {
      console.error('Error getting activity heatmap:', error);
      return [];
    }
  }

  // Get productivity insights
  static async getProductivityInsights(userId: string): Promise<any> {
    try {
      await connectDB();

      const stats = await UserStats.findOne({ userId });
      const last30Days = await this.getActivityHeatmap(userId, 30);
      
      const totalActivity = last30Days.reduce((sum: number, day: any) => sum + day.count, 0);
      const avgPerDay = totalActivity / 30;
      
      const activeDays = last30Days.filter((day: any) => day.count > 0).length;
      const consistencyScore = (activeDays / 30) * 100;

      return {
        averageActivityPerDay: avgPerDay.toFixed(1),
        activeDaysLast30: activeDays,
        consistencyScore: consistencyScore.toFixed(1),
        currentStreak: stats?.streakDays || 0,
        totalTimeSpent: stats?.totalTimeSpent || 0,
        totalWords: stats?.totalWords || 0,
        favoriteTemplate: stats?.favoriteTemplate,
      };
    } catch (error) {
      console.error('Error getting productivity insights:', error);
      return null;
    }
  }
}

// Helper function to track events easily
export async function trackEvent(
  userId: string,
  eventType: string,
  metadata?: Record<string, any>
): Promise<void> {
  await Analytics.trackEvent({ userId, eventType, metadata });
}
