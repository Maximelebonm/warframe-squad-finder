import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getProfile, upsertProfile } from '#/functions/profile'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { checkAliasAvailable } from './../functions/profile';

export const Route = createFileRoute('/profile')({
  ssr: false,
  component: ProfilePage,
})

function ProfilePage() {
  const router = useRouter()
  const [warframeAlias, setWarframeAlias] = useState('')
  const [platform, setPlatform] = useState('pc')

  // Changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [AliasError, setAliasError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Suppression de compte
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile(),
  })

  useEffect(() => {
    if (!isLoading && !profile) {
      router.navigate({ to: '/' })
    }
    if (profile) {
      setWarframeAlias(profile.warframeAlias)
      setPlatform(profile.platform ?? 'pc')
    }
  }, [profile, isLoading])

  const mutation = useMutation({
    mutationFn: (data: { warframeAlias: string; platform: string; status: string }) =>
      upsertProfile({ data }),
    onSuccess: () => router.navigate({ to: '/' }),
    onError: (error: Error) => setAliasError(error.message),
  })

  function validatePassword(pwd: string): string | null {
    if (pwd.length < 8) return 'Au moins 8 caractères'
    if (!/[A-Z]/.test(pwd)) return 'Au moins une majuscule'
    if (!/[0-9]/.test(pwd)) return 'Au moins un chiffre'
    if (!/[^a-zA-Z0-9]/.test(pwd)) return 'Au moins un caractère spécial'
    return null
  }

  async function handleChangePassword() {
    setPasswordError('')
    setPasswordSuccess(false)

    const pwdError = validatePassword(newPassword)
    if (pwdError) { setPasswordError(pwdError); return }
    if (newPassword !== confirmPassword) { setPasswordError('Les mots de passe ne correspondent pas'); return }

    setPasswordLoading(true)
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    })

    if (error) {
      setPasswordError(error.message ?? 'Une erreur est survenue')
    } else {
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordLoading(false)
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'SUPPRIMER') {
      setDeleteError('Tape exactement SUPPRIMER pour confirmer')
      return
    }
    setDeleteLoading(true)
    const { error } = await authClient.deleteUser()
    if (error) {
      setDeleteError(error.message ?? 'Une erreur est survenue')
      setDeleteLoading(false)
      return
    }
    router.navigate({ to: '/' })
  }

  if (isLoading) return <div className="p-8">Chargement...</div>

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-10">

        {/* Profil Warframe */}
        <section className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">Mon profil</h1>
            <p className="text-muted-foreground mt-1">Configure ton profil Warframe</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alias">Alias Warframe</Label>
            <Input
              id="alias"
              placeholder="TonAliasInGame"
              value={warframeAlias}
              onChange={(e) => setWarframeAlias(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Plateforme</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pc">PC</SelectItem>
                <SelectItem value="ps">PlayStation</SelectItem>
                <SelectItem value="xbox">Xbox</SelectItem>
                <SelectItem value="switch">Switch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            disabled={mutation.isPending || !warframeAlias}
            onClick={() => mutation.mutate({ warframeAlias, platform, status: profile?.status ?? 'offline' })}
          >
            {mutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>

          {mutation.isError && (
            <p className="text-sm text-red-500">{AliasError}</p>
          )}
        </section>

        <hr />

        {/* Changement de mot de passe */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Changer le mot de passe</h2>
            <p className="text-muted-foreground text-sm mt-1">8 caractères min, une majuscule, un chiffre, un caractère spécial</p>
          </div>

          <div className="space-y-2">
            <Label>Mot de passe actuel</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Nouveau mot de passe</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Confirmer le nouveau mot de passe</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-green-600">Mot de passe mis à jour !</p>}

          <Button
            className="w-full"
            onClick={handleChangePassword}
            disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
          >
            {passwordLoading ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </section>

        <hr />

        {/* Suppression de compte */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-red-500">Supprimer mon compte</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Action irréversible. Toutes tes annonces et messages seront supprimés.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Tape <span className="font-mono font-bold">SUPPRIMER</span> pour confirmer</Label>
            <Input
              placeholder="SUPPRIMER"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
          </div>

          {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}

          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Suppression...' : 'Supprimer mon compte'}
          </Button>
        </section>

      </div>
    </div>
  )
}