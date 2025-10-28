import type React from "react"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { SiteHeader } from "@/components/site-header"
import { getCurrentUser } from "@/lib/auth"
import { unstable_noStore as noStore } from "next/cache"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default async function DashboardLayout({
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

  if (user.equipe !== "T.I") {
    redirect("/portal")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={user} />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Sidebar para desktop */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <DashboardNav />
        </aside>

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
              <DashboardNav />
            </SheetContent>
          </Sheet>
          <div className="text-sm font-medium">Dashboard</div>
        </div>

        <main className="flex w-full flex-col overflow-hidden pt-6">{children}</main>
      </div>
    </div>
  )
}
