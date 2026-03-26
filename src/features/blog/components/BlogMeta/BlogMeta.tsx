interface BlogMetaProps {
  date: string
  category?: string
  readingTimeMin?: number
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export function BlogMeta({ date, category, readingTimeMin }: BlogMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#3982DC]">
      <time dateTime={date}>{formatDate(date)}</time>
      {category ? (
        <>
          <span aria-hidden>·</span>
          <span>{category}</span>
        </>
      ) : null}
      {readingTimeMin ? (
        <>
          <span aria-hidden>·</span>
          <span>{readingTimeMin} Min. Lesezeit</span>
        </>
      ) : null}
    </div>
  )
}
