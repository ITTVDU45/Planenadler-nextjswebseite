// Imports
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';

// Components
import Button from '@/shared/ui/Button.component';
import { AddToCartSuccessModal } from '@/shared/components/AddToCartSuccessModal';

// State
import { useCartStore } from '@/shared/lib/cartStore';

// Utils
import { getFormattedCart } from '@/shared/lib/functions';
import { pushToDataLayer, roundTrackingValue, type DataLayerEcommerceEvent } from '@/lib/tracking';

// Types
import type {
  ISingleProduct,
  ISingleProductProps,
  IVariationDetail,
} from '@/shared/types/product';

// GraphQL
import { ADD_TO_CART } from '@/features/cart/api';
import { GET_CART } from '@/features/cart/api';

// Re-export types for backward compatibility
export type IProduct = ISingleProduct;
export type IProductRootObject = ISingleProductProps;
export type IVariationNodes = IVariationDetail;

/**
 * Handles the Add to cart functionality.
 * Uses GraphQL for product data
 * @param {ISingleProductProps} product // Product data
 * @param {number} variationId // Variation ID
 * @param {boolean} fullWidth // Whether the button should be full-width
 */

const AddToCart = ({
  product,
  variationId,
  fullWidth = false,
}: ISingleProductProps) => {
  const { syncWithWooCommerce, isLoading: isCartLoading } = useCartStore();
  const [requestError, setRequestError] = useState<boolean>(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const productId = product?.databaseId ? product?.databaseId : variationId;

  const productQueryInput = {
    clientMutationId: uuidv4(), // Generate a unique id.
    productId,
  };

  // Get cart data query
  const { data } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    const updatedCart = data ? getFormattedCart(data) : undefined;
    if (updatedCart) syncWithWooCommerce(updatedCart);
  }, [data, syncWithWooCommerce]);

  // Add to cart mutation
  const [addToCart, { loading: addToCartLoading }] = useMutation(ADD_TO_CART, {
    variables: {
      input: productQueryInput,
    },
    refetchQueries: [{ query: GET_CART }],
    onCompleted: () => {
      const priceValue = typeof product?.salePrice === 'string'
        ? Number.parseFloat(product.salePrice.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.'))
        : typeof product?.price === 'string'
          ? Number.parseFloat(product.price.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.'))
          : undefined
      const roundedPrice = Number.isFinite(priceValue) ? roundTrackingValue(priceValue as number) : undefined
      const event: DataLayerEcommerceEvent = {
        event: 'add_to_cart',
        ecommerce: {
          currency: 'EUR',
          value: roundedPrice,
          items: [
            {
              item_id: String(productId),
              item_name: product?.name ?? 'Produkt',
              price: roundedPrice,
              quantity: 1,
            },
          ],
        },
      }
      pushToDataLayer(event);
      setSuccessModalOpen(true);
    },

    onError: () => {
      setRequestError(true);
    },
  });

  const handleAddToCart = () => {
    addToCart();
  };

  return (
    <>
      <AddToCartSuccessModal
        open={successModalOpen}
        productName={product?.name ?? 'Produkt'}
        onClose={() => setSuccessModalOpen(false)}
      />
      <Button
        handleButtonClick={() => handleAddToCart()}
        buttonDisabled={addToCartLoading || requestError || isCartLoading}
        fullWidth={fullWidth}
      >
        {isCartLoading ? 'Loading...' : 'KJØP'}
      </Button>
    </>
  );
};

export default AddToCart;
