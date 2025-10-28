import { cookies } from "next/headers"
import type { User } from "@/lib/types"
import { getCurrentUser as fetchCurrentUser } from "@/lib/api-client"
import { unstable_noStore as noStore } from "next/cache"

export async function getCurrentUser(): Promise<User | null> {
  // Indica ao Next.js que esta função não deve ser armazenada em cache
  noStore()

  try {
    const cookieStore = await cookies() // <-- Use await aqui!
    const token = cookieStore.get("token")?.value

    if (!token) {
      return null
    }

    const user = await fetchCurrentUser(token)
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}