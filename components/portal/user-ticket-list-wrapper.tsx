"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { UserTicketList } from "@/components/portal/user-ticket-list"
import { getTickets } from "@/lib/api-client"
import type { Ticket } from "@/lib/types"
import { Icons } from "@/components/icons"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface UserTicketListWrapperProps {
  initialTickets?: Ticket[]
}

const PAGE_SIZE = 40

export function UserTicketListWrapper({ initialTickets = [] }: UserTicketListWrapperProps) {
  const [allTickets, setAllTickets] = useState<Ticket[]>([]) // Todos os tickets do usuário
  const [currentPageTickets, setCurrentPageTickets] = useState<Ticket[]>(initialTickets) // Tickets da página atual
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const { token } = useAuth()

  const allTicketsCacheKey = `user_tickets_all`
  const totalPages = Math.ceil(allTickets.length / PAGE_SIZE)
  const shouldShowPagination = allTickets.length > PAGE_SIZE

  // Função para dividir tickets em páginas localmente
  const getTicketsForPage = (tickets: Ticket[], pageNum: number) => {
    const startIndex = (pageNum - 1) * PAGE_SIZE
    const endIndex = startIndex + PAGE_SIZE
    return tickets.slice(startIndex, endIndex)
  }

  // Atualizar tickets da página atual quando mudar página ou allTickets
  useEffect(() => {
    const pageTickets = getTicketsForPage(allTickets, page)
    setCurrentPageTickets(pageTickets)
  }, [allTickets, page])

  // Carregar todos os tickets do cache local ao montar
  useEffect(() => {
    const cached = localStorage.getItem(allTicketsCacheKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) {
          setAllTickets(parsed)
          console.log(`Cache de usuário carregado: ${parsed.length} tickets`)
        }
      } catch {}
    }
  }, [allTicketsCacheKey])

  // Buscar TODOS os tickets do usuário (sem paginação) e atualizar cache
  const fetchAllUserTickets = async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    
    try {
      // Buscar sem limit para pegar todos os tickets do usuário
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://chamados-backendapi.onrender.com"}/api/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })
      
      if (!response.ok) throw new Error("Erro ao buscar tickets do usuário")
      
      const data = await response.json()
      const fetchedTickets = data.tickets || []
      
      setAllTickets(fetchedTickets)
      localStorage.setItem(allTicketsCacheKey, JSON.stringify(fetchedTickets))
      console.log(`Todos os tickets do usuário carregados: ${fetchedTickets.length}`)
    } catch (error) {
      console.error("Erro ao buscar todos os tickets do usuário:", error)
      setError("Erro ao carregar seus chamados. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar todos os tickets ao montar/token mudar
  useEffect(() => {
    fetchAllUserTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Atualizar todos os tickets a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(fetchAllUserTickets, 30000)
    return () => clearInterval(interval)
  }, [token])

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1)
  }
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1)
  }

  if (isLoading && currentPageTickets.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <p className="text-center text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <UserTicketList tickets={Array.isArray(currentPageTickets) ? currentPageTickets : []} />
      {shouldShowPagination && (
        <div className="flex justify-center items-center gap-4 my-4">
          <Button onClick={handlePrevPage} disabled={page === 1}>
            Anterior
          </Button>
          <span className="font-medium">
            Página {page} de {totalPages}
          </span>
          <Button onClick={handleNextPage} disabled={page >= totalPages}>
            Próxima
          </Button>
        </div>
      )}
    </>
  )
}
