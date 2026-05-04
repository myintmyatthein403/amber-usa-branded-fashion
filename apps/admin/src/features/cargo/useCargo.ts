import { useState } from 'react';
import { useFetch } from '../../hooks/useCrud';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { CargoShipment, Variant, Warehouse } from './schema';

export const useCargo = () => {
  const { data: shipments, loading, refresh } = useFetch<CargoShipment>(API_ROUTES.LOGISTICS.CARGO);
  const { data: warehouses } = useFetch<Warehouse>(API_ROUTES.LOGISTICS.WAREHOUSES);
  const { data: variants } = useFetch<Variant>(API_ROUTES.VARIANTS.BASE);

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
      const data = await apiService(API_ROUTES.LOGISTICS.CARGO_BY_ID(id)) as CargoShipment;
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
        const updated = await apiService(API_ROUTES.LOGISTICS.CARGO_BY_ID(id)) as CargoShipment;
        setSelectedShipment(updated);
      }
      refresh();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setUpdating(false);
    }
  };

  return {
    shipments,
    loading,
    refresh,
    warehouses,
    variants,
    modalOpen,
    setModalOpen,
    detailsModalOpen,
    setDetailsModalOpen,
    selectedShipment,
    updating,
    submitting,
    formData,
    setFormData,
    selectedVariantId,
    setSelectedVariantId,
    selectedQuantity,
    setSelectedQuantity,
    addItem,
    removeItem,
    handleCreateShipment,
    openDetails,
    handleUpdateStatus
  };
};
