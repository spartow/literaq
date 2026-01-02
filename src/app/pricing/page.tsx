'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Check, FileText, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    paperLimit: 3,
    features: [
      'Up to 3 papers',
      'Basic chat functionality',
      'PDF viewer',
    ],
    cta: 'Current Plan',
    priceId: null,
  },
  {
    name: 'Basic',
    price: 9.99,
    paperLimit: 50,
    features: [
      'Up to 50 papers',
      'Advanced chat with GPT-4',
      'PDF viewer',
      'Chat history',
      'Priority support',
    ],
    cta: 'Upgrade to Basic',
    priceId: 'basic',
    popular: true,
  },
  {
    name: 'Pro',
    price: 29.99,
    paperLimit: 'Unlimited',
    features: [
      'Unlimited papers',
      'Advanced chat with GPT-4',
      'PDF viewer',
      'Chat history',
      'Priority support',
      'API access',
      'Bulk uploads',
    ],
    cta: 'Upgrade to Pro',
    priceId: 'pro',
  },
];

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, plan: string) => {
    if (!isSignedIn) {
      window.location.href = '/sign-up';
      return;
    }

    setLoading(priceId);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, plan }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Literaq</h1>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start for free, upgrade as you grow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-lg shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-indigo-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600">/month</span>
                  )}
                </div>
                <p className="text-gray-600 mt-2">
                  {typeof plan.paperLimit === 'number'
                    ? `${plan.paperLimit} papers`
                    : plan.paperLimit}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() =>
                  plan.priceId && handleSubscribe(plan.priceId, plan.name.toLowerCase())
                }
                disabled={!plan.priceId || loading === plan.priceId}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } ${
                  !plan.priceId || loading === plan.priceId
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {loading === plan.priceId ? 'Loading...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            All plans include a 7-day money-back guarantee. Cancel anytime.
          </p>
          {isSignedIn && user && (
            <p className="mt-4 text-sm text-gray-500">
              Logged in as {user.emailAddresses[0]?.emailAddress}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
