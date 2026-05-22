import { useState } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { Collection } from './schema';

export const useCollections = () => {
  const { data: collections, loading, refresh } = useFetch<Collection>(API_ROUTES.COLLECTIONS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.COLLECTIONS.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    slug: '', 
    description: '', 
    image: '', 
    isActive: true 
  });

   const uploadFile = async (file: File): Promise<string | null> => {
     const data = new FormData();
     data.append('file', file);
     setUploading(true);
     try {
       const response = await apiService<FormData, { url: string }>(API_ROUTES.UPLOAD, {
         method: 'POST',
         body: data,
         isMultipart: true
       });
       return `${import.meta.env.VITE_API_URL}${response.url}`;
     } catch (error) {
       console.error('Upload error:', error);
       return null;
     } finally {
       setUploading(false);
     }
   };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadFile(e.target.files[0]);
      if (url) {
        setFormData(prev => ({ ...prev, image: url }));
      }
    }
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    setFormData(prev => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingCollection 
        ? API_ROUTES.COLLECTIONS.BY_ID(editingCollection.id)
        : API_ROUTES.COLLECTIONS.BASE;
      
      const method = editingCollection ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      setEditingCollection(null);
      setFormData({ name: '', slug: '', description: '', image: '', isActive: true });
      refresh();
    } catch (error) {
      console.error('Failed to save collection:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure? This will remove the collection but not the products within it.');
    if (!confirmed) return;
    const success = await deleteItem(id);
    if (success) refresh();
  };

  const openAddModal = () => {
    setEditingCollection(null);
    setFormData({ name: '', slug: '', description: '', image: '', isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({ 
      name: collection.name, 
      slug: collection.slug,
      description: collection.description || '',
      image: collection.image || '', 
      isActive: collection.isActive 
    });
    setModalOpen(true);
  };

  return {
    collections,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    uploading,
    editingCollection,
    formData,
    setFormData,
    handleFileChange,
    handleNameChange,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal
  };
};
