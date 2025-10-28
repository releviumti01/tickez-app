import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { PortalHeader } from "@/components/portal/portal-header"
import { PortalShell } from "@/components/portal/portal-shell"
import { UserSettings } from "@/components/portal/user-settings"

export default async function PortalSettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.equipe === "T.I") {
    redirect("/dashboard/settings")
  }

  return (
    <PortalShell>
      <PortalHeader heading="Configurações" text="Gerencie suas configurações de usuário." />
      <div className="mt-6">
        <UserSettings user={user} />
      </div>
    </PortalShell>
  )
}
