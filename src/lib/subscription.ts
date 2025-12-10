import { prisma } from './db';

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    paperLimit: 3,
    features: [
      'Up to 3 papers',
      'Basic chat functionality',
      'PDF viewer',
    ],
  },
  BASIC: {
    name: 'Basic',
    price: 9.99,
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    paperLimit: 50,
    features: [
      'Up to 50 papers',
      'Advanced chat with GPT-4',
      'PDF viewer',
      'Chat history',
      'Priority support',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 29.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    paperLimit: -1, // unlimited
    features: [
      'Unlimited papers',
      'Advanced chat with GPT-4',
      'PDF viewer',
      'Chat history',
      'Priority support',
      'API access',
      'Bulk uploads',
    ],
  },
};

export async function checkSubscription(userId: string): Promise<{
  isSubscribed: boolean;
  plan: string;
  paperLimit: number;
  currentPaperCount: number;
  canUpload: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionPlan: true,
      subscriptionEndDate: true,
      paperCount: true,
    },
  });

  if (!user) {
    return {
      isSubscribed: false,
      plan: 'free',
      paperLimit: PLANS.FREE.paperLimit,
      currentPaperCount: 0,
      canUpload: true,
    };
  }

  const isActive =
    user.subscriptionStatus === 'active' &&
    (!user.subscriptionEndDate || user.subscriptionEndDate > new Date());

  if (!isActive) {
    return {
      isSubscribed: false,
      plan: 'free',
      paperLimit: PLANS.FREE.paperLimit,
      currentPaperCount: user.paperCount,
      canUpload: user.paperCount < PLANS.FREE.paperLimit,
    };
  }

  const plan = user.subscriptionPlan?.toUpperCase() as keyof typeof PLANS;
  const planDetails = PLANS[plan] || PLANS.FREE;

  return {
    isSubscribed: true,
    plan: user.subscriptionPlan || 'free',
    paperLimit: planDetails.paperLimit,
    currentPaperCount: user.paperCount,
    canUpload:
      planDetails.paperLimit === -1 ||
      user.paperCount < planDetails.paperLimit,
  };
}

export async function incrementPaperCount(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      paperCount: {
        increment: 1,
      },
    },
  });
}
