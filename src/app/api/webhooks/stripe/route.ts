import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('Stripe-Signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (!userId || !plan) {
          console.error('Missing metadata in checkout session');
          break;
        }

        // Update user subscription
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: session.customer as string,
            subscriptionStatus: 'active',
            subscriptionPlan: plan,
            subscriptionEndDate: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ), // 30 days from now
          },
        });

        console.log(`✅ Subscription activated for user ${userId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error('User not found for customer:', customerId);
          break;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: subscription.status,
            subscriptionEndDate: new Date(
              subscription.current_period_end * 1000
            ),
          },
        });

        console.log(`✅ Subscription updated for user ${user.id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error('User not found for customer:', customerId);
          break;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'cancelled',
            subscriptionPlan: null,
            subscriptionEndDate: new Date(
              subscription.current_period_end * 1000
            ),
          },
        });

        console.log(`✅ Subscription cancelled for user ${user.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
