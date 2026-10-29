// Identidade da plataforma. Para personalizar, altere as variáveis
// VITE_APP_NAME / VITE_APP_SHORT_NAME no .env ou edite os valores abaixo.
// A logomarca fica em public/logo-mark.png (usada por src/components/ui/Logo.tsx) e public/favicon.png.
export const brand = {
  name: import.meta.env.VITE_APP_NAME || 'Called for Yuri',
  shortName: import.meta.env.VITE_APP_SHORT_NAME || 'Called',
  tagline: 'Atendimento técnico de informática',
}
