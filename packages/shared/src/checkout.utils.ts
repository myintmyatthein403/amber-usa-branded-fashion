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

export interface DepositLineItem extends CheckoutLineItem {
  isPreOrder?: boolean;
  depositAmount?: number | null; // per-unit, same currency as `price`
}

export interface DepositOptions {
  isCod: boolean;
  codDepositAmount?: number | null; // flat amount, always in MMK
}

export function calculateDepositTotal(
  items: DepositLineItem[],
  deliveryFee: number,
  orderCurrency: string,
  exchangeRate: number,
  options: DepositOptions,
  orderTotal?: number,
): { depositAmount: number | null; balanceDue: number } {
  const { total } =
    orderTotal !== undefined
      ? { total: orderTotal }
      : calculateCheckoutTotal(items, deliveryFee, orderCurrency, exchangeRate);

  const hasPreOrderDeposit = items.some(
    (item) => item.isPreOrder && item.depositAmount != null,
  );

  let preOrderDeposit: number | null = null;
  if (hasPreOrderDeposit) {
    const itemsTotal = items.reduce((sum, item) => {
      const code = item.currencyCode || (item.isUsd !== false ? 'USD' : 'MMK');
      const perUnit =
        item.isPreOrder && item.depositAmount != null
          ? Math.min(item.depositAmount, item.price)
          : item.price;
      return sum + normalizePrice(perUnit * item.quantity, code, orderCurrency, exchangeRate);
    }, 0);
    preOrderDeposit = itemsTotal + deliveryFee;
  }

  let codDeposit: number | null = null;
  if (options.isCod && options.codDepositAmount != null) {
    codDeposit = normalizePrice(options.codDepositAmount, 'MMK', orderCurrency, exchangeRate);
  }

  let depositAmount: number | null = null;
  if (preOrderDeposit != null && codDeposit != null) {
    depositAmount = Math.max(preOrderDeposit, codDeposit);
  } else if (preOrderDeposit != null) {
    depositAmount = preOrderDeposit;
  } else if (codDeposit != null) {
    depositAmount = codDeposit;
  }

  if (depositAmount != null) {
    depositAmount = Math.min(depositAmount, total);
  }

  const balanceDue = depositAmount != null ? Math.max(total - depositAmount, 0) : 0;

  return { depositAmount, balanceDue };
}
