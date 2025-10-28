"use client"

import { useState } from "react"
import Link from "next/link"
import type { Ticket } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface TicketListProps {
  tickets: Ticket[]
}

export function TicketList({ tickets }: TicketListProps) {
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const router = useRouter()

  const filteredTickets = tickets.filter((ticket) => {
    // Apply status filter
    if (filter !== "all" && ticket.status !== filter) {
      return false
    }

    // Apply search filter
    if (
      search &&
      !ticket.nome_solicitante.toLowerCase().includes(search.toLowerCase()) &&
      !ticket.setor.toLowerCase().includes(search.toLowerCase()) &&
      !ticket.descricao_problema.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }

    return true
  })

  const handleFilterChange = (value: string) => {
    setFilter(value)
    router.push(`/dashboard?status=${value}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Buscar chamados..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Sem atribuição">Sem atribuição</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Aguardando resposta">Aguardando resposta</SelectItem>
            <SelectItem value="Concluído">Concluído</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">Nenhum chamado encontrado.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.map((ticket) => (
            <Link href={`/dashboard/tickets/${ticket.id}`} key={ticket.id}>
              <Card className="h-full flex flex-col overflow-hidden transition-colors hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">#{ticket.id}</CardTitle>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <CardDescription className="line-clamp-1">
                    {ticket.nome_solicitante} - {ticket.setor}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 flex-1">
                  <p className="line-clamp-2 text-sm">{ticket.descricao_problema}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-4 py-2 text-xs text-muted-foreground mt-auto">
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
