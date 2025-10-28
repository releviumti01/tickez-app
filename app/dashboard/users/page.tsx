import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { UsersList } from "@/components/dashboard/users-list"
import { getUsers } from "@/lib/data"

export default async function UsersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.equipe !== "T.I") {
    redirect("/portal")
  }

  const users = await getUsers()

  return (
    <DashboardShell>
      <DashboardHeader heading="Usuários" text="Gerencie os usuários do sistema." />
      <div className="mt-6">
        <UsersList users={users} />
      </div>
    </DashboardShell>
  )
}
