# Authentication & Subscription Setup Guide

## Overview

Literaq now includes:
- ✅ **Authentication** with Clerk
- ✅ **Subscription management** with Stripe  
- ✅ **Usage limits** (Free: 3 papers, Basic: 50 papers, Pro: Unlimited)
- ✅ **Payment processing** and webhooks

## 1. Install Dependencies

```bash
npm install
```

This will install:
- `@clerk/nextjs` - Authentication
- `stripe` - Payment processing

## 2. Set Up Clerk Authentication

### Create a Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Choose "Next.js" as your framework

### Get Your API Keys

In your Clerk dashboard:
1. Go to **API Keys**
2. Copy your keys

### Add to `.env`

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 3. Set Up Stripe Payments

### Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Get your API keys from **Developers → API keys**

### Create Products & Prices

In your Stripe dashboard:

1. Go to **Products** → **Add product**
2. Create two products:

**Basic Plan:**
- Name: Literaq Basic
- Price: $9.99/month
- Recurring: Monthly
- Copy the Price ID (starts with `price_...`)

**Pro Plan:**
- Name: Literaq Pro
- Price: $29.99/month  
- Recurring: Monthly
- Copy the Price ID (starts with `price_...`)

### Add to `.env`

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Set Up Webhooks (Local Development)

Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

Login to Stripe:
```bash
stripe login
```

Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret and add to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 4. Update Database Schema

The schema has been updated with User and subscription models. Push the changes:

```bash
npx prisma db push
```

## 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000`

## Features

### Free Plan (Default)
- Up to 3 papers
- Basic chat functionality
- PDF viewer

### Basic Plan ($9.99/month)
- Up to 50 papers
- Advanced chat with GPT-4
- PDF viewer
- Chat history
- Priority support

### Pro Plan ($29.99/month)
- Unlimited papers
- Advanced chat with GPT-4
- PDF viewer
- Chat history
- Priority support
- API access
- Bulk uploads

## Testing Payments

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future date for expiry
- Any 3 digits for CVC

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Add authentication and subscriptions"
git push
```

### 2. Deploy to Vercel

1. Import your GitHub repo
2. Vercel will auto-detect Next.js

### 3. Add Environment Variables

In Vercel project settings, add all environment variables from your `.env` file:

**Clerk:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/`

**Stripe:**
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_BASIC_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET` (get from production webhook)
- `NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app`

**OpenAI & Database:**
- (Already configured from previous setup)

### 4. Set Up Production Webhooks

1. In Stripe dashboard, go to **Developers → Webhooks**
2. Click **Add endpoint**
3. URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the signing secret and update `STRIPE_WEBHOOK_SECRET` in Vercel

## Security Notes

- Never commit `.env` file to git
- Rotate your OpenAI API key (it was exposed earlier)
- Use Stripe test mode for development
- Switch to live mode only when ready for production

## Troubleshooting

### Clerk Issues
- Check that all `NEXT_PUBLIC_CLERK_*` variables are set
- Verify Sign In/Sign Up URLs match your routes

### Stripe Issues  
- Make sure webhook secret is correct
- Check Stripe CLI is running for local testing
- Verify price IDs match your Stripe products

### Database Issues
- Run `npx prisma db push` after schema changes
- Check that User model was created successfully

## API Routes

- `POST /api/papers/upload` - Upload paper (requires auth)
- `POST /api/papers/[paperId]/chat` - Chat with paper (requires auth)
- `POST /api/stripe/create-checkout` - Create checkout session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks
- `GET /pricing` - View pricing plans
- `GET /sign-in` - Sign in page
- `GET /sign-up` - Sign up page

## Support

For issues, check:
1. Console logs in browser (F12)
2. Terminal output from `npm run dev`
3. Stripe dashboard → Developers → Logs
4. Clerk dashboard → Logs
