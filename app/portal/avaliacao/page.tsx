import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { PortalHeader } from "@/components/portal/portal-header"
import { PortalShell } from "@/components/portal/portal-shell"
import { UserEvaluationList } from "@/components/portal/user-evaluation-list"

export default async function AvaliacaoPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.equipe === "T.I") {
    redirect("/dashboard")
  }

  return (
    <PortalShell>
      <PortalHeader heading="Avaliação" text="Avalie os chamados concluídos pela equipe de T.I." />
      <div className="mt-6">
        <UserEvaluationList />
      </div>
    </PortalShell>
  )
}