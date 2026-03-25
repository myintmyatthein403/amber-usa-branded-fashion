import React, { useEffect, useState, useMemo } from 'react';
import { Settings as SettingsIcon, Save, Loader2, ShieldCheck, FileText, Info, Eye, EyeOff, CreditCard } from 'lucide-react';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface Settings {
  id: string;
  privacyPolicy: string | null;
  termsConditions: string | null;
  usdToMmkRate: string;
  stripePublishableKey: string | null;
  stripeSecretKey: string | null;
  stripeWebhookSecret: string | null;
}

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [usdToMmkRate, setUsdToMmkRate] = useState('3500');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiService(API_ROUTES.SETTINGS);
        setSettings(data);
        setPrivacyPolicy(data.privacyPolicy || '');
        setTermsConditions(data.termsConditions || '');
        setUsdToMmkRate(data.usdToMmkRate?.toString() || '3500');
        setStripePublishableKey(data.stripePublishableKey || '');
        setStripeSecretKey(data.stripeSecretKey || '');
        setStripeWebhookSecret(data.stripeWebhookSecret || '');
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    try {
      await apiService(API_ROUTES.SETTINGS, {
        method: 'PATCH',
        body: {
          privacyPolicy,
          termsConditions,
          usdToMmkRate: parseFloat(usdToMmkRate),
          stripePublishableKey,
          stripeSecretKey,
          stripeWebhookSecret,
        },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'clean']
    ],
  }), []);

  const [showSecret, setShowSecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Accessing Global Configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Global Configuration</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Store Settings & Policies</h2>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5 disabled:opacity-50"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {success ? 'Configuration Synced' : 'Sync Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Currency Configuration */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2 bg-primary/10 text-primary">
              <SettingsIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Currency & Exchange Rate</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Manage store currency conversion for Myanmar Market.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card border border-border p-8">
            <div className="space-y-4">
               <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground block">USD to MMK Exchange Rate</label>
               <div className="flex items-center gap-4">
                  <div className="text-2xl font-serif text-muted-foreground">1 USD =</div>
                  <input 
                    type="number" 
                    value={usdToMmkRate} 
                    onChange={(e) => setUsdToMmkRate(e.target.value)}
                    className="flex-1 h-12 border-b border-input bg-transparent px-0 py-2 text-2xl font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
                    placeholder="3500"
                  />
                  <div className="text-2xl font-serif">MMK</div>
               </div>
               <p className="text-[9px] text-muted-foreground italic mt-2">* This rate will be used to automatically convert product prices for Myanmar customers.</p>
            </div>
          </div>
        </div>

        {/* Stripe Configuration */}
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
                  value={stripePublishableKey} 
                  onChange={(e) => setStripePublishableKey(e.target.value)}
                  className="w-full h-12 border-b border-input bg-transparent px-0 py-2 font-mono text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
                  placeholder="pk_test_..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground block">Secret Key</label>
                <div className="relative">
                  <input 
                    type={showSecret ? "text" : "password"}
                    value={stripeSecretKey} 
                    onChange={(e) => setStripeSecretKey(e.target.value)}
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
                    value={stripeWebhookSecret} 
                    onChange={(e) => setStripeWebhookSecret(e.target.value)}
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

        {/* Privacy Policy */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2 bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Privacy Policy</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Manage how you handle customer data and privacy.</p>
            </div>
          </div>
          
          <div className="border border-border bg-card focus-within:border-primary transition-colors duration-300 min-h-[400px]">
            <ReactQuill 
              theme="snow" 
              value={privacyPolicy} 
              onChange={setPrivacyPolicy} 
              modules={quillModules} 
              className="[&_.ql-editor]:min-h-[350px] font-sans" 
            />
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2 bg-primary/10 text-primary">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Terms & Conditions</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Define the legal agreement between you and your customers.</p>
            </div>
          </div>
          
          <div className="border border-border bg-card focus-within:border-primary transition-colors duration-300 min-h-[400px]">
            <ReactQuill 
              theme="snow" 
              value={termsConditions} 
              onChange={setTermsConditions} 
              modules={quillModules} 
              className="[&_.ql-editor]:min-h-[350px] font-sans" 
            />
          </div>
        </div>

        <div className="bg-muted/30 p-8 border border-border flex items-start gap-6">
          <div className="p-3 bg-primary/10 text-primary rounded-full">
            <Info size={24} />
          </div>
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">Aesthetic Guidance</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              Changes made here will be instantly reflected on the frontend legal pages. 
              We recommend using a clean, professional tone and maintaining consistent formatting 
              using the typography tools above. Ensure your policies comply with both Myanmar 
              retail regulations and international digital standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
