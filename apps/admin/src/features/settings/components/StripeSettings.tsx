import React, { useState } from 'react';
import { CreditCard, Eye, EyeOff } from 'lucide-react';

interface StripeSettingsProps {
  formData: any;
  onUpdate: (field: string, value: string) => void;
}

export const StripeSettings: React.FC<StripeSettingsProps> = ({
  formData,
  onUpdate,
}) => {
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-primary/10 text-primary">
          <CreditCard size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Stripe Payment Gateway</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Configure your credit card payment processing.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8 bg-card border border-border p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground block">Publishable Key</label>
            <input 
              type="text" 
              value={formData.stripePublishableKey} 
              onChange={(e) => onUpdate('stripePublishableKey', e.target.value)}
              className="w-full h-12 border-b border-input bg-transparent px-0 py-2 font-mono text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
              placeholder="pk_test_..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground block">Secret Key</label>
            <div className="relative">
              <input 
                type={showSecret ? "text" : "password"}
                value={formData.stripeSecretKey} 
                onChange={(e) => onUpdate('stripeSecretKey', e.target.value)}
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 font-mono text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none pr-10" 
                placeholder="sk_test_..."
              />
              <button 
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground block">Webhook Secret</label>
            <div className="relative">
              <input 
                type={showWebhookSecret ? "text" : "password"}
                value={formData.stripeWebhookSecret} 
                onChange={(e) => onUpdate('stripeWebhookSecret', e.target.value)}
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 font-mono text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none pr-10" 
                placeholder="whsec_..."
              />
              <button 
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showWebhookSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground italic">* Webhook URL: {window.location.origin.replace('admin.', '').replace(':5173', ':3001')}/api/stripe/webhook</p>
      </div>
    </div>
  );
};
