"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import { useAuth } from "@/components/auth-provider"
import { createTicket } from "@/lib/api-client"

interface NewTicketFormProps {
  user: User
}

export function NewTicketForm({ user }: NewTicketFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: user.nome,
    email: user.email,
    telefone: "",
    setor: user.equipe,
    prioridade: "Médio",
    descricao: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState<string | null>(null)
  const { toast } = useToast()
  const { token } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.telefone || !formData.descricao) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    if (formData.descricao.length < 10) {
      toast({
        title: "Descrição muito curta",
        description: "A descrição deve ter pelo menos 10 caracteres.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (!token) {
        throw new Error("Token de autenticação não encontrado")
      }

      // Preparar dados para envio
      const ticketData = {
        nome_solicitante: formData.nome,
        email_contato: formData.email,
        telefone_setor: formData.telefone,
        setor: formData.setor,
        prioridade: formData.prioridade,
        descricao_problema: formData.descricao,
      }

      // Criar chamado via API
      const newTicket = await createTicket(token, ticketData)

      setTicketId(newTicket.id)
      setSubmitted(true)

      toast({
        title: "Chamado criado com sucesso!",
        description: `Seu chamado #${newTicket.id} foi criado e será analisado pela equipe de T.I.`,
      })

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/portal")
        router.refresh()
      }, 3000)
    } catch (error) {
      console.error("Erro ao criar chamado:", error)
      toast({
        title: "Erro ao criar chamado",
        description: "Ocorreu um erro ao criar o chamado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Icons.check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="mb-2 text-xl font-medium">Chamado enviado com sucesso!</h3>
          <p className="text-muted-foreground">
            Seu chamado {ticketId && `#${ticketId}`} foi criado e será analisado pela equipe de T.I.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">Redirecionando para seus chamados...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Novo Chamado</CardTitle>
        <CardDescription>Preencha o formulário abaixo para abrir um novo chamado.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email de contato</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone do setor *</Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setor">Setor</Label>
              <Input id="setor" name="setor" value={formData.setor} onChange={handleChange} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prioridade">Prioridade</Label>
            <Select value={formData.prioridade} onValueChange={(value) => handleSelectChange("prioridade", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Baixo">Baixo</SelectItem>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Alto">Alto</SelectItem>
                <SelectItem value="Urgência">Urgência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição do problema *</Label>
            <Textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva detalhadamente o problema que está enfrentando..."
              className="min-h-[150px] resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">Mínimo de 10 caracteres</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Criando chamado..." : "Enviar Chamado"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
