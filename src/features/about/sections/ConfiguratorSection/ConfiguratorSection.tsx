'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ConfiguratorContent } from '../../types'
import { CONFIGURATOR_CONTENT } from '../../data/configurator'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface ConfiguratorSectionProps {
  content?: ConfiguratorContent
}

export function ConfiguratorSection({ content = CONFIGURATOR_CONTENT }: ConfiguratorSectionProps) {
  return (
    <section className="w-full py-16 lg:py-24" style={{ backgroundColor: 'rgb(247, 250, 255)' }}>
      <ContentShell>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-6">
            <h2 className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl lg:text-4xl">
              {content.title}
            </h2>
            <div className="mt-8 space-y-6">
              {content.steps.map((step) => (
                <div
                  key={step.step}
                  className="flex gap-4 rounded-[20px] border border-[#DBE9F9] bg-white p-5 shadow-[0_8px_24px_rgba(31,92,171,0.06)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1F5CAB] text-sm font-bold text-white">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-[#1F5CAB] sm:text-lg">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#1F5CAB]/70">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href={content.ctaHref}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-[#1F5CAB] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0F2B52] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB] focus:ring-offset-2"
            >
              {content.ctaLabel}
            </Link>
          </div>
          <div className="lg:col-span-6">
            {content.image ? (
              <div className="relative overflow-hidden rounded-[2rem] bg-[#DBE9F9] sm:rounded-[2.5rem]">
                <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
                  <Image
                    src={content.image.src}
                    alt={content.image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </ContentShell>
    </section>
  )
}
