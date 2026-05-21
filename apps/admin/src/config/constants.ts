export const APP_CONFIG = {
  NAME: 'Amber Brand Fashion',
  DESCRIPTION: 'Myanmar Heritage Management Portal',
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5050',
  DATE_FORMAT: 'MMM dd, yyyy',
};

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
  },
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id: number | string) => `/products/${id}`,
  },
  CATEGORIES: {
    BASE: '/categories',
    REORDER: '/categories/reorder',
    BY_ID: (id: number | string) => `/categories/${id}`,
  },
  BRANDS: {
    BASE: '/brands',
    BY_ID: (id: number | string) => `/brands/${id}`,
  },
  VARIANTS: {
    BASE: '/variants',
    BY_ID: (id: number | string) => `/variants/${id}`,
  },
  HERO: {
    BASE: '/hero',
    ACTIVE: '/hero/active',
    BY_ID: (id: string) => `/hero/${id}`,
  },
  MISSION: {
    BASE: '/mission',
    ACTIVE: '/mission/active',
    BY_ID: (id: string) => `/mission/${id}`,
  },
  GIFT_CARD_SECTION: {
    BASE: '/gift-card-section',
    ACTIVE: '/gift-card-section/active',
    BY_ID: (id: string) => `/gift-card-section/${id}`,
  },
  SALE_SECTION: {
    BASE: '/sale-section',
    ACTIVE: '/sale-section/active',
    BY_ID: (id: string) => `/sale-section/${id}`,
  },
  FOOTER_SECTION: {
    BASE: '/footer-section',
    ACTIVE: '/footer-section/active',
    BY_ID: (id: string) => `/footer-section/${id}`,
  },
  TESTIMONIALS: {
    BASE: '/testimonials',
    ACTIVE: '/testimonials/active',
    BY_ID: (id: string) => `/testimonials/${id}`,
  },
  COMMUNITY_POSTS: {
    BASE: '/community-posts',
    ACTIVE: '/community-posts/active',
    BY_ID: (id: string) => `/community-posts/${id}`,
  },
  COLLECTIONS: {
    BASE: '/collections',
    BY_ID: (id: string) => `/collections/${id}`,
  },
  COUPONS: {
    BASE: '/coupons',
    BY_ID: (id: string) => `/coupons/${id}`,
  },
  GIFT_CARDS: {
    BASE: '/gift-cards',
    BY_ID: (id: string) => `/gift-cards/${id}`,
  },
  SALES: {
    BASE: '/sales',
    BY_ID: (id: string) => `/sales/${id}`,
    ADD_PRODUCT: (saleId: string, productId: string) => `/sales/${saleId}/products/${productId}`,
    REMOVE_PRODUCT: (productId: string) => `/sales/products/${productId}`,
  },
  SETTINGS: '/settings',
  REVIEWS: {
    BASE: '/reviews',
    BY_ID: (id: string) => `/reviews/${id}`,
    TOGGLE_APPROVAL: (id: string) => `/reviews/${id}/toggle-approval`,
  },
  UPLOAD: '/upload',
  DELIVERY_METHODS: {
    BASE: '/delivery-methods',
    ACTIVE: '/delivery-methods/active',
    BY_ID: (id: string) => `/delivery-methods/${id}`,
  },
  ADS: {
    BASE: '/ads',
    ACTIVE: '/ads/active',
    BY_ID: (id: string) => `/ads/${id}`,
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  ROLES: {
    BASE: '/roles',
    BY_ID: (id: string) => `/roles/${id}`,
  },
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    UPDATE_PAYMENT_STATUS: (id: string) => `/orders/${id}/payment-status`,
    BULK_STATUS: '/orders/bulk-status',
    BULK_PAYMENT_STATUS: '/orders/bulk-payment-status',
    PENDING_COUNT: '/orders/pending-count',
    },
  LOGISTICS: {
    WAREHOUSES: '/logistics/warehouses',
    INVENTORY: '/logistics/inventory',
    INVENTORY_BY_VARIANT: (variantId: string) => `/logistics/inventory/${variantId}`,
    INVENTORY_BY_WAREHOUSE: (warehouseId: string) => `/logistics/inventory/warehouse/${warehouseId}`,
    UPDATE_STOCK: '/logistics/inventory/update',
    CARGO: '/logistics/cargo',
    CARGO_BY_ID: (id: string) => `/logistics/cargo/${id}`,
    CARGO_STATUS: (id: string) => `/logistics/cargo/${id}/status`,
    },
  MEDIA: {
    BASE: '/media',
    UPLOAD: '/media/upload',
    BY_ID: (id: string) => `/media/${id}`,
  },
  ATTRIBUTES: {
    BASE: '/attributes',
    PUBLIC: '/attributes/public',
    REORDER: '/attributes/reorder',
    BY_ID: (id: string) => `/attributes/${id}`,
    VALUES: (id: string) => `/attributes/${id}/values`,
    VALUES_REORDER: (id: string) => `/attributes/${id}/values/reorder`,
    VALUE_BY_ID: (id: string) => `/attributes/values/${id}`,
  },
  STATS: '/stats',
};

