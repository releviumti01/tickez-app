"use client"

import { useAuth } from "@/components/auth-provider"
import { UserTicketDetail } from "@/components/portal/user-ticket-detail"
import type { Ticket, User } from "@/lib/types"

interface UserTicketDetailWrapperProps {
  ticket: Ticket
  user: User
  apiUrl: string
}

export function UserTicketDetailWrapper({ ticket, user, apiUrl }: UserTicketDetailWrapperProps) {
  const { token } = useAuth()

  if (!token) {
    return <div>Carregando...</div>
  }

  return <UserTicketDetail ticket={ticket} user={user} apiUrl={apiUrl} token={token} />
}
