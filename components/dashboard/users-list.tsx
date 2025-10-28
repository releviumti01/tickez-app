"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import { UserCreateDialog } from "@/components/dashboard/user-create-dialog"
import { Icons } from "@/components/icons"


interface UsersListProps {
  users: User[]
}

export function UsersList({ users }: UsersListProps) {

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [userList, setUserList] = useState<User[]>(users)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Chave do cache local
  const usersCacheKey = "dashboard_users"

  // Carregar usuários do cache local ao montar
  useEffect(() => {
    const cached = localStorage.getItem(usersCacheKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) {
          setUserList(parsed)
        }
      } catch {}
    }
  }, [])

  // Buscar usuários da API e atualizar cache
  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true)
      try {
        // Requisição para a API de usuários (rota já usada no SSR)
        const res = await fetch("/api/users")
        if (!res.ok) throw new Error("Erro ao buscar usuários")
        const data = await res.json()
        if (Array.isArray(data)) {
          setUserList(data)
          localStorage.setItem(usersCacheKey, JSON.stringify(data))
        }
      } catch {}
      setIsLoading(false)
    }
    fetchUsers()
  }, [])

  // Agrupar usuários por equipe
  const usersByTeam = userList.reduce(
    (acc, user) => {
      const team = user.equipe
      if (!acc[team]) {
        acc[team] = []
      }
      acc[team].push(user)
      return acc
    },
    {} as Record<string, User[]>,
  )

  // Filtrar usuários com base no termo de busca
  const filteredUsers = userList.filter(
    (user) =>
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.equipe.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Agrupar usuários filtrados por equipe
  const filteredUsersByTeam = filteredUsers.reduce(
    (acc, user) => {
      const team = user.equipe
      if (!acc[team]) {
        acc[team] = []
      }
      acc[team].push(user)
      return acc
    },
    {} as Record<string, User[]>,
  )

  const teams = Object.keys(usersByTeam).sort()

  return (
    <div className="space-y-4">
      {isLoading && (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar usuários..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {/* DROPDOWN DE SETORES */}
          <select
            className="border rounded px-3 py-2"
            value={selectedTeam}
            onChange={e => setSelectedTeam(e.target.value)}
          >
            <option value="all">Todos</option>
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* GRID DE USUÁRIOS FILTRADA PELO DROPDOWN */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {(selectedTeam === "all"
          ? filteredUsers
          : filteredUsersByTeam[selectedTeam] || []
        ).length > 0 ? (
          (selectedTeam === "all"
            ? filteredUsers
            : filteredUsersByTeam[selectedTeam] || []
          ).map((user) => <UserCard key={user.id} user={user} />)
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex h-32 items-center justify-center">
              <p className="text-center text-muted-foreground">
                {selectedTeam === "all"
                  ? "Nenhum usuário encontrado."
                  : searchTerm
                    ? "Nenhum usuário encontrado com este termo de busca."
                    : `Nenhum usuário na equipe ${selectedTeam}.`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <UserCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}

function UserCard({ user }: { user: User }) {
  const initials = user.nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <Link href={`/dashboard/users/${user.id}`}>
      <Card className="h-full overflow-hidden transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-base">{user.nome}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Badge variant={user.equipe === "T.I" ? "default" : "outline"}>{user.equipe}</Badge>
        </CardContent>
      </Card>
    </Link>
  )
}
