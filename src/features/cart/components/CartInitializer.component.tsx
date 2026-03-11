import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

// State
import { useCartStore } from '@/shared/lib/cartStore';

// Utils
import { getFormattedCart } from '@/shared/lib/functions';

// GraphQL
import { GET_CART } from '../api/queries';

/**
 * Non-rendering component responsible for initializing the cart state
 * by fetching data from WooCommerce and syncing it with the Zustand store.
 * This should be rendered once at the application root (_app.tsx).
 * @function CartInitializer
 * @returns {null} - This component does not render any UI
 */
const CartInitializer = () => {
  const { syncWithWooCommerce } = useCartStore();

  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    const updatedCart = data ? getFormattedCart(data) : undefined;
    if (updatedCart) syncWithWooCommerce(updatedCart);
  }, [data, syncWithWooCommerce]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // This component does not render any UI
  return null;
};

export default CartInitializer;
