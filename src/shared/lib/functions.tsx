/*eslint complexity: ["error", 20]*/

import { v4 as uuidv4 } from 'uuid';
import { ChangeEvent } from 'react';

import type { CartProduct, Cart, CartConfigurationEntry, CartTotals } from '@/shared/types/cart';
import type { ICheckoutDataProps } from '@/shared/types/checkout';
import type {
  ICartItemNode,
  IUpdateCartMutationArgs,
  IFormattedCartProps,
} from '@/shared/types/graphql';

const CONFIGURATION_SUMMARY_KEY = 'planenadler_configuration_summary'
const CONFIGURATION_ID_KEY = 'planenadler_configuration_id'
const CONFIGURATION_LABELS: Record<string, string> = {
  fabric: 'Material',
  colors: 'Farbe',
  width: 'Laenge A',
  height_right: 'Hoehe rechts B',
  height_left: 'Hoehe links C',
  trailer_width: 'Anhaengerbreite A',
  trailer_length: 'Anhaengerlaenge B',
  trailer_height: 'Planenhoehe C',
  rectangular_length: 'Laenge A',
  rectangular_width: 'Breite B',
  rectangular_height: 'Hoehe C',
  side_a: 'Seite A',
  side_b: 'Seite B',
  side_c: 'Seite C',
  side_f: 'Seite F',
  side_h: 'Hoehe H',
  has_top_edge: 'Obere Seite',
  has_edge_left_0: 'Linke Seite',
  has_edge_right_0: 'Rechte Seite',
  has_edge_bottom_0: 'Untere Seite',
  eyelet_edge: 'Oesen',
  closureType: 'Verschlussart',
  front_clouser: 'Frontverschluss',
  back_clouser: 'Rueckverschluss',
  window_width: 'Fensterbreite',
  window_height: 'Fensterhoehe',
  door_width: 'Tuerbreite',
  door_height: 'Tuerhoehe',
  door_offset_left: 'Tuerabstand links',
}

// Re-export types that other files import from here
export type { ICartItemNode } from '@/shared/types/graphql';
export type { ICheckoutDataProps } from '@/shared/types/checkout';
export type { IUpdateCartItem } from '@/shared/types/graphql';
export type { IUpdateCartInput } from '@/shared/types/graphql';
export type { IUpdateCartVariables } from '@/shared/types/graphql';
export type { IUpdateCartMutationArgs } from '@/shared/types/graphql';

// Keep backward-compatible alias for IProductRootObject → ICartItemNode
export type IProductRootObject = ICartItemNode;
export type IUpdateCartRootObject = IUpdateCartMutationArgs;

type TUpdatedItems = { key: string; quantity: number }[];

/** Graues SVG-Platzhalterbild (kein Netzwerk), für next/image nutzbar */
export const PLACEHOLDER_IMAGE_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+';

/**
 * Preis-String für Anzeige normalisieren: HTML-Entitäten wie &nbsp; durch echte Zeichen ersetzen.
 */
