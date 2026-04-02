import { NextPage, InferGetStaticPropsType, GetStaticProps } from 'next';

import Categories from '@/shared/components/Category/Categories.component';
import Layout from '@/shared/components/Layout.component';

import { FETCH_ALL_CATEGORIES_QUERY } from '@/features/product/api/queries';
import { fetchGraphqlWithFallback } from '@/features/product/api/server-fetch';

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
  let categories: { id: string; name: string; slug: string }[] = []

  try {
    const result = await fetchGraphqlWithFallback<{
      productCategories?: { nodes?: { id: string; name: string; slug: string }[] }
    }>(FETCH_ALL_CATEGORIES_QUERY)

    categories = result.productCategories?.nodes ?? []
  } catch (error) {
    console.error('[CategoriesPage] GraphQL fetch failed', error)
  }

  return {
    props: {
      categories,
    },
    revalidate: 10,
  };
};
