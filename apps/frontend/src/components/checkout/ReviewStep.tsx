"use client";

import { CheckoutFormData, DeliveryMethod, PaymentMethod, CartItem } from "./index";
import Price from "@/components/Price";
import StripePaymentSection from "./StripePaymentSection";
import ManualPaymentSection from "./ManualPaymentSection";

interface ReviewStepProps {
  formData: CheckoutFormData;
  deliveryMethods: DeliveryMethod[];
  paymentMethods: PaymentMethod[];
  cartItems: CartItem[];
  subtotal: number;
  formatPrice: (amount: number, isUsd?: boolean) => string;
  onBack: () => void;
  onConfirm: () => void;
  onUpdateForm: (updates: Partial<CheckoutFormData>) => void;
  selectedPayment?: PaymentMethod;
  selectedMethod?: DeliveryMethod;
  isStripe?: boolean;
  stripeClientSecret?: string | null;
  isCreatingStripeIntent?: boolean;
  stripeError?: string | null;
  orderId?: string;
  isSubmittingManual?: boolean;
  orderError?: string | null;
}

export default function ReviewStep({
  formData,
  deliveryMethods,
  paymentMethods,
  cartItems,
  subtotal,
  formatPrice,
  onBack,
  onConfirm,
  onUpdateForm,
  selectedPayment,
  selectedMethod,
  isStripe,
  stripeClientSecret,
  isCreatingStripeIntent,
  stripeError,
  orderId,
  isSubmittingManual,
  orderError,
}: ReviewStepProps) {
  // Calculate delivery fee
  const deliveryFee = selectedMethod?.price 
    ? parseFloat(selectedMethod.price)
    : 0;

  // Calculate total
  const total = subtotal + deliveryFee;

  // Get estimated delivery date
  const getEstimatedDelivery = () => {
    if (selectedMethod?.estimatedDays) {
      const days = parseInt(selectedMethod.estimatedDays);
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return '3-5 business days';
  };

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-serif">Final Review & Payment</h3>
      
      <div className="space-y-6">
        {/* Shipping Information */}
        <div className="border-b border-[#1A1A1A]/5 pb-6">
          <h4 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/40 mb-4">
            Shipping Information
          </h4>
          <div className="space-y-2 text-sm">
            <p><span className="text-[#1A1A1A]/40">Name:</span> {formData.firstName} {formData.lastName}</p>
            <p><span className="text-[#1A1A1A]/40">Email:</span> {formData.email}</p>
            <p><span className="text-[#1A1A1A]/40">Phone:</span> {formData.phone}</p>
            <p className="text-[#1A1A1A]/40">
              {formData.address}, {formData.city}
            </p>
          </div>
        </div>

        {/* Delivery Method */}
        <div className="border-b border-[#1A1A1A]/5 pb-6">
          <h4 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/40 mb-4">
            Delivery Method
          </h4>
          <div className="space-y-2 text-sm">
            <p><span className="text-[#1A1A1A]/40">Method:</span> {selectedMethod?.name || 'Not selected'}</p>
            <p><span className="text-[#1A1A1A]/40">Estimated Delivery:</span> {getEstimatedDelivery()}</p>
            <p><span className="text-[#1A1A1A]/40">Fee:</span> <Price amount={deliveryFee} /></p>
          </div>
        </div>

        {/* Payment Selection & Action */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/40 mb-4">
            Payment: {selectedPayment?.name}
          </h4>
          
          {isStripe ? (
            <div className="mt-4">
              <StripePaymentSection
                clientSecret={stripeClientSecret || null}
                isCreating={!!isCreatingStripeIntent}
                error={stripeError || null}
                orderId={orderId}
                onSuccess={onConfirm}
                onError={() => {}} // Error is handled in the component
              />
              <button
                onClick={onBack}
                className="mt-4 w-full border border-[#1A1A1A]/10 py-4 uppercase tracking-[0.3em] text-[10px] font-bold"
              >
                Back to Payment Method
              </button>
            </div>
          ) : selectedPayment ? (
            <>
              {orderError && (
                <p className="mb-4 text-sm text-red-600 border border-red-200 bg-red-50 p-3">
                  {orderError}
                </p>
              )}
              <ManualPaymentSection
                payment={selectedPayment}
                formData={formData}
                onUpdate={onUpdateForm}
                onBack={onBack}
                onComplete={onConfirm}
                submitting={isSubmittingManual}
              />
            </>
          ) : (
             <p className="text-sm text-red-500">Please go back and select a payment method.</p>
          )}
        </div>
      </div>
    </div>
  );
}