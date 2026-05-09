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
    usdToMmkRate: '3500',
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService<unknown, Settings>(API_ROUTES.SETTINGS);
      setSettings(data);
      setFormData({
        privacyPolicy: data?.privacyPolicy || '',
        termsConditions: data?.termsConditions || '',
        usdToMmkRate: String(data?.usdToMmkRate || '3500'),
        stripePublishableKey: data?.stripePublishableKey || '',
        stripeSecretKey: data?.stripeSecretKey || '',
        stripeWebhookSecret: data?.stripeWebhookSecret || '',
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
      await apiService(API_ROUTES.SETTINGS, {
        method: 'PATCH',
        body: {
          ...formData,
          usdToMmkRate: parseFloat(formData.usdToMmkRate),
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

  const updateField = useCallback((field: string, value: any) => {
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
    updateField,
    handleSubmit,
    quillModules,
  };
};
