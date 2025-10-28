"use client"

import { Icons } from "@/components/icons"
import { ImageGallery } from "@/components/image-gallery"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { UploadImage } from "@/components/upload-image"
import { useToast } from "@/hooks/use-toast"
import type { Ticket, User } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface TicketDetailProps {
  ticket: Ticket
  user: User
  apiUrl: string
  token: string
}

export function TicketDetail({ ticket, user, apiUrl, token }: TicketDetailProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState("")
  const [status, setStatus] = useState(ticket.status)
  const [attachments, setAttachments] = useState(ticket.anexos || [])
  const [showTransferSelect, setShowTransferSelect] = useState(false)
  const [tiUsers, setTiUsers] = useState<User[]>([])
  const [selectedTiUser, setSelectedTiUser] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const canAssume = ticket.status === "Sem atribuição"
  const canRespond = ticket.status !== "Concluído" && ticket.status !== "Cancelado"
  const canFinish = ticket.status !== "Concluído" && ticket.status !== "Cancelado" && ticket.atribuido_a
  const canTransfer =
    ticket.status !== "Sem atribuição" &&
    ticket.status !== "Concluído" &&
    ticket.status !== "Cancelado" &&
    ticket.atribuido_a === user.nome

  const isResponsavel = ticket.atribuido_a === user.nome

  // Modificar a função handleAssume para usar a URL correta
  const handleAssume = async () => {
    setIsLoading(true)
    try {
      const ticketIdForRequest =
        typeof ticket.id === "string" && ticket.id.startsWith("#") ? ticket.id.substring(1) : ticket.id

      const response = await fetch(`${apiUrl}/api/tickets/${ticketIdForRequest}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Pendente" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao assumir chamado")
      }

      toast({
        title: "Chamado assumido com sucesso",
        description: "Você agora é responsável por este chamado.",
      })

      router.refresh()
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      console.error("Erro ao assumir chamado:", error)
      toast({
        title: "Erro ao assumir chamado",
        description: errMsg || "Ocorreu um erro ao assumir este chamado.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!response.trim()) {
      toast({
        title: "Resposta vazia",
        description: "Por favor, digite uma resposta antes de enviar.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const ticketIdForRequest =
        typeof ticket.id === "string" && ticket.id.startsWith("#") ? ticket.id.substring(1) : ticket.id

      const responseData = await fetch(`${apiUrl}/api/tickets/${ticketIdForRequest}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mensagem: response, status }),
      })

      if (!responseData.ok) {
        const errorData = await responseData.json()
        throw new Error(errorData.error || "Erro ao enviar resposta")
      }

      toast({
        title: "Resposta enviada com sucesso",
        description: "Sua resposta foi adicionada ao chamado.",
      })

      setResponse("")
      router.refresh()
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      console.error("Erro ao enviar resposta:", error)
      toast({
        title: "Erro ao enviar resposta",
        description: errMsg || "Ocorreu um erro ao enviar sua resposta.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      const ticketIdForRequest =
        typeof ticket.id === "string" && ticket.id.startsWith("#") ? ticket.id.substring(1) : ticket.id

      const response = await fetch(`${apiUrl}/api/tickets/${ticketIdForRequest}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Concluído" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao concluir chamado")
      }

      // Atualiza o cache local dos tickets do dashboard (todas as possíveis chaves de status)
      const statusKeys = ["all", "Sem atribuição", "Pendente", "Aguardando resposta", "Concluído", "Cancelado"]
      statusKeys.forEach((statusKey) => {
        const cacheKey = `dashboard_tickets_${statusKey}`
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed)) {
              const updated = parsed.map((t) =>
                t.id === ticket.id ? { ...t, status: "Concluído" } : t
              )
              localStorage.setItem(cacheKey, JSON.stringify(updated))
            }
          } catch {}
        }
      })

      // Dispara evento customizado para atualização instantânea do dashboard
      window.dispatchEvent(new Event("tickets-updated"))

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao concluir chamado")
      }

      toast({
        title: "Chamado concluído com sucesso",
        description: "O chamado foi marcado como concluído.",
      })

      router.refresh()
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      console.error("Erro ao concluir chamado:", error)
      toast({
        title: "Erro ao concluir chamado",
        description: errMsg || "Ocorreu um erro ao concluir este chamado.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar usuários da equipe T.I quando for necessário
  const fetchTiUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/users/ti`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Erro ao buscar usuários T.I")
      const data = await response.json()
      setTiUsers(data.usuarios || [])
    } catch (err) {
      setTiUsers([])
    }
  }

  const handleTransferClick = async () => {
    await fetchTiUsers()
    setShowTransferSelect(true)
  }

  const handleTransferConfirm = async () => {
    if (!selectedTiUser) return
    setIsLoading(true)
    try {
      const ticketIdForRequest =
        typeof ticket.id === "string" && ticket.id.startsWith("#") ? ticket.id.substring(1) : ticket.id

      const response = await fetch(`${apiUrl}/api/tickets/${ticketIdForRequest}/transfer`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ atribuido_a: selectedTiUser }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao transferir chamado")
      }

      toast({
        title: "Chamado transferido",
        description: `O chamado foi transferido para ${selectedTiUser}.`,
      })

      setShowTransferSelect(false)
      setSelectedTiUser(null)
      router.refresh()
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      toast({
        title: "Erro ao transferir chamado",
        description: errMsg || "Ocorreu um erro ao transferir este chamado.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = (fileData: any) => {
    setAttachments((prev) => [...prev, fileData])
  }

  const handleDeleteComplete = (fileId: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== fileId))
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Chamado</CardTitle>
            <CardDescription>Informações sobre o chamado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Status</p>
                <StatusBadge status={ticket.status} />
              </div>
              <div>
                <p className="text-sm font-medium">Prioridade</p>
                <PriorityBadge priority={ticket.prioridade} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Solicitante</p>
              <p className="text-sm">{ticket.nome_solicitante}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm">{ticket.email_contato}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Telefone</p>
              <p className="text-sm">{ticket.telefone_setor}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Setor</p>
              <p className="text-sm">{ticket.setor}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Data de Criação</p>
              <p className="text-sm">{formatDate(ticket.data_criacao)}</p>
            </div>
            {ticket.atribuido_a && (
              <div>
                <p className="text-sm font-medium">Atribuído a</p>
                <p className="text-sm">{ticket.atribuido_a}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Descrição do Problema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{ticket.descricao_problema}</p>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-2 border-t px-6 py-4">
            {canAssume && (
              <Button onClick={handleAssume} disabled={isLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Assumir Chamado
              </Button>
            )}
            {canTransfer && !showTransferSelect && (
              <Button onClick={handleTransferClick} disabled={isLoading} variant="secondary">
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Transferir chamado
              </Button>
            )}
            {canTransfer && showTransferSelect && (
              <div className="flex gap-2 items-center w-full">
                <Select onValueChange={setSelectedTiUser}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Selecione o usuário T.I" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiUsers.map((u) => (
                      <SelectItem key={u.nome} value={u.nome}>
                        {u.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleTransferConfirm} disabled={!selectedTiUser || isLoading}>
                  Confirmar
                </Button>
                <Button variant="ghost" onClick={() => setShowTransferSelect(false)}>
                  Cancelar
                </Button>
              </div>
            )}
            {canFinish && isResponsavel && (
              <Button onClick={handleFinish} disabled={isLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Finalizar Chamado
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {attachments && attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Anexos</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageGallery
              attachments={attachments}
              ticketId={ticket.id}
              canDelete={true}
              apiUrl={apiUrl}
              token={token}
              onDeleteComplete={handleDeleteComplete}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Respostas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.historico_respostas && ticket.historico_respostas.length > 0 ? (
            ticket.historico_respostas.map((resposta, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {resposta.autor
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{resposta.autor}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(resposta.data)}</p>
                  </div>
                </div>
                <p className="whitespace-pre-wrap pl-10 text-sm">{resposta.mensagem}</p>
                {index < ticket.historico_respostas.length - 1 && <Separator className="my-4" />}
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground">Nenhuma resposta ainda.</p>
          )}
        </CardContent>
        {canRespond && (
          <CardFooter className="flex-col space-y-4 border-t px-6 py-4">
            <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 w-full">
                <Textarea
                  placeholder="Digite sua resposta..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <Select defaultValue={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Aguardando resposta">Aguardando resposta</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleRespond} disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Responder
                </Button>
              </div>
            </div>

            <UploadImage ticketId={ticket.id} onUploadComplete={handleUploadComplete} apiUrl={apiUrl} token={token} />
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    "Sem atribuição": "bg-yellow-500/10 text-yellow-500",
    Pendente: "bg-blue-500/10 text-blue-500",
    "Aguardando resposta": "bg-purple-500/10 text-purple-500",
    Concluído: "bg-green-500/10 text-green-500",
    Cancelado: "bg-red-500/10 text-red-500",
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
