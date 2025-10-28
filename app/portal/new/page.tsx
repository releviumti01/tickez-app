import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { PortalHeader } from "@/components/portal/portal-header"
import { PortalShell } from "@/components/portal/portal-shell"
import { NewTicketForm } from "@/components/portal/new-ticket-form"

export default async function NewTicketPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.equipe === "T.I") {
    redirect("/dashboard")
  }

  return (
    <PortalShell>
      <PortalHeader heading="Abrir Novo Chamado" text="Preencha o formulário abaixo para abrir um novo chamado." />
      <div className="mt-6">
        <NewTicketForm user={user} />
      </div>
    </PortalShell>
  )
}
