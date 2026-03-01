"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "motion/react";
import { User, Settings, Package, LogOut, ChevronRight, Mail, Phone, MapPin, Camera, Star, Clock, CreditCard, RotateCcw, X, CheckCircle2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
}

interface Order {
  id: string;
  date: string;
  status: "Delivering" | "Completed" | "Refunded";
  total: string;
  items: number;
  itemList: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
}

const MOCK_ORDERS: Order[] = [
  { 
    id: "AMB-2026-0892", 
    date: "Feb 28, 2026", 
    status: "Delivering", 
    total: "148,000 MMK", 
    items: 2,
    itemList: [
      { id: 1, name: "Classic Silk Dress", price: 85000, quantity: 1, size: "M", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800" },
      { id: 2, name: "Amber Lace Top", price: 45000, quantity: 1, size: "S", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800" }
    ],
    shippingAddress: "No. 123, Bahan Township, Yangon, Myanmar",
    paymentMethod: "KBZPay"
  },
  { 
    id: "AMB-2026-0415", 
    date: "Jan 12, 2026", 
    status: "Completed", 
    total: "85,000 MMK", 
    items: 1,
    itemList: [
      { id: 1, name: "Classic Silk Dress", price: 85000, quantity: 1, size: "L", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800" }
    ],
    shippingAddress: "No. 123, Bahan Township, Yangon, Myanmar",
    paymentMethod: "WavePay"
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  const memberLevel = {
    name: "Gold Elite",
    progress: 75,
    points: "1,250 / 2,000",
    perks: ["Free Express Shipping", "10% Birthday Discount", "Early Access to Drops"]
  };

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
                  <User className="w-12 h-12 text-[#D4AF37]" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-[#1A1A1A] rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-serif text-[#1A1A1A]">Su Myat</h2>
                <div className="flex items-center justify-center space-x-2">
                  <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">{memberLevel.name}</span>
                </div>
              </div>
            </div>

            {/* Member Level Card */}
            <div className="bg-[#1A1A1A] p-8 text-white space-y-6 overflow-hidden relative">
              <div className="absolute inset-0 acheik-pattern opacity-10" />
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-end">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Member Level</h4>
                  <span className="text-[10px] font-bold">{memberLevel.points} pts</span>
                </div>
                <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${memberLevel.progress}%` }}
                    className="h-full bg-[#D4AF37]"
                  />
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed italic">
                  Earn 750 more points to reach Platinum status.
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
              <button className="flex items-center space-x-4 p-4 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all">
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
                      <button className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]">Edit</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Full Name</span>
                        <p className="text-sm font-medium">Su Myat</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Username</span>
                        <p className="text-sm font-medium">@sumyat_fashion</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Email Address</span>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-[#D4AF37]" />
                          <p className="text-sm font-medium">su.myat@example.com</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Phone Number</span>
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-[#D4AF37]" />
                          <p className="text-sm font-medium">+95 9 123 456 789</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Default Shipping Address</span>
                      <div className="flex items-start space-x-3 p-6 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5">
                        <MapPin className="w-4 h-4 text-[#D4AF37] mt-1 shrink-0" />
                        <p className="text-sm font-medium leading-relaxed">
                          No. 123, Bahan Township, <br />
                          Yangon, Myanmar
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
                      {MOCK_ORDERS.map((order) => (
                        <div key={order.id} className="p-6 border border-[#1A1A1A]/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-[#D4AF37] transition-all group">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Order ID</p>
                            <p className="text-sm font-bold">{order.id}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Date</p>
                            <p className="text-sm font-medium">{order.date}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Status</p>
                            <span className={cn(
                              "text-[10px] font-bold uppercase px-3 py-1 rounded-full",
                              order.status === "Delivering" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                            )}>
                              {order.status}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Total</p>
                            <p className="text-sm font-bold text-[#D4AF37]">{order.total}</p>
                          </div>
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="px-6 py-2 border border-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest group-hover:bg-[#1A1A1A] group-hover:text-white transition-all"
                          >
                            View Detail
                          </button>
                        </div>
                      ))}
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
                        <h3 className="text-3xl font-serif">Order {selectedOrder.id}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Placed on {selectedOrder.date}</p>
                      </div>
                      <div className="flex gap-4">
                        {selectedOrder.status === "Completed" && (
                          <button 
                            onClick={() => setIsRefundModalOpen(true)}
                            className="flex items-center space-x-2 px-6 py-3 border border-red-100 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Request Refund</span>
                          </button>
                        )}
                        <Link 
                          href={`/track?id=${selectedOrder.id}`}
                          className="flex items-center space-x-2 px-6 py-3 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Track Delivery</span>
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {selectedOrder.itemList.map((item) => (
                        <div key={item.id} className="flex space-x-6 items-center">
                          <div className="relative w-20 aspect-[3/4] bg-[#F5F0E1] overflow-hidden rounded-sm">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <h4 className="text-sm font-serif font-bold text-[#1A1A1A]">{item.name}</h4>
                            <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest font-bold">Size: {item.size} • Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-[#1A1A1A]">{item.price.toLocaleString()} MMK</p>
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
                            <span className="font-bold text-[#D4AF37] text-lg">{selectedOrder.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "rewards" && (
                <motion.div
                  key="rewards"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white p-8 md:p-12 border border-[#1A1A1A]/5 space-y-12">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-[#1A1A1A]/5 pb-8">
                      <div className="space-y-2">
                        <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em]">Membership</span>
                        <h3 className="text-4xl font-serif">{memberLevel.name} Status</h3>
                      </div>
                      <div className="bg-[#F5F0E1] px-6 py-4 rounded-sm border border-[#D4AF37]/20">
                        <p className="text-[10px] uppercase font-bold text-[#1A1A1A]/40 mb-1">Your Balance</p>
                        <p className="text-xl font-bold text-[#D4AF37]">1,250 Points</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <h4 className="text-xs font-bold uppercase tracking-widest">Exclusive Perks</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {memberLevel.perks.map((perk, i) => (
                          <div key={i} className="p-6 border border-[#1A1A1A]/5 bg-zinc-50 flex flex-col items-center text-center space-y-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-10 bg-[#1A1A1A] text-white relative overflow-hidden">
                      <div className="absolute inset-0 acheik-pattern opacity-10" />
                      <div className="relative z-10 space-y-6">
                        <div className="space-y-2">
                          <h4 className="text-xl font-serif">Journey to Platinum</h4>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Unlocks 15% VIP Discount & Personal Stylist</p>
                        </div>
                        <div className="space-y-2">
                          <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
                            <div className="h-full bg-[#D4AF37] w-3/4" />
                          </div>
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                            <span>Gold Elite</span>
                            <span>Platinum Elite</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white p-8 md:p-12 border border-[#1A1A1A]/5 space-y-12">
                    <h3 className="text-3xl font-serif border-b border-[#1A1A1A]/5 pb-6">Account Settings</h3>
                    
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-widest">Email Notifications</h4>
                          <p className="text-xs text-[#1A1A1A]/40">Receive updates on order status and new arrivals.</p>
                        </div>
                        <div className="w-12 h-6 bg-[#D4AF37] rounded-full p-1 flex justify-end cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-widest">SMS Alerts</h4>
                          <p className="text-xs text-[#1A1A1A]/40">Get instant text alerts for delivery tracking.</p>
                        </div>
                        <div className="w-12 h-6 bg-zinc-200 rounded-full p-1 flex justify-start cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>

                      <div className="pt-8 border-t border-[#1A1A1A]/5 space-y-6">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/40">Security</h4>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button className="px-8 py-4 border border-[#1A1A1A] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#1A1A1A] hover:text-white transition-all">
                            Change Password
                          </button>
                          <button className="px-8 py-4 border border-[#1A1A1A]/10 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 transition-all">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Refund Request Modal */}
      <AnimatePresence>
        {isRefundModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRefundModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white p-10 shadow-2xl space-y-8"
            >
              <button onClick={() => setIsRefundModalOpen(false)} className="absolute top-6 right-6 text-[#1A1A1A]/40 hover:text-[#1A1A1A]"><X className="w-6 h-6" /></button>
              
              <div className="space-y-2">
                <RotateCcw className="w-8 h-8 text-[#D4AF37] mb-4" />
                <h3 className="text-3xl font-serif">Refund Request</h3>
                <p className="text-xs text-[#1A1A1A]/40 uppercase tracking-widest font-bold">For Order {selectedOrder?.id}</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Reason for Refund</label>
                  <select 
                    className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                  >
                    <option value="">Select a reason</option>
                    <option value="size">Wrong Size</option>
                    <option value="damaged">Damaged Item</option>
                    <option value="not_matching">Does not match description</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Additional Comments</label>
                  <textarea 
                    rows={4}
                    placeholder="Please provide more details..."
                    className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => setIsRefundModalOpen(false)}
                  className="flex-1 py-4 border border-[#1A1A1A]/10 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert("Refund request submitted. Our team will review it within 24-48 hours.");
                    setIsRefundModalOpen(false);
                  }}
                  className="flex-[2] py-4 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all shadow-xl shadow-black/10"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
