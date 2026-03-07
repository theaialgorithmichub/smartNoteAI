import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { APIKey } from '@/lib/models/api-key';
import crypto from 'crypto';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export async function validateAPIKey(req: NextRequest): Promise<{
  valid: boolean;
  userId?: string;
  permissions?: string[];
  error?: string;
}> {
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');

  if (!apiKey) {
    return { valid: false, error: 'API key required' };
  }

  if (!apiKey.startsWith('sk_')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  try {
    await connectDB();

    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const apiKeyDoc = await APIKey.findOne({ keyHash, isActive: true });

    if (!apiKeyDoc) {
      return { valid: false, error: 'Invalid API key' };
    }

    // Check expiration
    if (apiKeyDoc.expiresAt && new Date() > apiKeyDoc.expiresAt) {
      return { valid: false, error: 'API key expired' };
    }

    // Check IP whitelist
    if (apiKeyDoc.ipWhitelist.length > 0) {
      const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      if (!apiKeyDoc.ipWhitelist.includes(clientIP)) {
        return { valid: false, error: 'IP not whitelisted' };
      }
    }

    // Check rate limits
    const rateLimitCheck = checkRateLimit(keyHash, apiKeyDoc.rateLimit);
    if (!rateLimitCheck.allowed) {
      return { valid: false, error: rateLimitCheck.error };
    }

    // Update usage
    const today = new Date().toDateString();
    if (apiKeyDoc.usage.lastResetDate.toDateString() !== today) {
      apiKeyDoc.usage.requestsToday = 0;
      apiKeyDoc.usage.lastResetDate = new Date();
    }

    apiKeyDoc.usage.totalRequests += 1;
    apiKeyDoc.usage.requestsToday += 1;
    apiKeyDoc.usage.lastUsed = new Date();
    await apiKeyDoc.save();

    return {
      valid: true,
      userId: apiKeyDoc.userId,
      permissions: apiKeyDoc.permissions,
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return { valid: false, error: 'Internal server error' };
  }
}

function checkRateLimit(keyHash: string, limits: { requestsPerMinute: number; requestsPerDay: number }): {
  allowed: boolean;
  error?: string;
} {
  const now = Date.now();
  const minuteKey = `${keyHash}:minute`;
  
  // Check per-minute limit
  if (!rateLimitStore[minuteKey]) {
    rateLimitStore[minuteKey] = {
      count: 0,
      resetTime: now + 60000, // 1 minute
    };
  }

  if (now > rateLimitStore[minuteKey].resetTime) {
    rateLimitStore[minuteKey] = {
      count: 0,
      resetTime: now + 60000,
    };
  }

  if (rateLimitStore[minuteKey].count >= limits.requestsPerMinute) {
    return {
      allowed: false,
      error: `Rate limit exceeded: ${limits.requestsPerMinute} requests per minute`,
    };
  }

  rateLimitStore[minuteKey].count += 1;
  return { allowed: true };
}

export function hasPermission(permissions: string[], required: string): boolean {
  return permissions.includes(required) || permissions.includes('*');
}

export function createAPIResponse(data: any, status: number = 200) {
  return NextResponse.json({
    success: status >= 200 && status < 300,
    data,
    timestamp: new Date().toISOString(),
  }, { status });
}

export function createAPIError(error: string, status: number = 400) {
  return NextResponse.json({
    success: false,
    error,
    timestamp: new Date().toISOString(),
  }, { status });
}
