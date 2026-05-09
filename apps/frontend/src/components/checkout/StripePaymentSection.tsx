"use client";

import StripeWrapper from "@/components/stripe/StripeWrapper";
import StripePaymentForm from "@/components/stripe/StripePaymentForm";

interface StripePaymentSectionProps {
  clientSecret: string | null;
  isCreating: boolean;
  error: string | null;
  orderId?: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function StripePaymentSection({
  clientSecret,
  isCreating,
  error,
  orderId,
  onSuccess,
  onError,
}: StripePaymentSectionProps) {
  return (
    <div className="space-y-6">
      {isCreating ? (
        <div className="p-12 text-center animate-pulse uppercase tracking-widest text-[10px] font-bold">
          Initializing Secure Payment...
        </div>
      ) : clientSecret ? (
        <StripeWrapper clientSecret={clientSecret}>
          <StripePaymentForm
            orderId={orderId}
            onSuccess={onSuccess}
            onError={onError}
          />
        </StripeWrapper>
      ) : (
        <div className="text-red-500 text-[10px] uppercase font-bold tracking-widest text-center">
          {error || "Failed to load payment form."}
        </div>
      )}
      {error && (
        <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest text-center">
          {error}
        </p>
      )}
    </div>
  );
}