import { CounterItem } from './CounterItem'
import { INFO_WITH_COUNTERS } from './data'
import type { InfoWithCountersContent } from './types'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface InfoWithCountersProps {
  content?: InfoWithCountersContent
}

export function InfoWithCounters({ content = INFO_WITH_COUNTERS }: InfoWithCountersProps) {
  return (
    <section className="w-full bg-[#1F5CAB] py-16 lg:py-24">
      <ContentShell>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            {content.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
            {content.description}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {content.counters.map((counter) => (
            <div key={counter.id} className="flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {counter.value}
              </div>
              <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-white/60 sm:text-xs">
                {counter.label}
              </div>
            </div>
          ))}
        </div>
      </ContentShell>
    </section>
  )
}
