import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error : authError } = await authClient.signUp.email({
      email,
      password,
      name,
    })

    if (authError) {
      setError(authError.message ?? 'Une erreur est survenue')
      setLoading(false)
      return
    }

    setEmailSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Inscription</h1>
          <p className="text-muted-foreground mt-2">
            Crée ton compte Warframe Squad Finder
          </p>
        </div>
        {emailSent ? (
          <div className="text-center space-y-3 py-6">
            <div className="text-4xl">📧</div>
            <h2 className="text-xl font-semibold">Vérifie ta boîte mail</h2>
            <p className="text-muted-foreground text-sm">
              Un lien de confirmation a été envoyé à <span className="font-medium text-foreground">{email}</span>.
              Clique dessus pour activer ton compte.
            </p>
            <p className="text-xs text-muted-foreground">
              Tu ne vois pas l'email ? Vérifie tes spams.
            </p>
          </div>
        ) : (
        <>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Pseudo d'utilisateur (peut être different de ton alias warframe)</Label>
            <Input
              id="name"
              type="text"
              placeholder="TonPseudo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Inscription...' : "S'inscrire"}
          </Button>
        </form>
      </>
      )}
        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}