"use client";

import { useStore } from "@/store/useStore";

export default function LanguageSwitcher() {
  const locale = useStore((s) => s.locale);
  const setLocale = useStore((s) => s.setLocale);

  return (
    <div className="flex gap-1 text-[10px] font-bold uppercase tracking-widest">
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={locale === "en" ? "text-[#C5A059]" : "text-[#1A1A1A]/50 hover:text-[#1A1A1A]"}
      >
        EN
      </button>
      <span className="text-[#1A1A1A]/30">|</span>
      <button
        type="button"
        onClick={() => setLocale("my")}
        className={locale === "my" ? "text-[#C5A059]" : "text-[#1A1A1A]/50 hover:text-[#1A1A1A]"}
      >
        MY
      </button>
    </div>
  );
}
