'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { ContentShell } from '@/shared/components/ContentShell.component'
import type { FaqItem } from '@/features/about/types'

interface FaqPageContentProps {
  items: FaqItem[]
}

function normalizeSearchValue(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function FaqPageContent({ items }: FaqPageContentProps) {
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)
  const deferredQuery = useDeferredValue(query)

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(deferredQuery)
    if (!normalizedQuery) return items

    return items.filter((item) => {
      const haystack = normalizeSearchValue(`${item.question} ${item.answer}`)
      return haystack.includes(normalizedQuery)
    })
  }, [deferredQuery, items])

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      <ContentShell>
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[2rem] border border-[#DBE9F9] bg-[#F7FAFF] p-6 shadow-[0_12px_30px_rgba(31,92,171,0.08)] sm:p-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#3982DC]">
                FAQ
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#1F5CAB] sm:text-3xl lg:text-4xl">
                Fragen schnell finden
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#1F5CAB]/75 sm:text-base">
                Tippen Sie ein Stichwort wie Lieferung, Masse, wasserdicht oder
                Befestigung ein. Die Liste filtert sich sofort beim Schreiben.
              </p>
            </div>

            <div className="mt-6">
              <label htmlFor="faq-search" className="sr-only">
                FAQ durchsuchen
              </label>
              <div className="flex items-center gap-3 rounded-full border border-[#DBE9F9] bg-white px-5 py-3 shadow-[0_8px_20px_rgba(31,92,171,0.06)]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5CAB"
                  strokeWidth="1.8"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                  id="faq-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Frage oder Stichwort eingeben"
                  className="w-full bg-transparent text-sm text-[#1F5CAB] outline-none placeholder:text-[#1F5CAB]/45 sm:text-base"
                />
              </div>
              <p className="mt-3 text-sm text-[#1F5CAB]/70">
                {filteredItems.length} {filteredItems.length === 1 ? 'Frage gefunden' : 'Fragen gefunden'}
              </p>
            </div>
          </div>

          <dl className="mt-8 space-y-3">
            {filteredItems.map((item) => {
              const isOpen = openId === item.id
              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF]"
                >
                  <dt>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${item.id}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-[#1F5CAB] sm:px-6 sm:text-base"
                    >
                      <span>{item.question}</span>
                      <span
                        className={[
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DBE9F9] bg-white transition-transform duration-200',
                          isOpen ? 'rotate-180' : '',
                        ].join(' ')}
                        aria-hidden
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1F5CAB"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </button>
                  </dt>
                  <dd
                    id={`faq-answer-${item.id}`}
                    className={[
                      'overflow-hidden text-sm leading-relaxed text-[#1F5CAB]/80 transition-all duration-300',
                      isOpen ? 'max-h-96 px-5 pb-5 sm:px-6 sm:pb-6' : 'max-h-0',
                    ].join(' ')}
                  >
                    {item.answer}
                  </dd>
                </div>
              )
            })}
          </dl>

          {filteredItems.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900">
              Keine passende Frage gefunden. Versuchen Sie ein anderes Stichwort
              oder kontaktieren Sie uns direkt.
            </div>
          ) : null}
        </div>
      </ContentShell>
    </section>
  )
}
