// Identidade da plataforma. Para personalizar, altere as variáveis
// VITE_APP_NAME / VITE_APP_SHORT_NAME no .env ou edite os valores abaixo.
// A logomarca fica em src/components/ui/Logo.tsx (SVG) e public/favicon.svg.
export const brand = {
  name: import.meta.env.VITE_APP_NAME || 'Central de Suporte TI',
  shortName: import.meta.env.VITE_APP_SHORT_NAME || 'Suporte TI',
  tagline: 'Atendimento técnico de informática',
}
