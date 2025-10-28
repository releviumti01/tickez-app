import type React from "react"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { getCurrentUser } from "@/lib/auth"
import { unstable_noStore as noStore } from "next/cache"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { PortalNav } from "@/components/portal/portal-nav"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Indica ao Next.js que este layout deve ser renderizado dinamicamente
  noStore()

  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.equipe === "T.I") {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={user} />

      {/* Menu móvel */}
      <div className="sticky top-14 z-30 flex items-center border-b bg-background py-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu de navegação</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] max-w-sm pt-10">
            <div className="flex flex-col space-y-2 px-2 py-4">
              <PortalNav orientation="vertical" user={user} /> {/* Passe o user aqui */}
            </div>
          </SheetContent>
        </Sheet>
        <div className="text-sm font-medium">Portal</div>
      </div>

      <main className="flex-1">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  )
}
