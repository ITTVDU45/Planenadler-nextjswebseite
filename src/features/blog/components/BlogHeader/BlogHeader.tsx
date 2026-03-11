import Link from 'next/link'
import type { BlogPost } from '../../types'

interface BlogHeaderProps {
  post: BlogPost
}

export function BlogHeader({ post }: BlogHeaderProps) {
  const firstCategory = post.categories?.[0] ?? (post.category ? { name: post.category, slug: post.category.toLowerCase().replace(/\s+/g, '-') } : null)

  return (
    <header className="mb-6 sm:mb-8">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#1F5CAB]/70">
          <li>
            <Link href="/" className="transition hover:text-[#1F5CAB]">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/blog" className="transition hover:text-[#1F5CAB]">
              Blog
            </Link>
          </li>
          {firstCategory ? (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/blog?category=${encodeURIComponent(firstCategory.slug)}`}
                  className="transition hover:text-[#1F5CAB]"
                >
                  {firstCategory.name}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden>/</li>
          <li className="text-[#1F5CAB]/90" aria-current="page">
            {post.title}
          </li>
        </ol>
      </nav>
      <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-[#1F5CAB] sm:text-4xl lg:text-5xl">
        {post.title}
      </h1>
    </header>
  )
}
