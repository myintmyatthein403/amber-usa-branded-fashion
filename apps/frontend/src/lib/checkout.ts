import type { CheckoutFormData, DeliveryMethod, CartItem } from "@/components/checkout";
import { calculateCheckoutTotal } from "@amber/shared";
import { getApiUrl } from "@/lib/api";

export function buildShippingAddress(form: CheckoutFormData): string {
  if (form.market === "US") {
    return [
      `${form.firstName} ${form.lastName}`,
      form.street,
      `${form.city}, ${form.state || ""} ${form.zipCode || ""}`.trim(),
      form.phone,
    ]
      .filter(Boolean)
      .join(", ");
  }
  return [
    `${form.firstName} ${form.lastName}`,
    [form.street, form.township].filter(Boolean).join(", "),
    `${form.region || ""}, ${form.city}`.trim(),
    form.phone,
  ]
    .filter(Boolean)
    .join(", ");
}

export function filterDeliveryMethodsByMarket(
  methods: DeliveryMethod[],
  market: "US" | "MM",
): DeliveryMethod[] {
  const locationKey = market === "US" ? "USA" : "MYANMAR";
  return methods
    .map((m) => {
      const locPrices = m.locationPrices;
      if (locPrices && typeof locPrices === "object" && locationKey in locPrices) {
        const regional = locPrices[locationKey];
        return {
          ...m,
          price: String(regional),
          isUsdPrice: market === "US",
        };
      }
      return m;
    })
    .filter((m) => {
      if (!m.locationPrices) return true;
      const locPrices = m.locationPrices as Record<string, number>;
      return locationKey in locPrices || Object.keys(locPrices).length === 0;
    });
}

export function buildOrderPayload(
  form: CheckoutFormData,
  cartItems: CartItem[],
  currency: string,
  deliveryFee: number,
) {
  const shippingAddress = buildShippingAddress(form);
  const customerName = `${form.firstName} ${form.lastName}`.trim();

  return {
    shippingAddress,
    customerName,
    customerEmail: form.email,
    customerPhone: form.phone,
    street: form.street || form.address,
    city: form.city,
    state: form.state,
    township: form.township,
    zipCode: form.zipCode,
    deliveryMethodId: form.shippingMethod,
    deliveryFee,
    paymentMethod: form.paymentMethod,
    paymentReference: form.transactionRef?.trim() || undefined,
    currency,
    market: form.market,
    shippingCountry: form.shippingCountry,
    items: cartItems.map((item) => ({
      productId: item.id,
      variantId: item.variantId,
      name: item.name,
      price: item.price,
      isUsd: item.currencyCode === "USD" || item.isUsdPrice !== false,
      currencyCode: item.currencyCode || (item.isUsdPrice !== false ? "USD" : "MMK"),
      quantity: item.quantity,
      image: item.image || '',
      size: item.size,
    })),
  };
}

export function computeCheckoutTotal(
  cartItems: CartItem[],
  deliveryFee: number,
  currency: string,
  exchangeRate: number,
  isShippingUsd: boolean,
  shippingCost: number,
): number {
  let feeInOrderCurrency = deliveryFee;
  if (isShippingUsd && currency === "MMK") {
    feeInOrderCurrency = shippingCost * exchangeRate;
  } else if (!isShippingUsd && currency === "USD") {
    feeInOrderCurrency = shippingCost / exchangeRate;
  } else {
    feeInOrderCurrency = shippingCost;
  }

  const { total } = calculateCheckoutTotal(
    cartItems.map((item) => ({
      price: item.price,
      quantity: item.quantity,
      currencyCode: item.currencyCode || (item.isUsdPrice !== false ? "USD" : "MMK"),
      isUsd: item.isUsdPrice,
    })),
    feeInOrderCurrency,
    currency,
    exchangeRate,
  );
  return total;
}

export async function uploadPaymentProof(
  orderId: string,
  file: File,
  token: string,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${getApiUrl()}/orders/${orderId}/payment-proof`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Failed to upload payment proof");
  }
}
