import React from 'react';
import { Loader2, Info } from 'lucide-react';
import { useSettings } from '../features/settings/hooks/useSettings';
import { SettingsHeader } from '../features/settings/components/SettingsHeader';
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

      <div className="grid grid-cols-1 gap-12">
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
