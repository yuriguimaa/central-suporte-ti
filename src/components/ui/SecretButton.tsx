import { useRef, useState } from 'react'

/** Easter egg: botão "NÃO APERTE" que toca um áudio. Clicar de novo reinicia. */
export function SecretButton() {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  const play = () => {
    if (!audio.current) {
      audio.current = new Audio('/audio/nao-aperte.mp3')
      audio.current.onended = () => setPlaying(false)
    }
    audio.current.currentTime = 0
    audio.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  return (
    <button
      type="button"
      onClick={play}
      className={`rounded border border-red-400/60 bg-red-600 px-1.5 py-px font-display text-[8px] leading-tight font-bold tracking-wide text-white shadow-[0_1px_0_#7f1d1d] transition-transform hover:bg-red-500 active:translate-y-0.5 active:shadow-none ${
        playing ? 'animate-pulse' : ''
      }`}
      title="Sério, não aperte."
    >
      NÃO APERTE
    </button>
  )
}
