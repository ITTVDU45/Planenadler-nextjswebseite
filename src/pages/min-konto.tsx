import Layout from '@/shared/components/Layout.component';
import CustomerAccount from '@/features/auth/components/CustomerAccount.component';
import withAuth from '@/features/auth/components/withAuth.component';

import type { GetServerSideProps, NextPage } from 'next';

const CUSTOMER_QUERY = `
  query GET_CURRENT_USER {
    customer {
      id
    }
  }
`;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  const cookie = req.headers.cookie ?? '';

  if (!graphqlUrl) {
    return { props: {} };
  }

  try {
    const res = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
      body: JSON.stringify({
        query: CUSTOMER_QUERY,
      }),
    });
    const json = (await res.json()) as { data?: { customer?: unknown } };
    if (!json?.data?.customer) {
      return {
        redirect: {
          destination: '/logg-inn',
          permanent: false,
        },
      };
    }
  } catch {
    return {
      redirect: {
        destination: '/logg-inn',
        permanent: false,
      },
    };
  }
  return { props: {} };
};

const CustomerAccountPage: NextPage = () => {
  return (
    <Layout title="Min konto">
      <div className="container mx-auto px-4 py-8">
        <CustomerAccount />
      </div>
    </Layout>
  );
};

export default withAuth(CustomerAccountPage);
