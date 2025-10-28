"use client"

import Link from "next/link"
import type { Ticket } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle } from "lucide-react"

interface UserTicketListProps {
  tickets: Ticket[]
}

export function UserTicketList({ tickets }: UserTicketListProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link href="/portal/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Abrir Novo Chamado</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </Link>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Nenhum chamado encontrado</h3>
              <p className="text-muted-foreground">
                Você ainda não abriu nenhum chamado. Clique no botão acima para abrir um novo chamado.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <Link href={`/portal/tickets/${ticket.id}`} key={ticket.id}>
              <Card className="h-full overflow-hidden transition-colors hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">#{ticket.id}</CardTitle>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <CardDescription className="line-clamp-1">{ticket.setor}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="line-clamp-2 text-sm">{ticket.descricao_problema}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
                  <div>
                    <PriorityBadge priority={ticket.prioridade} />
                  </div>
                  <div>{formatDate(ticket.data_criacao)}</div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    "Sem atribuição": "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    Pendente: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    "Aguardando resposta": "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
    Concluído: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    Cancelado: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  }

  return (
    <Badge variant="outline" className={variants[status] || ""}>
      {status}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, string> = {
    Baixo: "bg-green-500/10 text-green-500",
    Médio: "bg-yellow-500/10 text-yellow-500",
    Alto: "bg-orange-500/10 text-orange-500",
    Urgência: "bg-red-500/10 text-red-500",
  }

  return (
    <Badge variant="outline" className={variants[priority] || ""}>
      {priority}
    </Badge>
  )
}
