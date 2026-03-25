import React, { useEffect, useState } from 'react';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { BrandsPage } from './pages/BrandsPage';
import { VariantsPage } from './pages/VariantsPage';
import { HeroPage } from './pages/HeroPage';
import { MissionPage } from './pages/MissionPage';
import { GiftCardSectionPage } from './pages/GiftCardSectionPage';
import { SaleSectionPage } from './pages/SaleSectionPage';
import { FooterSectionPage } from './pages/FooterSectionPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { CommunityPostsPage } from './pages/CommunityPostsPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CouponsPage } from './pages/CouponsPage';
import { GiftCardsPage } from './pages/GiftCardsPage';
import { SalesPage } from './pages/SalesPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DeliveryMethodsPage } from './pages/DeliveryMethodsPage';
import { AdsPage } from './pages/AdsPage';
import { UsersPage } from './pages/UsersPage';
import { RolesPage } from './pages/RolesPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { OrdersPage } from './pages/OrdersPage';
import { WarehousesPage } from './pages/WarehousesPage';
import { CargoPage } from './pages/CargoPage';
import { InventoryPage } from './pages/InventoryPage';
import { MediaPage } from './pages/MediaPage';
import { useAdminUIStore } from './store/useAdminUIStore';
import { apiService } from './services/api.service';
import { API_ROUTES } from './config/constants';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign,
  Loader2,
  ShieldAlert
} from 'lucide-react';

const TAB_PERMISSIONS: Record<string, string[]> = {
  products: ['products:read'],
  categories: ['categories:manage'],
  brands: ['brands:manage'],
  variants: ['products:write'],
  orders: ['orders:manage'],
  warehouses: ['settings:manage'],
  inventory: ['settings:manage'],
  cargo: ['orders:manage'],
  reviews: ['reviews:manage'],
  sales: ['marketing:manage'],
  coupons: ['marketing:manage'],
  giftcards: ['giftcards:manage'],
  ads: ['ads:manage'],
  collections: ['marketing:manage'],
  hero: ['content:manage'],
  mission: ['content:manage'],
  'gift-card-section': ['content:manage'],
  'sale-section': ['content:manage'],
  testimonials: ['content:manage'],
  'community-posts': ['community:manage'],
  'footer-section': ['content:manage'],
  staff: ['staff:manage'],
  roles: ['roles:manage'],
  settings: ['settings:manage'],
  'delivery-methods': ['settings:manage'],
  media: ['content:manage'],
};

const AccessDenied = () => (
  <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
    <div className="w-20 h-20 bg-destructive/10 flex items-center justify-center rounded-full">
      <ShieldAlert size={40} className="text-destructive" />
    </div>
    <div className="text-center space-y-2">
      <h2 className="text-3xl font-serif text-foreground tracking-tight">Access Restricted</h2>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed italic">
        "Your current administrative role does not have the required permissions to view this module. Please contact a Superadmin to elevate your access."
      </p>
    </div>
  </div>
);

// ... stats and Dashboard remains same

function App() {
  const { activeTab, setActiveTab, isAuthenticated, token, logout, user, updateUser, setPendingOrdersCount, pendingOrdersCount } = useAdminUIStore();
  const [initializing, setInitializing] = useState(true);

  // Update browser title
  useEffect(() => {
    if (pendingOrdersCount > 0) {
      document.title = `(${pendingOrdersCount}) New Orders | Amber Admin`;
    } else {
      document.title = 'Amber Admin';
    }
  }, [pendingOrdersCount]);

  const hasAccess = (tab: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPERADMIN') return true;
    
    const required = TAB_PERMISSIONS[tab];
    if (!required) return true; // Public tabs like dashboard
    
    const userPerms = user.permissions || user.role?.permissions || [];
    return required.some(p => userPerms.includes(p));
  };

  // Sync permissions and pending count live from backend
  useEffect(() => {
    const syncData = async () => {
      if (!isAuthenticated || !token) {
        setInitializing(false);
        return;
      }

      try {
        const [profile, pendingCount] = await Promise.all([
          apiService(API_ROUTES.AUTH.PROFILE),
          apiService(API_ROUTES.ORDERS.PENDING_COUNT)
        ]);
        updateUser(profile);
        setPendingOrdersCount(pendingCount);
      } catch (error) {
        console.error('Failed to sync backend data:', error);
        if ((error as any).message?.includes('401')) {
          logout();
        }
      } finally {
        setInitializing(false);
      }
    };

    syncData();
    const interval = setInterval(() => {
      if (isAuthenticated) syncData();
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token, updateUser, logout, setPendingOrdersCount]);

  // Sync activeTab with URL on mount
  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, '');
    const validTabs: any[] = ['dashboard', 'products', 'categories', 'brands', 'variants', 'hero', 'mission', 'gift-card-section', 'sale-section', 'footer-section', 'testimonials', 'community-posts', 'collections', 'coupons', 'gift-cards', 'sales', 'reviews', 'orders', 'customers', 'staff', 'roles', 'settings', 'delivery-methods', 'ads', 'warehouses', 'cargo', 'inventory', 'media'];
    
    if (validTabs.includes(path)) {
      setActiveTab(path as any);
    } else if (path === '') {
      setActiveTab('dashboard');
    }
  }, [setActiveTab]);

  // Sync URL with activeTab
  useEffect(() => {
    if (isAuthenticated) {
      const path = activeTab === 'dashboard' ? '/' : `/${activeTab}`;
      if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
    }
  }, [activeTab, isAuthenticated]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActivePage = () => {
    if (!hasAccess(activeTab)) {
      return <AccessDenied />;
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <ProductsPage />;
      case 'categories': return <CategoriesPage />;
      case 'brands': return <BrandsPage />;
      case 'variants': return <VariantsPage />;
      case 'hero': return <HeroPage />;
      case 'mission': return <MissionPage />;
      case 'gift-card-section': return <GiftCardSectionPage />;
      case 'sale-section': return <SaleSectionPage />;
      case 'footer-section': return <FooterSectionPage />;
      case 'testimonials': return <TestimonialsPage />;
      case 'community-posts': return <CommunityPostsPage />;
      case 'collections': return <CollectionsPage />;
      case 'coupons': return <CouponsPage />;
      case 'gift-cards': return <GiftCardsPage />;
      case 'sales': return <SalesPage />;
      case 'reviews': return <ReviewsPage />;
      case 'settings': return <SettingsPage />;
      case 'delivery-methods': return <DeliveryMethodsPage />;
      case 'ads': return <AdsPage />;
      case 'orders': return <OrdersPage />;
      case 'warehouses': return <WarehousesPage />;
      case 'inventory': return <InventoryPage />;
      case 'cargo': return <CargoPage />;
      case 'customers': return <UsersPage mode="customers" />;
      case 'staff': return <UsersPage mode="staff" />;
      case 'roles': return <RolesPage />;
      case 'media': return <MediaPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <AdminLayout>
      {renderActivePage()}
    </AdminLayout>
  );
}

export default App;
