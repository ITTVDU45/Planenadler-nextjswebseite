import type { Counter } from './types'

interface CounterItemProps {
  item: Counter
}

export function CounterItem({ item }: CounterItemProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="text-4xl font-black tracking-tight text-[#1F5CAB] sm:text-5xl lg:text-6xl">
        {item.value}
      </div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[#3982DC]/70 sm:text-xs">
        {item.label}
      </div>
    </div>
  )
}
