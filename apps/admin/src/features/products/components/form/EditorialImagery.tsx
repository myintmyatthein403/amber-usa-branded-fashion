import React from 'react';
import { Image as ImageIcon, Link as LinkIcon, Plus, X } from 'lucide-react';

interface EditorialImageryProps {
  images: string[];
  onChange: (images: string[]) => void;
  onOpenMedia: (index?: number) => void;
}

export const EditorialImagery: React.FC<EditorialImageryProps> = ({
  images,
  onChange,
  onOpenMedia
}) => {
  const [urlInput, setUrlInput] = React.useState('');

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const addImageUrl = () => {
    if (urlInput.trim()) {
      onChange([...images, urlInput.trim()]);
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2">
            <ImageIcon size={14} /> Editorial Imagery
          </label>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Click an image to replace, or use the (+) to add more.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Paste Image URL..." 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
              className="h-8 pl-8 pr-3 bg-card border border-border text-[10px] w-64 focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <button 
            type="button"
            onClick={addImageUrl}
            className="h-8 px-4 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors"
          >
            Link
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((url, index) => (
          <div key={index} className="group relative aspect-square bg-secondary border border-border overflow-hidden cursor-pointer">
            <img 
              src={url} 
              alt={`Product ${index}`} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              onClick={() => onOpenMedia(index)}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="text-[9px] text-white font-bold uppercase tracking-[0.2em]">Change</span>
            </div>
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); removeImage(index); }}
              className="absolute top-2 right-2 p-1.5 bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground z-10"
            >
              <X size={12} />
            </button>
            {index === 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[8px] font-bold uppercase tracking-widest text-center py-1">
                Primary
              </div>
            )}
          </div>
        ))}
        <button 
          type="button"
          onClick={() => onOpenMedia()}
          className="aspect-square border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300 group"
        >
          <Plus size={24} className="group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Add Image</span>
        </button>
      </div>
    </div>
  );
};
