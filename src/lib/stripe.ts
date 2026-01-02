import Stripe from 'stripe';

function getStripeInstance() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
  });
}

export const stripe = process.env.STRIPE_SECRET_KEY ? getStripeInstance() : null;

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string,
  plan: string
) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }
  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    metadata: {
      userId,
      plan,
    },
  });

  return session;
}

export async function createBillingPortalSession(customerId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
  });

  return session;
}
