import type { BlogPost } from '../../types'
import Link from 'next/link'

interface BlogSidebarProps {
  recentPosts: BlogPost[]
  tags?: { name: string; slug: string }[]
}

export function BlogSidebar({ recentPosts, tags }: BlogSidebarProps) {
  return (
    <aside className="flex flex-col gap-8">
      {recentPosts.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#1F5CAB]">
            Neueste Beiträge
          </h3>
          <ul className="space-y-3">
            {recentPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm text-[#1F5CAB]/80 transition hover:text-[#1F5CAB]"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags && tags.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#1F5CAB]">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/blog?tag=${tag.slug}`}
                className="rounded-full bg-[#DBE9F9] px-3 py-1 text-xs font-semibold text-[#1F5CAB] transition hover:bg-[#B9D4F3]"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
