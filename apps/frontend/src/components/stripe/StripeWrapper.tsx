"use client";

import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { Stripe, StripeElementsOptions } from '@stripe/stripe-js';

interface StripeWrapperProps {
  children: React.ReactNode;
  clientSecret: string;
}

export default function StripeWrapper({ children, clientSecret }: StripeWrapperProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    getStripe().then(setStripe);
  }, []);

  if (!stripe || !clientSecret) {
    return <div className="p-12 text-center animate-pulse uppercase tracking-widest text-[10px] font-bold">Initializing Secure Payment...</div>;
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#D4AF37',
        colorBackground: '#FDFDFD',
        colorText: '#1A1A1A',
        colorDanger: '#df1b41',
        fontFamily: 'serif',
        spacingUnit: '4px',
        borderRadius: '0px',
      },
      rules: {
        '.Input': {
          border: '1px solid rgba(26, 26, 26, 0.05)',
          backgroundColor: 'rgba(245, 240, 225, 0.3)',
          padding: '16px',
        },
        '.Input:focus': {
          border: '1px solid #D4AF37',
          boxShadow: 'none',
        },
      }
    },
  };

  return (
    <Elements stripe={stripe} options={options}>
      {children}
    </Elements>
  );
}
