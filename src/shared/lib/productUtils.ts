import { Product, ProductCategory, ProductType } from '@/shared/types/product';

/** Attribute name matches size (pa_size, Size, etc.) */
const isSizeAttribute = (name: string): boolean =>
  /size/i.test(name) || /^pa_size$/i.test(name);

/** Attribute name matches color (pa_color, Color, etc.) */
const isColorAttribute = (name: string): boolean =>
  /color/i.test(name) || /colour/i.test(name) || /^pa_color$/i.test(name);

/**
 * Sizes for a product: from allPaSizes if present, else from variation attributes.
 */
export const getSizesFromProduct = (product: Product): string[] => {
  if (product.allPaSizes?.nodes?.length) {
    return product.allPaSizes.nodes.map((n) => n.name);
  }
  const sizes = new Set<string>();
  product.variations?.nodes?.forEach((v) => {
    v.attributes?.nodes?.forEach((a) => {
      if (isSizeAttribute(a.name) && a.value) sizes.add(a.value);
    });
  });
  return Array.from(sizes);
};

/**
 * Colors for a product: from allPaColors if present, else from variation attributes.
 * Returns { name, slug } for compatibility with filter UI.
 */
export const getColorsFromProduct = (
  product: Product,
): { name: string; slug: string }[] => {
  if (product.allPaColors?.nodes?.length) {
    return product.allPaColors.nodes.map((n) => ({
      name: n.name,
      slug: (n as { slug?: string }).slug ?? n.name.toLowerCase().replace(/\s+/g, '-'),
    }));
  }
  const colorMap = new Map<string, string>();
  product.variations?.nodes?.forEach((v) => {
    v.attributes?.nodes?.forEach((a) => {
      if (isColorAttribute(a.name) && a.value) {
        const slug = a.value.toLowerCase().replace(/\s+/g, '-');
        if (!colorMap.has(slug)) colorMap.set(slug, a.value);
      }
    });
  });
  return Array.from(colorMap.entries()).map(([slug, name]) => ({ name, slug }));
};

export const getUniqueProductTypes = (products: Product[]): ProductType[] => {
  // Use Map to ensure unique categories by slug
  const categoryMap = new Map<string, ProductType>();

  products?.forEach((product) => {
    product.productCategories?.nodes.forEach((cat: ProductCategory) => {
      if (!categoryMap.has(cat.slug)) {
        categoryMap.set(cat.slug, {
          id: cat.slug,
          name: cat.name,
          checked: false,
        });
      }
    });
  });

  // Convert Map values to array and sort by name
  return Array.from(categoryMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
};
