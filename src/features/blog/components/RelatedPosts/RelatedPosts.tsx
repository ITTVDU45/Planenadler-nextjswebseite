import type { BlogPost } from '../../types'
import { BlogCard } from '../BlogCard/BlogCard'

interface RelatedPostsProps {
  posts: BlogPost[]
  title?: string
}

export function RelatedPosts({ posts, title = 'Weitere Blogartikel' }: RelatedPostsProps) {
  if (!posts.length) return null

  return (
    <section className="mt-12">
      <h3 className="mb-6 text-xl font-bold text-[#1F5CAB] sm:text-2xl">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}
