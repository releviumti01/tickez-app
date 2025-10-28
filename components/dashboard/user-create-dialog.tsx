"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import { useAuth } from "@/components/auth-provider"
import { createUser } from "@/lib/api-client"

interface UserCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UserCreateDialog({ open, onOpenChange, onSuccess }: UserCreateDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    equipe: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { token } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, equipe: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.email || !formData.senha || !formData.equipe) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (!token) {
        throw new Error("Token não encontrado")
      }

      await createUser(token, formData)

      toast({
        title: "Usuário criado com sucesso",
        description: `O usuário ${formData.nome} foi criado com sucesso.`,
      })

      // Reset form
      setFormData({
        nome: "",
        email: "",
        senha: "",
        equipe: "",
      })

      // Close dialog
      onOpenChange(false)

      // Callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "Erro ao criar usuário",
        description: "Ocorreu um erro ao criar o usuário. Verifique os dados e tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>Preencha os dados para criar um novo usuário no sistema.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome do usuário"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                name="senha"
                type="password"
                value={formData.senha}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="equipe">Equipe</Label>
              <Select value={formData.equipe} onValueChange={handleSelectChange} disabled={isLoading}>
                <SelectTrigger id="equipe">
                  <SelectValue placeholder="Selecione uma equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T.I">T.I</SelectItem>
                  <SelectItem value="Faturamento">Faturamento</SelectItem>
                  <SelectItem value="R.H">R.H</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Qualidade">Qualidade</SelectItem>
                  <SelectItem value="Central de Guias">Central de Guias</SelectItem>
                  <SelectItem value="Enfermagem">Enfermagem</SelectItem>
                  <SelectItem value="Recepção">Recepção</SelectItem>
                  <SelectItem value="Nutrição">Nutrição</SelectItem>
                  <SelectItem value="Farmácia">Farmácia</SelectItem>
                  <SelectItem value="Médico">Médico</SelectItem>
                  <SelectItem value="Gestão">Gestão</SelectItem>
                  <SelectItem value="Fundador">Fundador</SelectItem>
                  <SelectItem value="Atendimento">Atendimento</SelectItem>
                  <SelectItem value="Fisioterapia">Fisioterapia</SelectItem>
                  <SelectItem value="Biomedicina">Biomedicina</SelectItem>
                  <SelectItem value="Fundadora">Fundadora</SelectItem>
                  <SelectItem value="Psicologa">Psicologa</SelectItem>
                  <SelectItem value="Serviço Geral">Serviço Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Criar Usuário
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
