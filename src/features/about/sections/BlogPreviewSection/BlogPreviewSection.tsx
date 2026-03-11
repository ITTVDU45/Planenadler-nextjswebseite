'use client'

import Link from 'next/link'
import type { BlogPreviewItem } from '../../types'
import { BLOG_PREVIEW_ITEMS } from '../../data/blogPreview'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface BlogPreviewSectionProps {
  items?: BlogPreviewItem[]
}

export function BlogPreviewSection({ items = BLOG_PREVIEW_ITEMS }: BlogPreviewSectionProps) {
  return (
    <section className="w-full bg-white py-16 lg:py-24">
      <ContentShell>
        <h2 className="mb-10 text-center text-2xl font-bold text-[#1F5CAB] sm:text-3xl lg:text-4xl">
          Aus unserem Blog
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col rounded-[24px] border border-[#DBE9F9] bg-[#F7FAFF] p-6 shadow-[0_8px_24px_rgba(31,92,171,0.06)] transition hover:border-[#B9D4F3] hover:shadow-[0_12px_30px_rgba(31,92,171,0.12)]"
            >
              <h3 className="text-base font-semibold text-[#1F5CAB] group-hover:underline sm:text-lg">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-[#1F5CAB]/70">{item.excerpt}</p>
              <span className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#3982DC]">
                Weiterlesen →
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center rounded-full border border-[#1F5CAB] px-5 py-2.5 text-sm font-semibold text-[#1F5CAB] transition hover:bg-[#1F5CAB] hover:text-white"
          >
            Alle Blog-Artikel
          </Link>
        </div>
      </ContentShell>
    </section>
  )
}
