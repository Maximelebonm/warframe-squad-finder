import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function validatePassword(pwd: string): string | null {
    if (pwd.length < 8) return 'Au moins 8 caractères'
    if (!/[A-Z]/.test(pwd)) return 'Au moins une majuscule'
    if (!/[0-9]/.test(pwd)) return 'Au moins un chiffre'
    if (!/[^a-zA-Z0-9]/.test(pwd)) return 'Au moins un caractère spécial'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const pwdError = validatePassword(password)
    if (pwdError) { setError(pwdError); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }

    setLoading(true)
    const { error: authError } = await authClient.resetPassword({ newPassword: password })

    if (authError) {
      setError(authError.message ?? 'Une erreur est survenue')
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.navigate({ to: '/login' }), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Nouveau mot de passe</h1>
          <p className="text-muted-foreground mt-2">Choisis un nouveau mot de passe sécurisé</p>
        </div>

        {done ? (
          <p className="text-green-600 text-center">Mot de passe mis à jour ! Redirection...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                8 caractères min, une majuscule, un chiffre, un caractère spécial
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirme le mot de passe</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Réinitialiser'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}