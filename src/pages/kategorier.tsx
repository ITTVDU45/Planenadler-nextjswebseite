import { NextPage, InferGetStaticPropsType, GetStaticProps } from 'next';

import Categories from '@/shared/components/Category/Categories.component';
import Layout from '@/shared/components/Layout.component';

import client from '@/config/apollo/ApolloClient';

import { FETCH_ALL_CATEGORIES_QUERY } from '@/features/product/api/queries';

/**
 * Category page displays all of the categories
 */
const Kategorier: NextPage = ({
  categories,
}: InferGetStaticPropsType<typeof getStaticProps>) => (
  <Layout title="Kategorier">
    {categories && <Categories categories={categories} />}
  </Layout>
);

export default Kategorier;

export const getStaticProps: GetStaticProps = async () => {
  const result = await client.query({
    query: FETCH_ALL_CATEGORIES_QUERY,
  });

  return {
    props: {
      categories: result.data.productCategories.nodes,
    },
    revalidate: 10,
  };
};
