"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Price from "@/components/Price";
import { useStore } from "@/store/useStore";
import {
  ShippingForm,
  DeliveryMethodSelector,
  PaymentMethodSelector,
  ManualPaymentSection,
  OrderSummary,
  StripePaymentSection,
  type CheckoutFormData,
  type DeliveryMethod,
  type PaymentMethod,
  type StockValidationResult,
} from "@/components/checkout";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [isValidatingStock, setIsValidatingStock] = useState(false);

  const cartItems = useStore((state) => state.cartItems);
  const subtotal = useStore((state) => state.getSubtotal());
  const clearCart = useStore((state) => state.clearCart);
  const formatPrice = useStore((state) => state.formatPrice);
  const currency = useStore((state) => state.currency);
  const exchangeRate = useStore((state) => state.exchangeRate);

  const { user: authUser, token: authToken, isAuthenticated } = useAuthStore();

  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const [formData, setBaseFormData] = useState<CheckoutFormData>({
    email: authUser?.email || "",
    firstName: authUser?.name?.split(" ")[0] || "",
    lastName: authUser?.name?.split(" ").slice(1).join(" ") || "",
    address: authUser?.address || "",
    city: "Yangon",
    phone: authUser?.phone || "",
    shippingMethod: "",
    paymentMethod: "",
  });

  useEffect(() => {
    setMounted(true);

    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (authUser) {
      setBaseFormData((prev) => ({
        ...prev,
        email: authUser.email || prev.email,
        firstName: authUser.name?.split(" ")[0] || prev.firstName,
        lastName: authUser.name?.split(" ").slice(1).join(" ") || prev.lastName,
        address: authUser.address || prev.address,
        phone: authUser.phone || prev.phone,
      }));
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery-methods/active`)
      .then((res) => res.json())
      .then((result) => {
        const data = result?.data || result || [];
        setDeliveryMethods(data);
        if (data.length > 0) {
          setBaseFormData((prev) => ({ ...prev, shippingMethod: data[0].id }));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingMethods(false));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment-methods/active`)
      .then((res) => res.json())
      .then((result) => {
        const data = result?.data || result || [];
        setPaymentMethods(data);
        if (data.length > 0) {
          setBaseFormData((prev) => ({ ...prev, paymentMethod: data[0].name }));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingPayments(false));
  }, [authUser, isAuthenticated, router]);

  const selectedMethod = deliveryMethods.find((m) => m.id === formData.shippingMethod);
  const selectedPayment = paymentMethods.find((p) => p.name === formData.paymentMethod);

  const getShippingCostValue = () => {
    if (!selectedMethod) return 0;

    const hasPhysicalItems = cartItems.some(
      (item) => item.category !== "Gift Card" && item.size !== "Digital"
    );

    if (!hasPhysicalItems || cartItems.length === 0) {
      return 0;
    }

    if (selectedMethod.isDigital) {
      return 0;
    }

    if (
      selectedMethod.freeOverAmount &&
      subtotal >= parseFloat(selectedMethod.freeOverAmount)
    ) {
      return 0;
    }
    return parseFloat(selectedMethod.price);
  };

  const shippingCost = getShippingCostValue();
  const isShippingUsd = selectedMethod?.isUsdPrice ?? false;
  const getShippingDisplay = (cost: number) => formatPrice(cost, isShippingUsd);

  const calculateTotal = () => {
    let finalShippingInCurrentCurrency = shippingCost;
    if (isShippingUsd && currency === "MMK") {
      finalShippingInCurrentCurrency = shippingCost * exchangeRate;
    } else if (!isShippingUsd && currency === "USD") {
      finalShippingInCurrentCurrency = shippingCost / exchangeRate;
    }
    return subtotal + finalShippingInCurrentCurrency;
  };

  const handleCreatePaymentIntent = async () => {
    setIsCreatingIntent(true);
    setPaymentError(null);
    try {
      const total = calculateTotal();

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...formData,
          totalAmount: total,
          currency: currency,
          items: cartItems.map((item) => ({
            productId: item.id,
            variantId: item.variantId,
            name: item.name,
            price: item.price,
            isUsd: item.isUsdPrice !== false,
            quantity: item.quantity,
            image: item.image,
            size: item.size,
          })),
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderResult = await orderResponse.json();
      const order = orderResult?.data || orderResult;
      setCurrentOrderId(order.id);

      const stripeAmount = currency === "USD" ? total : total / exchangeRate;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stripe/create-payment-intent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: stripeAmount,
            currency: "USD",
            orderId: order.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      setPaymentError("Failed to initialize payment. Please try again.");
    } finally {
      setIsCreatingIntent(false);
    }
  };

  useEffect(() => {
    if (
      step === 3 &&
      selectedPayment?.type === "STRIPE" &&
      !clientSecret &&
      mounted
    ) {
      handleCreatePaymentIntent();
    }
  }, [step, formData.paymentMethod, clientSecret, mounted, selectedPayment]);

  const checkStock = async () => {
    setIsValidatingStock(true);
    setStockError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/validate-stock`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            cartItems.map((item) => ({
              productId: item.id,
              variantId: item.variantId,
              quantity: item.quantity,
            }))
          ),
        }
      );

      if (!response.ok) throw new Error("Failed to validate stock");

      const results = await response.json();
      const outOfStockItems = results.filter((r: StockValidationResult) => !r.inStock);

      if (outOfStockItems.length > 0) {
        const itemNames = outOfStockItems
          .map((r: StockValidationResult) => {
            const item = cartItems.find(
              (i) => i.id === r.productId || i.variantId === r.variantId
            );
            return item ? item.name : "Unknown item";
          })
          .join(", ");
        setStockError(
          `Some items are out of stock: ${itemNames}. Please update your bag.`
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Stock validation error:", error);
      setStockError("Failed to validate stock. Please try again.");
      return false;
    } finally {
      setIsValidatingStock(false);
    }
  };

  const handleNext = async () => {
    if (step === 1 || step === 2) {
      const isStockOk = await checkStock();
      if (!isStockOk) return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStockError(null);
    setStep(step - 1);
  };
  const handleComplete = async () => {
    if (selectedPayment?.type !== "STRIPE") {
      try {
        const total = calculateTotal();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }

        const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            ...formData,
            totalAmount: total,
            currency: currency,
            items: cartItems.map((item) => ({
              productId: item.id,
              variantId: item.variantId,
              name: item.name,
              price: item.price,
              isUsd: item.isUsdPrice !== false,
              quantity: item.quantity,
              image: item.image,
              size: item.size,
            })),
          }),
        });

        if (orderResponse.ok) {
          const orderResult = await orderResponse.json();
          const order = orderResult?.data || orderResult;
          setCurrentOrderId(order.id);
        }
      } catch (error) {
        console.error("Failed to create order:", error);
      }
    }

    setIsCompleted(true);
    clearCart();
  };

  const updateFormData = (updates: Partial<CheckoutFormData>) => {
    setBaseFormData((prev) => ({ ...prev, ...updates }));
  };

  if (!mounted) return null;

  if (isCompleted) {
    return (
      <main className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8 p-12 bg-white shadow-2xl border border-[#D4AF37]/10"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-[#F5F0E1] rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#D4AF37]" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-serif text-[#1A1A1A]">Order Confirmed</h1>
            <p className="text-[#1A1A1A]/60 text-sm leading-relaxed">
              Thank you for shopping with Amber. Your order has been received and is
              being processed. A confirmation email has been sent to{" "}
              {formData.email}.
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <Link
              href="/profile"
              className="block w-full bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all"
            >
              View Order History
            </Link>
            <Link
              href="/shop"
              className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  if (cartItems.length === 0 && !isCompleted) {
    return (
      <main className="min-h-screen bg-[#FDFDFD] flex items-center justify-center flex-col space-y-8">
        <h2 className="text-3xl font-serif">Your bag is empty</h2>
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-widest border-b-2 border-[#D4AF37] pb-1 hover:text-[#D4AF37]"
          >
            Back to Shop
          </Link>
          {!isAuthenticated && (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Please{" "}
              <Link
                href="/login?redirect=/checkout"
                className="text-[#D4AF37] underline"
              >
                sign in
              </Link>{" "}
              to proceed with checkout
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">
        <div className="p-8 md:p-16 lg:p-24 space-y-12 bg-white">
          <Link href="/" className="flex flex-col items-start group">
            <h1 className="text-3xl font-serif tracking-tighter uppercase text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">
              Amber
            </h1>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] -mt-1 font-semibold">
              Premium USA Brands
            </span>
          </Link>

          <div className="flex items-center space-x-4 text-[10px] uppercase tracking-widest font-bold">
            <span className={cn(step >= 1 ? "text-[#1A1A1A]" : "text-[#1A1A1A]/20")}>
              Information
            </span>
            <ChevronRight className="w-3 h-3 text-[#1A1A1A]/20" />
            <span className={cn(step >= 2 ? "text-[#1A1A1A]" : "text-[#1A1A1A]/20")}>
              Shipping
            </span>
            <ChevronRight className="w-3 h-3 text-[#1A1A1A]/20" />
            <span className={cn(step >= 3 ? "text-[#1A1A1A]" : "text-[#1A1A1A]/20")}>
              Payment
            </span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <ShippingForm
                  formData={formData}
                  onUpdate={updateFormData}
                  onContinue={handleNext}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <DeliveryMethodSelector
                  methods={deliveryMethods}
                  loading={loadingMethods}
                  selectedId={formData.shippingMethod}
                  onSelect={(id) => updateFormData({ shippingMethod: id })}
                  subtotal={subtotal}
                  formatPrice={formatPrice}
                  onBack={handleBack}
                  onContinue={handleNext}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <PaymentMethodSelector
                  methods={paymentMethods}
                  loading={loadingPayments}
                  selectedName={formData.paymentMethod}
                  onSelect={(name, type) => {
                    updateFormData({ paymentMethod: name });
                    if (type !== "STRIPE") setClientSecret(null);
                  }}
                />

                {selectedPayment?.type === "STRIPE" ? (
                  <StripePaymentSection
                    clientSecret={clientSecret}
                    isCreating={isCreatingIntent}
                    error={paymentError}
                    orderId={currentOrderId || undefined}
                    onSuccess={handleComplete}
                    onError={(msg) => setPaymentError(msg)}
                  />
                ) : selectedPayment ? (
                  <ManualPaymentSection
                    payment={selectedPayment}
                    onBack={handleBack}
                    onComplete={handleComplete}
                  />
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-[#F5F0E1]/30 p-8 md:p-16 lg:p-24 border-l border-[#1A1A1A]/5">
          <OrderSummary
            cartItems={cartItems}
            subtotal={subtotal}
            shippingCost={shippingCost}
            getShippingDisplay={getShippingDisplay}
            currency={currency}
          />
        </div>
      </div>
    </main>
  );
}