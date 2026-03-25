"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "motion/react";
import { User, Settings, Package, LogOut, ChevronRight, Mail, Phone, MapPin, Camera, Star, Clock, CreditCard, RotateCcw, X, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Price from "@/components/Price";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfilePage() {
  const { user, token, isAuthenticated, logout, updateUser } = useAuthStore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    address: "",
  });

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        updateUser(data);
        setFormData({
          name: data.name || "",
          username: data.username || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      } else if (response.status === 401) {
        logout();
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }, [token, updateUser, logout, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchProfile();
    }
  }, [isAuthenticated, router, fetchProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        updateUser(data);
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const memberProgress = (user?.points || 0) / 2000 * 100;

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Navbar />

      <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col lg:row lg:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-80 space-y-8">
            <div className="bg-white p-8 border border-[#1A1A1A]/5 shadow-sm space-y-6">
              <div className="relative w-24 h-24 mx-auto group">
                <div className="w-full h-full rounded-full bg-[#F5F0E1] flex items-center justify-center overflow-hidden border-2 border-[#D4AF37]">
                  {user?.avatar ? (
                    <Image src={user.avatar} alt={user.name || ""} fill className="object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-[#D4AF37]" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-[#1A1A1A] rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-serif text-[#1A1A1A]">{user?.name || "Member"}</h2>
                <div className="flex items-center justify-center space-x-2">
                  <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">{user?.memberLevel || "Silver"}</span>
                </div>
              </div>
            </div>

            {/* Member Level Card */}
            <div className="bg-[#1A1A1A] p-8 text-white space-y-6 overflow-hidden relative">
              <div className="absolute inset-0 acheik-pattern opacity-10" />
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-end">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Member Level</h4>
                  <span className="text-[10px] font-bold">{user?.points || 0} / 2,000 pts</span>
                </div>
                <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${memberProgress}%` }}
                    className="h-full bg-[#D4AF37]"
                  />
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed italic">
                  Earn {2000 - (user?.points || 0)} more points to reach Platinum status.
                </p>
              </div>
            </div>

            <nav className="flex flex-col space-y-1">
              {[
                { id: "profile", label: "My Profile", icon: User },
                { id: "orders", label: "Order Records", icon: Package },
                { id: "rewards", label: "Membership Perks", icon: Star },
                { id: "settings", label: "Account Settings", icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSelectedOrder(null); }}
                  className={cn(
                    "flex items-center justify-between p-4 text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeTab === item.id 
                      ? "bg-[#1A1A1A] text-white" 
                      : "text-[#1A1A1A]/60 hover:bg-[#F5F0E1]/50"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={cn("w-3 h-3", activeTab === item.id ? "opacity-100" : "opacity-0")} />
                </button>
              ))}
              <button 
                onClick={() => { logout(); router.push("/"); }}
                className="flex items-center space-x-4 p-4 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white p-8 md:p-12 border border-[#1A1A1A]/5 space-y-12">
                    <div className="flex justify-between items-end border-b border-[#1A1A1A]/5 pb-6">
                      <h3 className="text-3xl font-serif">Profile Information</h3>
                      <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Full Name</span>
                        <p className="text-sm font-medium">{user?.name || "Not set"}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Username</span>
                        <p className="text-sm font-medium">{user?.username ? `@${user.username}` : "Not set"}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Email Address</span>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-[#D4AF37]" />
                          <p className="text-sm font-medium">{user?.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Phone Number</span>
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-[#D4AF37]" />
                          <p className="text-sm font-medium">{user?.phone || "Not set"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Default Shipping Address</span>
                      <div className="flex items-start space-x-3 p-6 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5">
                        <MapPin className="w-4 h-4 text-[#D4AF37] mt-1 shrink-0" />
                        <p className="text-sm font-medium leading-relaxed">
                          {user?.address || "No address saved"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "orders" && !selectedOrder && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white p-8 md:p-12 border border-[#1A1A1A]/5 space-y-8">
                    <h3 className="text-3xl font-serif border-b border-[#1A1A1A]/5 pb-6">Order History</h3>
                    
                    <div className="space-y-6">
                      {!user?.orders || user.orders.length === 0 ? (
                        <p className="text-sm text-[#1A1A1A]/40 italic">No orders found.</p>
                      ) : (
                        user.orders.map((order: any) => (
                          <div key={order.id} className="p-6 border border-[#1A1A1A]/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-[#D4AF37] transition-all group">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Order Number</p>
                              <p className="text-sm font-bold">{order.orderNumber}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Date</p>
                              <p className="text-sm font-medium">{new Date(order.date).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Status</p>
                              <span className={cn(
                                "text-[10px] font-bold uppercase px-3 py-1 rounded-full",
                                order.status === "DELIVERING" ? "bg-blue-100 text-blue-600" : 
                                order.status === "COMPLETED" ? "bg-green-100 text-green-600" : "bg-zinc-100 text-zinc-600"
                              )}>
                                {order.status}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Total</p>
                              <Price 
                                amount={order.totalAmount} 
                                isUsdPrice={order.currency ? order.currency === 'USD' : true} 
                                className="text-sm font-bold text-[#D4AF37]" 
                              />
                            </div>
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="px-6 py-2 border border-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest group-hover:bg-[#1A1A1A] group-hover:text-white transition-all"
                            >
                              View Detail
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "orders" && selectedOrder && (
                <motion.div
                  key="order-detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white p-8 md:p-12 border border-[#1A1A1A]/5 space-y-12">
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to Records</span>
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1A1A1A]/5 pb-8">
                      <div className="space-y-2">
                        <h3 className="text-3xl font-serif">Order {selectedOrder.orderNumber}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Placed on {new Date(selectedOrder.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-4">
                        {selectedOrder.status === "COMPLETED" && (
                          <button 
                            onClick={() => setIsRefundModalOpen(true)}
                            className="flex items-center space-x-2 px-6 py-3 border border-red-100 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Request Refund</span>
                          </button>
                        )}
                        <Link 
                          href={`/track?id=${selectedOrder.orderNumber}`}
                          className="flex items-center space-x-2 px-6 py-3 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Track Delivery</span>
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {selectedOrder.items?.map((item: any) => (
                        <div key={item.id} className="flex space-x-6 items-center">
                          <div className="relative w-20 aspect-[3/4] bg-[#F5F0E1] overflow-hidden rounded-sm">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <h4 className="text-sm font-serif font-bold text-[#1A1A1A]">{item.name}</h4>
                            <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest font-bold">Size: {item.size} • Qty: {item.quantity}</p>
                          </div>
                          <Price 
                            amount={item.price} 
                            isUsdPrice={item.isUsd !== false} 
                            className="text-sm font-bold text-[#1A1A1A]" 
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-[#1A1A1A]/5">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Shipping Address</h4>
                        <p className="text-sm font-medium leading-relaxed">{selectedOrder.shippingAddress}</p>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Payment & Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#1A1A1A]/40">Method</span>
                            <span className="font-bold flex items-center space-x-2">
                              <CreditCard className="w-3 h-3 text-[#D4AF37]" />
                              <span>{selectedOrder.paymentMethod}</span>
                            </span>
                          </div>
                          <div className="flex justify-between text-sm pt-4 border-t border-[#1A1A1A]/5">
                            <span className="text-[#1A1A1A]/40">Total Amount</span>
                            <Price 
                              amount={selectedOrder.totalAmount} 
                              isUsdPrice={selectedOrder.currency ? selectedOrder.currency === 'USD' : true} 
                              className="font-bold text-[#D4AF37] text-lg" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ... Rewards and Settings tabs (similar updates if needed) ... */}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white p-10 shadow-2xl space-y-8"
            >
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 text-[#1A1A1A]/40 hover:text-[#1A1A1A]"><X className="w-6 h-6" /></button>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-serif">Edit Profile</h3>
                <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest font-bold">Update your personal information</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Full Name</label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Username</label>
                    <input 
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Phone Number</label>
                  <input 
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Shipping Address</label>
                  <textarea 
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-4 border border-[#1A1A1A]/10 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] py-4 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all shadow-xl shadow-black/10"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
