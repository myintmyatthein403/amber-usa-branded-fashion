import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = async () => {
  if (!stripePromise) {
    // 1. Try to get from environment variable
    let key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    // 2. Fallback to fetching from API if env var is missing
    if (!key) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/settings`);
        const settings = await response.json();
        key = settings.stripePublishableKey;
      } catch (error) {
        console.error('Failed to fetch Stripe publishable key from API:', error);
      }
    }

    if (key) {
      stripePromise = loadStripe(key);
    } else {
      console.error('Stripe publishable key is missing (env and API)');
      return null;
    }
  }
  return stripePromise;
};
