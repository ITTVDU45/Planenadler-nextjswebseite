import Head from 'next/head';
import Layout from '@/shared/components/Layout.component';
import ProductList from '@/features/product/components/ProductList.component';
import { FETCH_ALL_PRODUCTS_QUERY } from '@/features/product/api/queries';
import { fetchGraphqlWithFallback } from '@/features/product/api/server-fetch';
import type { Product } from '@/shared/types/product';
import type { NextPage, GetStaticProps, InferGetStaticPropsType } from 'next';

const Produkter: NextPage = ({
  products,
  loading,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  if (loading)
    return (
      <Layout title="Produkter">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );

  if (!products)
    return (
      <Layout title="Produkter">
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-red-500">Ingen produkter funnet</p>
        </div>
      </Layout>
    );

  return (
    <Layout title="Produkter">
      <Head>
        <title>Produkter | WooCommerce Next.js</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <ProductList products={products} title="Herreklær" />
      </div>
    </Layout>
  );
};

export default Produkter;

export const getStaticProps: GetStaticProps = async () => {
  let products: Product[] = []

  try {
    const data = await fetchGraphqlWithFallback<{
      products?: { nodes?: Product[] }
    }>(FETCH_ALL_PRODUCTS_QUERY)

    products = data.products?.nodes ?? []
  } catch (error) {
    console.error('[ProductsPage] GraphQL fetch failed', error)
  }

  return {
    props: {
      products,
      loading: false,
      networkStatus: 7,
    },
    revalidate: 60,
  };
};
