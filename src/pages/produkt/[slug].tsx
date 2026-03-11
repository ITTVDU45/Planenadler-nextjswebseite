import type { GetServerSideProps } from 'next'

export default function LegacyProduktRedirect() {
  return null
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = typeof params?.slug === 'string' ? params.slug : ''

  return {
    redirect: {
      destination: `/product/${slug}`,
      permanent: false,
    },
  }
}
