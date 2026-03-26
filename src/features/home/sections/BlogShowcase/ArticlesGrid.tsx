import type { Article } from './types'
import { ArticleCard } from './ArticleCard'

interface ArticlesGridProps {
  articles: Article[]
}

export function ArticlesGrid({ articles }: ArticlesGridProps) {
  if (!articles.length) return null

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
