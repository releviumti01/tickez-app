import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getTicketById } from "@/lib/data"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TicketDetailWrapper } from "@/components/dashboard/ticket-detail-wrapper"
import { getApiUrl } from "@/lib/api-client"

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.equipe !== "T.I") {
    redirect("/portal")
  }

  const ticket = await getTicketById(params.id)

  if (!ticket) {
    redirect("/dashboard")
  }

  const apiUrl = getApiUrl()

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Chamado #${ticket.id}`}
        text={`Detalhes do chamado aberto por ${ticket.nome_solicitante}`}
      />
      <TicketDetailWrapper ticket={ticket} user={user} apiUrl={apiUrl} />
    </DashboardShell>
  )
}
