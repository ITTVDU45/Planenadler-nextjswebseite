import { withRouter } from 'next/router';

// Components
import Layout from '@/shared/components/Layout.component';
import DisplayProducts from '@/features/product/components/DisplayProducts.component';

import client from '@/config/apollo/ApolloClient';

import { GET_PRODUCTS_FROM_CATEGORY } from '@/features/product/api/queries';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

/**
 * Display a single product with dynamic pretty urls
 */
const Produkt = ({
  categoryName,
  products,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <Layout title={`${categoryName ? categoryName : ''}`}>
      {products ? (
        <DisplayProducts products={products} />
      ) : (
        <div className="mt-8 text-2xl text-center">Laster produkt ...</div>
      )}
    </Layout>
  );
};

export default withRouter(Produkt);

export const getServerSideProps: GetServerSideProps = async ({
  query: { id },
}) => {
  const res = await client.query({
    query: GET_PRODUCTS_FROM_CATEGORY,
    variables: { id },
  });

  return {
    props: {
      categoryName: res.data.productCategory.name,
      products: res.data.productCategory.products.nodes,
    },
  };
};
