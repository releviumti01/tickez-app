import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getUserById } from "@/lib/data"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { UserDetail } from "@/components/dashboard/user-detail"

export default async function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect("/")
  }

  if (currentUser.equipe !== "T.I") {
    redirect("/portal")
  }

  const user = await getUserById(params.id)

  if (!user) {
    redirect("/dashboard/users")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={`Usuário: ${user.nome}`} text="Detalhes e gerenciamento do usuário." />
      <div className="mt-6">
        <UserDetail user={user} currentUser={currentUser} />
      </div>
    </DashboardShell>
  )
}
