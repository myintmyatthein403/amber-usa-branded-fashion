"use client";

import { useState } from "react";
import { PaymentMethod, CheckoutFormData } from "./index";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "@/i18n/useTranslations";

interface ManualPaymentSectionProps {
  payment: PaymentMethod;
  formData: CheckoutFormData;
  onUpdate: (updates: Partial<CheckoutFormData>) => void;
  onBack: () => void;
  onComplete: () => void;
  submitting?: boolean;
}

export default function ManualPaymentSection({
  payment,
  formData,
  onUpdate,
  onBack,
  onComplete,
  submitting = false,
}: ManualPaymentSectionProps) {
  const t = useTranslations();
  const [receiptName, setReceiptName] = useState<string | null>(null);

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptName(file.name);
    onUpdate({ receiptFile: file });
  };

  const canComplete =
    Boolean(formData.transactionRef?.trim()) && Boolean(formData.receiptFile);

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
              <p className="text-[11px] font-bold font-mono">{payment.accountNumber}</p>
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

        <div className="space-y-4 pt-4 border-t border-[#D4AF37]/10">
          <label className="block space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/60">
              {t("checkout.transactionRef")} *
            </span>
            <input
              type="text"
              className="w-full p-4 bg-white border border-[#1A1A1A]/10 text-sm outline-none focus:border-[#D4AF37]"
              value={formData.transactionRef || ""}
              onChange={(e) => onUpdate({ transactionRef: e.target.value })}
              placeholder="e.g. TXN-123456789"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/60">
              {t("checkout.uploadReceipt")} *
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="w-full text-xs text-[#1A1A1A]/60 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-[#1A1A1A] file:text-white"
              onChange={handleReceiptChange}
            />
            {receiptName && (
              <p className="text-[10px] text-[#1A1A1A]/40">Attached: {receiptName}</p>
            )}
          </label>
        </div>

        <p className="text-[10px] text-[#1A1A1A]/40 leading-relaxed italic">
          Upload your payment screenshot here. Our team will verify your payment and confirm your
          order — usually within a few hours.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="p-5 border border-[#1A1A1A]/10 hover:bg-zinc-50 transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={!canComplete || submitting}
          className="flex-1 bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all disabled:opacity-50"
        >
          {submitting ? "Submitting..." : t("checkout.completePurchase")}
        </button>
      </div>
    </>
  );
}
