import React from 'react';
import { Loader2, Instagram, Facebook, MapPin, Phone, Mail } from 'lucide-react';
import { FooterSection, CreateFooterInput } from '../schema';

interface FooterFormProps {
  formData: CreateFooterInput;
  setFormData: React.Dispatch<React.SetStateAction<CreateFooterInput>>;
  submitting: boolean;
  editingSection: FooterSection | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const FooterForm: React.FC<FooterFormProps> = ({
  formData,
  setFormData,
  submitting,
  editingSection,
  onSubmit,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 py-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Company Name</label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Company Subtitle</label>
            <input
              type="text"
              required
              value={formData.companySubtitle}
              onChange={(e) => setFormData({ ...formData, companySubtitle: e.target.value })}
              className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Narrative Description</label>
          <textarea
            value={formData.companyDescription}
            onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
            className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
           <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Social Links</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Instagram size={16} className="text-muted-foreground" />
                  <input type="text" placeholder="Instagram URL" value={formData.instagramUrl} onChange={(e) => setFormData({...formData, instagramUrl: e.target.value})} className="flex-1 border-b border-border bg-transparent p-1 text-xs outline-none focus:border-primary" />
                </div>
                <div className="flex items-center gap-3">
                  <Facebook size={16} className="text-muted-foreground" />
                  <input type="text" placeholder="Facebook URL" value={formData.facebookUrl} onChange={(e) => setFormData({...formData, facebookUrl: e.target.value})} className="flex-1 border-b border-border bg-transparent p-1 text-xs outline-none focus:border-primary" />
                </div>
              </div>
           </div>
           <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Contact Details</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-muted-foreground" />
                  <input type="text" placeholder="Physical Address" value={formData.contactAddress} onChange={(e) => setFormData({...formData, contactAddress: e.target.value})} className="flex-1 border-b border-border bg-transparent p-1 text-xs outline-none focus:border-primary" />
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-muted-foreground" />
                  <input type="text" placeholder="Phone Number" value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} className="flex-1 border-b border-border bg-transparent p-1 text-xs outline-none focus:border-primary" />
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-muted-foreground" />
                  <input type="email" placeholder="Email Address" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} className="flex-1 border-b border-border bg-transparent p-1 text-xs outline-none focus:border-primary" />
                </div>
              </div>
           </div>
        </div>

        <div className="space-y-2 pt-6 border-t border-border">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Copyright Notice</label>
          <input
            type="text"
            value={formData.copyrightText}
            onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
            className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <button type="button" onClick={onCancel} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
        <button
          type="submit"
          disabled={submitting}
          className="bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:opacity-50"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : editingSection ? 'Commit Changes' : 'Initialize Design'}
        </button>
      </div>
    </form>
  );
};
