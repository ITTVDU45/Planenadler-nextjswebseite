import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '../../types'

interface BlogCardProps {
  post: BlogPost
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] shadow-[0_8px_24px_rgba(31,92,171,0.06)] transition hover:border-[#B9D4F3] hover:shadow-[0_12px_30px_rgba(31,92,171,0.12)] hover:-translate-y-0.5">
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] w-full overflow-hidden bg-[#DBE9F9]">
        <Image
          src={post.coverImage.src}
          alt={post.coverImage.alt}
          fill
          className="object-cover transition group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#3982DC]">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {post.category ? (
            <>
              <span aria-hidden>·</span>
              <span>{post.category}</span>
            </>
          ) : null}
        </div>
        <h2 className="line-clamp-2 text-base font-semibold text-[#1F5CAB] sm:text-lg">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm text-[#1F5CAB]/70">
          {post.excerpt}
        </p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex w-fit rounded-full bg-[#1F5CAB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1a4d8c]"
        >
          Mehr dazu
        </Link>
      </div>
    </article>
  )
}
