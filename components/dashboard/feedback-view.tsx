"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useAuth } from "@/components/auth-provider"
import { Star, Clock, User, MessageSquare, Filter, TrendingUp, Users, BarChart3, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"

interface FeedbackItem {
  id: string
  usuario_nome: string
  responsavel_nome: string
  chamado_id: string
  avaliacao: number | null
  comentario?: string | null
  data_avaliacao: string
  tempo_resolucao?: string | null
}

interface MetricasFuncionario {
  funcionario: string
  totalAvaliacoes: number
  avaliacoesComNota: number
  avaliacoesSemNota: number
  taxaSatisfacao: number
  percentualSatisfacao: number
}

interface MetricasGeral {
  totalAvaliacoes: number
  avaliacoesComNota: number
  avaliacoesSemNota: number
  taxaSatisfacao: number
  percentualSatisfacao: number
}

interface MetricasResponse {
  metricas: {
    geral: MetricasGeral
    porFuncionario: MetricasFuncionario[]
  }
  totalFuncionarios: number
}

export function FeedbackView() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [allFeedbacks, setAllFeedbacks] = useState<FeedbackItem[]>([]) // Todos os feedbacks carregados
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [funcionariosTI, setFuncionariosTI] = useState<string[]>([])
  const [selectedResponsavel, setSelectedResponsavel] = useState<string>("todos")
  const [metricas, setMetricas] = useState<MetricasResponse | null>(null)
  const [isLoadingMetricas, setIsLoadingMetricas] = useState(true)
  const { token } = useAuth()

  const cacheKey = 'dashboard_feedbacks'
  const metricasCacheKey = 'dashboard_metricas_ti'
  const pageStateKey = 'feedback_page_state'
  const itemsPerPage = 40

  // Carregar feedbacks do cache local ao montar
  useEffect(() => {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) {
          setAllFeedbacks(parsed)
          console.log(`Cache de feedbacks carregado: ${parsed.length} itens`)
        }
      } catch {}
    }

    // Carregar estado da página do sessionStorage
    const savedPageState = sessionStorage.getItem(pageStateKey)
    if (savedPageState) {
      try {
        const { page, responsavel } = JSON.parse(savedPageState)
        setCurrentPage(page || 1)
        setSelectedResponsavel(responsavel || "todos")
      } catch {}
    }
  }, [])

  // Salvar estado da página no sessionStorage
  useEffect(() => {
    const pageState = {
      page: currentPage,
      responsavel: selectedResponsavel
    }
    sessionStorage.setItem(pageStateKey, JSON.stringify(pageState))
  }, [currentPage, selectedResponsavel])

  // Função para obter feedbacks da página atual
  const getFeedbacksForPage = (feedbacksList: FeedbackItem[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return feedbacksList.slice(startIndex, endIndex)
  }

  // Função para filtrar feedbacks por responsável
  const getFilteredFeedbacks = (feedbacksList: FeedbackItem[]) => {
    if (selectedResponsavel === "todos") {
      return feedbacksList
    }
    return feedbacksList.filter(feedback => feedback.responsavel_nome === selectedResponsavel)
  }

  // Atualizar feedbacks exibidos quando mudar página ou filtro
  useEffect(() => {
    const filtered = getFilteredFeedbacks(allFeedbacks)
    const paginated = getFeedbacksForPage(filtered, currentPage)
    setFeedbacks(paginated)
  }, [allFeedbacks, currentPage, selectedResponsavel])

  // Buscar funcionários T.I. para o filtro
  const fetchFuncionariosTI = async () => {
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://chamados-backendapi.onrender.com"}/api/relatorios/funcionarios-ti`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Erro ao buscar funcionários T.I")

      const data = await response.json()
      setFuncionariosTI(data.funcionarios || [])
    } catch (error) {
      console.error("Erro ao buscar funcionários T.I:", error)
    }
  }

  // Buscar feedbacks da API
  const fetchFeedbacks = async (silent = false) => {
    if (!token) return
    
    // Só mostra loading se não for atualização silenciosa e não temos dados ainda
    if (!silent && allFeedbacks.length === 0) {
      setIsLoading(true)
    }
    
    if (!silent) {
      setError(null)
    }

    try {
      // Sempre buscar todos os feedbacks (sem filtro de responsável na API)
      const url = `${process.env.NEXT_PUBLIC_API_URL || "https://chamados-backendapi.onrender.com"}/api/relatorios/avaliacoes`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })

      if (!response.ok) throw new Error("Erro ao buscar feedbacks")

      const data = await response.json()
      const fetchedFeedbacks = data.avaliacoes || []
      
      setAllFeedbacks(fetchedFeedbacks)
      localStorage.setItem(cacheKey, JSON.stringify(fetchedFeedbacks))
      
      if (!silent) {
        console.log(`Feedbacks carregados: ${fetchedFeedbacks.length}`)
      }
    } catch (error) {
      console.error("Erro ao buscar feedbacks:", error)
      if (!silent) {
        setError("Erro ao carregar feedbacks. Tente novamente.")
      }
    } finally {
      if (!silent && allFeedbacks.length === 0) {
        setIsLoading(false)
      }
    }
  }

  // Handler para mudança de filtro
  const handleResponsavelChange = (value: string) => {
    setSelectedResponsavel(value)
    setCurrentPage(1) // Reset para primeira página ao mudar filtro
  }

  // Wrapper para retry manual
  const handleRetry = () => {
    fetchFeedbacks(false) // Não silencioso, mostra loading
  }

  // Carregar métricas do cache local ao montar
  useEffect(() => {
    const cachedMetricas = localStorage.getItem(metricasCacheKey)
    if (cachedMetricas) {
      try {
        const parsed = JSON.parse(cachedMetricas)
        setMetricas(parsed)
        console.log('Cache de métricas carregado')
      } catch {}
    }
  }, [])

  // Buscar métricas da API
  const fetchMetricas = async () => {
    if (!token) return
    setIsLoadingMetricas(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://chamados-backendapi.onrender.com"}/api/relatorios/metricas-equipe-ti`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })

      if (!response.ok) throw new Error("Erro ao buscar métricas")

      const data = await response.json()
      
      setMetricas(data)
      localStorage.setItem(metricasCacheKey, JSON.stringify(data))
      console.log('Métricas carregadas:', data)
    } catch (error) {
      console.error("Erro ao buscar métricas:", error)
    } finally {
      setIsLoadingMetricas(false)
    }
  }

  // Carregar funcionários T.I e feedbacks ao montar
  useEffect(() => {
    fetchFuncionariosTI()
    fetchFeedbacks(false) // Carregamento inicial não é silencioso
    fetchMetricas()
    
    // Atualização automática em background (como no Dashboard)
    const interval = setInterval(() => {
      // Atualização silenciosa - não afeta o estado de loading
      fetchFeedbacks(true)
      fetchMetricas()
    }, 30000) // Atualiza a cada 30 segundos (como no Dashboard)
    
    return () => clearInterval(interval)
  }, [token])

  // Filtro agora é feito localmente - useEffect removido

  // Função para renderizar estrelas
  const renderStars = (rating: number | null) => {
    if (rating === null) return null
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  // Função para obter cor da badge baseada na avaliação
  const getBadgeVariant = (rating: number | null) => {
    if (rating === null) return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    if (rating >= 4) return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    if (rating >= 3) return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
    return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Função para obter cor baseada na taxa de satisfação
  const getSatisfactionColor = (percentual: number) => {
    if (percentual >= 80) return "text-green-600"
    if (percentual >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  // Função para obter cor da badge baseada na taxa
  const getSatisfactionBadge = (percentual: number) => {
    if (percentual >= 80) return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    if (percentual >= 60) return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
    return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
  }

  // Funções de paginação
  const getFilteredFeedbacksCount = () => {
    return getFilteredFeedbacks(allFeedbacks).length
  }

  const getTotalPages = () => {
    return Math.ceil(getFilteredFeedbacksCount() / itemsPerPage)
  }

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))
  }

  if (isLoading && feedbacks.length === 0 && allFeedbacks.length === 0) {
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
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRetry}>Tentar Novamente</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (feedbacks.length === 0 && allFeedbacks.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <div className="text-center space-y-3">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">Nenhum feedback encontrado</h3>
            <p className="text-muted-foreground">
              Os feedbacks dos usuários aparecerão aqui quando estiverem disponíveis.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (feedbacks.length === 0 && allFeedbacks.length > 0) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <div className="text-center space-y-3">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">
              Nenhum feedback encontrado para {selectedResponsavel === "todos" ? "esta página" : selectedResponsavel}
            </h3>
            <p className="text-muted-foreground">
              {selectedResponsavel !== "todos" ? (
                <>Tente selecionar "Todos os responsáveis" ou outro funcionário.</>
              ) : (
                <>Tente voltar para a página anterior ou ajustar os filtros.</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Visão Geral - Métricas */}
      {metricas && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Visão Geral</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metricas.metricas.geral.totalAvaliacoes}</div>
                  <p className="text-xs text-muted-foreground">
                    {metricas.metricas.geral.avaliacoesComNota} avaliadas • {metricas.metricas.geral.avaliacoesSemNota} pendentes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Satisfação Geral</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getSatisfactionColor(metricas.metricas.geral.percentualSatisfacao)}`}>
                    {metricas.metricas.geral.percentualSatisfacao}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Média: {metricas.metricas.geral.taxaSatisfacao}/5 estrelas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Funcionários Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metricas.totalFuncionarios}</div>
                  <p className="text-xs text-muted-foreground">
                    Membros da equipe T.I
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Não Avaliadas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{metricas.metricas.geral.avaliacoesSemNota}</div>
                  <p className="text-xs text-muted-foreground">
                    {metricas.metricas.geral.totalAvaliacoes > 0 ? 
                      `${((metricas.metricas.geral.avaliacoesSemNota / metricas.metricas.geral.totalAvaliacoes) * 100).toFixed(1)}% do total` : 
                      'Nenhuma avaliação'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Desempenho por Funcionário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Desempenho por Funcionário</span>
              </CardTitle>
              <CardDescription>
                Métricas individuais de cada membro da equipe T.I
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {metricas.metricas.porFuncionario.map((funcionario) => (
                  <Card key={funcionario.funcionario} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{funcionario.funcionario}</CardTitle>
                        <Badge className={getSatisfactionBadge(funcionario.percentualSatisfacao)}>
                          {funcionario.percentualSatisfacao}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-semibold">{funcionario.totalAvaliacoes}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avaliadas</p>
                          <p className="font-semibold text-green-600">{funcionario.avaliacoesComNota}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pendentes</p>
                          <p className="font-semibold text-yellow-600">{funcionario.avaliacoesSemNota}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Média</p>
                          <p className="font-semibold">{funcionario.taxaSatisfacao}/5</p>
                        </div>
                      </div>
                      
                      {/* Barra de progresso da satisfação */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Satisfação</span>
                          <span className={getSatisfactionColor(funcionario.percentualSatisfacao)}>
                            {funcionario.percentualSatisfacao}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              funcionario.percentualSatisfacao >= 80 ? 'bg-green-500' :
                              funcionario.percentualSatisfacao >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${funcionario.percentualSatisfacao}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtro por Responsável */}
      <div className="flex items-center space-x-4">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <Select value={selectedResponsavel} onValueChange={handleResponsavelChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrar por responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os responsáveis</SelectItem>
            {funcionariosTI.map((funcionario) => (
              <SelectItem key={funcionario} value={funcionario}>
                {funcionario}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedResponsavel !== "todos" && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <span>Filtrado por: {selectedResponsavel}</span>
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {feedbacks.map((feedback) => (
          <Card key={feedback.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Chamado #{feedback.chamado_id}</CardTitle>
                <Badge className={getBadgeVariant(feedback.avaliacao)}>
                  {feedback.avaliacao !== null ? `${feedback.avaliacao}/5` : "Não avaliado"}
                </Badge>
              </div>
              {feedback.avaliacao !== null ? (
                <div className="flex items-center space-x-1">
                  {renderStars(feedback.avaliacao)}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Chamado não avaliado
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{feedback.usuario_nome}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icons.user className="h-4 w-4" />
                <span>Atendido por: {feedback.responsavel_nome}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDate(feedback.data_avaliacao)}</span>
              </div>
              {feedback.tempo_resolucao && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Tempo de espera para avaliação: {feedback.tempo_resolucao}</span>
                </div>
              )}
              {feedback.comentario && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm italic">"{feedback.comentario}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Controles de Paginação Centralizados */}
      {getFilteredFeedbacksCount() > 0 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground min-w-[140px] justify-center">
              <span>
                Página {currentPage} de {getTotalPages()}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === getTotalPages()}
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Informações de contagem - separadas e centralizadas */}
      {getFilteredFeedbacksCount() > 0 && (
        <div className="flex justify-center">
          <span className="text-sm text-muted-foreground">
            {getFilteredFeedbacksCount()} feedbacks{selectedResponsavel !== "todos" && ` de ${selectedResponsavel}`}
          </span>
        </div>
      )}
    </div>
  )
}