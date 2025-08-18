"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"

// Define user interface for type-checking
interface User {
  id: string
  name: string
  email: string
}

// Define the AuthContextType for context values
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Create the AuthContext with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
})

// Custom hook to access AuthContext values
export const useAuth = () => useContext(AuthContext)

// AuthProvider component to wrap the app and manage user state
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if there's a user session in localStorage
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Login function with mock credentials
  const login = async (email: string, password: string) => {
    if (email === "user@example.com" && password === "password") {
      const user = { id: "1", name: "John Doe", email }
      setUser(user)
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user))
      }
    } else {
      throw new Error("Invalid credentials")
    }
  }

  // Logout function to clear user session
  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
    }
  }

  // Context value to provide to the children components
  const contextValue: AuthContextType = {
    user,
    login,
    logout,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
