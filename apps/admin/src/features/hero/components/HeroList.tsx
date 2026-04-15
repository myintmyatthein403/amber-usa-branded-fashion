import React from 'react';
import { HeroSection } from '../schema';
import { HeroCard } from './HeroCard';

interface HeroListProps {
  heroes: HeroSection[] | null;
  loading: boolean;
  onEdit: (hero: HeroSection) => void;
  onDelete: (id: string) => void;
  onToggleActive: (hero: HeroSection) => void;
}

export const HeroList: React.FC<HeroListProps> = ({
  heroes,
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

  if (!heroes || heroes.length === 0) {
    return (
      <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">
        No hero designs found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {heroes.map((hero) => (
        <HeroCard
          key={hero.id}
          hero={hero}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
};
