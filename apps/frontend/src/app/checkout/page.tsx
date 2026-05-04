"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/useAuthStore";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, CreditCard, Truck, ArrowLeft, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Price from "@/components/Price";
import StripeWrapper from "@/components/stripe/StripeWrapper";
import StripePaymentForm from "@/components/stripe/StripePaymentForm";
import { useRouter } from "next/navigation";

interface DeliveryMethod {
  id: string;
  name: string;
  description?: string;
  price: string;
  isUsdPrice: boolean;
  isDigital: boolean;
  estimatedDays?: string;
  freeOverAmount?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'MANUAL' | 'STRIPE';
  accountName?: string;
  accountNumber?: string;
  qrCode?: string;
  instructions?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  // 1. All Hooks at the top
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

  const [formData, setBaseFormData] = useState({
    email: authUser?.email || "",
    firstName: authUser?.name?.split(" ")[0] || "",
    lastName: authUser?.name?.split(" ").slice(1).join(" ") || "",
    address: authUser?.address || "",
    city: "Yangon",
    phone: authUser?.phone || "",
    shippingMethod: "",
    paymentMethod: "" // Will be set after fetching
  });

  // 2. All Effects
  useEffect(() => {
    setMounted(true);
    
    // Guest protection
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    // Prefill from auth if logged in
    if (authUser) {
      setBaseFormData(prev => ({
        ...prev,
        email: authUser.email || prev.email,
        firstName: authUser.name?.split(" ")[0] || prev.firstName,
        lastName: authUser.name?.split(" ").slice(1).join(" ") || prev.lastName,
        address: authUser.address || prev.address,
        phone: authUser.phone || prev.phone,
      }));
    }

    // Fetch Delivery Methods
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery-methods/active`)
      .then(res => res.json())
      .then(result => {
        const data = result?.data || result || [];
        setDeliveryMethods(data);
        if (data.length > 0) {
          setBaseFormData(prev => ({ ...prev, shippingMethod: data[0].id }));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingMethods(false));

    // Fetch Payment Methods
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment-methods/active`)
      .then(res => res.json())
      .then(result => {
        const data = result?.data || result || [];
        setPaymentMethods(data);
        if (data.length > 0) {
          setBaseFormData(prev => ({ ...prev, paymentMethod: data[0].name }));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingPayments(false));
  }, [authUser, isAuthenticated, router]);

  const selectedMethod = deliveryMethods.find(m => m.id === formData.shippingMethod);
  const selectedPayment = paymentMethods.find(p => p.name === formData.paymentMethod);
  
  const getShippingCostValue = () => {
    if (!selectedMethod) return 0;
    
    // Check if cart only contains digital items/gift cards
    const hasPhysicalItems = cartItems.some(item => item.category !== 'Gift Card' && item.size !== 'Digital');
    
    // If it's a digital-only order, shipping is always free
    if (!hasPhysicalItems || cartItems.length === 0) {
      return 0;
    }

    // If the method itself is digital/email but there are physical items, this shouldn't happen 
    // but we respect the method's price if it's not marked digital
    if (selectedMethod.isDigital) {
      return 0;
    }

    if (selectedMethod.freeOverAmount && subtotal >= parseFloat(selectedMethod.freeOverAmount)) {
      return 0;
    }
    return parseFloat(selectedMethod.price);
  };

  const shippingCost = getShippingCostValue();
  const isShippingUsd = selectedMethod?.isUsdPrice ?? false;
  const getShippingDisplay = (cost: number) => formatPrice(cost, isShippingUsd);

  const calculateTotal = () => {
    let finalShippingInCurrentCurrency = shippingCost;
    if (isShippingUsd && currency === 'MMK') {
      finalShippingInCurrentCurrency = shippingCost * exchangeRate;
    } else if (!isShippingUsd && currency === 'USD') {
      finalShippingInCurrentCurrency = shippingCost / exchangeRate;
    }
    return subtotal + finalShippingInCurrentCurrency;
  };

  const handleCreatePaymentIntent = async () => {
    setIsCreatingIntent(true);
    setPaymentError(null);
    try {
      const total = calculateTotal();
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // 1. Create the order first
      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...formData,
          totalAmount: total,
          currency: currency,
          items: cartItems.map(item => ({
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
        throw new Error('Failed to create order');
      }

      const orderResult = await orderResponse.json();
      const order = orderResult?.data || orderResult;
      setCurrentOrderId(order.id);

      // 2. Create payment intent with orderId
      const stripeAmount = currency === 'USD' ? total : total / exchangeRate;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: stripeAmount,
          currency: 'USD',
          orderId: order.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setPaymentError("Failed to initialize payment. Please try again.");
    } finally {
      setIsCreatingIntent(false);
    }
  };

  useEffect(() => {
    if (step === 3 && selectedPayment?.type === 'STRIPE' && !clientSecret && mounted) {
      handleCreatePaymentIntent();
    }
  }, [step, formData.paymentMethod, clientSecret, mounted, selectedPayment]);

  const checkStock = async () => {
    setIsValidatingStock(true);
    setStockError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/validate-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartItems.map(item => ({
          productId: item.id,
          variantId: item.variantId,
          quantity: item.quantity
        }))),
      });

      if (!response.ok) throw new Error('Failed to validate stock');
      
      const results = await response.json();
      const outOfStockItems = results.filter((r: any) => !r.inStock);
      
      if (outOfStockItems.length > 0) {
        const itemNames = outOfStockItems.map((r: any) => {
          const item = cartItems.find(i => i.id === r.productId || i.variantId === r.variantId);
          return item ? item.name : 'Unknown item';
        }).join(', ');
        setStockError(`Some items are out of stock: ${itemNames}. Please update your bag.`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Stock validation error:', error);
      setStockError('Failed to validate stock. Please try again.');
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
    if (selectedPayment?.type !== 'STRIPE') {
      try {
        const total = calculateTotal();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...formData,
            totalAmount: total,
            currency: currency,
            items: cartItems.map(item => ({
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
        console.error('Failed to create order:', error);
      }
    }
    
    setIsCompleted(true);
    clearCart();
  };

  // 3. Conditional Returns AFTER all hooks
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
              Thank you for shopping with Amber. Your order has been received and is being processed. 
              A confirmation email has been sent to {formData.email}.
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
          <Link href="/shop" className="text-xs font-bold uppercase tracking-widest border-b-2 border-[#D4AF37] pb-1 hover:text-[#D4AF37]">
            Back to Shop
          </Link>
          {!isAuthenticated && (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Please <Link href="/login?redirect=/checkout" className="text-[#D4AF37] underline">sign in</Link> to proceed with checkout
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">
        
        {/* Left Side: Checkout Form */}
        <div className="p-8 md:p-16 lg:p-24 space-y-12 bg-white">
          <Link href="/" className="flex flex-col items-start group">
            <h1 className="text-3xl font-serif tracking-tighter uppercase text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">Amber</h1>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] -mt-1 font-semibold">Premium USA Brands</span>
          </Link>

          {/* Stepper */}
          <div className="flex items-center space-x-4 text-[10px] uppercase tracking-widest font-bold">
            <span className={cn(step >= 1 ? "text-[#1A1A1A]" : "text-[#1A1A1A]/20")}>Information</span>
            <ChevronRight className="w-3 h-3 text-[#1A1A1A]/20" />
            <span className={cn(step >= 2 ? "text-[#1A1A1A]" : "text-[#1A1A1A]/20")}>Shipping</span>
            <ChevronRight className="w-3 h-3 text-[#1A1A1A]/20" />
            <span className={cn(step >= 3 ? "text-[#1A1A1A]" : "text-[#1A1A1A]/20")}>Payment</span>
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
                <div className="space-y-6">
                  <h3 className="text-xl font-serif">Contact Information</h3>
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 focus:border-[#D4AF37] outline-none transition-colors text-sm"
                    value={formData.email}
                    onChange={(e) => setBaseFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-serif">Shipping Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      placeholder="First Name" 
                      className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 focus:border-[#D4AF37] outline-none text-sm"
                      value={formData.firstName}
                      onChange={(e) => setBaseFormData({...formData, firstName: e.target.value})}
                    />
                    <input 
                      placeholder="Last Name" 
                      className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 focus:border-[#D4AF37] outline-none text-sm"
                      value={formData.lastName}
                      onChange={(e) => setBaseFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                  <input 
                    placeholder="Address (Street, Town, Township)" 
                    className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 focus:border-[#D4AF37] outline-none text-sm"
                    value={formData.address}
                    onChange={(e) => setBaseFormData({...formData, address: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 focus:border-[#D4AF37] outline-none text-sm">
                      <option>Yangon</option>
                      <option>Mandalay</option>
                      <option>Naypyidaw</option>
                    </select>
                    <input 
                      placeholder="Phone Number" 
                      className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 focus:border-[#D4AF37] outline-none text-sm"
                      value={formData.phone}
                      onChange={(e) => setBaseFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleNext}
                  className="w-full bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all shadow-xl"
                >
                  Continue to Shipping
                </button>
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
                <h3 className="text-xl font-serif">Shipping Method</h3>
                <div className="space-y-4">
                  {loadingMethods ? (
                    <div className="p-12 text-center text-muted-foreground animate-pulse uppercase tracking-widest text-[10px] font-bold">Syncing Logistics...</div>
                  ) : deliveryMethods.map((method) => (
                    <div 
                      key={method.id}
                      onClick={() => setBaseFormData({...formData, shippingMethod: method.id})}
                      className={cn(
                        "p-6 border flex items-center justify-between cursor-pointer transition-all",
                        formData.shippingMethod === method.id ? "border-[#D4AF37] bg-[#F5F0E1]/30" : "border-[#1A1A1A]/5 hover:border-[#1A1A1A]/20"
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", formData.shippingMethod === method.id ? "border-[#D4AF37]" : "border-[#1A1A1A]/20")}>
                          {formData.shippingMethod === method.id && <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold uppercase tracking-widest">{method.name}</p>
                          <p className="text-[10px] text-[#1A1A1A]/40 uppercase font-bold">{method.estimatedDays}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#D4AF37]">
                        {method.freeOverAmount && subtotal >= parseFloat(method.freeOverAmount) ? 'FREE' : formatPrice(parseFloat(method.price), method.isUsdPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button onClick={handleBack} className="p-5 border border-[#1A1A1A]/10 hover:bg-zinc-50 transition-all"><ArrowLeft className="w-4 h-4" /></button>
                  <button onClick={handleNext} className="flex-1 bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all">Continue to Payment</button>
                </div>
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
                <h3 className="text-xl font-serif">Payment Method</h3>
                
                {loadingPayments ? (
                  <div className="p-12 text-center text-muted-foreground animate-pulse uppercase tracking-widest text-[10px] font-bold">Initializing Secure Checkout...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {paymentMethods.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          setBaseFormData({...formData, paymentMethod: p.name});
                          if (p.type !== 'STRIPE') setClientSecret(null);
                        }}
                        className={cn(
                          "p-8 border flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all text-center",
                          formData.paymentMethod === p.name ? "border-[#D4AF37] bg-[#F5F0E1]/30" : "border-[#1A1A1A]/5 hover:border-[#1A1A1A]/20"
                        )}
                      >
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-[#D4AF37] shadow-sm uppercase text-xs">
                          {p.name.substring(0, 1)}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{p.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPayment?.type === 'STRIPE' ? (
                  <div className="space-y-6">
                    {isCreatingIntent ? (
                      <div className="p-12 text-center animate-pulse uppercase tracking-widest text-[10px] font-bold">Initializing Secure Payment...</div>
                    ) : clientSecret ? (
                      <StripeWrapper clientSecret={clientSecret}>
                        <StripePaymentForm 
                          orderId={currentOrderId || undefined}
                          onSuccess={handleComplete} 
                          onError={(msg) => setPaymentError(msg)} 
                        />
                      </StripeWrapper>
                    ) : (
                      <div className="text-red-500 text-[10px] uppercase font-bold tracking-widest text-center">{paymentError || "Failed to load payment form."}</div>
                    )}
                    {paymentError && (
                      <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest text-center">{paymentError}</p>
                    )}
                  </div>
                ) : selectedPayment ? (
                  <>
                    <div className="p-8 bg-[#F5F0E1]/30 border border-[#D4AF37]/10 space-y-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/60">Payment Instructions</p>
                        <p className="text-sm font-serif leading-relaxed text-[#1A1A1A]">
                          {selectedPayment.instructions}
                        </p>
                      </div>

                      {selectedPayment.accountNumber && (
                        <div className="grid grid-cols-2 gap-8 py-6 border-y border-[#D4AF37]/10">
                          <div className="space-y-1">
                            <p className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold">Account Name</p>
                            <p className="text-[11px] font-bold uppercase tracking-wider">{selectedPayment.accountName}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold">Account Number</p>
                            <p className="text-[11px] font-bold font-mono">{selectedPayment.accountNumber}</p>
                          </div>
                        </div>
                      )}

                      {selectedPayment.qrCode && (
                        <div className="flex justify-center p-4 bg-white border border-[#D4AF37]/10">
                          <Image src={selectedPayment.qrCode} alt="QR Code" width={200} height={200} className="grayscale" />
                        </div>
                      )}

                      <p className="text-[10px] text-[#1A1A1A]/40 leading-relaxed italic border-t border-[#D4AF37]/10 pt-4">
                        Please proceed with your payment. Your order will be processed once our team verifies the transaction.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={handleBack} className="p-5 border border-[#1A1A1A]/10 hover:bg-zinc-50 transition-all"><ArrowLeft className="w-4 h-4" /></button>
                      <button onClick={handleComplete} className="flex-1 bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all">Complete Purchase</button>
                    </div>
                  </>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Order Summary */}
        <div className="bg-[#F5F0E1]/30 p-8 md:p-16 lg:p-24 border-l border-[#1A1A1A]/5">
          <div className="sticky top-24 space-y-12">
            <h2 className="text-2xl font-serif">Order Summary</h2>
            
            <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.variantId ? `${item.id}-${item.variantId}` : `${item.id}-${item.size}`} className="flex space-x-6 items-center">
                  <div className="relative w-20 aspect-[3/4] rounded-sm overflow-hidden bg-white shadow-sm shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <span className="absolute -top-2 -right-2 bg-[#1A1A1A] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-serif font-bold text-[#1A1A1A]">{item.name}</h4>
                    <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest font-bold">Size: {item.size}</p>
                    {item.isPreOrder && (
                      <span className="inline-block mt-1 text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest">
                        Pre-Order {item.expectedShippingDate ? `(Ships ${new Date(item.expectedShippingDate).toLocaleDateString()})` : ''}
                      </span>
                    )}
                  </div>
                  <Price amount={item.price * item.quantity} isUsdPrice={item.isUsdPrice} className="text-sm font-bold text-[#1A1A1A]" />
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-[#1A1A1A]/10">
              {/* Promo & Referral in Checkout */}
              <div className="space-y-3 pb-4">
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Discount Code" 
                    className="flex-1 p-3 bg-white border border-[#1A1A1A]/5 text-[10px] uppercase tracking-widest font-bold outline-none focus:border-[#D4AF37]"
                  />
                  <button className="px-4 py-3 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all">Apply</button>
                </div>
                <input 
                  type="text" 
                  placeholder="Referral Code (Optional)" 
                  className="w-full p-3 bg-white border border-[#1A1A1A]/5 text-[10px] uppercase tracking-widest font-bold outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-[#1A1A1A]/40 font-medium">Subtotal</span>
                <span className="font-bold text-[#1A1A1A]">{formatPrice(subtotal, currency === 'USD')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#1A1A1A]/40 font-medium">Shipping</span>
                <span className="font-bold text-[#1A1A1A]">{shippingCost === 0 ? 'FREE' : getShippingDisplay(shippingCost)}</span>
              </div>
              <div className="pt-6 flex justify-between items-end border-t-2 border-[#1A1A1A]">
                <span className="text-xl font-serif">Total</span>
                <div className="text-right">
                  <p className="text-[10px] text-[#1A1A1A]/40 uppercase font-bold tracking-widest mb-1">{currency === 'USD' ? 'USD Total' : 'Myanmar Kyat'}</p>
                  <TotalDisplay subtotal={subtotal} shippingCost={shippingCost} isShippingUsd={isShippingUsd} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function TotalDisplay({ subtotal, shippingCost, isShippingUsd }: { subtotal: number, shippingCost: number, isShippingUsd: boolean }) {
  const currency = useStore((state) => state.currency);
  const exchangeRate = useStore((state) => state.exchangeRate);
  const formatPrice = useStore((state) => state.formatPrice);
  
  // subtotal is already in current currency
  // shippingCost is in its base currency (isShippingUsd)
  
  let finalShippingInCurrentCurrency = shippingCost;
  
  if (isShippingUsd && currency === 'MMK') {
    finalShippingInCurrentCurrency = shippingCost * exchangeRate;
  } else if (!isShippingUsd && currency === 'USD') {
    finalShippingInCurrentCurrency = shippingCost / exchangeRate;
  }
  
  const total = subtotal + finalShippingInCurrentCurrency;
  
  return <span className="text-3xl font-bold text-[#D4AF37]">{formatPrice(total, currency === 'USD')}</span>;
}
