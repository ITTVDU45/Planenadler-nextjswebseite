'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FAQ_ITEMS } from './data'
import type { FaqItem } from './types'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface FAQProps {
  items?: FaqItem[]
}

export function FAQ({ items = FAQ_ITEMS }: FAQProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <section className="w-full bg-white py-16 lg:py-24">
      <ContentShell>
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#3982DC]">
              FAQ
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#1F5CAB] sm:text-3xl lg:text-4xl">
              Häufig gestellte Fragen
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#1F5CAB]/75 sm:text-base">
              Eine Auswahl aus verschiedenen Themen – die vollständige Übersicht mit Suche finden Sie auf der{' '}
              <Link
                href="/faq"
                className="font-semibold text-[#1F5CAB] underline underline-offset-4 hover:text-[#3982DC]"
              >
                FAQ-Seite
              </Link>
              .
            </p>
          </div>

          <dl className="mt-10 space-y-3">
            {items.map((item) => {
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
                      aria-controls={`home-faq-${item.id}`}
                      className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-[#1F5CAB] sm:text-base"
                    >
                      {item.question}
                      <span
                        className={[
                          'ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#DBE9F9] bg-white transition-transform duration-200',
                          isOpen ? 'rotate-180' : '',
                        ].join(' ')}
                        aria-hidden
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1F5CAB" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </button>
                  </dt>
                  <dd
                    id={`home-faq-${item.id}`}
                    className={[
                      'overflow-hidden text-sm leading-relaxed text-[#1F5CAB]/80 transition-all duration-300',
                      isOpen ? 'max-h-[32rem] px-5 pb-5' : 'max-h-0',
                    ].join(' ')}
                  >
                    <div
                      className="prose prose-sm max-w-none text-[#1F5CAB]/80 prose-a:text-[#1F5CAB] prose-a:font-semibold prose-a:underline prose-a:underline-offset-4"
                      dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>
      </ContentShell>
    </section>
  )
}
