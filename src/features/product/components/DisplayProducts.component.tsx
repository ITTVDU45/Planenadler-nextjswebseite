/*eslint complexity: ["error", 20]*/
import Link from 'next/link';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

import {
  filteredVariantPrice,
  paddedPrice,
  getAbsoluteImageUrl,
  decodePriceDisplay,
  PLACEHOLDER_IMAGE_DATA_URL,
} from '@/shared/lib/functions';

import type { IDisplayProduct } from '@/shared/types/product';

interface IDisplayProductsProps {
  products: IDisplayProduct[];
}

/**
 * Displays all of the products as long as length is defined.
 * Does a map() over the props array and utilizes uuidv4 for unique key values.
 * @function DisplayProducts
 * @param {IDisplayProductsProps} products Products to render
 * @returns {JSX.Element} - Rendered component
 */

const DisplayProducts = ({ products }: IDisplayProductsProps) => (
  <section className="container mx-auto bg-white py-12">
    <div
      id="product-container"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    >
      {products ? (
        products.map(
          ({
            name,
            price,
            regularPrice,
            salePrice,
            onSale,
            slug,
            image,
            variations,
          }) => {
            // Add padding/empty character after currency symbol here
            if (price) {
              price = paddedPrice(price, 'kr');
            }
            if (regularPrice) {
              regularPrice = paddedPrice(regularPrice, 'kr');
            }
            if (salePrice) {
              salePrice = paddedPrice(salePrice, 'kr');
            }

            return (
              <div key={uuidv4()} className="group">
                <Link href={`/produkt/${encodeURIComponent(slug)}`}>
                  <div className="aspect-[4/3] max-h-[280px] relative overflow-hidden bg-gray-100 rounded-lg">
                    <Image
                      id="product-image"
                      className="object-cover object-center transition duration-300 group-hover:scale-105"
                      alt={name}
                      src={
                        getAbsoluteImageUrl(image?.sourceUrl) ||
                        process.env.NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL ||
                        PLACEHOLDER_IMAGE_DATA_URL
                      }
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  </div>
                </Link>
                <Link href={`/produkt/${encodeURIComponent(slug)}`}>
                  <span>
                    <div className="mt-4">
                      <p className="text-xl font-bold text-center cursor-pointer hover:text-gray-600 transition-colors">
                        {name}
                      </p>
                    </div>
                  </span>
                </Link>
                <div className="mt-2 text-center">
                  {onSale ? (
                    <div className="flex justify-center items-center space-x-2">
                      <span className="text-xl font-bold text-red-600">
                        {variations &&
                          decodePriceDisplay(filteredVariantPrice(price, ''))}
                        {!variations && decodePriceDisplay(salePrice)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {variations &&
                          decodePriceDisplay(filteredVariantPrice(price, 'right'))}
                        {!variations && decodePriceDisplay(regularPrice)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg text-gray-900">
                      {decodePriceDisplay(price)}
                    </span>
                  )}
                </div>
              </div>
            );
          },
        )
      ) : (
        <div className="mx-auto text-xl font-bold text-center text-gray-800 no-underline uppercase">
          Ingen produkter funnet
        </div>
      )}
    </div>
  </section>
);

export default DisplayProducts;
