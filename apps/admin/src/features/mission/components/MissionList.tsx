import React from 'react';
import { MissionSection } from '../schema';
import { MissionCard } from './MissionCard';

interface MissionListProps {
  missions: MissionSection[] | null;
  loading: boolean;
  onEdit: (mission: MissionSection) => void;
  onDelete: (id: string) => void;
  onToggleActive: (mission: MissionSection) => void;
}

export const MissionList: React.FC<MissionListProps> = ({
  missions,
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

  if (!missions || missions.length === 0) {
    return (
      <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">
        No mission designs found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
};
