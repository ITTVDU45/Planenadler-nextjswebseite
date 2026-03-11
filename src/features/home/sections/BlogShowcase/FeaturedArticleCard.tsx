import Image from 'next/image'
import Link from 'next/link'
import type { Article } from './types'

interface FeaturedArticleCardProps {
  article: Article
  compact?: boolean
}

export function FeaturedArticleCard({
  article,
  compact = false,
}: FeaturedArticleCardProps) {
  return (
    <article
      className={[
        'w-full rounded-[1.5rem] bg-white shadow-[0_8px_24px_rgba(31,92,171,0.08)]',
        compact
          ? 'grid grid-cols-1 gap-3 p-3'
          : 'grid grid-cols-1 gap-5 p-4 lg:grid-cols-2 lg:gap-6 lg:p-5',
      ].join(' ')}
    >
      <div
        className={[
          'relative w-full overflow-hidden rounded-[1.5rem] bg-[#DBE9F9]',
          compact ? 'h-28' : 'h-48 sm:h-56 lg:h-64',
        ].join(' ')}
      >
        <Image
          src={article.image.src}
          alt={article.image.alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      <div className="flex flex-col justify-center">
        <div className="text-xs font-semibold uppercase text-[#3982DC]">
          {article.category.replace('-', ' ')}
        </div>
        <div className="mt-2 text-xs text-[#3982DC]/80">
          {article.date} · {article.readTime}
        </div>
        <h3
          className={[
            'mt-3 font-bold text-[#1F5CAB]',
            compact ? 'text-sm' : 'text-xl lg:text-2xl',
          ].join(' ')}
        >
          {article.title}
        </h3>
        <p className={compact ? 'mt-2 text-xs text-[#1F5CAB]/80' : 'mt-2 text-sm text-[#1F5CAB]/80'}>
          {article.excerpt}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-[#DBE9F9]">
              <Image
                src={article.author.avatar.src}
                alt={article.author.avatar.alt}
                width={32}
                height={32}
                className="h-8 w-8 object-cover"
              />
            </div>
            <span className="text-xs text-[#1F5CAB]">{article.author.name}</span>
          </div>
          {article.slug ? (
            <Link
              href={`/blog/${article.slug}`}
              className={[
                'rounded-full bg-[#1F5CAB] font-semibold text-white transition hover:bg-[#1a4d8c]',
                compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
              ].join(' ')}
            >
              Mehr dazu
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}
