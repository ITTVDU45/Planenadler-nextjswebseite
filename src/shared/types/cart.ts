/**
 * Cart-specific types for Zustand store and cart operations.
 * These represent the client-side cart state shape.
 */

export interface CartProductImage {
  sourceUrl?: string;
  srcSet?: string;
  title: string;
}

export interface CartProduct {
  cartKey: string;
  name: string;
  qty: number;
  price: number;
  totalPrice: string;
  image: CartProductImage;
  productId: number;
  slug?: string;
  variant?: string;
  configurationId?: string;
}

export interface Cart {
  products: CartProduct[];
  totalProductsCount: number;
  totalProductsPrice: number;
}
