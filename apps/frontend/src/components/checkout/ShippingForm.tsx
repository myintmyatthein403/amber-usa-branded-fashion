"use client";

import { CheckoutFormData } from "./index";

interface ShippingFormProps {
  formData: CheckoutFormData;
  onUpdate: (updates: Partial<CheckoutFormData>) => void;
  onContinue: () => void;
}

export default function ShippingForm({ formData, onUpdate, onContinue }: ShippingFormProps) {
  const isValid = formData.email && formData.firstName && formData.lastName && formData.address && formData.phone;

  return (
    <>
      <div className="space-y-6">
        <h3 className="text-xl font-serif">Contact Information</h3>
        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 focus:border-[#D4AF37] outline-none transition-colors text-sm"
          value={formData.email}
          onChange={(e) => onUpdate({ email: e.target.value })}
        />
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-serif">Shipping Address</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="First Name"
            className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 focus:border-[#D4AF37] outline-none text-sm"
            value={formData.firstName}
            onChange={(e) => onUpdate({ firstName: e.target.value })}
          />
          <input
            placeholder="Last Name"
            className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 focus:border-[#D4AF37] outline-none text-sm"
            value={formData.lastName}
            onChange={(e) => onUpdate({ lastName: e.target.value })}
          />
        </div>
        <input
          placeholder="Address (Street, Town, Township)"
          className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 focus:border-[#D4AF37] outline-none text-sm"
          value={formData.address}
          onChange={(e) => onUpdate({ address: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <select
            className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 focus:border-[#D4AF37] outline-none text-sm"
            value={formData.city}
            onChange={(e) => onUpdate({ city: e.target.value })}
          >
            <option>Yangon</option>
            <option>Mandalay</option>
            <option>Naypyidaw</option>
          </select>
          <input
            placeholder="Phone Number"
            className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 focus:border-[#D4AF37] outline-none text-sm"
            value={formData.phone}
            onChange={(e) => onUpdate({ phone: e.target.value })}
          />
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all shadow-xl"
      >
        Continue to Delivery
      </button>
    </>
  );
}