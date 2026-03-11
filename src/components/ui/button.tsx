import * as React from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'default' | 'secondary' | 'outline'
type ButtonSize = 'default' | 'sm' | 'lg'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-[#1F5CAB] text-white hover:bg-[#164887] focus-visible:ring-[#1F5CAB]/50',
  secondary:
    'bg-[#DBE9F9] text-[#1F5CAB] hover:bg-[#C9DEF6] focus-visible:ring-[#1F5CAB]/30',
  outline:
    'border border-[#DBE9F9] bg-white text-[#1F5CAB] hover:bg-[#F4F8FE] focus-visible:ring-[#1F5CAB]/30',
}

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-11 px-5 py-2.5 text-sm',
  sm: 'h-9 px-4 py-2 text-xs',
  lg: 'h-12 px-6 py-3 text-base',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    type = 'button',
    asChild = false,
    children,
    ...props
  }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-60',
      variantClasses[variant],
      sizeClasses[size],
      className,
    )

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<{ className?: string }>,
        {
          className: cn(classes, (children.props as { className?: string }).className),
        },
      )
    }

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
