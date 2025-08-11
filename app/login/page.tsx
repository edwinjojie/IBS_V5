"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plane } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Store JWT token in localStorage
      localStorage.setItem("token", data.token)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-start bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/plane5.jpg')",
      }}
    >
      <div className="flex flex-col justify-center items-start w-full max-w-lg h-full px-8 py-16">
        <Card className="w-full max-w-md p-8 bg-background/40 backdrop-blur-md border border-border/50 shadow-xl">
          <div className="flex flex-col items-center mb-6">
            <Plane className="h-8 w-8 text-primary mb-2" />
            <h1 className="text-2xl font-bold mb-1">AirOps Login</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 w-full">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="bg-background/30 backdrop-blur-sm border-border/50"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="bg-background/30 backdrop-blur-sm border-border/50"
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-primary hover:underline cursor-not-allowed opacity-60" tabIndex={-1}>
              Forgot password?
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}