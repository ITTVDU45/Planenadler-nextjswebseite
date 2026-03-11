'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

const Sheet = Dialog.Root
const SheetTrigger = Dialog.Trigger
const SheetClose = Dialog.Close
const SheetPortal = Dialog.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity',
      className,
    )}
    {...props}
  />
))
SheetOverlay.displayName = 'SheetOverlay'

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Content> {
  side?: 'left' | 'right' | 'top' | 'bottom'
  closeClassName?: string
  hideClose?: boolean
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  SheetContentProps
>(({ side = 'right', className, children, closeClassName, hideClose = false, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <Dialog.Content
      ref={ref}
      className={cn(
        'fixed z-50 flex h-full flex-col gap-4 border-l border-white/10 bg-[#0F2B52] p-6 text-white shadow-2xl transition',
        side === 'right' && 'inset-y-0 right-0 w-[280px]',
        side === 'left' && 'inset-y-0 left-0 w-[280px]',
        side === 'top' && 'inset-x-0 top-0 h-[280px]',
        side === 'bottom' && 'inset-x-0 bottom-0 h-[280px]',
        className,
      )}
      {...props}
    >
      {children}
      {!hideClose ? (
        <SheetClose
          className={cn(
            'absolute right-4 top-4 z-10 rounded-full border border-white/20 p-2 text-white/80 transition hover:text-white',
            closeClassName,
          )}
        >
          <span className="sr-only">Close</span>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
            <path
              d="M1 1l10 10M11 1L1 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </SheetClose>
      ) : null}
    </Dialog.Content>
  </SheetPortal>
))
SheetContent.displayName = 'SheetContent'

export { Sheet, SheetTrigger, SheetClose, SheetContent }
