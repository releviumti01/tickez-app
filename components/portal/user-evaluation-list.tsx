"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/components/ui/use-toast"
import { Star, Clock, AlertCircle, CheckCircle2, Loader2, ThumbsUp, MessageSquare } from "lucide-react"
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

type Ticket = {
  id: string
  status: string
  descricao_problema: string
  prioridade: string
  data_criacao: string
  data_conclusao?: string
  setor?: string
  atribuido_a?: string
  avaliacao?: {
    id: string
    nota: number | null
    comentario: string | null
    respondido_em: string | null
    criado_em: string
    ja_avaliado: boolean
  }
}

type EvaluationState = {
  [key: string]: {
    nota: number
    comentario?: string
    isSubmitting: boolean
  }
}

const priorityColors = {
  Baixa: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  Média: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  Alta: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  Crítica: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
}

export function UserEvaluationList() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [evaluations, setEvaluations] = useState<EvaluationState>({})
  const [isLoading, setIsLoading] = useState(false)
  const { token } = useAuth()

  // Chave do cache local
  const cacheKey = 'user_evaluation_tickets'

  // Carregar tickets do cache local ao montar
  useEffect(() => {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) {
          setTickets(parsed)
        }
      } catch {}
    }
  }, [cacheKey])

  useEffect(() => {
    fetchTickets()
  }, [token])

  const fetchTickets = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://chamados-backendapi.onrender.com"
      const res = await fetch(`${apiUrl}/api/tickets/to-evaluate`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Erro ao carregar chamados")

      const data = await res.json()
      console.log("Dados recebidos:", data)

      setTickets(data.tickets || [])
      // Atualizar cache local
      localStorage.setItem(cacheKey, JSON.stringify(data.tickets || []))

      // Initialize evaluation state apenas para tickets não avaliados
      const initialEvaluations: EvaluationState = {}
      data.tickets?.forEach((ticket: Ticket) => {
        if (!ticket.avaliacao?.ja_avaliado) {
          initialEvaluations[ticket.id] = {
            nota: 0,
            comentario: "",
            isSubmitting: false,
          }
        }
      })
      setEvaluations(initialEvaluations)
    } catch (error) {
      console.error("Erro ao buscar tickets:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os chamados para avaliação.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStarClick = (ticketId: string, rating: number) => {
    setEvaluations((prev) => ({
      ...prev,
      [ticketId]: {
        ...prev[ticketId],
        nota: rating,
      },
    }))
  }

  const handleCommentChange = (ticketId: string, comment: string) => {
    setEvaluations((prev) => ({
      ...prev,
      [ticketId]: {
        ...prev[ticketId],
        comentario: comment,
      },
    }))
  }

  const handleSubmitEvaluation = async (ticketId: string) => {
    const evaluation = evaluations[ticketId]
    if (!evaluation || evaluation.nota === 0) {
      toast({
        title: "Avaliação obrigatória",
        description: "Por favor, selecione uma nota de 1 a 5 estrelas.",
        variant: "destructive",
      })
      return
    }

    setEvaluations((prev) => ({
      ...prev,
      [ticketId]: {
        ...prev[ticketId],
        isSubmitting: true,
      },
    }))

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://chamados-backendapi.onrender.com"
      const res = await fetch(`${apiUrl}/api/tickets/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chamado_id: ticketId,
          nota: evaluation.nota,
          comentario: evaluation.comentario || null,
        }),
      })

      const responseData = await res.json()

      if (!res.ok) {
        // Se for erro 403 (já avaliado), mostrar mensagem específica
        if (res.status === 403) {
          toast({
            title: "Avaliação já enviada",
            description: "Esta avaliação já foi enviada anteriormente e não pode ser alterada.",
            variant: "destructive",
          })
          // Recarregar os dados para atualizar a interface
          fetchTickets()
          return
        }
        throw new Error(responseData.error || "Erro ao enviar avaliação")
      }

      // Atualizar o ticket local para mostrar como avaliado
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                avaliacao: {
                  ...ticket.avaliacao!,
                  nota: evaluation.nota,
                  comentario: evaluation.comentario || null,
                  respondido_em: new Date().toISOString(),
                  ja_avaliado: true,
                },
              }
            : ticket,
        ),
      )

      // Atualizar cache local após avaliação
      setTimeout(() => {
        localStorage.setItem(cacheKey, JSON.stringify(
          tickets.map((ticket) =>
            ticket.id === ticketId
              ? {
                  ...ticket,
                  avaliacao: {
                    ...ticket.avaliacao!,
                    nota: evaluation.nota,
                    comentario: evaluation.comentario || null,
                    respondido_em: new Date().toISOString(),
                    ja_avaliado: true,
                  },
                }
              : ticket
          )
        ))
      }, 0)

      // Remover do estado de avaliações
      setEvaluations((prev) => {
        const newState = { ...prev }
        delete newState[ticketId]
        return newState
      })

      toast({
        title: "Avaliação enviada!",
        description: "Obrigado pelo seu feedback. Sua avaliação nos ajuda a melhorar nossos serviços.",
        duration: 5000,
      })
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar sua avaliação. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setEvaluations((prev) => ({
        ...prev,
        [ticketId]: {
          ...prev[ticketId],
          isSubmitting: false,
        },
      }))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // 🔥 COMPONENTE PARA AVALIAÇÃO INTERATIVA (apenas para não avaliados)
  const InteractiveStarRating = ({ ticketId, currentRating }: { ticketId: string; currentRating: number }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(ticketId, star)}
            className="transition-all hover:scale-110 transform duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded"
            disabled={evaluations[ticketId]?.isSubmitting}
          >
            <Star
              className={`w-6 h-6 ${
                star <= currentRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300 dark:text-gray-600 dark:hover:text-yellow-400"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {currentRating > 0 ? `${currentRating}/5` : "Clique para avaliar"}
        </span>
      </div>
    )
  }

  // 🔥 COMPONENTE PARA EXIBIÇÃO APENAS (para já avaliados)
  const DisplayOnlyStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{rating}/5 estrelas</span>
      </div>
    )
  }

  if (isLoading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Carregando chamados para avaliação...</p>
        </div>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h3 className="text-lg font-semibold mb-2 text-foreground">Tudo em dia!</h3>
        <p className="text-muted-foreground">Não há chamados concluídos para avaliação no momento.</p>
      </div>
    )
  }

  // Separar tickets avaliados e não avaliados
  const ticketsPendentes = tickets.filter((ticket) => !ticket.avaliacao?.ja_avaliado)
  const ticketsAvaliados = tickets.filter((ticket) => ticket.avaliacao?.ja_avaliado)

  return (
    <div className="space-y-6">
      {/* 🔥 SEÇÃO: TICKETS PENDENTES DE AVALIAÇÃO */}
      {ticketsPendentes.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-muted-foreground">
              {ticketsPendentes.length} chamado{ticketsPendentes.length !== 1 ? "s" : ""} aguardando sua avaliação
            </p>
          </div>

          {ticketsPendentes.map((ticket) => {
            const evaluation = evaluations[ticket.id]
            const isSubmitting = evaluation?.isSubmitting || false

            return (
              <Card key={ticket.id} className="transition-all hover:shadow-md border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">Chamado #{ticket.id.slice(-8)}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="secondary"
                          className={
                            priorityColors[ticket.prioridade as keyof typeof priorityColors] ||
                            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          }
                        >
                          {ticket.prioridade}
                        </Badge>
                        {ticket.setor && (
                          <Badge variant="outline" className="border-border text-foreground">
                            {ticket.setor}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                      Aguardando Avaliação
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-foreground">Descrição do Problema:</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md border border-border">
                      {ticket.descricao_problema}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Criado em:</span>
                      <span className="text-foreground">{formatDate(ticket.data_criacao)}</span>
                    </div>
                    {ticket.data_conclusao && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-muted-foreground">Concluído em:</span>
                        <span className="text-foreground">{formatDate(ticket.data_conclusao)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium mb-3 text-blue-800 dark:text-blue-400">
                      Como você avalia o atendimento?
                    </h4>

                    <div className="space-y-4">
                      <InteractiveStarRating ticketId={ticket.id} currentRating={evaluation?.nota || 0} />

                      <div>
                        <label className="text-sm font-medium mb-2 block text-foreground">
                          Comentário adicional (opcional):
                        </label>
                        <Textarea
                          placeholder="Conte-nos mais sobre sua experiência..."
                          value={evaluation?.comentario || ""}
                          onChange={(e) => handleCommentChange(ticket.id, e.target.value)}
                          disabled={isSubmitting}
                          className="resize-none bg-background border-border text-foreground placeholder:text-muted-foreground"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            disabled={!evaluation?.nota || evaluation.nota === 0 || isSubmitting}
                            className="min-w-[120px]"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              "Enviar Avaliação"
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-foreground">Confirmar Avaliação</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              Você está avaliando este chamado com {evaluation?.nota || 0} estrela
                              {(evaluation?.nota || 0) !== 1 ? "s" : ""}.
                              <br />
                              <strong className="text-foreground">Esta ação não pode ser desfeita.</strong> Deseja
                              continuar?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-background border-border text-foreground hover:bg-muted">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleSubmitEvaluation(ticket.id)}>
                              Confirmar Avaliação
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </>
      )}

      {/* 🔥 SEÇÃO: TICKETS JÁ AVALIADOS (APENAS VISUALIZAÇÃO) */}
      {ticketsAvaliados.length > 0 && (
        <>
          <div className="border-t border-border pt-6 mt-8">
            <div className="flex items-center gap-2 mb-6">
              <ThumbsUp className="w-5 h-5 text-green-500" />
              <p className="text-sm text-muted-foreground">Chamados já avaliados ({ticketsAvaliados.length})</p>
            </div>

            {ticketsAvaliados.map((ticket) => (
              <Card
                key={ticket.id}
                className="mb-4 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">Chamado #{ticket.id.slice(-8)}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="secondary"
                          className={
                            priorityColors[ticket.prioridade as keyof typeof priorityColors] ||
                            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          }
                        >
                          {ticket.prioridade}
                        </Badge>
                        {ticket.setor && (
                          <Badge variant="outline" className="border-border text-foreground">
                            {ticket.setor}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white dark:bg-green-700 dark:text-green-100 border-0">
                      ✓ Avaliado
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-foreground">Descrição do Problema:</h4>
                    <p className="text-sm text-muted-foreground bg-background p-3 rounded-md border border-border">
                      {ticket.descricao_problema}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Concluído em:</span>
                      <span className="text-foreground">{formatDate(ticket.data_conclusao!)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">Avaliado em:</span>
                      <span className="text-foreground">{formatDate(ticket.avaliacao!.respondido_em!)}</span>
                    </div>
                  </div>

                  {/* 🔥 SEÇÃO DE AVALIAÇÃO - APENAS VISUALIZAÇÃO */}
                  <div className="border-t border-border pt-4 bg-background p-4 rounded-md border border-border">
                    <h4 className="font-medium mb-3 text-green-700 dark:text-green-400">Sua Avaliação (Finalizada):</h4>

                    <div className="space-y-3">
                      <DisplayOnlyStars rating={ticket.avaliacao!.nota!} />

                      {ticket.avaliacao!.comentario && (
                        <div className="p-3 bg-muted/50 rounded-md border-l-4 border-green-500 dark:border-green-400">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground mb-1">Seu comentário:</p>
                              <p className="text-sm text-muted-foreground">{ticket.avaliacao!.comentario}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                          Obrigado pelo seu feedback! Avaliação finalizada.
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
