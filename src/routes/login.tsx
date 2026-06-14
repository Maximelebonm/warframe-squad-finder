import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const pwdError = validatePassword(password)

    if (pwdError) {
    setError(pwdError)
    setLoading(false)
    return
  }

    const { error : authError } = await authClient.signIn.email({
      email,
      password,
    })

    if (authError) {
      setError(authError.message ?? 'Une erreur est survenue')
      setLoading(false)
      return
    }

    router.navigate({ to: '/' })
  }

    function validatePassword(pwd: string): string | null {
  if (pwd.length < 8) return 'Au moins 8 caractères'
  if (!/[A-Z]/.test(pwd)) return 'Au moins une majuscule'
  if (!/[0-9]/.test(pwd)) return 'Au moins un chiffre'
  if (!/[^a-zA-Z0-9]/.test(pwd)) return 'Au moins un caractère spécial'
  return null
  }

  async function handleForgotPassword() {
  if (!email) {
    setError('Entre ton email d\'abord')
    return
  }
  setResetLoading(true)
  await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' })
  setResetSent(true)
  setResetLoading(false)
}

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Connexion</h1>
          <p className="text-muted-foreground mt-2">
            Accède à ton compte Warframe Squad Finder
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {resetLoading ? 'Envoi...' : 'Mot de passe oublié ?'}
            </button>
          </div>

          {resetSent && (
            <p className="text-sm text-green-600">
              Email de réinitialisation envoyé à {email} !
            </p>
          )}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-primary hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}