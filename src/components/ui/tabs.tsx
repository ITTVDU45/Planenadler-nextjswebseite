'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  value: string
  setValue: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within <Tabs>')
  }
  return context
}

interface TabsProps {
  defaultValue: string
  className?: string
  children: React.ReactNode
}

export function Tabs({ defaultValue, className, children }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue)
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex w-full flex-wrap gap-2 rounded-xl bg-[#F4F8FE] p-2',
        className,
      )}
      {...props}
    />
  )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const { value: currentValue, setValue } = useTabsContext()
  const isActive = currentValue === value

  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      className={cn(
        'rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5CAB]/30',
        isActive
          ? 'bg-white text-[#1F5CAB] shadow-[0_2px_8px_rgba(15,43,82,0.12)]'
          : 'text-[#1F5CAB]/75 hover:bg-white/60 hover:text-[#1F5CAB]',
        className,
      )}
      aria-selected={isActive}
      role="tab"
      {...props}
    />
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({ value, className, ...props }: TabsContentProps) {
  const { value: currentValue } = useTabsContext()
  if (currentValue !== value) return null

  return <div className={cn('mt-6', className)} role="tabpanel" {...props} />
}
