import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { getCurrentUser } from "@/lib/auth"
import { Logo } from "@/components/logo"
import { unstable_noStore as noStore } from "next/cache"

export default async function Home() {
  // Indica ao Next.js que esta página deve ser renderizada dinamicamente
  noStore()

  const user = await getCurrentUser()

  if (user) {
    redirect(user.equipe === "T.I" ? "/dashboard" : "/portal")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo className="h-16 w-16" />
          <h1 className="text-3xl font-bold">Tickez</h1>
          <p className="text-muted-foreground">Sistema de Gestão de Chamados</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
