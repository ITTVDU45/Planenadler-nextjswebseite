import Link from 'next/link'
import type { ContactInfoItem } from '../types'

interface ContactInfoCardsProps {
  items: ContactInfoItem[]
}

const actionBase =
  'inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-xs font-bold transition-all focus:outline-none focus:ring-2 sm:w-auto'
const actionPrimary = 'bg-white text-[#1F5CAB] hover:bg-[#DBE9F9] focus:ring-white/60'
const actionSecondary =
  'border border-white/70 text-white hover:border-white hover:bg-white/10 focus:ring-white/40'
const actionSecondaryLight =
  'border border-[#DBE9F9] text-[#1F5CAB] hover:border-[#B9D4F3] hover:bg-[#DBE9F9]/30 focus:ring-[#3982DC]/30'

export function ContactInfoCards({ items }: ContactInfoCardsProps) {
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {items.map((card) => {
        const isLight = card.bgColor === '#FFFFFF'
        const secondaryClass = isLight ? actionSecondaryLight : actionSecondary
        const primaryClass = isLight
          ? 'bg-[#3982DC] text-white hover:bg-[#1F5CAB]'
          : actionPrimary

        return (
          <div
            key={card.id}
            className="flex h-full flex-col justify-between rounded-[24px] p-5 sm:p-6 lg:p-8"
            style={{ backgroundColor: card.bgColor }}
          >
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${card.subTextColor}`}
              >
                {card.title}
              </p>
              <div className={`mt-3 text-base font-semibold sm:text-lg ${card.textColor}`}>
                {card.value}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {card.primaryAction && (
                <Link
                  href={card.primaryAction.href}
                  className={`${actionBase} ${primaryClass}`}
                  aria-label={`${card.primaryAction.label} – ${card.title}`}
                >
                  {card.primaryAction.label}
                </Link>
              )}
              {card.secondaryAction && (
                <Link
                  href={card.secondaryAction.href}
                  className={`${actionBase} ${secondaryClass}`}
                  aria-label={`${card.secondaryAction.label} – ${card.title}`}
                >
                  {card.secondaryAction.label}
                </Link>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
