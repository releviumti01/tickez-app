import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { UserSettings } from "@/components/dashboard/user-settings"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Configurações" text="Gerencie suas configurações de usuário." />
      <div className="mt-6">
        <UserSettings user={user} />
      </div>
    </DashboardShell>
  )
}