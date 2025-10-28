import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getTicketById } from "@/lib/data"
import { PortalHeader } from "@/components/portal/portal-header"
import { PortalShell } from "@/components/portal/portal-shell"
import { UserTicketDetailWrapper } from "@/components/portal/user-ticket-detail-wrapper"
import { getApiUrl } from "@/lib/api-client"

export default async function UserTicketDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.equipe === "T.I") {
    redirect("/dashboard")
  }

  const ticket = await getTicketById(params.id)

  if (!ticket || ticket.email_contato !== user.email) {
    redirect("/portal")
  }

  const apiUrl = getApiUrl()

  return (
    <PortalShell>
      <PortalHeader heading={`Chamado #${ticket.id}`} text="Detalhes do seu chamado" />
      <UserTicketDetailWrapper ticket={ticket} user={user} apiUrl={apiUrl} />
    </PortalShell>
  )
}
