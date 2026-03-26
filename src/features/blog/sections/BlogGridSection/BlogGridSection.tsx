import type { BlogPost } from '../../types'
import { BlogCard } from '../../components/BlogCard/BlogCard'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface BlogGridSectionProps {
  posts: BlogPost[]
  heading?: string
}

export function BlogGridSection({ posts, heading }: BlogGridSectionProps) {
  if (!posts.length) return null

  return (
    <section className="w-full bg-white py-12 lg:py-16">
      <ContentShell>
        {heading && (
          <h2 className="mb-8 text-2xl font-bold text-[#1F5CAB] sm:text-3xl">
            {heading}
          </h2>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </ContentShell>
    </section>
  )
}
