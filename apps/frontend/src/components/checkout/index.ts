export { default as ShippingForm } from "./ShippingForm";
export { default as DeliveryMethodSelector } from "./DeliveryMethodSelector";
export { default as PaymentMethodSelector } from "./PaymentMethodSelector";
export { default as ManualPaymentSection } from "./ManualPaymentSection";
export { default as OrderSummary } from "./OrderSummary";
export { default as StripePaymentSection } from "./StripePaymentSection";
export { default as ReviewStep } from "./ReviewStep";

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  phone: string;
  shippingMethod: string;
  paymentMethod: string;
}

export interface DeliveryMethod {
  id: string;
  name: string;
  description?: string;
  price: string;
  isUsdPrice: boolean;
  isDigital: boolean;
  estimatedDays?: string;
  freeOverAmount?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: "MANUAL" | "STRIPE";
  accountName?: string;
  accountNumber?: string;
  qrCode?: string;
  instructions?: string;
}

export interface StockValidationResult {
  productId: string;
  variantId?: string;
  inStock: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  isUsdPrice?: boolean;
  size?: string;
}