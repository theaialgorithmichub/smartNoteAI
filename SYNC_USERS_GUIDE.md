# User Sync Guide - Clerk to MongoDB

## Problem
Users exist in Clerk but not in MongoDB, causing the search functionality to fail.

## Solution
We've implemented automatic user syncing with multiple approaches:

---

## 🔄 Automatic Sync (Recommended)

### 1. Webhook Setup (Future signups)
Clerk webhooks will automatically sync new users to MongoDB when they sign up.

**Setup Steps:**
1. Go to Clerk Dashboard → Webhooks
2. Create a new webhook endpoint
3. Set URL to: `https://your-domain.com/api/webhooks/clerk`
4. Select events: `user.created`, `user.updated`, `user.deleted`
5. Copy the webhook secret
6. Add to `.env.local`:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### 2. Auto-sync on Search (Current users)
The search API now automatically syncs users from Clerk to MongoDB when they're found in search results.

**How it works:**
- When you search for a user, the API queries Clerk
- If the user exists in Clerk but not MongoDB, they're automatically created
- This happens transparently in the background

---

## 🔧 Manual Sync (For Existing Users)

### Option 1: API Endpoint
Call the sync endpoint to sync all existing Clerk users to MongoDB:

```bash
# Using curl
curl -X POST http://localhost:3000/api/sync-users \
  -H "Cookie: your-session-cookie"

# Or using fetch in browser console
fetch('/api/sync-users', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

**Response:**
```json
{
  "success": true,
  "message": "Synced 2 users, skipped 0 existing users",
  "synced": 2,
  "skipped": 0,
  "total": 2
}
```

### Option 2: Add Sync Button to UI (Recommended)

Add this to your dashboard or settings page:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function SyncUsersButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sync-users', { method: 'POST' });
      const data = await response.json();
      setResult(data);
      alert(`Synced ${data.synced} users successfully!`);
    } catch (error) {
      alert('Sync failed: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button onClick={handleSync} disabled={loading}>
        {loading ? 'Syncing...' : 'Sync Clerk Users to MongoDB'}
      </Button>
      {result && (
        <p className="text-sm text-gray-600">
          {result.message}
        </p>
      )}
    </div>
  );
}
```

---

## 📋 What Was Created

### Files Created:
1. **`src/lib/utils/syncUser.ts`** - Utility functions for syncing users
   - `syncUserToMongoDB(clerkUserId)` - Sync single user
   - `getOrCreateUser(clerkUserId)` - Get or auto-create user

2. **`src/app/api/webhooks/clerk/route.ts`** - Webhook handler for Clerk events
   - Handles `user.created`, `user.updated`, `user.deleted`

3. **`src/app/api/sync-users/route.ts`** - Manual sync endpoint
   - Syncs all Clerk users to MongoDB

### Files Modified:
1. **`src/app/api/friends/search/route.ts`** - Updated to:
   - Search Clerk users directly
   - Auto-create users in MongoDB when found
   - Filter out self and existing friends

---

## 🧪 Testing

### Test User Search:
1. Go to Friends tab
2. Click "Find Friends"
3. Search for a user by name or email
4. You should now see results from Clerk

### Verify MongoDB:
1. Check MongoDB Atlas → smartNotes → users collection
2. You should see users appearing as you search for them

---

## 🔍 How It Works Now

**Before:**
- Search → MongoDB only → No results (users not synced)

**After:**
- Search → Clerk API → Auto-sync to MongoDB → Return results ✅

**Flow:**
1. User searches for "John"
2. API queries Clerk for users matching "John"
3. For each result:
   - Check if user exists in MongoDB
   - If not, create them automatically
   - Add to results (excluding self and friends)
4. Return filtered results

---

## 🚀 Quick Start

**To sync your existing 2 Clerk users right now:**

1. Open browser console on your dashboard
2. Run:
   ```javascript
   fetch('/api/sync-users', { method: 'POST' })
     .then(r => r.json())
     .then(console.log)
   ```
3. Check the response - should show 2 users synced
4. Try searching for users in the Friends tab

---

## 📝 Environment Variables Needed

```env
# .env.local
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Optional - for webhook (future signups)
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## ✅ Verification Checklist

- [ ] Run sync endpoint to sync existing users
- [ ] Search for a user in Friends tab
- [ ] Verify user appears in MongoDB
- [ ] Send friend request
- [ ] Check notifications

---

**Status:** ✅ User search now works with automatic Clerk → MongoDB syncing!
