import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';

    console.log('[TEST SEARCH] Query:', query);
    console.log('[TEST SEARCH] Current user:', userId);

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query too short', query });
    }

    // Test Clerk search
    const client = await clerkClient();
    console.log('[TEST SEARCH] Clerk client initialized');

    const clerkUsers = await client.users.getUserList({
      query,
      limit: 20
    });

    console.log('[TEST SEARCH] Found users:', clerkUsers.data.length);

    const results = clerkUsers.data.map(user => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      username: user.username
    }));

    return NextResponse.json({
      query,
      count: results.length,
      users: results
    });
  } catch (error) {
    console.error('[TEST SEARCH] Error:', error);
    return NextResponse.json({ 
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
