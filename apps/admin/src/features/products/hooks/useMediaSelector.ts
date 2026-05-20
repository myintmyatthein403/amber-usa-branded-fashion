import { useState, useCallback } from 'react';

type MediaTarget = 'product' | 'variant';

export const useMediaSelector = (
  productImages: string[],
  variantImages: string[]
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<MediaTarget>('product');
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const openProductMedia = useCallback((index?: number) => {
    setTarget('product');
    setReplacingIndex(index ?? null);
    setIsOpen(true);
  }, []);

  const openVariantMedia = useCallback(() => {
    setTarget('variant');
    setReplacingIndex(null);
    setIsOpen(true);
  }, []);

  const closeMedia = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = useCallback((url: string) => {
    // The actual image update is handled by parent component
    // This just closes the modal and resets
    setIsOpen(false);
  }, []);

  const currentImages = target === 'product' ? productImages : variantImages;

  return {
    isOpen,
    target,
    replacingIndex,
    openProductMedia,
    openVariantMedia,
    closeMedia,
    handleSelect,
    currentImages,
  };
};