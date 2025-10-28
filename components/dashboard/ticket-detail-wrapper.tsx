"use client"

import { useAuth } from "@/components/auth-provider"
import { TicketDetail } from "@/components/dashboard/ticket-detail"
import type { Ticket, User } from "@/lib/types"

interface TicketDetailWrapperProps {
  ticket: Ticket
  user: User
  apiUrl: string
}

export function TicketDetailWrapper({ ticket, user, apiUrl }: TicketDetailWrapperProps) {
  const { token } = useAuth()

  if (!token) {
    return <div>Carregando...</div>
  }

  return <TicketDetail ticket={ticket} user={user} apiUrl={apiUrl} token={token} />
}
