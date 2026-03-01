"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, CreditCard, Truck, ArrowLeft, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const cartItems = useStore((state) => state.cartItems);
  const subtotal = useStore((state) => state.getSubtotal());
  const clearCart = useStore((state) => state.clearCart);
  
  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const [formData, setBaseFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "Yangon",
    phone: "",
    shippingMethod: "standard",
    paymentMethod: "kpay"
  });

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
              Thank you for shopping with Amber. Your order #AMB-2026-0892 has been received and is being processed. 
              A confirmation email has been sent to {formData.email}.
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <Link 
              href="/track?id=AMB-2026-0892" 
              className="block w-full bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all"
            >
              Track Order
            </Link>
            <Link 
              href="/shop" 
              className="block w-full border border-[#1A1A1A]/10 text-[#1A1A1A] py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-zinc-50 transition-all"
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
        <Link href="/shop" className="text-xs font-bold uppercase tracking-widest border-b-2 border-[#D4AF37] pb-1 hover:text-[#D4AF37]">
          Back to Shop
        </Link>
      </main>
    );
  }

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleComplete = () => {
    setIsCompleted(true);
    clearCart();
  };

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
                  {[
                    { id: 'standard', name: 'Standard Delivery', time: '2-3 Business Days', price: '3,000 MMK' },
                    { id: 'express', name: 'Express Delivery', time: '24 Hours (Yangon Only)', price: '6,500 MMK' }
                  ].map((method) => (
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
                          <p className="text-[10px] text-[#1A1A1A]/40 uppercase font-bold">{method.time}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#D4AF37]">{method.price}</span>
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
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'kpay', name: 'KBZPay', icon: 'K' },
                    { id: 'wave', name: 'WavePay', icon: 'W' },
                    { id: 'card', name: 'Credit Card', icon: <CreditCard className="w-4 h-4" /> },
                    { id: 'cod', name: 'Cash on Delivery', icon: <Truck className="w-4 h-4" /> }
                  ].map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => setBaseFormData({...formData, paymentMethod: p.id})}
                      className={cn(
                        "p-8 border flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all text-center",
                        formData.paymentMethod === p.id ? "border-[#D4AF37] bg-[#F5F0E1]/30" : "border-[#1A1A1A]/5 hover:border-[#1A1A1A]/20"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-[#D4AF37] shadow-sm">
                        {p.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">{p.name}</span>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-[#F5F0E1]/30 border border-[#D4AF37]/10 space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/60">Payment Note</p>
                  <p className="text-[10px] text-[#1A1A1A]/40 leading-relaxed italic">
                    For KBZPay and WavePay, you will receive a QR code on the next screen or our representative will contact you for mobile payment confirmation.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button onClick={handleBack} className="p-5 border border-[#1A1A1A]/10 hover:bg-zinc-50 transition-all"><ArrowLeft className="w-4 h-4" /></button>
                  <button onClick={handleComplete} className="flex-1 bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all">Complete Purchase</button>
                </div>
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
                <div key={`${item.id}-${item.size}`} className="flex space-x-6 items-center">
                  <div className="relative w-20 aspect-[3/4] rounded-sm overflow-hidden bg-white shadow-sm shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <span className="absolute -top-2 -right-2 bg-[#1A1A1A] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-serif font-bold text-[#1A1A1A]">{item.name}</h4>
                    <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest font-bold">Size: {item.size}</p>
                  </div>
                  <span className="text-sm font-bold text-[#1A1A1A]">{(item.price * item.quantity).toLocaleString()} MMK</span>
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
                <span className="font-bold text-[#1A1A1A]">{subtotal.toLocaleString()} MMK</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#1A1A1A]/40 font-medium">Shipping</span>
                <span className="font-bold text-[#1A1A1A]">3,000 MMK</span>
              </div>
              <div className="pt-6 flex justify-between items-end border-t-2 border-[#1A1A1A]">
                <span className="text-xl font-serif">Total</span>
                <div className="text-right">
                  <p className="text-[10px] text-[#1A1A1A]/40 uppercase font-bold tracking-widest mb-1">Myanmar Kyat</p>
                  <span className="text-3xl font-bold text-[#D4AF37]">{(subtotal + 3000).toLocaleString()} MMK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
