import Link from 'next/link';
import { ComponentType } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../api/queries';
import LoadingSpinner from '@/shared/components/LoadingSpinner.component';

/**
 * Auth guard: first load is protected by getServerSideProps on the page.
 * Client-side we only show loading or a fallback if session expired.
 */
const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const { data, loading, error } = useQuery(GET_CURRENT_USER, {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    });

    // Show loading while checking authentication
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      );
    }

    // Session expired or error: show message and link (no client-side redirect in useEffect)
    if (error || !data?.customer) {
      return (
        <div className="flex flex-col justify-center items-center min-h-screen gap-4">
          <p className="text-lg">Du er ikke innlogget.</p>
          <Link
            href="/logg-inn"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Gå til innlogging
          </Link>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
