"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileText, PlusCircle, Settings, Star } from "lucide-react" // Adicione Star aqui
import type { User } from "@/lib/types"

interface PortalNavProps {
  orientation?: "horizontal" | "vertical"
  user?: User
}

export function PortalNav({ orientation = "horizontal", user }: PortalNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Meus Chamados",
      href: "/portal",
      icon: FileText,
    },
    {
      title: "Novo Chamado",
      href: "/portal/new",
      icon: PlusCircle,
    },
    {
      title: "Configurações",
      href: "/portal/settings",
      icon: Settings,
    },
  ]

  if (orientation === "vertical") {
    return (
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start", pathname === item.href && "bg-secondary")}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          </Link>
        ))}
        {/* Mostra o link Avaliação apenas se não for T.I */}
        {user?.equipe !== "T.I" && (
          <Link href="/portal/avaliacao">
            <Button variant={pathname === "/portal/avaliacao" ? "secondary" : "ghost"} className="w-full justify-start">
              <Star className="mr-2 h-4 w-4" />
              Avaliação
            </Button>
          </Link>
        )}
      </nav>
    )
  }

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={cn("justify-start", pathname === item.href && "bg-secondary")}
            size="sm"
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        </Link>
      ))}
      {/* Mostra o link Avaliação apenas se não for T.I */}
      {user?.equipe !== "T.I" && (
        <Link href="/portal/avaliacao">
          <Button variant={pathname === "/portal/avaliacao" ? "secondary" : "ghost"} size="sm">
            <Star className="mr-2 h-4 w-4" />
            Avaliação
          </Button>
        </Link>
      )}
    </nav>
  )
}
