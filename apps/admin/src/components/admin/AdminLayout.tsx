import React from 'react';
import { Sidebar } from './Sidebar';
import { useAdminUIStore } from '../../store/useAdminUIStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { extractRoleString } from '../../lib/utils';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isSidebarOpen, activeTab, user } = useAdminUIStore();
  const userRole = extractRoleString(user);
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-all duration-300">
      <Sidebar />
      <main 
        className={cn(
          "flex-1 transition-all duration-300 min-h-screen",
          isSidebarOpen ? "ml-72" : "ml-20"
        )}
      >
        <header className="h-20 flex items-center justify-between px-10 border-b border-header-border bg-header backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none mb-1.5">Overview</span>
            <h1 className="text-2xl font-serif text-foreground tracking-tight capitalize">{activeTab}</h1>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 pl-8 border-l border-header-border">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold tracking-wider text-foreground uppercase">{user?.name || 'Admin User'}</span>
                <span className="text-[10px] font-medium text-primary uppercase tracking-widest">{userRole || 'Staff Account'}</span>
              </div>
              <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center text-xs font-bold tracking-tighter">
                {userInitials}
              </div>
            </div>
          </div>
        </header>

        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
};
