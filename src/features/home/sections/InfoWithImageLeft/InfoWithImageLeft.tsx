import Image from 'next/image'
import Link from 'next/link'
import { INFO_WITH_IMAGE_LEFT } from './data'
import type { InfoWithImageLeftContent } from './types'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface InfoWithImageLeftProps {
  content?: InfoWithImageLeftContent
}

export function InfoWithImageLeft({ content = INFO_WITH_IMAGE_LEFT }: InfoWithImageLeftProps) {
  return (
    <section className="w-full bg-[#F4F8FD] py-16 lg:py-24">
      <ContentShell>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Bild links */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-[#DBE9F9] sm:aspect-[16/11]">
            <Image
              src={content.image.src}
              alt={content.image.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Text rechts */}
          <div>
            <h2 className="text-2xl font-bold leading-tight text-[#1F5CAB] sm:text-3xl lg:text-4xl">
              {content.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#1F5CAB]/80 sm:text-base">
              {content.description}
            </p>

            {content.points && content.points.length > 0 && (
              <ul className="mt-6 space-y-3">
                {content.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#1F5CAB]/90 sm:text-base">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1F5CAB] text-[10px] font-bold text-white">
                      ✓
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            )}

            {content.ctaLabel && content.ctaHref && (
              <div className="mt-8">
                <Link
                  href={content.ctaHref}
                  className="inline-flex items-center justify-center rounded-full bg-[#1F5CAB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0F2B52] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB] focus:ring-offset-2"
                >
                  {content.ctaLabel}
                </Link>
              </div>
            )}
          </div>
        </div>
      </ContentShell>
    </section>
  )
}
