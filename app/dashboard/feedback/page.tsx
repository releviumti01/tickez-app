import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { FeedbackView } from "@/components/dashboard/feedback-view"

export default async function FeedbackPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.equipe !== "T.I") {
    redirect("/portal")
  }

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Feedback" 
        text="Visualize e gerencie feedbacks dos usuários sobre atendimentos e sistema." 
      />
      <div className="mt-6">
        <FeedbackView />
      </div>
    </DashboardShell>
  )
}