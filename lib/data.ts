import type { Ticket, User } from "@/lib/types"
import {
  getTickets as apiGetTickets,
  getTicketById as apiGetTicketById,
  getUsers as apiGetUsers,
  getCurrentUser as apiGetCurrentUser,
} from "@/lib/api-client"
import { cookies } from "next/headers"
import { unstable_noStore as noStore } from "next/cache"

// Função para obter o token de autenticação
async function getAuthToken() {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    throw new Error("Token de autenticação não encontrado")
  }

  return token
}

// Função para obter todos os tickets com filtro opcional
export async function getTickets({ status = "all" }: { status?: string } = {}): Promise<Ticket[]> {
  noStore() // Evita cache

  try {
    const token = await getAuthToken()
    const tickets = await apiGetTickets(token, status !== "all" ? status : undefined)
    console.log(`Buscando tickets com status: ${status}, encontrados: ${tickets.length}`)
    return tickets
  } catch (error) {
    console.error("Erro ao obter tickets:", error)
    return []
  }
}

// Função para obter um ticket por ID
export async function getTicketById(id: string): Promise<Ticket | null> {
  noStore() // Evita cache

  try {
    const token = await getAuthToken()
    const ticket = await apiGetTicketById(token, id)
    return ticket
  } catch (error) {
    console.error(`Erro ao obter ticket ${id}:`, error)
    return null
  }
}

// Função para obter tickets de um usuário específico
export async function getUserTickets(email: string): Promise<Ticket[]> {
  noStore() // Evita cache

  try {
    const token = await getAuthToken()
    // A API já filtra automaticamente por usuário logado para usuários não-TI
    const tickets = await apiGetTickets(token)
    console.log(`Buscando tickets do usuário ${email}, encontrados: ${tickets.length}`)
    return tickets
  } catch (error) {
    console.error("Erro ao obter tickets do usuário:", error)
    return []
  }
}

// Função para obter todos os usuários
export async function getUsers(): Promise<User[]> {
  noStore() // Evita cache

  try {
    const token = await getAuthToken()
    const users = await apiGetUsers(token)
    return users
  } catch (error) {
    console.error("Erro ao obter usuários:", error)
    return []
  }
}

// Função para obter um usuário por ID
export async function getUserById(id: string): Promise<User | null> {
  noStore() // Evita cache

  try {
    const token = await getAuthToken()
    const users = await apiGetUsers(token)
    const user = users.find((user: User) => user.id === id)
    return user || null
  } catch (error) {
    console.error(`Erro ao obter usuário ${id}:`, error)
    return null
  }
}

// Função para obter o usuário atual
export async function getCurrentUser(): Promise<User | null> {
  noStore() // Evita cache

  try {
    const token = await getAuthToken()
    const user = await apiGetCurrentUser(token)
    return user
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error)
    return null
  }
}
