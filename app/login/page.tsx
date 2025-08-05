"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plane } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setTimeout(() => {
      setLoading(false)
      if (!email || !password) {
        setError("Please enter both email and password.")
      } else {
        // Success: You can add redirect logic here later
      }
    }, 1000)
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
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
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