import { useAdminUIStore } from '../../store/useAdminUIStore';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign,
  AlertCircle
} from 'lucide-react';

export const useDashboard = () => {
  const { pendingOrdersCount, setActiveTab } = useAdminUIStore();

  const stats = [
    { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%', icon: DollarSign, color: 'text-primary' },
    { label: 'New Orders', value: pendingOrdersCount.toString(), change: 'Awaiting Fulfillment', icon: AlertCircle, color: pendingOrdersCount > 0 ? 'text-amber-500' : 'text-muted-foreground', action: () => setActiveTab('orders') },
    { label: 'Total Sales', value: '+2350', change: '+180.1%', icon: ShoppingBag, color: 'text-primary' },
    { label: 'Active Users', value: '+12,234', change: '+19%', icon: Users, color: 'text-primary' },
  ];

  const recentSales = [1, 2, 3, 4, 5].map((i) => ({
    id: i,
    customerName: `Customer ${i}`,
    email: `customer${i}@example.com`,
    amount: '+$1,999.00',
    initials: 'JD'
  }));

  return {
    stats,
    recentSales,
    pendingOrdersCount
  };
};
