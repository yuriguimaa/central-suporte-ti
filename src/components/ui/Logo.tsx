import { brand } from '@/config/brand'

/** Marca: um "ticket" com picote e um visto. Troque o SVG para personalizar. */
export function LogoMark({ className = 'size-9', light = false }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill={light ? '#1A4775' : '#0B2545'} />
      <path
        d="M8 11.5A2.5 2.5 0 0 1 10.5 9h11a2.5 2.5 0 0 1 2.5 2.5v2a2 2 0 0 0 0 4v2a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 8 19.5v-2a2 2 0 0 0 0-4z"
        fill="#4CB3F4"
      />
      <path d="M13 15.5l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark light={light} />
      {!compact && (
        <span className={`font-display text-[15px] font-semibold leading-tight ${light ? 'text-white' : 'text-ink'}`}>
          {brand.name}
        </span>
      )}
    </span>
  )
}
