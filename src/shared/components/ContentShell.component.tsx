import { ReactNode } from 'react'

interface ContentShellProps {
  children: ReactNode
  className?: string
}

export function ContentShell({ children, className }: ContentShellProps) {
  const base =
    'mx-auto w-full max-w-full px-4 sm:px-6 lg:max-w-[1440px] lg:px-8'
  const classes = className ? `${base} ${className}` : base

  return <div className={classes}>{children}</div>
}
