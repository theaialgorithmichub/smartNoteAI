# Stripe Subscription System Setup Guide

This guide will walk you through setting up Stripe for the SmartNote AI subscription system.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Node.js and npm installed
- SmartNote AI project set up

## Step 1: Install Stripe Package

```bash
npm install stripe @stripe/stripe-js
```

## Step 2: Get Your Stripe API Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Click on "Developers" in the left sidebar
3. Click on "API keys"
4. Copy your **Publishable key** and **Secret key**
5. For testing, use the test mode keys (they start with `pk_test_` and `sk_test_`)

## Step 3: Create Products and Prices in Stripe

### Create Products

1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. Create the following products:

#### Pro Plan Product
- **Name**: SmartNote AI Pro
- **Description**: Professional plan with 10 notebooks and 10 templates
- **Pricing**:
  - Monthly: $9.99/month (recurring)
  - Yearly: $99.99/year (recurring)

#### Ultra Plan Product
- **Name**: SmartNote AI Ultra
- **Description**: Ultimate plan with unlimited notebooks and all templates
- **Pricing**:
  - Monthly: $19.99/month (recurring)
  - Yearly: $199.99/year (recurring)

#### Credit Packages
Create one-time payment products for each credit package:
- **10 Credits**: $4.99 (one-time)
- **25 Credits**: $9.99 (one-time)
- **50 Credits**: $17.99 (one-time)
- **100 Credits**: $29.99 (one-time)
- **250 Credits**: $64.99 (one-time)

### Get Price IDs

After creating each price, copy the Price ID (starts with `price_`). You'll need these for your environment variables.

## Step 4: Set Up Environment Variables

Add the following to your `.env` file:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Stripe Webhook Secret (we'll get this in Step 5)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs
STRIPE_PRO_MONTHLY_PRICE_ID=price_pro_monthly_id_here
STRIPE_PRO_YEARLY_PRICE_ID=price_pro_yearly_id_here
STRIPE_ULTRA_MONTHLY_PRICE_ID=price_ultra_monthly_id_here
STRIPE_ULTRA_YEARLY_PRICE_ID=price_ultra_yearly_id_here
STRIPE_CREDITS_10_PRICE_ID=price_credits_10_id_here
STRIPE_CREDITS_25_PRICE_ID=price_credits_25_id_here
STRIPE_CREDITS_50_PRICE_ID=price_credits_50_id_here
STRIPE_CREDITS_100_PRICE_ID=price_credits_100_id_here
STRIPE_CREDITS_250_PRICE_ID=price_credits_250_id_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Set Up Webhooks

Webhooks allow Stripe to notify your application about events (payments, subscription changes, etc.).

### For Local Development (Using Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_`) and add it to your `.env` file

### For Production

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select the following events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" and add it to your production environment variables

## Step 6: Configure Stripe Customer Portal

The Customer Portal allows users to manage their subscriptions, update payment methods, and view invoices.

1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Click "Activate test link" (for test mode)
3. Configure the following settings:

### Features
- ✅ Update payment method
- ✅ View invoices
- ✅ Cancel subscription

### Business Information
- Add your business name
- Add support email
- Add privacy policy URL
- Add terms of service URL

### Branding
- Upload your logo
- Choose brand colors

## Step 7: Test the Integration

### Test Cards

Use these test card numbers in test mode:

- **Successful payment**: `4242 4242 4242 4242`
- **Payment requires authentication**: `4000 0025 0000 3155`
- **Payment is declined**: `4000 0000 0000 9995`

Use any future expiry date, any 3-digit CVC, and any postal code.

### Testing Workflow

1. **Test Free Plan**:
   - Sign up for a new account
   - Verify you're on the free plan
   - Try creating a notebook (should work for 1 notebook)

2. **Test Pro Subscription**:
   - Go to /pricing
   - Click "Upgrade to Pro"
   - Complete checkout with test card
   - Verify subscription is active in /account
   - Check that you can select 10 templates
   - Verify credits were added

3. **Test Credit Purchase**:
   - Go to /pricing
   - Purchase a credit package
   - Verify credits were added to your account

4. **Test Subscription Management**:
   - Go to /account
   - Click "Manage Billing" to access Customer Portal
   - Try updating payment method
   - Try canceling subscription
   - Verify cancellation is reflected in your account

5. **Test Webhooks**:
   - Monitor webhook events in Stripe Dashboard
   - Verify all events are being received
   - Check your database to ensure data is being updated

## Step 8: MongoDB Setup

Ensure MongoDB is configured and the subscription models are created:

```bash
# Make sure MongoDB connection string is in .env
MONGODB_URI=your_mongodb_connection_string
```

The subscription system will automatically create the necessary collections on first use.

## Step 9: Go Live

When ready to go live:

1. Switch from test mode to live mode in Stripe Dashboard
2. Create live products and prices (same as test mode)
3. Update environment variables with live API keys and price IDs
4. Set up production webhook endpoint
5. Update `NEXT_PUBLIC_APP_URL` to your production domain
6. Test thoroughly in production environment

## Troubleshooting

### Webhook Not Receiving Events

- Verify webhook URL is correct
- Check that webhook secret is properly set in environment variables
- Ensure your server is accessible (use ngrok for local testing)
- Check Stripe Dashboard > Webhooks for failed attempts

### Payment Not Processing

- Verify Price IDs are correct in environment variables
- Check Stripe Dashboard > Logs for errors
- Ensure test mode/live mode matches your API keys

### Subscription Not Updating

- Check webhook events are being received
- Verify MongoDB connection is working
- Check server logs for errors
- Ensure user ID mapping is correct

## Security Best Practices

1. **Never expose secret keys**: Keep `STRIPE_SECRET_KEY` server-side only
2. **Verify webhook signatures**: Always verify webhook signatures to prevent fraud
3. **Use HTTPS in production**: Stripe requires HTTPS for webhooks in production
4. **Implement idempotency**: Handle duplicate webhook events gracefully
5. **Log everything**: Keep detailed logs of all transactions for debugging

## Useful Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)

## Support

For Stripe-related issues:
- Stripe Support: https://support.stripe.com
- Stripe Community: https://stripe.com/community

For SmartNote AI issues:
- Check application logs
- Review webhook events in Stripe Dashboard
- Contact your development team
