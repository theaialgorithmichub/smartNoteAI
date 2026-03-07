import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Analytics } from '@/lib/analytics';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [insights, templateUsage, heatmap] = await Promise.all([
      Analytics.getProductivityInsights(userId),
      Analytics.getTemplateUsage(userId),
      Analytics.getActivityHeatmap(userId, 90),
    ]);

    return NextResponse.json({
      success: true,
      insights,
      templateUsage,
      heatmap,
    });
  } catch (error: any) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
