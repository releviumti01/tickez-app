"use client"

import { useState } from "react"
import type { Ticket, User } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Icons } from "@/components/icons"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { UploadImage } from "@/components/upload-image"
import { ImageGallery } from "@/components/image-gallery"

interface UserTicketDetailProps {
  ticket: Ticket
  user: User
  apiUrl: string
  token: string
}

export function UserTicketDetail({ ticket, user, apiUrl, token }: UserTicketDetailProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState("")
  const [attachments, setAttachments] = useState(ticket.anexos || [])
  const { toast } = useToast()
  const router = useRouter()

  const canRespond = ticket.status !== "Concluído" && ticket.status !== "Cancelado"
  const canCancel = ticket.status !== "Concluído" && ticket.status !== "Cancelado"

  // Modificar a função handleRespond para usar a URL correta
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
        body: JSON.stringify({ mensagem: response }),
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
      console.error("Erro ao enviar resposta:", error)
      toast({
        title: "Erro ao enviar resposta",
        description: error.message || "Ocorreu um erro ao enviar sua resposta.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
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
        body: JSON.stringify({ status: "Cancelado" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao cancelar chamado")
      }

      toast({
        title: "Chamado cancelado com sucesso",
        description: "O chamado foi cancelado com sucesso.",
      })

      router.push("/portal")
      router.refresh()
    } catch (error) {
      console.error("Erro ao cancelar chamado:", error)
      toast({
        title: "Erro ao cancelar chamado",
        description: error.message || "Ocorreu um erro ao cancelar este chamado.",
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

  const tiRespondeu = ticket.historico_respostas?.some((r) => r.autor_equipe === "T.I")
  const podeResponder = tiRespondeu

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
          {canCancel && (
            <CardFooter className="border-t px-6 py-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isLoading}>
                    {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Cancelar Chamado
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar chamado?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja cancelar este chamado? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Voltar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel}>Confirmar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Descrição do Problema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{ticket.descricao_problema}</p>
          </CardContent>
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
            <div className="flex w-full items-end gap-2">
              <div className="flex-1">
                <Textarea
                  placeholder="Digite sua resposta..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="min-h-[100px] resize-none"
                  disabled={!podeResponder}
                />
              </div>
              <Button onClick={handleRespond} disabled={isLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Responder
              </Button>
            </div>

            <UploadImage ticketId={ticket.id} onUploadComplete={handleUploadComplete} apiUrl={apiUrl} token={token} />
            {!podeResponder && (
              <p className="text-sm text-muted-foreground">
                Você só pode responder após um responsável da equipe T.I responder ao chamado.
              </p>
            )}
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
