"use client"

import type React from "react"

import { useState } from "react"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import { useAuth } from "@/components/auth-provider"
import { updateUser } from "@/lib/api-client"
import { useRouter } from "next/navigation"

interface UserSettingsProps {
  user: User
}

export function UserSettings({ user }: UserSettingsProps) {
  const [formData, setFormData] = useState({
    nome: user.nome,
    email: user.email,
    senha: "",
    confirmSenha: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { token, logout } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    if (formData.senha && formData.senha !== formData.confirmSenha) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e a confirmação de senha devem ser iguais.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (!token) {
        throw new Error("Token não encontrado")
      }

      const updateData = {
        nome: formData.nome,
        email: formData.email,
        ...(formData.senha ? { senha: formData.senha } : {}),
      }

      await updateUser(token, user.id, updateData)

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      })

      // Reset password fields
      setFormData((prev) => ({ ...prev, senha: "", confirmSenha: "" }))

      // Refresh the page to get updated user data
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao atualizar suas informações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Configurações de Perfil</CardTitle>
        <CardDescription>Atualize suas informações pessoais e senha.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="equipe">Equipe</Label>
            <Input id="equipe" value={user.equipe} disabled />
          </div>
          <div className="pt-4">
            <h3 className="mb-4 text-sm font-medium">Alterar Senha</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Nova Senha</Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Deixe em branco para manter a senha atual"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmSenha">Confirmar Nova Senha</Label>
                <Input
                  id="confirmSenha"
                  name="confirmSenha"
                  type="password"
                  value={formData.confirmSenha}
                  onChange={handleChange}
                  placeholder="Confirme a nova senha"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => logout()} disabled={isLoading}>
            Sair
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
