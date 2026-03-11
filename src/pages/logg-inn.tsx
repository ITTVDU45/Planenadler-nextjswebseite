import Layout from '@/shared/components/Layout.component';
import UserLogin from '@/features/auth/components/UserLogin.component';

import type { NextPage } from 'next';

const LoginPage: NextPage = () => {
  return (
    <Layout title="Logg inn">
      <div className="container mx-auto px-4 py-8">
        <UserLogin />
      </div>
    </Layout>
  );
};

export default LoginPage;
