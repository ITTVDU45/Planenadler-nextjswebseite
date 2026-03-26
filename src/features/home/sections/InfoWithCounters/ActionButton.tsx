import Link from 'next/link'
import type { ActionButton as ActionButtonType } from '../InfoWithImageRight/types'

interface ActionButtonProps {
  button: ActionButtonType
}

export function ActionButton({ button }: ActionButtonProps) {
  const baseClass =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantClass =
    button.variant === 'primary'
      ? 'bg-[#1F5CAB] text-white hover:bg-[#0F2B52] focus:ring-[#1F5CAB]'
      : 'border-2 border-[#DBE9F9] text-[#1F5CAB] hover:border-[#B9D4F3] hover:bg-[#DBE9F9]/50 focus:ring-[#DBE9F9]'

  return (
    <Link href={button.href} className={`${baseClass} ${variantClass}`}>
      {button.label}
    </Link>
  )
}
