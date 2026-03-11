/*eslint complexity: ["error", 20]*/
// Imports
import { useState, useEffect } from 'react';
import { useQuery, useMutation, ApolloError } from '@apollo/client';

// Components
import Billing from './Billing.component';
import CartContents from '../CartContents.component';
import LoadingSpinner from '@/shared/components/LoadingSpinner.component';

// GraphQL
import { GET_CART } from '@/features/cart/api/queries';
import { CHECKOUT_MUTATION } from '@/shared/lib/GQL_MUTATIONS';
import { useCartStore } from '@/shared/lib/cartStore';

// Utils
import { getFormattedCart, createCheckoutData } from '@/shared/lib/functions';

// Types
import type { ICheckoutDataProps, ICheckoutData } from '@/shared/types/checkout';

const CheckoutForm = () => {
  const { cart, clearWooCommerceSession, syncWithWooCommerce } = useCartStore();
  const [orderData, setOrderData] = useState<ICheckoutData | null>(null);
  const [requestError, setRequestError] = useState<ApolloError | null>(null);
  const [orderCompleted, setorderCompleted] = useState<boolean>(false);

  // Get cart data query
  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (!data) return;
    const updatedCart = getFormattedCart(data);
    if (!updatedCart && !data?.cart?.contents?.nodes?.length) {
      clearWooCommerceSession();
      return;
    }
    if (updatedCart) syncWithWooCommerce(updatedCart);
  }, [data, clearWooCommerceSession, syncWithWooCommerce]);

  // Checkout GraphQL mutation
  const [checkout, { loading: checkoutLoading }] = useMutation(
    CHECKOUT_MUTATION,
    {
      variables: {
        input: orderData,
      },
      onCompleted: () => {
        clearWooCommerceSession();
        setorderCompleted(true);
        refetch();
      },
      onError: (error) => {
        setRequestError(error);
        refetch();
      },
    },
  );

  useEffect(() => {
    if (null !== orderData) {
      // Perform checkout mutation when the value for orderData changes.
      checkout();
      // Delayed refetch to ensure WooCommerce backend has settled
      setTimeout(() => {
        refetch();
      }, 2000);
    }
  }, [checkout, orderData, refetch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleFormSubmit = (submitData: ICheckoutDataProps) => {
    const checkOutData = createCheckoutData(submitData);

    setOrderData(checkOutData);
    setRequestError(null);
  };

  return (
    <>
      {cart && !orderCompleted ? (
        <div className="container mx-auto">
          {/*	Order*/}
          <CartContents />
          {/*Payment Details*/}
          <Billing handleFormSubmit={handleFormSubmit} />
          {/*Error display*/}
          {requestError && (
            <div className="h-32 text-xl text-center text-red-600">
              En feil har oppstått.
            </div>
          )}
          {/* Checkout Loading*/}
          {checkoutLoading && (
            <div className="text-xl text-center">
              Behandler ordre, vennligst vent ...
              <LoadingSpinner />
            </div>
          )}
        </div>
      ) : (
        <>
          {!cart && !orderCompleted && (
            <h1 className="text-2xl m-12 mt-24 font-bold text-center">
              Ingen produkter i handlekurven
            </h1>
          )}
          {orderCompleted && (
            <div className="container h-24 m-12 mx-auto mt-24 text-xl text-center">
              Takk for din ordre!
            </div>
          )}
        </>
      )}
    </>
  );
};

export default CheckoutForm;
