"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@/lib/types"
import { login as apiLogin, getCurrentUser } from "@/lib/api-client"

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Funções auxiliares para manipular cookies sem depender de js-cookie
const setCookie = (name: string, value: string, days: number) => {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `; expires=${date.toUTCString()}`
  document.cookie = `${name}=${value}${expires}; path=/`
}

const getCookie = (name: string) => {
  const nameEQ = `${name}=`
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

const removeCookie = (name: string) => {
  document.cookie = `${name}=; Max-Age=-99999999; path=/`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = getCookie("token")
    if (storedToken) {
      setToken(storedToken)
      getCurrentUser(storedToken)
        .then((userData) => {
          setUser(userData)
        })
        .catch(() => {
          // Token invalid or expired
          removeCookie("token")
          setToken(null)
          if (pathname !== "/") {
            router.push("/")
          }
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
      if (pathname !== "/") {
        router.push("/")
      }
    }
  }, [pathname, router])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { user: userData, token: authToken } = await apiLogin(email, password)

      setUser(userData)
      setToken(authToken)

      // Set cookie with expiration (1 day)
      setCookie("token", authToken, 1)

      // Redirect based on user role
      if (userData.equipe === "T.I") {
        router.push("/dashboard")
      } else {
        router.push("/portal")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    removeCookie("token")
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
