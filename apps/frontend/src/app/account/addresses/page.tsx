"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuthStore } from "@/store/useAuthStore";
import { getApiUrl } from "@/lib/api";
import Link from "next/link";

interface SavedAddress {
  id: string;
  label?: string;
  country: string;
  street: string;
  city: string;
  state?: string;
  township?: string;
  zipCode?: string;
  phone?: string;
  isDefault?: boolean;
}

const emptyForm = {
  label: "Home",
  country: "MM",
  street: "",
  city: "Yangon",
  state: "",
  township: "",
  zipCode: "",
  phone: "",
  isDefault: false,
};

export default function AddressesPage() {
  const router = useRouter();
  const { token, isAuthenticated, hasHydrated } = useAuthStore();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${getApiUrl()}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(Array.isArray(data) ? data : data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/login?redirect=/account/addresses");
      return;
    }
    fetchAddresses();
  }, [hasHydrated, isAuthenticated, router, fetchAddresses]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await fetch(`${getApiUrl()}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      await fetchAddresses();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this address?")) return;
    await fetch(`${getApiUrl()}/addresses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAddresses();
  };

  if (!hasHydrated || (!isAuthenticated && hasHydrated)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#1A1A1A]/40">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-32 space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif">Saved Addresses</h1>
          <Link href="/profile" className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
            Back to profile
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <ul className="space-y-4">
            {addresses.map((a) => (
              <li key={a.id} className="p-6 border border-[#1A1A1A]/10 bg-white flex justify-between gap-4">
                <div>
                  <p className="font-bold text-sm">{a.label || "Address"}</p>
                  <p className="text-sm text-[#1A1A1A]/70 mt-1">
                    {a.street}, {a.township && `${a.township}, `}
                    {a.city} {a.state} {a.zipCode}
                  </p>
                  {a.phone && <p className="text-xs mt-1">{a.phone}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  className="text-[10px] uppercase tracking-widest text-rose-600 font-bold"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSave} className="space-y-4 p-8 border border-[#1A1A1A]/10 bg-white">
          <h2 className="text-lg font-serif">Add address</h2>
          <input
            className="w-full border-b border-[#1A1A1A]/20 py-2 text-sm"
            placeholder="Label"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          />
          <input
            required
            className="w-full border-b border-[#1A1A1A]/20 py-2 text-sm"
            placeholder="Street"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
          />
          <input
            required
            className="w-full border-b border-[#1A1A1A]/20 py-2 text-sm"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <input
            className="w-full border-b border-[#1A1A1A]/20 py-2 text-sm"
            placeholder="Township"
            value={form.township}
            onChange={(e) => setForm({ ...form, township: e.target.value })}
          />
          <input
            className="w-full border-b border-[#1A1A1A]/20 py-2 text-sm"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#1A1A1A] text-white py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#D4AF37] transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save address"}
          </button>
        </form>
      </div>
    </main>
  );
}
