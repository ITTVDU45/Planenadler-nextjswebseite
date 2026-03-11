interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="flex w-full items-center gap-2 rounded-full bg-[#DBE9F9] px-4 py-2 text-xs text-[#1F5CAB] sm:text-sm">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1F5CAB"
        strokeWidth="1.5"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search"
        className="w-full bg-transparent text-xs outline-none placeholder:text-[#1F5CAB]/60 sm:text-sm"
        aria-label="Artikel durchsuchen"
      />
    </label>
  )
}
