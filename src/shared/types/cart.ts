/**
 * Cart-specific types for Zustand store and cart operations.
 * These represent the client-side cart state shape.
 */

export interface CartProductImage {
  sourceUrl?: string;
  srcSet?: string;
  title: string;
}

export interface CartConfigurationEntry {
  label: string;
  value: string;
}

export interface CartTotals {
  subtotal: string;
  subtotalTax: string;
  shippingTax: string;
  shippingTotal: string;
  total: string;
  totalTax: string;
  feeTax: string;
  feeTotal: string;
  discountTax: string;
  discountTotal: string;
}

export interface CartAppliedCoupon {
  code: string;
  discountAmount?: string | null;
  discountTax?: string | null;
  description?: string | null;
}

export interface CartProduct {
  cartKey: string;
  name: string;
  qty: number;
  price: number;
  unitPriceDisplay: string;
  totalPrice: string;
  subtotalDisplay: string;
  totalDisplay: string;
  image: CartProductImage;
  productId: number;
  slug?: string;
  variant?: string;
  configurationId?: string;
  configurationSummary: CartConfigurationEntry[];
  hasConfiguration: boolean;
}

export interface Cart {
  products: CartProduct[];
  totalProductsCount: number;
  totalProductsPrice: string;
  totals: CartTotals;
  appliedCoupons: CartAppliedCoupon[];
}
