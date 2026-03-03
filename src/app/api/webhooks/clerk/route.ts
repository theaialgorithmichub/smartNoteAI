import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Verification failed', { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;

    try {
      await connectDB();

      const email = email_addresses[0]?.email_address || '';
      const name = `${first_name || ''} ${last_name || ''}`.trim() || username || 'User';
      const avatar = image_url || undefined;

      // Upsert user in MongoDB
      await User.findOneAndUpdate(
        { clerkId: id },
        {
          clerkId: id,
          email,
          name,
          avatar,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log(`[WEBHOOK] User ${eventType}:`, id, name);
    } catch (error) {
      console.error('[WEBHOOK] Error syncing user:', error);
      return new Response('Error: Database sync failed', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      await connectDB();
      await User.findOneAndDelete({ clerkId: id });
      console.log(`[WEBHOOK] User deleted:`, id);
    } catch (error) {
      console.error('[WEBHOOK] Error deleting user:', error);
      return new Response('Error: Database deletion failed', { status: 500 });
    }
  }

  return new Response('Webhook processed', { status: 200 });
}
