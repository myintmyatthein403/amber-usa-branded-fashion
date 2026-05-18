import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  ChevronLeft,
  ChevronDown,
  Menu,
  LogOut,
  BarChart3,
  Tag,
  Layers,
  Box,
  Shield,
  ChevronRight,
  Globe,
  Gift,
  Ticket,
  MessageSquare,
  Truck,
  Megaphone,
  Lock,
  Image as ImageIcon
} from 'lucide-react';
import { useAdminUIStore } from '../../store/useAdminUIStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { extractRoleString } from '../../lib/utils';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'dashboard' | 'products' | 'categories' | 'brands' | 'variants' | 'hero' | 'mission' | 'gift-card-section' | 'sale-section' | 'footer-section' | 'testimonials' | 'community-posts' | 'collections' | 'coupons' | 'gift-cards' | 'sales' | 'reviews' | 'orders' | 'customers' | 'staff' | 'roles' | 'settings' | 'delivery-methods' | 'ads' | 'warehouses' | 'cargo' | 'inventory' | 'media';


interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  tabId?: Tab;
  roles?: string[];
  permissions?: string[];
  subItems?: { id: Tab, label: string, icon?: any, roles?: string[], permissions?: string[] }[];
}

const sidebarConfig: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tabId: 'dashboard' },
  { 
    id: 'catalog', 
    label: 'Catalog', 
    icon: ShoppingBag,
    subItems: [
      { id: 'products', label: 'Products', icon: ShoppingBag, permissions: ['products:read'] },
      { id: 'categories', label: 'Categories', icon: Tag, permissions: ['categories:manage'] },
      { id: 'brands', label: 'Brands', icon: Tag, permissions: ['brands:manage'] },
      { id: 'variants', label: 'Variants', icon: Layers, permissions: ['products:write'] },
    ]
  },
  { 
    id: 'logistics', 
    label: 'Logistics', 
    icon: Truck,
    subItems: [
      { id: 'warehouses', label: 'Warehouses', icon: Box, permissions: ['logistics:manage'] },
      { id: 'inventory', label: 'Inventory Ledger', icon: Layers, permissions: ['logistics:manage'] },
      { id: 'cargo', label: 'Cargo Shipments', icon: Truck, permissions: ['logistics:manage'] },
    ]
  },
  { 
    id: 'operations', 
    label: 'Operations', 
    icon: BarChart3,
    subItems: [
      { id: 'orders', label: 'Orders', icon: ShoppingBag, permissions: ['orders:manage'] },
      { id: 'reviews', label: 'Reviews', icon: MessageSquare, permissions: ['reviews:manage'] },
      { id: 'delivery-methods', label: 'Delivery Setup', icon: Truck, permissions: ['settings:manage'] },
      { id: 'customers', label: 'Customers', icon: Users, permissions: ['staff:manage'] },
    ]
  },
  { 
    id: 'marketing', 
    label: 'Marketing', 
    icon: Ticket,
    subItems: [
      { id: 'sales', label: 'Sales Campaigns', icon: Tag, permissions: ['sales:manage'] },
      { id: 'coupons', label: 'Discount Codes', icon: Ticket, permissions: ['coupons:manage'] },
      { id: 'gift-cards', label: 'Gift Cards', icon: Gift, permissions: ['giftcards:manage'] },
      { id: 'ads', label: 'Ads Management', icon: Megaphone, permissions: ['ads:manage'] },
      { id: 'collections', label: 'Collections', icon: Layers, permissions: ['collections:manage'] },
    ]
  },
  { 
    id: 'website', 
    label: 'Website', 
    icon: Globe,
    subItems: [
      { id: 'hero', label: 'Hero Section', icon: ShoppingBag, permissions: ['content:manage'] },
      { id: 'mission', label: 'Mission Section', icon: ShoppingBag, permissions: ['content:manage'] },
      { id: 'gift-card-section', label: 'Gift Card Banner', icon: Gift, permissions: ['content:manage'] },
      { id: 'sale-section', label: 'Sale Event Section', icon: Tag, permissions: ['content:manage'] },
      { id: 'testimonials', label: 'Testimonials', icon: MessageSquare, permissions: ['content:manage'] },
      { id: 'community-posts', label: 'Community Posts', icon: Users, permissions: ['community:manage'] },
      { id: 'footer-section', label: 'Footer Settings', icon: Settings, permissions: ['content:manage'] },
      { id: 'media', label: 'Media Repository', icon: ImageIcon, permissions: ['content:manage'] },
    ]
  },
  { 
    id: 'system', 
    label: 'Access Control', 
    icon: Settings,
    roles: ['SUPERADMIN'],
    subItems: [
      { id: 'staff', label: 'Staff Directory', icon: Shield, roles: ['SUPERADMIN'], permissions: ['staff:manage'] },
      { id: 'roles', label: 'Roles & Permissions', icon: Lock, roles: ['SUPERADMIN'], permissions: ['roles:manage'] },
      { id: 'settings', label: 'Global Settings', icon: Settings, roles: ['SUPERADMIN'], permissions: ['settings:manage'] },
    ]
  },
];

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, toggleSidebar, activeTab, setActiveTab, logout, user, pendingOrdersCount } = useAdminUIStore();
  
   const userRole = extractRoleString(user);
   const userPermissions = user?.permissions || [];
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  useEffect(() => {
    if (userRole === 'SUPERADMIN') {
      setExpandedGroups(['catalog', 'logistics', 'operations', 'marketing', 'website', 'system']);
    } else {
      setExpandedGroups([]);
    }
  }, [userRole]);

  const checkAccess = (item: { id: string, roles?: string[], permissions?: string[] }) => {
    const isAdmin = userRole?.toUpperCase() === 'SUPERADMIN';
    if (isAdmin) return true;

    // Check Roles if specified
    if (item.roles) {
      if (!userRole) return false;
      const normalizedUserRole = userRole.toUpperCase();
      return item.roles.some(r => r.toUpperCase() === normalizedUserRole);
    }

    // Check Permissions if specified
    if (item.permissions && item.permissions.length > 0) {
      return item.permissions.some(p => userPermissions.includes(p));
    }

    return true;
  };

  const isSuperAdmin = userRole?.toUpperCase() === 'SUPERADMIN';
  const filteredSidebarConfig = isSuperAdmin 
    ? sidebarConfig
    : sidebarConfig
        .filter(item => {
          // If it's a group, check if it has any accessible subItems
          if (item.subItems) {
            const accessibleSubItems = item.subItems.filter(sub => checkAccess(sub));
            return accessibleSubItems.length > 0;
          }
          return checkAccess(item);
        })
        .map(item => ({
          ...item,
          subItems: item.subItems?.filter(sub => checkAccess(sub))
        }));

  // Auto-expand group if a sub-item is active
  useEffect(() => {
    filteredSidebarConfig.forEach(item => {
      if (item.subItems?.some(sub => sub.id === activeTab)) {
        if (!expandedGroups.includes(item.id)) {
          setExpandedGroups(prev => [...prev, item.id]);
        }
      }
    });
  }, [activeTab]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.subItems) {
      toggleGroup(item.id);
    } else if (item.tabId) {
      setActiveTab(item.tabId);
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 rounded-none",
        isSidebarOpen ? "w-72" : "w-20"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-sidebar-border">
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-serif text-2xl tracking-[0.2em] text-sidebar-foreground uppercase leading-none">Amber</span>
              <span className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase mt-1">Management</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 text-muted-foreground hover:text-sidebar-foreground transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-10 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredSidebarConfig.map((item) => {
            const isExpanded = expandedGroups.includes(item.id);
            const isAnySubItemActive = item.subItems?.some(sub => sub.id === activeTab);
            const isActive = item.tabId === activeTab || isAnySubItemActive;

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3 transition-all relative group rounded-none",
                    isActive && !item.subItems
                      ? "text-primary"
                      : "text-muted-foreground hover:text-sidebar-foreground"
                  )}
                >
                  {isActive && !item.subItems && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 w-[2px] h-6 bg-primary"
                    />
                  )}
                  <item.icon size={18} className={cn(
                    "transition-colors",
                    isActive ? "text-primary" : "group-hover:text-sidebar-foreground"
                  )} />
                  {isSidebarOpen && (
                    <>
                      <span className="flex-1 text-[11px] font-bold tracking-[0.2em] uppercase text-left">
                        {item.label}
                      </span>
                      {item.subItems && (
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={14} className="text-muted-foreground" />
                        </motion.div>
                      )}
                    </>
                  )}
                </button>

                {/* Sub Items */}
                <AnimatePresence initial={false}>
                  {isSidebarOpen && item.subItems && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="ml-9 border-l border-sidebar-border/50 py-1 space-y-1">
                        {item.subItems.map((subItem) => {
                          const isSubActive = activeTab === subItem.id;
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => setActiveTab(subItem.id)}
                              className={cn(
                                "w-full flex items-center gap-3 px-6 py-2 transition-all relative group rounded-none",
                                isSubActive
                                  ? "text-primary font-bold"
                                  : "text-muted-foreground hover:text-sidebar-foreground"
                              )}
                            >
                              {isSubActive && (
                                <motion.div
                                  layoutId="activeSubNav"
                                  className="absolute left-0 w-[2px] h-4 bg-primary"
                                />
                              )}
                              <span className="text-[10px] font-bold tracking-[0.15em] uppercase">
                                {subItem.label}
                              </span>
                              {subItem.id === 'orders' && pendingOrdersCount > 0 && (
                                <span className="ml-auto bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
                                  {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-sidebar-border">
          <button
            onClick={logout}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3.5 text-muted-foreground hover:text-destructive transition-all rounded-none",
              !isSidebarOpen && "justify-center"
            )}>
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
