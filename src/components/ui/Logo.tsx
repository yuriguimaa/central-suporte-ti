import { brand } from '@/config/brand'

/**
 * Marca: um canhoto de chamado (recortes laterais + picote) sobre azul-escuro.
 * Para trocar a logomarca, substitua este SVG e o public/favicon.svg.
 */
export function LogoMark({ className = 'size-9', light = false }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill={light ? '#8ECBFF' : '#0A2463'} />
      <path
        d="M6 10.5A1.5 1.5 0 0 1 7.5 9h17a1.5 1.5 0 0 1 1.5 1.5V14a2 2 0 0 0 0 4v3.5a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 6 21.5V18a2 2 0 0 0 0-4z"
        fill={light ? '#0A2463' : '#8ECBFF'}
      />
      <path d="M20 10.5v11" stroke={light ? '#8ECBFF' : '#0A2463'} strokeWidth="1.4" strokeDasharray="1.6 1.6" />
      <path d="M10 16.2l1.9 1.9 3.6-3.8" stroke={light ? '#8ECBFF' : '#0A2463'} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5" translate="no">
      <LogoMark light={light} />
      {!compact && (
        <span
          className={`font-display text-[15px] leading-none font-bold tracking-[-0.01em] whitespace-nowrap ${light ? 'text-white' : 'text-ink'}`}
          style={{ fontStretch: '106%' }}
        >
          {brand.name}
        </span>
      )}
    </span>
  )
}
