import { Suspense } from 'react'
import ProductHero from './components/ProductHero'
import { GoogleReviewSlider } from '@/shared/components/GoogleReviewSlider'
import { BlogShowcase, FAQ } from '@/features/home'
import { mapBlogPostToArticle, getCategoriesFromBlogPosts } from '@/features/home/sections/BlogShowcase/mapBlogPostToArticle'
import { getCachedGoogleReviews, getCachedRecentBlogPosts } from './product-page-cache'
import type { TruckTarpProduct } from './components/types'

function ReviewsSliderSkeleton() {
  return (
    <div className="w-full bg-[#F7FAFF] py-10 md:py-14" aria-hidden>
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#D4E3F7]/60" />
        <div className="mt-6 flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 min-w-[280px] animate-pulse rounded-2xl bg-white/80 shadow-sm"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function BlogSectionSkeleton() {
  return (
    <section className="py-12 md:py-16" aria-hidden>
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-[#EAF1FB]" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-[#F4F9FF]" />
          ))}
        </div>
      </div>
    </section>
  )
}

async function HeroWithGoogleReviews({ product }: { product: TruckTarpProduct }) {
  const googleReviews = await getCachedGoogleReviews()
  return (
    <>
      <ProductHero product={product} googleReviews={googleReviews} />
      <GoogleReviewSlider data={googleReviews} />
    </>
  )
}

async function BlogAndFaqSection() {
  const recentPosts = await getCachedRecentBlogPosts()
  const blogArticles = recentPosts.map(mapBlogPostToArticle)
  const blogCategories = getCategoriesFromBlogPosts(recentPosts)
  return (
    <>
      <BlogShowcase articles={blogArticles} categories={blogCategories} />
      <FAQ />
    </>
  )
}

export function ProductHeroReviewsBoundary({ product }: { product: TruckTarpProduct }) {
  return (
    <Suspense
      fallback={
        <>
          <ProductHero product={product} googleReviews={null} />
          <ReviewsSliderSkeleton />
        </>
      }
    >
      <HeroWithGoogleReviews product={product} />
    </Suspense>
  )
}

export function ProductBlogFaqBoundary() {
  return (
    <Suspense fallback={<BlogSectionSkeleton />}>
      <BlogAndFaqSection />
    </Suspense>
  )
}
