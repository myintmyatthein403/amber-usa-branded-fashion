import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Loader2, 
  Search,
  ChevronRight,
  Package,
  Calendar,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type CargoStatus = 'PREPARING' | 'DEPARTED' | 'IN_TRANSIT' | 'ARRIVED_MYANMAR' | 'CUSTOMS_CLEARANCE' | 'READY_FOR_DISTRIBUTION' | 'COMPLETED';

interface CargoShipment {
  id: string;
  shipmentNumber: string;
  status: CargoStatus;
  carrier?: string;
  trackingNumber?: string;
  origin: { name: string; location: string };
  destination: { name: string; location: string };
  items?: any[];
  _count: { items: number };
  createdAt: string;
}

const STATUS_CONFIG: Record<CargoStatus, { label: string; icon: any; color: string; bg: string; border: string }> = {
  PREPARING: { label: 'Preparing', icon: Package, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  DEPARTED: { label: 'Departed USA', icon: ExternalLink, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  IN_TRANSIT: { label: 'In Transit', icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  ARRIVED_MYANMAR: { label: 'Arrived Myanmar', icon: MapPin, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  CUSTOMS_CLEARANCE: { label: 'Customs', icon: ShieldCheck, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  READY_FOR_DISTRIBUTION: { label: 'Ready', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  COMPLETED: { label: 'Inventory Synced', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-600/10', border: 'border-emerald-600/20' },
};

export const CargoPage: React.FC = () => {
  const { data: shipments, loading, refresh } = useFetch<CargoShipment>(API_ROUTES.LOGISTICS.CARGO);
  const { data: warehouses } = useFetch<any>(API_ROUTES.LOGISTICS.WAREHOUSES);
  const { data: variants } = useFetch<any>(API_ROUTES.VARIANTS.BASE);

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<CargoShipment | null>(null);
  const [updating, setUpdating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Shipment Form State
  const [formData, setFormData] = useState({
    originId: '',
    destinationId: '',
    carrier: '',
    trackingNumber: '',
    items: [] as { variantId: string; quantity: number }[]
  });

  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const addItem = () => {
    if (!selectedVariantId || selectedQuantity < 1) return;
    
    // Check if item already in list
    const existing = formData.items.find(i => i.variantId === selectedVariantId);
    if (existing) {
      setFormData({
        ...formData,
        items: formData.items.map(i => i.variantId === selectedVariantId ? { ...i, quantity: i.quantity + selectedQuantity } : i)
      });
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, { variantId: selectedVariantId, quantity: selectedQuantity }]
      });
    }
    setSelectedVariantId('');
    setSelectedQuantity(1);
  };

  const removeItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(i => i.variantId !== id)
    });
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) return alert('Add at least one item');
    if (formData.originId === formData.destinationId) return alert('Origin and destination cannot be the same');

    setSubmitting(true);
    try {
      await apiService(API_ROUTES.LOGISTICS.CARGO, {
        method: 'POST',
        body: formData
      });
      setModalOpen(false);
      setFormData({ originId: '', destinationId: '', carrier: '', trackingNumber: '', items: [] });
      refresh();
    } catch (error) {
      console.error('Failed to create shipment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openDetails = async (id: string) => {
    try {
      const data = await apiService(API_ROUTES.LOGISTICS.CARGO_BY_ID(id));
      setSelectedShipment(data);
      setDetailsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch cargo details:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      await apiService(API_ROUTES.LOGISTICS.CARGO_STATUS(id), {
        method: 'PATCH',
        body: { status }
      });
      if (selectedShipment?.id === id) {
        const updated = await apiService(API_ROUTES.LOGISTICS.CARGO_BY_ID(id));
        setSelectedShipment(updated);
      }
      refresh();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Global Supply Chain</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Cargo Shipments</h2>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all duration-300 shadow-xl"
        >
          <Plus size={14} /> Initialize Manifest
        </button>
      </div>

      <div className="border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Manifest ID</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Route</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Status</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Logistics Provider</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Synchronizing Supply Chain Data...</td></tr>
            ) : shipments?.length === 0 ? (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No shipments in transit.</td></tr>
            ) : shipments?.map((s) => {
              const status = STATUS_CONFIG[s.status];
              return (
                <tr key={s.id} className="group hover:bg-muted/50 transition-colors duration-300">
                  <td className="px-10 py-6">
                    <div className="space-y-1">
                      <div className="text-sm font-bold font-mono text-foreground tracking-tight">{s.shipmentNumber}</div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Initiated {format(new Date(s.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                       <div className="text-center">
                          <div className="text-[10px] font-bold text-blue-500 uppercase">{s.origin.location}</div>
                          <div className="text-xs font-medium">{s.origin.name.split(' ')[0]}</div>
                       </div>
                       <ArrowRight size={12} className="text-muted-foreground/30" />
                       <div className="text-center">
                          <div className="text-[10px] font-bold text-emerald-500 uppercase">{s.destination.location}</div>
                          <div className="text-xs font-medium">{s.destination.name.split(' ')[0]}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex justify-center">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                        status.color, status.bg, status.border
                      )}>
                        {React.createElement(status.icon, { size: 10 })}
                        {status.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-foreground">{s.carrier || 'TBD'}</div>
                      <div className="text-[10px] font-mono text-muted-foreground/60">{s.trackingNumber || 'Pending Assignment'}</div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => openDetails(s.id)}
                      className="p-3 bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-none border border-border group-hover:border-primary/30"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Initialize Manifest Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Initialize Global Manifest"
        size="lg"
      >
        <form onSubmit={handleCreateShipment} className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">Origin Warehouse</label>
              <select
                required
                value={formData.originId}
                onChange={(e) => setFormData({ ...formData, originId: e.target.value })}
                className="w-full h-12 border-b border-gray-200 bg-transparent px-0 py-2 text-base font-medium focus:border-primary focus:outline-none transition-colors rounded-none"
              >
                <option value="">Select Origin</option>
                {warehouses?.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">Destination Warehouse</label>
              <select
                required
                value={formData.destinationId}
                onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
                className="w-full h-12 border-b border-gray-200 bg-transparent px-0 py-2 text-base font-medium focus:border-primary focus:outline-none transition-colors rounded-none"
              >
                <option value="">Select Destination</option>
                {warehouses?.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">Logistics Carrier</label>
              <input
                type="text"
                placeholder="e.g. DHL, FedEx, Local Cargo"
                value={formData.carrier}
                onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                className="w-full h-12 border-b border-gray-200 bg-transparent px-0 py-2 text-base font-medium placeholder:text-gray-300 focus:border-primary focus:outline-none transition-colors rounded-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">Tracking Number</label>
              <input
                type="text"
                placeholder="Assignment pending..."
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="w-full h-12 border-b border-gray-200 bg-transparent px-0 py-2 text-base font-mono font-medium placeholder:text-gray-300 focus:border-primary focus:outline-none transition-colors rounded-none"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Manifest Items</h4>
             <div className="flex gap-4 items-end bg-muted/30 p-4 border border-border">
                <div className="flex-1 space-y-2">
                   <label className="text-[8px] uppercase font-bold text-muted-foreground">Select SKU</label>
                   <select
                     value={selectedVariantId}
                     onChange={(e) => setSelectedVariantId(e.target.value)}
                     className="w-full h-10 bg-white border border-border px-3 text-xs focus:border-primary focus:outline-none"
                   >
                     <option value="">Select Variant</option>
                     {variants?.map((v: any) => (
                       <option key={v.id} value={v.id}>{v.product.name} - {v.size} / {v.color} ({v.sku})</option>
                     ))}
                   </select>
                </div>
                <div className="w-24 space-y-2">
                   <label className="text-[8px] uppercase font-bold text-muted-foreground">Quantity</label>
                   <input
                     type="number"
                     min="1"
                     value={selectedQuantity}
                     onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                     className="w-full h-10 bg-white border border-border px-3 text-xs focus:border-primary focus:outline-none"
                   />
                </div>
                <button 
                  type="button" 
                  onClick={addItem}
                  className="h-10 px-6 bg-secondary text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  Add
                </button>
             </div>

             <div className="border border-border">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-muted/50 border-b border-border">
                         <th className="px-4 py-2 text-[8px] font-bold uppercase text-muted-foreground">Item Specification</th>
                         <th className="px-4 py-2 text-[8px] font-bold uppercase text-muted-foreground text-center">QTY</th>
                         <th className="px-4 py-2 text-[8px] font-bold uppercase text-muted-foreground text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                      {formData.items.length === 0 ? (
                        <tr><td colSpan={3} className="px-4 py-8 text-center text-[10px] text-muted-foreground italic">Manifest is currently empty.</td></tr>
                      ) : formData.items.map((item) => {
                        const v = variants?.find((v: any) => v.id === item.variantId);
                        return (
                          <tr key={item.variantId}>
                             <td className="px-4 py-3">
                                <div className="text-xs font-bold">{v?.product?.name}</div>
                                <div className="text-[9px] font-mono text-muted-foreground uppercase">{v?.sku} / {v?.size} - {v?.color}</div>
                             </td>
                             <td className="px-4 py-3 text-center text-xs font-mono font-bold">{item.quantity}</td>
                             <td className="px-4 py-3 text-right">
                                <button type="button" onClick={() => removeItem(item.variantId)} className="text-destructive hover:text-destructive/70"><Clock size={14} /></button>
                             </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
             </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground px-4 transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-xl"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Launch Shipment Manifest
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal 
        isOpen={detailsModalOpen} 
        onClose={() => setDetailsModalOpen(false)} 
        title={`Cargo Manifest: ${selectedShipment?.shipmentNumber}`}
        size="lg"
      >
        {selectedShipment && (
          <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className={cn(
               "p-8 border flex items-center justify-between",
               STATUS_CONFIG[selectedShipment.status].bg,
               STATUS_CONFIG[selectedShipment.status].border
             )}>
                <div className="flex items-center gap-6">
                   <div className="p-4 bg-white/50 backdrop-blur-sm border border-inherit">
                      {React.createElement(STATUS_CONFIG[selectedShipment.status].icon, { size: 24, className: STATUS_CONFIG[selectedShipment.status].color })}
                   </div>
                   <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-1">Logistics Lifecycle State</div>
                      <div className={cn("text-2xl font-serif", STATUS_CONFIG[selectedShipment.status].color)}>
                        {STATUS_CONFIG[selectedShipment.status].label}
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                   {selectedShipment.status !== 'COMPLETED' && (
                     <select 
                       value={selectedShipment.status}
                       onChange={(e) => handleUpdateStatus(selectedShipment.id, e.target.value)}
                       disabled={updating}
                       className="h-12 bg-white border border-border px-4 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:outline-none cursor-pointer disabled:opacity-50"
                     >
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                     </select>
                   )}
                   {updating && <Loader2 size={16} className="animate-spin text-primary" />}
                </div>
             </div>

             {selectedShipment.status === 'READY_FOR_DISTRIBUTION' && (
               <div className="p-6 bg-amber-50 border border-amber-200 flex items-start gap-4">
                  <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                  <div className="space-y-1">
                     <p className="text-sm font-bold text-amber-900 uppercase tracking-tight">Final Sync Required</p>
                     <p className="text-xs text-amber-700 leading-relaxed">
                        Changing status to <strong>"Inventory Synced"</strong> will automatically inject all manifest items into the <strong>{selectedShipment.destination.name}</strong> stock ledger. This action is irreversible.
                     </p>
                  </div>
               </div>
             )}

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                        <MapPin size={14} /> Logistics Routing
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-muted/30 p-5 border border-border">
                            <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Origin (Source)</div>
                            <div className="text-sm font-bold">{selectedShipment.origin.name}</div>
                            <div className="text-[10px] font-medium text-muted-foreground uppercase">{selectedShipment.origin.location}</div>
                         </div>
                         <div className="bg-muted/30 p-5 border border-border">
                            <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Destination (Sink)</div>
                            <div className="text-sm font-bold">{selectedShipment.destination.name}</div>
                            <div className="text-[10px] font-medium text-muted-foreground uppercase">{selectedShipment.destination.location}</div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                        <Truck size={14} /> Carrier Protocol
                      </h4>
                      <div className="bg-muted/30 p-5 border border-border space-y-4">
                         <div className="flex justify-between items-end border-b border-border pb-4">
                            <div>
                               <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Lead Carrier</div>
                               <div className="text-sm font-bold">{selectedShipment.carrier || 'PENDING'}</div>
                            </div>
                            <div className="text-right">
                               <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Tracking ID</div>
                               <div className="text-sm font-mono font-bold text-primary">{selectedShipment.trackingNumber || 'UNASSIGNED'}</div>
                            </div>
                         </div>
                         <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-relaxed">
                            Log: {format(new Date(selectedShipment.createdAt), 'EEEE, MMMM dd, yyyy @ HH:mm')}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                     <Package size={14} /> Manifest Items ({selectedShipment.items?.length || 0})
                   </h4>
                   <div className="border border-border max-h-[400px] overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                         <thead>
                            <tr className="bg-muted/50 border-b border-border sticky top-0 z-10">
                               <th className="px-4 py-3 text-[9px] font-bold uppercase text-muted-foreground">Product Detail</th>
                               <th className="px-4 py-3 text-[9px] font-bold uppercase text-muted-foreground text-center">QTY</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-border">
                            {selectedShipment.items?.map((item: any) => (
                              <tr key={item.id} className="bg-card">
                                 <td className="px-4 py-3">
                                    <div className="text-xs font-bold">{item.variant.product.name}</div>
                                    <div className="text-[9px] font-mono text-muted-foreground uppercase">{item.variant.sku} / {item.variant.size} - {item.variant.color}</div>
                                 </td>
                                 <td className="px-4 py-3 text-center">
                                    <span className="text-xs font-mono font-bold px-2 py-1 bg-secondary border border-border">
                                       {item.quantity}
                                    </span>
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
