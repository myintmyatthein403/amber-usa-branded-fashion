import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface ProductStorytellingProps {
  description: string;
  onChange: (value: string) => void;
}

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'clean']
  ],
};

export const ProductStorytelling: React.FC<ProductStorytellingProps> = ({
  description,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Editorial Storytelling</label>
      <div className="border border-input bg-card focus-within:border-primary transition-colors duration-300">
        <ReactQuill 
          theme="snow" 
          value={description} 
          onChange={onChange} 
          modules={quillModules} 
          className="[&_.ql-editor]:min-h-[150px]" 
        />
      </div>
    </div>
  );
};
