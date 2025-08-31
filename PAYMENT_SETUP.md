# Payment Setup Instructions

## Environment Variables Required

To fix the 500 error during payment initiation, you need to set up the following environment variables:

### 1. Create `.env.local` file

Create a `.env.local` file in the root of your project with the following variables:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Supabase Configuration (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Sign in or create an account
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)
5. Replace the placeholder values in your `.env.local` file

### 3. What Was Fixed

The 500 error was caused by:

1. **Missing environment variables** - Stripe keys were not configured
2. **Invalid Stripe API version** - Used `"2025-07-30.basil"` which doesn't exist
3. **Poor error handling** - No validation of required environment variables
4. **Missing response validation** - No checking of API responses

### 4. Key Changes Made

1. **Updated API route** (`src/app/api/payment-intent/route.ts`):
   - Added environment variable validation
   - Fixed Stripe API version to `"2024-11-20.acacia"`
   - Improved error handling for Stripe errors
   - Added input validation for amount

2. **Updated payment page** (`src/app/booking/payment/page.tsx`):
   - Added validation for Stripe publishable key
   - Improved error handling in payment intent creation
   - Better error messages for users

### 5. Testing

After setting up the environment variables:

1. Restart your development server: `npm run dev`
2. Navigate to the payment page
3. The 500 error should be resolved

### 6. Production Deployment

Remember to set these environment variables in your production environment as well (Vercel, Netlify, etc.).

## Important Security Notes

- Never commit your actual API keys to version control
- Use test keys for development and live keys only for production
- The `.env.local` file is already in `.gitignore` to prevent accidental commits
