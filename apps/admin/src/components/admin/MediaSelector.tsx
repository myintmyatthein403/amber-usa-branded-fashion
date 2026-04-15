import React from 'react';
import { Modal } from './Modal';
import { MediaLibrary } from '../../features/media/components/MediaLibrary';

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  selectedUrls?: string[];
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({ 
  isOpen, 
  onClose, 
  onSelect,
  selectedUrls = []
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Select Media"
      size="xl"
    >
      <div className="h-[70vh]">
        <MediaLibrary 
          selectionMode={true} 
          onSelect={(url) => {
            onSelect(url);
            onClose();
          }} 
          selectedUrls={selectedUrls}
        />
      </div>
    </Modal>
  );
};
