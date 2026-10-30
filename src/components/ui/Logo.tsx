import { brand } from '@/config/brand'

/**
 * Marca: atendente com headset e notebook, em duotom nas cores do site (roxo sobre lavanda).
 * Para trocar a logomarca, substitua public/logo-mark.png, public/favicon.png e public/apple-touch-icon.png.
 */
export function LogoMark({ className = 'size-9' }: { className?: string; light?: boolean }) {
  return <img src="/logo-mark.png" alt="" width={256} height={256} className={`${className} shrink-0 select-none`} draggable={false} />
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
