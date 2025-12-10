import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { prisma } from '@/lib/db';
import { createCheckoutSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, plan } = await request.json();

    if (!priceId || !plan) {
      return NextResponse.json(
        { error: 'Missing priceId or plan' },
        { status: 400 }
      );
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: user.fullName,
        },
      });
    }

    // Map plan to actual Stripe price ID
    const stripePriceId =
      plan === 'basic'
        ? process.env.STRIPE_BASIC_PRICE_ID
        : process.env.STRIPE_PRO_PRICE_ID;

    if (!stripePriceId) {
      return NextResponse.json(
        { error: 'Price ID not configured' },
        { status: 500 }
      );
    }

    const session = await createCheckoutSession(
      dbUser.id,
      user.emailAddresses[0]?.emailAddress || '',
      stripePriceId,
      plan
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
