'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          router.push('/map')
        } else {
          setCheckingAuth(false)
        }
      })
      .catch(() => setCheckingAuth(false))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/map')
      } else {
        setError(data.error || 'Falsches Passwort')
      }
    } catch {
      setError('Verbindungsfehler')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Lade...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm space-y-8">
        {/* Logo and title */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10 text-primary">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">RSPPLP Austria</h1>
            <p className="text-muted-foreground mt-2">
              Gib das Zugangspasswort ein
            </p>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Access Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pl-11 pr-11 bg-card border-border/30 focus:border-primary"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90" 
            disabled={loading || !password}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Prüfe...
              </>
            ) : (
              'Eintreten'
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/50">
          Nur für autorisierte Mitglieder
        </p>
      </div>
    </div>
  )
}
