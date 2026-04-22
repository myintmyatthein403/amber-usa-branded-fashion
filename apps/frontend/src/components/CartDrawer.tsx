"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCartActions } from "@/hooks/useCartActions";
import Link from "next/link";
import Price from "./Price";

export default function CartDrawer() {
  const {
    mounted,
    cartItems,
    isCartOpen,
    itemCount,
    formattedSubtotal,
    formattedDeliveryFee,
    formattedTotal,
    closeCart,
    removeItem,
    changeQuantity,
    formatPrice
  } = useCartActions();

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[160] w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#1A1A1A]/5 flex justify-between items-center bg-[#FDFDFD]">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-lg font-serif uppercase tracking-widest text-[#1A1A1A]">Your Bag</h2>
                <span className="text-[10px] bg-[#D4AF37] text-white px-2 py-0.5 rounded-full font-bold">
                  {itemCount}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-[#F5F0E1] rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-[#D4AF37]/40" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif">Your bag is empty</h3>
                    <p className="text-sm text-[#1A1A1A]/40 max-w-[200px]">
                      Looks like you haven&apos;t added any Amber pieces yet.
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="text-xs font-bold uppercase tracking-widest border-b-2 border-[#D4AF37] pb-1 hover:text-[#D4AF37] transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    layout
                    key={item.variantId ? `${item.id}-${item.variantId}` : `${item.id}-${item.size}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex space-x-4"
                  >
                    <div className="relative w-24 aspect-[3/4] bg-[#F5F0E1] rounded-sm overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-serif font-bold text-[#1A1A1A] line-clamp-1">{item.name}</h4>
                          <button 
                            onClick={() => removeItem(item.id, item.size, item.variantId)}
                            className="text-[#1A1A1A]/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest font-bold">
                          {item.size ? `Size: ${item.size}` : 'Standard Size'}
                        </p>
                        {item.isPreOrder && (
                          <div className="flex flex-col gap-0.5 mt-1">
                            <span className="text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest w-fit">
                              Pre-Order
                            </span>
                            {item.expectedShippingDate && (
                              <span className="text-[9px] text-[#1A1A1A]/50 italic">
                                Ships: {new Date(item.expectedShippingDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                        <Price 
                          amount={item.price * item.quantity} 
                          isUsdPrice={item.isUsdPrice !== false} 
                          className="text-sm font-bold text-[#D4AF37]" 
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center border border-[#1A1A1A]/10 rounded-full px-2 py-1">
                          <button 
                            onClick={() => changeQuantity(item.id, item.size, -1, item.variantId)}
                            className="p-1 hover:text-[#D4AF37] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => changeQuantity(item.id, item.size, 1, item.variantId)}
                            className="p-1 hover:text-[#D4AF37] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-8 bg-[#FDFDFD] border-t border-[#1A1A1A]/5 space-y-6">
                
                {/* Discount & Referral */}
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Discount Code" 
                      className="flex-1 p-3 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 text-[10px] uppercase tracking-widest font-bold outline-none focus:border-[#D4AF37]"
                    />
                    <button className="px-4 py-3 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all">Apply</button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Referral Code (Optional)" 
                    className="w-full p-3 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 text-[10px] uppercase tracking-widest font-bold outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Quick Delivery Estimate */}
                <div className="space-y-3 pt-4 border-t border-[#1A1A1A]/5">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/60">Delivery Option</h4>
                  <div className="flex gap-2">
                    <button className="flex-1 p-3 border border-[#D4AF37] bg-[#F5F0E1]/30 text-[9px] font-bold uppercase tracking-widest">Standard ({formatPrice(3000, false)})</button>
                    <button className="flex-1 p-3 border border-[#1A1A1A]/5 text-[9px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 hover:border-[#D4AF37] transition-all">Express ({formatPrice(6500, false)})</button>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#1A1A1A]/40 font-medium">Subtotal</span>
                    <span className="font-bold">{formattedSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#1A1A1A]/40 font-medium">Delivery</span>
                    <span className="font-bold">{formattedDeliveryFee}</span>
                  </div>
                  <div className="pt-4 flex justify-between items-end border-t border-[#1A1A1A]/5">
                    <span className="text-lg font-serif">Estimated Total</span>
                    <span className="text-xl font-bold text-[#D4AF37]">{formattedTotal}</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <Link 
                    href="/checkout" 
                    onClick={closeCart}
                    className="w-full bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold text-center hover:bg-[#D4AF37] transition-all flex items-center justify-center space-x-4 group shadow-xl shadow-black/10"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full border border-[#1A1A1A]/10 text-[#1A1A1A] py-4 uppercase tracking-[0.3em] text-[10px] font-bold text-center hover:bg-zinc-50 transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
                
                <p className="text-[9px] text-center text-[#1A1A1A]/30 uppercase tracking-[0.2em] font-bold">
                  Secure Checkout Powered by Resonance
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
