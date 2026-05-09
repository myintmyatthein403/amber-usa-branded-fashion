"use client";

import Image from "next/image";
import Price from "@/components/Price";
import { useStore, type CartItem } from "@/store/useStore";

interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  shippingCost: number;
  getShippingDisplay: (cost: number) => string;
  currency: string;
}

export default function OrderSummary({
  cartItems,
  subtotal,
  shippingCost,
  getShippingDisplay,
  currency,
}: OrderSummaryProps) {
  const formatPrice = useStore((state) => state.formatPrice);

  return (
    <div className="sticky top-24 space-y-12">
      <h2 className="text-2xl font-serif">Order Summary</h2>

      <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
        {cartItems.map((item) => (
          <div
            key={
              item.variantId
                ? `${item.id}-${item.variantId}`
                : `${item.id}-${item.size}`
            }
            className="flex space-x-6 items-center"
          >
            <div className="relative w-20 aspect-[3/4] rounded-sm overflow-hidden bg-white shadow-sm shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
              <span className="absolute -top-2 -right-2 bg-[#1A1A1A] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-serif font-bold text-[#1A1A1A]">
                {item.name}
              </h4>
              <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest font-bold">
                Size: {item.size}
              </p>
              {item.isPreOrder && (
                <span className="inline-block mt-1 text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest">
                  Pre-Order{" "}
                  {item.expectedShippingDate
                    ? `(Ships ${new Date(
                        item.expectedShippingDate
                      ).toLocaleDateString()})`
                    : ""}
                </span>
              )}
            </div>
            <Price
              amount={item.price * item.quantity}
              isUsdPrice={item.isUsdPrice}
              className="text-sm font-bold text-[#1A1A1A]"
            />
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-8 border-t border-[#1A1A1A]/10">
        <div className="space-y-3 pb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Discount Code"
              className="flex-1 p-3 bg-white border border-[#1A1A1A]/5 text-[10px] uppercase tracking-widest font-bold outline-none focus:border-[#D4AF37]"
            />
            <button className="px-4 py-3 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all">
              Apply
            </button>
          </div>
          <input
            type="text"
            placeholder="Referral Code (Optional)"
            className="w-full p-3 bg-white border border-[#1A1A1A]/5 text-[10px] uppercase tracking-widest font-bold outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-[#1A1A1A]/40 font-medium">Subtotal</span>
          <span className="font-bold text-[#1A1A1A]">
            {formatPrice(subtotal, currency === "USD")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#1A1A1A]/40 font-medium">Shipping</span>
          <span className="font-bold text-[#1A1A1A]">
            {shippingCost === 0 ? "FREE" : getShippingDisplay(shippingCost)}
          </span>
        </div>
        <div className="pt-6 flex justify-between items-end border-t-2 border-[#1A1A1A]">
          <span className="text-xl font-serif">Total</span>
          <div className="text-right">
            <p className="text-[10px] text-[#1A1A1A]/40 uppercase font-bold tracking-widest mb-1">
              {currency === "USD" ? "USD Total" : "Myanmar Kyat"}
            </p>
            <TotalDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}

function TotalDisplay() {
  const subtotal = useStore((state) => state.getSubtotal());
  const formatPrice = useStore((state) => state.formatPrice);
  const currency = useStore((state) => state.currency);

  return (
    <span className="text-3xl font-bold text-[#D4AF37]">
      {formatPrice(subtotal, currency === "USD")}
    </span>
  );
}