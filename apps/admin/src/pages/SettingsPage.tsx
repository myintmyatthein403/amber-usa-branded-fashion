import React from 'react';
import { Loader2, Info } from 'lucide-react';
import { useSettings } from '../features/settings/hooks/useSettings';
import { SettingsHeader } from '../features/settings/components/SettingsHeader';
import { CurrencySettings } from '../features/settings/components/CurrencySettings';
import { StripeSettings } from '../features/settings/components/StripeSettings';
import { PolicySettings } from '../features/settings/components/PolicySettings';

export const SettingsPage: React.FC = () => {
  const {
    loading,
    submitting,
    success,
    formData,
    rateMeta,
    updateField,
    handleSubmit,
    quillModules,
  } = useSettings();

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
      <SettingsHeader 
        onSave={handleSubmit}
        submitting={submitting}
        success={success}
      />

      <div className="flex items-start gap-3 p-4 border border-amber-500/30 bg-amber-500/5 text-sm text-muted-foreground">
        <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong className="text-foreground">USD/MMK rate:</strong> Prefer{' '}
          <a href="/currencies" className="text-primary underline">Currency Management</a>{' '}
          for live exchange rates. The field below syncs from the active USD→MMK pair and is kept for legacy storefront settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <CurrencySettings
          usdToMmkRate={formData.usdToMmkRate}
          rateUpdatedAt={rateMeta.rateUpdatedAt}
          isManualOverride={rateMeta.isManualOverride}
        />

        <StripeSettings 
          formData={formData as any}
          onUpdate={updateField}
        />

        <PolicySettings 
          type="privacy"
          value={formData.privacyPolicy}
          onChange={(val) => updateField('privacyPolicy', val)}
          modules={quillModules}
        />

        <PolicySettings 
          type="terms"
          value={formData.termsConditions}
          onChange={(val) => updateField('termsConditions', val)}
          modules={quillModules}
        />

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
