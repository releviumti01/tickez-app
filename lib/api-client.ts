import type { User, Ticket } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-chamados-wq6s.onrender.com"

// Auth functions
export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Login failed")
  }

  return response.json()
}

export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to get current user")
  }

  const data = await response.json()
  return data.user
}

// Ticket functions
export async function getTickets(token: string, status?: string, limit: number = 40, offset: number = 0): Promise<{tickets: Ticket[], total: number}> {
  let url = `${API_URL}/api/tickets?limit=${limit}&offset=${offset}`
  if (status) url += `&status=${status}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to get tickets")
  }

  const data = await response.json()
  return { tickets: data.tickets, total: data.total }
}

export async function getTicketById(token: string, id: string): Promise<Ticket> {
  const response = await fetch(`${API_URL}/api/tickets/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to get ticket")
  }

  const data = await response.json()
  return data.ticket
}

export async function createTicket(token: string, ticketData: any): Promise<Ticket> {
  const response = await fetch(`${API_URL}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(ticketData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to create ticket")
  }

  const data = await response.json()
  return data.ticket
}

export async function updateTicketStatus(token: string, id: string, status: string): Promise<Ticket> {
  const response = await fetch(`${API_URL}/api/tickets/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to update ticket status")
  }

  const data = await response.json()
  return data.ticket
}

export async function addResponse(token: string, id: string, message: string, status?: string): Promise<any> {
  const response = await fetch(`${API_URL}/api/tickets/${id}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mensagem: message, status }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to add response")
  }

  return response.json()
}

export async function getTicketMetrics(token: string): Promise<any> {
  const response = await fetch(`${API_URL}/api/tickets/metrics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to get ticket metrics")
  }

  return response.json()
}

// User functions
export async function getUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_URL}/api/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to get users")
  }

  const data = await response.json()
  return data.users
}

export async function createUser(token: string, userData: any): Promise<User> {
  const response = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to create user")
  }

  const data = await response.json()
  return data.user
}

export async function updateUser(token: string, id: string, userData: any): Promise<User> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to update user")
  }

  const data = await response.json()
  return data.user
}

export async function deleteUser(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to delete user")
  }
}

// Helper function to get API URL
export function getApiUrl() {
  return API_URL
}

// Get user tickets (simplified for portal users)
export async function getUserTickets(token: string): Promise<Ticket[]> {
  const response = await fetch(`${API_URL}/api/tickets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to get user tickets")
  }

  const data = await response.json()
  // Return only the tickets array for user portal
  return data.tickets || []
}
