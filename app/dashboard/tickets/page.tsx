import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TicketListWrapper } from "@/components/dashboard/ticket-list-wrapper"

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.equipe !== "T.I") {
    redirect("/portal")
  }

  const status = searchParams.status || "all"

  return (
    <DashboardShell>
      <DashboardHeader heading="Chamados" text="Gerencie todos os chamados abertos no sistema." />
      <div className="mt-6">
        <TicketListWrapper status={status} />
      </div>
    </DashboardShell>
  )
}
