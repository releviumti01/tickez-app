import Link from "next/link"
import type { User } from "@/lib/types"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import { Logo } from "@/components/logo"
import { PortalNav } from "@/components/portal/portal-nav"

export function SiteHeader({ user }: { user: User }) {
  const isIT = user.equipe === "T.I"

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-14 items-center">
        <Link href={isIT ? "/dashboard" : "/portal"} className="flex items-center space-x-2">
          <Logo className="h-6 w-6" />
          <span className="font-bold md:inline-block">Tickez</span>
        </Link>

        {!isIT && (
          <div className="ml-6 hidden md:flex">
            <PortalNav user={user} /> {/* Passe o user aqui */}
          </div>
        )}

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ModeToggle />
            <UserNav user={user} />
          </nav>
        </div>
      </div>
    </header>
  )
}
