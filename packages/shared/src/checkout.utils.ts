import { normalizePrice } from './currency.utils';

export interface CheckoutLineItem {
  price: number;
  quantity: number;
  currencyCode?: string;
  isUsd?: boolean;
}

export function calculateCheckoutTotal(
  items: CheckoutLineItem[],
  deliveryFee: number,
  orderCurrency: string,
  exchangeRate: number,
): { subtotal: number; total: number } {
  const subtotal = items.reduce((sum, item) => {
    const code = item.currencyCode || (item.isUsd !== false ? 'USD' : 'MMK');
    const line = normalizePrice(
      item.price * item.quantity,
      code,
      orderCurrency,
      exchangeRate,
    );
    return sum + line;
  }, 0);
  return { subtotal, total: subtotal + deliveryFee };
}
