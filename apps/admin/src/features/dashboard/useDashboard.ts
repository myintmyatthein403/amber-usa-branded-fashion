import { useState, useEffect } from 'react';
import { useAdminUIStore } from '../../store/useAdminUIStore';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { 
  Users, 
  ShoppingBag, 
  DollarSign,
  AlertCircle,
  MapPin,
  Package,
  TrendingUp
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
}

interface RecentSale {
  id: string;
  customerName: string;
  email: string;
  amount: number;
  currency: string;
  date: string;
}

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

interface PopularCity {
  city: string;
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
}

interface InventoryTurnover {
  warehouse: string;
  totalOrders: number;
  totalRevenue: number;
  totalItemsSold: number;
  averageOrderValue: number;
  turnoverRate: number;
}

interface ConversionRate {
  totalVisitors: number;
  totalOrders: number;
  conversionRate: number;
}

export interface DisplaySale {
  id: string;
  customerName: string;
  email: string;
  amount: string;
  initials: string;
}

export const useDashboard = () => {
  const { pendingOrdersCount, setActiveTab, token } = useAdminUIStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [popularCities, setPopularCities] = useState<PopularCity[]>([]);
  const [inventoryTurnover, setInventoryTurnover] = useState<InventoryTurnover[]>([]);
  const [conversionRate, setConversionRate] = useState<ConversionRate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      
      try {
        const [dashboardResponse, citiesResponse, inventoryResponse, conversionResponse] = await Promise.all([
          apiService<null, {
            data: {
              stats: DashboardStats;
              recentSales: RecentSale[];
              chartData: ChartData[];
            }
          }>(API_ROUTES.STATS),
          apiService<null, { data: PopularCity[] }>(`${API_ROUTES.STATS}/popular-cities?limit=5`),
          apiService<null, { data: InventoryTurnover[] }>(`${API_ROUTES.STATS}/inventory-turnover?days=30`),
          apiService<null, { data: ConversionRate }>(`${API_ROUTES.STATS}/conversion-rate?days=30`),
        ]);

        setStats(dashboardResponse.data.stats);
        setRecentSales(dashboardResponse.data.recentSales);
        setChartData(dashboardResponse.data.chartData);
        setPopularCities(citiesResponse.data);
        setInventoryTurnover(inventoryResponse.data);
        setConversionRate(conversionResponse.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const displayStats = stats ? [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: `${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}%`,
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      label: 'New Orders',
      value: stats.pendingOrders.toString(),
      change: stats.pendingOrders > 0 ? 'Awaiting Fulfillment' : 'All caught up',
      icon: AlertCircle,
      color: stats.pendingOrders > 0 ? 'text-amber-500' : 'text-muted-foreground',
      action: stats.pendingOrders > 0 ? () => setActiveTab('orders') : undefined,
    },
    {
      label: 'Total Sales',
      value: stats.totalOrders.toLocaleString(),
      change: `${stats.ordersChange >= 0 ? '+' : ''}${stats.ordersChange}%`,
      icon: ShoppingBag,
      color: 'text-primary',
    },
    {
      label: 'Active Users',
      value: stats.totalCustomers.toLocaleString(),
      change: `${stats.customersChange >= 0 ? '+' : ''}${stats.customersChange}%`,
      icon: Users,
      color: 'text-primary',
    },
  ] : [
    { label: 'Total Revenue', value: '...', change: '', icon: DollarSign, color: 'text-primary' },
    { label: 'New Orders', value: '...', change: 'Loading...', icon: AlertCircle, color: 'text-muted-foreground' },
    { label: 'Total Sales', value: '...', change: '', icon: ShoppingBag, color: 'text-primary' },
    { label: 'Active Users', value: '...', change: '', icon: Users, color: 'text-primary' },
  ];

  const displayRecentSales: DisplaySale[] = (recentSales?.length ?? 0) > 0
    ? recentSales.map((sale) => ({
        id: sale.id,
        customerName: sale.customerName,
        email: sale.email,
        amount: formatCurrency(sale.amount, sale.currency),
        initials: sale.customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      }))
    : [];

  return {
    stats: displayStats,
    recentSales: displayRecentSales,
    pendingOrdersCount: stats?.pendingOrders ?? pendingOrdersCount,
    chartData,
    popularCities,
    inventoryTurnover,
    conversionRate,
    loading,
  };
};