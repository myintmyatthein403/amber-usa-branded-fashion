import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface PolicySettingsProps {
  type: 'privacy' | 'terms';
  value: string;
  onChange: (value: string) => void;
  modules: any;
}

export const PolicySettings: React.FC<PolicySettingsProps> = ({
  type,
  value,
  onChange,
  modules,
}) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-primary/10 text-primary">
          {isPrivacy ? <ShieldCheck size={20} /> : <FileText size={20} />}
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">
            {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
            {isPrivacy 
              ? 'Manage how you handle customer data and privacy.' 
              : 'Define the legal agreement between you and your customers.'}
          </p>
        </div>
      </div>
      
      <div className="border border-border bg-card focus-within:border-primary transition-colors duration-300 min-h-[400px]">
        <ReactQuill 
          theme="snow" 
          value={value} 
          onChange={onChange} 
          modules={modules} 
          className="[&_.ql-editor]:min-h-[350px] font-sans" 
        />
      </div>
    </div>
  );
};
