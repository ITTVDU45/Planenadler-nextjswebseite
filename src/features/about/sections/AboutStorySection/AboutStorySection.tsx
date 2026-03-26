import type { AboutStoryContent } from '../../types'
import { ABOUT_STORY_CONTENT } from '../../data/aboutContent'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface AboutStorySectionProps {
  content?: AboutStoryContent
}

export function AboutStorySection({ content = ABOUT_STORY_CONTENT }: AboutStorySectionProps) {
  return (
    <section className="w-full bg-[#F4F8FD] py-16 lg:py-24">
      <ContentShell>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#3982DC]">
              {content.title}
            </p>
            {content.paragraphs.map((para, i) => (
              <p
                key={i}
                className="mt-4 text-sm leading-relaxed text-[#1F5CAB]/80 sm:text-base"
              >
                {para}
              </p>
            ))}

            {content.highlights && content.highlights.length > 0 && (
              <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2">
                {content.highlights.map((h) => (
                  <div
                    key={h.label}
                    className="rounded-2xl border border-[#DBE9F9] bg-white px-4 py-4 shadow-sm"
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wider text-[#3982DC]">
                      {h.label}
                    </dt>
                    <dd className="mt-1 text-sm font-bold text-[#1F5CAB]">{h.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {content.storyTitle && (
            <div className="rounded-[2rem] bg-[#1F5CAB] p-7 text-white sm:p-10">
              <h2 className="text-xl font-bold sm:text-2xl lg:text-3xl">
                {content.storyTitle}
              </h2>
              {content.storyParagraph && (
                <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                  {content.storyParagraph}
                </p>
              )}
            </div>
          )}
        </div>
      </ContentShell>
    </section>
  )
}
