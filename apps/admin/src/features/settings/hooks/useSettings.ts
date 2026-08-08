import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '../../../services/api.service';
import { API_ROUTES } from '../../../config/constants';
import { Settings } from '../schema';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    privacyPolicy: '',
    termsConditions: '',
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    codDepositAmount: '',
    codDepositOrderThreshold: '',
  });

  const [rateMeta, setRateMeta] = useState<{
    rateUpdatedAt?: string | null;
    isManualOverride?: boolean;
  }>({});

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService<unknown, { data: Settings }>(API_ROUTES.SETTINGS);
      const data = response.data;
      setSettings(data);
      setFormData({
        privacyPolicy: data?.privacyPolicy || '',
        termsConditions: data?.termsConditions || '',
        stripePublishableKey: data?.stripePublishableKey || '',
        stripeSecretKey: data?.stripeSecretKey || '',
        stripeWebhookSecret: data?.stripeWebhookSecret || '',
        codDepositAmount:
          data?.codDepositAmount != null ? String(data.codDepositAmount) : '',
        codDepositOrderThreshold:
          data?.codDepositOrderThreshold != null
            ? String(data.codDepositOrderThreshold)
            : '',
      });
      setRateMeta({
        rateUpdatedAt: (data as Settings & { rateUpdatedAt?: string })?.rateUpdatedAt ?? null,
        isManualOverride: (data as Settings & { isManualOverride?: boolean })?.isManualOverride ?? false,
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    try {
      const { privacyPolicy, termsConditions, stripePublishableKey, stripeSecretKey, stripeWebhookSecret, codDepositAmount, codDepositOrderThreshold } = formData;
      await apiService(API_ROUTES.SETTINGS, {
        method: 'PATCH',
        body: {
          privacyPolicy,
          termsConditions,
          stripePublishableKey,
          stripeSecretKey,
          stripeWebhookSecret,
          codDepositAmount: codDepositAmount === '' ? null : Number(codDepositAmount),
          codDepositOrderThreshold:
            codDepositOrderThreshold === '' ? null : Number(codDepositOrderThreshold),
        },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await fetchSettings();
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = useCallback((field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'clean']
    ],
  }), []);

  return {
    settings,
    loading,
    submitting,
    success,
    formData,
    rateMeta,
    updateField,
    handleSubmit,
    quillModules,
  };
};