export const decodePriceDisplay = (price: string | undefined | null): string => {
  if (price == null || typeof price !== 'string') return '';
  return price
    .replace(/&nbsp;/gi, ' ')
    .replace(/&euro;/gi, '€')
    .replace(/&#8364;/gi, '€')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();
};

/**
 * Add empty character after currency symbol
 * @param {string} price The price string that we input
 * @param {string} symbol Currency symbol to add empty character/padding after
 */

export const paddedPrice = (price: string, symbol: string) =>
  price.split(symbol).join(`${symbol} `);

/**
 * Shorten inputted string (usually product description) to a maximum of length
 * @param {string} input The string that we input
 * @param {number} length The length that we want to shorten the text to
 */
export const trimmedStringToLength = (input: string, length: number) => {
  if (input.length > length) {
    const subStr = input.substring(0, length);
    return `${subStr}...`;
  }
  return input;
};

/**
 * Filter variant price. Changes "kr198.00 - kr299.00" to kr299.00 or kr198 depending on the side variable
 * @param {String} side Which side of the string to return (which side of the "-" symbol)
 * @param {String} price The inputted price that we need to convert
 */
export const filteredVariantPrice = (price: string, side: string) => {
  if ('right' === side) {
    return price.substring(price.length, price.indexOf('-')).replace('-', '');
  }

  return price.substring(0, price.indexOf('-')).replace('-', '');
};

/**
 * Erreichbare Produktbild-URL für next/image.
 * - Relative URLs werden mit der WordPress-Basis-URL ergänzt.
 * - Absolute URLs mit nicht erreichbarem Host (z. B. Docker-Name "wordpress")
 *   werden auf die konfigurierte GraphQL-Basis umgeschrieben, damit der Browser
 *   die Bilder laden kann.
 */
export const getAbsoluteImageUrl = (url: string | undefined | null): string => {
  if (!url || typeof url !== 'string') return '';
  const base = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '';
  const origin = base.replace(/\/graphql\/?$/i, '');

  // Relativ → absolute URL mit WordPress-Origin
  if (!/^https?:\/\//i.test(url)) {
    return origin ? `${origin}${url.startsWith('/') ? url : `/${url}`}` : url;
  }

  // Absolute URL: Host prüfen. localhost/127.0.0.1 sind vom Browser erreichbar.
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return url;
    // Anderer Host (z. B. "wordpress" in Docker) → Origin ersetzen
    if (origin) {
      return `${origin}${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // Ungültige URL
  }
  return url;
};

/**
 * Parst WooCommerce-Preisstring (z. B. "19,99 €" oder "0,00 €") zu einer Zahl.
 * Unterstützt deutsches Format (Komma als Dezimaltrenner) und Punkt.
 */
export function parseCartPriceString(priceStr: string | undefined | null): number {
  if (priceStr == null || typeof priceStr !== 'string') return 0
  const trimmed = priceStr.trim().replace(/\s+/g, '')
  // Nur Ziffern, Komma, Punkt, Minus behalten
  const cleaned = trimmed.replace(/[^0-9.,-]/g, '')
  if (!cleaned) return 0
  // Deutsches Format: 1.234,56 → 1234.56
  const hasComma = cleaned.includes(',')
  const normalized = hasComma
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned
  const value = Number.parseFloat(normalized)
  return Number.isFinite(value) ? value : 0
}

export function formatCartPriceValue(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return 'Preis auf Anfrage'
  }

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export function getEffectiveShippingTotal(totals: CartTotals): string {
  const shipping = parseCartPriceString(totals.shippingTotal)
  const shippingTax = parseCartPriceString(totals.shippingTax)
  const fee = parseCartPriceString(totals.feeTotal)
  const feeTax = parseCartPriceString(totals.feeTax)
  return formatCartPriceValue(shipping + shippingTax + fee + feeTax)
}

function decodeConfigurationSummary(
  item: ICartItemNode,
): { summary: CartConfigurationEntry[]; configurationId?: string; hasConfiguration: boolean } {
  const extraEntries = Array.isArray(item.extraData) ? item.extraData : []
  const configurationId = extraEntries.find((entry) => entry.key === CONFIGURATION_ID_KEY)?.value
  const summaryEntry = extraEntries.find((entry) => entry.key === CONFIGURATION_SUMMARY_KEY)?.value

  if (summaryEntry) {
    try {
      const parsed = JSON.parse(summaryEntry) as Array<{ label?: unknown; value?: unknown }>
      if (Array.isArray(parsed)) {
        const summary = parsed
          .map((entry) => ({
            label: typeof entry?.label === 'string' ? entry.label.trim() : '',
            value: typeof entry?.value === 'string' ? entry.value.trim() : '',
          }))
          .filter((entry) => entry.label.length > 0 && entry.value.length > 0)

        return {
          summary,
          configurationId,
          hasConfiguration: summary.length > 0,
        }
      }
    } catch {
      /* ignore malformed summary */
    }
  }

  const fallbackSummary = extraEntries
    .filter((entry) => {
      if (!entry?.key || !entry?.value) return false
      if (entry.key in CONFIGURATION_LABELS) return true
      return (
        entry.key.startsWith('Extra_') ||
        entry.key.startsWith('Door_Extra_') ||
        entry.key.startsWith('Zubeh') ||
        entry.key === 'planenadler_sketch_file_name'
      )
    })
    .map((entry) => {
      if (entry.key === 'planenadler_sketch_file_name') {
        return { label: 'Skizze', value: entry.value }
      }
      if (entry.key.startsWith('Extra_')) {
        return { label: 'Extras', value: entry.value }
      }
      if (entry.key.startsWith('Door_Extra_')) {
        return { label: 'Tuer-Extras', value: entry.value }
      }
      if (entry.key.startsWith('Zubeh')) {
        return { label: 'Zubehoer', value: entry.value }
      }
      return { label: CONFIGURATION_LABELS[entry.key] ?? entry.key, value: entry.value }
    })

  return {
    summary: fallbackSummary,
    configurationId,
    hasConfiguration: fallbackSummary.length > 0,
  }
}

/**
 * Returns cart data in the required format.
 * @param {IFormattedCartProps} data Cart data from GraphQL
 */

export const getFormattedCart = (data: IFormattedCartProps) => {
  if (!data?.cart?.contents?.nodes?.length) {
    return;
  }

  const givenProducts = data.cart.contents.nodes;

  const totals: CartTotals = {
    subtotal: data.cart.subtotal,
    subtotalTax: data.cart.subtotalTax,
    shippingTax: data.cart.shippingTax,
    shippingTotal: data.cart.shippingTotal,
    total: data.cart.total,
    totalTax: data.cart.totalTax,
    feeTax: data.cart.feeTax,
    feeTotal: data.cart.feeTotal,
    discountTax: data.cart.discountTax,
    discountTotal: data.cart.discountTotal,
  }

  const formattedCart: Cart = {
    products: [],
    totalProductsCount: 0,
    totalProductsPrice: data.cart.total,
    totals,
  };

  let totalProductsCount = 0;

  givenProducts.forEach((item) => {
    const givenProduct = item.product.node;

    const totalNumeric = parseCartPriceString(item.total)
    const subtotalNumeric = parseCartPriceString(item.subtotal)
    let totalValue = totalNumeric > 0 ? totalNumeric : subtotalNumeric
    if (totalValue <= 0 && givenProduct.price) {
      totalValue = parseCartPriceString(givenProduct.price) * item.quantity
    }
    const unitPrice = item.quantity > 0 ? totalValue / item.quantity : 0
    const {
      summary: configurationSummary,
      configurationId,
      hasConfiguration,
    } = decodeConfigurationSummary(item)

    const variantAttributes = item.variation?.node.attributes?.nodes ?? []
    const variant = variantAttributes.length > 0
      ? variantAttributes.map((a) => a.value).filter(Boolean).join(' / ')
      : undefined

    const product: CartProduct = {
      productId: givenProduct.productId ?? givenProduct.databaseId,
      cartKey: item.key,
      name: givenProduct.name,
      qty: item.quantity,
      price: unitPrice,
      unitPriceDisplay: formatCartPriceValue(unitPrice),
      totalPrice: item.total,
      subtotalDisplay: item.subtotal,
      totalDisplay: item.total,
      image: givenProduct.image?.sourceUrl
        ? {
            sourceUrl: givenProduct.image.sourceUrl,
            srcSet: givenProduct.image.srcSet,
            title: givenProduct.image.title,
          }
        : {
            sourceUrl:
              process.env.NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL ||
              PLACEHOLDER_IMAGE_DATA_URL,
            srcSet:
              process.env.NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL ||
              PLACEHOLDER_IMAGE_DATA_URL,
            title: givenProduct.name,
          },
      slug: givenProduct.slug,
      variant,
      configurationId,
      configurationSummary,
      hasConfiguration,
    };

    totalProductsCount += item.quantity;
    formattedCart.products.push(product);
  });

  formattedCart.totalProductsCount = totalProductsCount;

  return formattedCart;
};

export const createCheckoutData = (order: ICheckoutDataProps) => {
  const shipToDifferentAddress = Boolean(order.shipToDifferentAddress);
  return {
    clientMutationId: uuidv4(),
    billing: {
      firstName: order.firstName,
      lastName: order.lastName,
      address1: order.address1,
      address2: order.address2 ?? '',
      city: order.city,
      country: order.country,
      state: order.state ?? '',
      postcode: order.postcode,
      email: order.email,
      phone: order.phone,
      company: order.company ?? '',
    },
    shipping: shipToDifferentAddress
      ? {
          firstName: order.shippingFirstName ?? order.firstName,
          lastName: order.shippingLastName ?? order.lastName,
          address1: order.shippingAddress1 ?? order.address1,
          address2: order.shippingAddress2 ?? '',
          city: order.shippingCity ?? order.city,
          country: order.shippingCountry ?? order.country,
          state: order.shippingState ?? '',
          postcode: order.shippingPostcode ?? order.postcode,
          email: order.email,
          phone: order.phone,
          company: '',
        }
      : {
          firstName: order.firstName,
          lastName: order.lastName,
          address1: order.address1,
          address2: order.address2 ?? '',
          city: order.city,
          country: order.country,
          state: order.state ?? '',
          postcode: order.postcode,
          email: order.email,
          phone: order.phone,
          company: order.company ?? '',
        },
    shipToDifferentAddress,
    paymentMethod: order.paymentMethod,
    isPaid: false,
    transactionId: uuidv4(),
  };
};

/**
 * Get the updated items in the below format required for mutation input.
 *
 * Creates an array in above format with the newQty (updated Qty ).
 *
 */
export const getUpdatedItems = (
  products: ICartItemNode[],
  newQty: number,
  cartKey: string,
) => {
  const updatedItems: TUpdatedItems = products.map((cartItem) => ({
    key: cartItem.key,
    quantity: cartItem.key === cartKey ? newQty : cartItem.quantity,
  }));

  return updatedItems;
};

/*
 * When user changes the quantity, update the cart in localStorage
 * Also update the cart in the global Context
 */
export const handleQuantityChange = (
  event: ChangeEvent<HTMLInputElement>,
  cartKey: string,
  cart: ICartItemNode[],
  updateCart: (variables: IUpdateCartMutationArgs) => void,
  updateCartProcessing: boolean,
) => {
  if (typeof window !== 'undefined') {
    event.stopPropagation();

    // Return if the previous update cart mutation request is still processing
    if (updateCartProcessing || !cart) {
      return;
    }

    // If the user tries to delete the count of product, set that to 1 by default ( This will not allow him to reduce it less than zero )
    const newQty = event.target.value ? parseInt(event.target.value, 10) : 1;

    if (cart.length) {
      const updatedItems = getUpdatedItems(cart, newQty, cartKey);

      updateCart({
        variables: {
          input: {
            clientMutationId: uuidv4(),
            items: updatedItems,
          },
        },
      });
    }
  }
};
