import { useParams } from 'react-router-dom'
import { TicketDetail } from '@/components/tickets/TicketDetail'

export default function TicketPage({ admin = false }: { admin?: boolean }) {
  const { number } = useParams()
  const n = Number(number)
  // key força recarregar ao navegar entre chamados
  return <TicketDetail key={n} number={Number.isFinite(n) ? n : 0} admin={admin} />
}
