import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not configured in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency } = await request.json();
    
    // Validate input
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    // Create payment intent with Stripe
    // Stripe expects amounts in the smallest currency unit (cents for USD)
    // Convert dollars to cents by multiplying by 100
    const amountInCents = Math.round(amount * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, // Amount in cents
      currency: typeof currency === 'string' ? currency : 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        created_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    console.error("Stripe payment intent creation error:", error);
    
    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ 
        error: "Payment service error: " + error.message 
      }, { status: 400 });
    }

    // Handle other errors
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}