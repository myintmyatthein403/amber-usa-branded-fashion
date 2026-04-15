import React from 'react';
import { FooterSection } from '../schema';
import { FooterCard } from './FooterCard';

interface FooterListProps {
  sections: FooterSection[] | null;
  loading: boolean;
  onEdit: (section: FooterSection) => void;
  onDelete: (id: string) => void;
  onToggleActive: (section: FooterSection) => void;
}

export const FooterList: React.FC<FooterListProps> = ({
  sections,
  loading,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  if (loading) {
    return (
      <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">
        Querying Experience Vault...
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">
        No footer designs found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {sections.map((section) => (
        <FooterCard
          key={section.id}
          section={section}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
};
