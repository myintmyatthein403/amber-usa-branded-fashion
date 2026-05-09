"use client";

import { PaymentMethod } from "./index";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

interface ManualPaymentSectionProps {
  payment: PaymentMethod;
  onBack: () => void;
  onComplete: () => void;
}

export default function ManualPaymentSection({
  payment,
  onBack,
  onComplete,
}: ManualPaymentSectionProps) {
  return (
    <>
      <div className="p-8 bg-[#F5F0E1]/30 border border-[#D4AF37]/10 space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/60">
            Payment Instructions
          </p>
          <p className="text-sm font-serif leading-relaxed text-[#1A1A1A]">
            {payment.instructions}
          </p>
        </div>

        {payment.accountNumber && (
          <div className="grid grid-cols-2 gap-8 py-6 border-y border-[#D4AF37]/10">
            <div className="space-y-1">
              <p className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold">
                Account Name
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider">
                {payment.accountName}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold">
                Account Number
              </p>
              <p className="text-[11px] font-bold font-mono">
                {payment.accountNumber}
              </p>
            </div>
          </div>
        )}

        {payment.qrCode && (
          <div className="flex justify-center p-4 bg-white border border-[#D4AF37]/10">
            <Image
              src={payment.qrCode}
              alt="QR Code"
              width={200}
              height={200}
              className="grayscale"
            />
          </div>
        )}

        <p className="text-[10px] text-[#1A1A1A]/40 leading-relaxed italic border-t border-[#D4AF37]/10 pt-4">
          Please proceed with your payment. Your order will be processed once
          our team verifies the transaction.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="p-5 border border-[#1A1A1A]/10 hover:bg-zinc-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onComplete}
          className="flex-1 bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all"
        >
          Complete Purchase
        </button>
      </div>
    </>
  );
}