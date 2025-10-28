"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BarChart3, Inbox, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNav() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Chamados",
      href: "/dashboard/tickets",
      icon: Inbox,
    },
    {
      title: "Usuários",
      href: "/dashboard/users",
      icon: Users,
    },
    {
      title: "Configurações",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  // Função para verificar se a aba está ativa
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      // Dashboard só fica ativo se estiver exatamente em /dashboard
      return pathname === "/dashboard";
    }
    // Outras abas ficam ativas se o pathname começar com seu href
    return pathname.startsWith(href);
  };

  return (
    <nav className="grid items-start gap-2 px-2 py-4">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={isActive(item.href) ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              isActive(item.href) && "bg-secondary"
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        </Link>
      ))}
    </nav>
  );
}
