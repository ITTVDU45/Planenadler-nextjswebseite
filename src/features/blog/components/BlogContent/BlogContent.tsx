interface BlogContentProps {
  html: string
}

export function BlogContent({ html }: BlogContentProps) {
  return (
    <div
      className="prose prose-lg max-w-none text-[#1F5CAB]/90 prose-headings:text-[#1F5CAB] prose-a:text-[#3982DC] prose-a:underline prose-img:rounded-2xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
