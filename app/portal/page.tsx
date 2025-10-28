import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { PortalHeader } from "@/components/portal/portal-header"
import { PortalShell } from "@/components/portal/portal-shell"
import { UserTicketListWrapper } from "@/components/portal/user-ticket-list-wrapper"

export default async function PortalPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.equipe === "T.I") {
    redirect("/dashboard")
  }

  return (
    <PortalShell>
      <PortalHeader heading="Meus Chamados" text="Visualize e gerencie seus chamados abertos." />
      <div className="mt-6">
        <UserTicketListWrapper />
      </div>
    </PortalShell>
  )
}
