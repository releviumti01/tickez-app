import { NextResponse } from "next/server"

// Mock user database
const users = [
  {
    id: "1",
    nome: "Admin TI",
    email: "admin@example.com",
    senha: "admin123",
    equipe: "T.I",
  },
  {
    id: "2",
    nome: "Usuário Regular",
    email: "usuario@example.com",
    senha: "usuario123",
    equipe: "Marketing",
  },
]

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Find user by email
    const user = users.find((u) => u.email === email)

    // Check if user exists and password matches
    if (!user || user.senha !== password) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Return user data (excluding password)
    const { senha, ...userData } = user
    return NextResponse.json(userData)
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
