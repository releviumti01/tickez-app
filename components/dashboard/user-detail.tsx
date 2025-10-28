"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import { useAuth } from "@/components/auth-provider"
import { updateUser, deleteUser } from "@/lib/api-client"
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

interface UserDetailProps {
  user: User
  currentUser: User
}

export function UserDetail({ user, currentUser }: UserDetailProps) {
  const [formData, setFormData] = useState({
    nome: user.nome,
    email: user.email,
    equipe: user.equipe,
    senha: "",
    confirmSenha: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const { token } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, equipe: value }))
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
        equipe: formData.equipe,
        ...(formData.senha ? { senha: formData.senha } : {}),
      }

      await updateUser(token, user.id, updateData)

      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso.",
      })

      // Reset password fields
      setFormData((prev) => ({ ...prev, senha: "", confirmSenha: "" }))

      // Refresh the page to get updated user data
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro ao atualizar usuário",
        description: "Ocorreu um erro ao atualizar as informações do usuário. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      if (!token) {
        throw new Error("Token não encontrado")
      }

      await deleteUser(token, user.id)

      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      })

      router.push("/dashboard/users")
    } catch (error) {
      toast({
        title: "Erro ao excluir usuário",
        description: "Ocorreu um erro ao excluir o usuário. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const isSelf = currentUser.id === user.id

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Detalhes do Usuário</CardTitle>
        <CardDescription>Visualize e edite as informações do usuário.</CardDescription>
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
          <div className="pt-4">
            <h3 className="mb-4 text-sm font-medium">Definir Nova Senha</h3>
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
          {!isSelf && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isLoading || isDeleting}>
                  {isDeleting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Excluir Usuário
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O usuário será permanentemente excluído do sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
