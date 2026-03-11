// Components
import Layout from '@/shared/components/Layout.component';
import CartContents from '@/features/cart/components/CartContents.component';

// Types
import type { NextPage } from 'next';

const Handlekurv: NextPage = () => (
  <Layout title="Handlekurv">
    <CartContents />
  </Layout>
);

export default Handlekurv;
