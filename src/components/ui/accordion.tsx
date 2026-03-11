'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface AccordionContextValue {
  openValue: string | null
  setOpenValue: (value: string | null) => void
  collapsible: boolean
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

function useAccordionContext() {
  const context = React.useContext(AccordionContext)
  if (!context) {
    throw new Error('Accordion components must be used within <Accordion>')
  }
  return context
}

interface AccordionProps {
  type?: 'single'
  collapsible?: boolean
  defaultValue?: string
  className?: string
  children: React.ReactNode
}

export function Accordion({
  type = 'single',
  collapsible = true,
  defaultValue,
  className,
  children,
}: AccordionProps) {
  const [openValue, setOpenValue] = React.useState<string | null>(
    defaultValue ?? null,
  )

  if (type !== 'single') {
    throw new Error('Only single accordion type is supported in this project.')
  }

  return (
    <AccordionContext.Provider value={{ openValue, setOpenValue, collapsible }}>
      <div className={cn('w-full', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemContextValue {
  value: string
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null)

function useAccordionItemContext() {
  const context = React.useContext(AccordionItemContext)
  if (!context) {
    throw new Error('AccordionItem subcomponents must be used within <AccordionItem>')
  }
  return context
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function AccordionItem({ value, className, ...props }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div
        className={cn('rounded-xl border border-[#E7EEF8] bg-white', className)}
        {...props}
      />
    </AccordionItemContext.Provider>
  )
}

export function AccordionTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { openValue, setOpenValue, collapsible } = useAccordionContext()
  const { value } = useAccordionItemContext()
  const isOpen = openValue === value

  const toggle = () => {
    if (isOpen && collapsible) {
      setOpenValue(null)
      return
    }
    setOpenValue(value)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold text-[#0F2B52] transition hover:bg-[#F8FBFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5CAB]/30',
        className,
      )}
      aria-expanded={isOpen}
      {...props}
    >
      <span>{children}</span>
      <span className={cn('text-[#1F5CAB] transition-transform', isOpen && 'rotate-45')}>+</span>
    </button>
  )
}

export function AccordionContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { openValue } = useAccordionContext()
  const { value } = useAccordionItemContext()
  const isOpen = openValue === value
  if (!isOpen) return null

  return (
    <div className={cn('border-t border-[#EEF3FB] px-4 py-3 text-sm text-[#1F5CAB]/85', className)} {...props}>
      {children}
    </div>
  )
}
