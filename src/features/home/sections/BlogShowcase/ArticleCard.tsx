import Image from 'next/image'
import Link from 'next/link'
import type { Article } from './types'

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="flex h-full min-h-[23rem] w-full flex-col rounded-[2rem] bg-white p-4 shadow-[0_10px_30px_rgba(31,92,171,0.08)] sm:min-h-[24rem] sm:p-5">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-[#DBE9F9]">
        <Image
          src={article.image.src}
          alt={article.image.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="mt-4 text-xs font-semibold uppercase text-[#3982DC]">
        {article.category.replace('-', ' ')}
      </div>
      <div className="mt-1 text-xs text-[#3982DC]/80">
        {article.date} · {article.readTime}
      </div>
      <h3 className="mt-2 h-[4.8rem] overflow-hidden text-base font-semibold text-[#1F5CAB] sm:h-[5.4rem] sm:text-lg">
        {article.title}
      </h3>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 overflow-hidden rounded-full bg-[#DBE9F9]">
            <Image
              src={article.author.avatar.src}
              alt={article.author.avatar.alt}
              width={28}
              height={28}
              className="h-7 w-7 object-cover"
            />
          </div>
          <span className="text-xs text-[#1F5CAB]">{article.author.name}</span>
        </div>
        {article.slug ? (
          <Link
            href={`/blog/${article.slug}`}
            className="ml-auto rounded-full bg-[#1F5CAB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1a4d8c] sm:text-sm"
          >
            Mehr dazu
          </Link>
        ) : null}
      </div>
    </article>
  )
}
