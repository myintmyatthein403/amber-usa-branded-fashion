"use client";

import { CheckoutFormData, Market } from "./index";
import { useTranslations } from "@/i18n/useTranslations";
import { cn } from "@/lib/utils";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

const MM_REGIONS = [
  "Yangon", "Mandalay", "Naypyidaw", "Bago", "Magway", "Sagaing",
  "Tanintharyi", "Mon", "Kayin", "Kayah", "Chin", "Rakhine", "Shan", "Kachin",
];

interface ShippingFormProps {
  formData: CheckoutFormData;
  onUpdate: (updates: Partial<CheckoutFormData>) => void;
  onContinue: () => void;
  submitting?: boolean;
}

export default function ShippingForm({
  formData,
  onUpdate,
  onContinue,
  submitting = false,
}: ShippingFormProps) {
  const t = useTranslations();
  const isUs = formData.market === "US";

  const isValid =
    Boolean(formData.email.trim()) &&
    Boolean(formData.firstName.trim()) &&
    Boolean(formData.lastName.trim()) &&
    Boolean(formData.phone.trim()) &&
    Boolean(formData.street.trim()) &&
    Boolean(formData.city.trim()) &&
    (isUs
      ? Boolean(formData.state?.trim()) && Boolean(formData.zipCode?.trim())
      : Boolean(formData.region?.trim()));

  const setMarket = (market: Market) => {
    onUpdate({
      market,
      shippingCountry: market === "US" ? "US" : "MM",
      state: market === "US" ? formData.state : undefined,
      zipCode: market === "US" ? formData.zipCode : undefined,
      township: market === "MM" ? formData.township : undefined,
      region: market === "MM" ? formData.region : undefined,
    });
  };

  const inputClass =
    "w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 focus:border-[#D4AF37] outline-none transition-colors text-sm";

  return (
    <>
      <div className="space-y-6">
        <h3 className="text-xl font-serif">{t("checkout.contact")}</h3>
        <input
          type="email"
          placeholder="Email Address"
          className={inputClass}
          value={formData.email}
          onChange={(e) => onUpdate({ email: e.target.value })}
        />
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-serif">{t("checkout.address")}</h3>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">
            {t("checkout.country")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["US", "MM"] as Market[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMarket(m)}
                className={cn(
                  "py-3 border text-[10px] font-bold uppercase tracking-widest transition-all",
                  formData.market === m
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "border-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:border-[#D4AF37]",
                )}
              >
                {m === "US" ? t("checkout.countryUs") : t("checkout.countryMm")}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="First Name"
            className={inputClass}
            value={formData.firstName}
            onChange={(e) => onUpdate({ firstName: e.target.value })}
          />
          <input
            placeholder="Last Name"
            className={inputClass}
            value={formData.lastName}
            onChange={(e) => onUpdate({ lastName: e.target.value })}
          />
        </div>

        <input
          placeholder="Street Address"
          className={inputClass}
          value={formData.street}
          onChange={(e) =>
            onUpdate({ street: e.target.value, address: e.target.value })
          }
        />

        {isUs ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="City"
                className={inputClass}
                value={formData.city}
                onChange={(e) => onUpdate({ city: e.target.value })}
              />
              <select
                className={inputClass}
                value={formData.state || ""}
                onChange={(e) => onUpdate({ state: e.target.value })}
              >
                <option value="">State</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <input
              placeholder="ZIP Code"
              className={inputClass}
              value={formData.zipCode || ""}
              onChange={(e) => onUpdate({ zipCode: e.target.value })}
            />
          </>
        ) : (
          <>
            <input
              placeholder="Township"
              className={inputClass}
              value={formData.township || ""}
              onChange={(e) => onUpdate({ township: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                className={inputClass}
                value={formData.region || ""}
                onChange={(e) => onUpdate({ region: e.target.value })}
              >
                <option value="">Region / State</option>
                {MM_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input
                placeholder="City"
                className={inputClass}
                value={formData.city}
                onChange={(e) => onUpdate({ city: e.target.value })}
              />
            </div>
          </>
        )}

        <input
          placeholder="Phone Number"
          className={inputClass}
          value={formData.phone}
          onChange={(e) => onUpdate({ phone: e.target.value })}
        />
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!isValid || submitting}
        className="w-full bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Checking Stock..." : t("checkout.continueDelivery")}
      </button>
    </>
  );
}
