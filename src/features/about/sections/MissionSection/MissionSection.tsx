'use client'

import type { MissionContent } from '../../types'
import { MISSION_CONTENT } from '../../data/aboutContent'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface MissionSectionProps {
  content?: MissionContent
}

export function MissionSection({ content = MISSION_CONTENT }: MissionSectionProps) {
  return (
    <section className="w-full bg-white py-16 lg:py-24">
      <ContentShell>
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl lg:text-4xl">
            {content.title}
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-[#1F5CAB]/80 sm:text-base lg:text-lg">
            {content.text}
          </p>
          {content.points && content.points.length > 0 ? (
            <ul className="mt-8 space-y-4">
              {content.points.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-[#DBE9F9] bg-[#F7FAFF] px-4 py-3 text-sm text-[#1F5CAB]/90 sm:text-base"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1F5CAB] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </ContentShell>
    </section>
  )
}
