import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getProfile, upsertProfile } from '#/functions/profile'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'

export const Route = createFileRoute('/profile')({
      ssr: false,
  component: ProfilePage,
})

function ProfilePage() {
  const router = useRouter()
  const [warframeAlias, setWarframeAlias] = useState('')
  const [platform, setPlatform] = useState('pc')
  const [status, setStatus] = useState('offline')

const { data: profile, isLoading } = useQuery({
  
  queryKey: ['profile'],
  queryFn: () => getProfile(),
})

// Initialise les états quand le profil est chargé
useEffect(() => {
  if (profile) {
    setWarframeAlias(profile.warframeAlias)
    setPlatform(profile.platform ?? 'pc')
    setStatus(profile.status ?? 'offline')
  }
}, [profile])

  const mutation = useMutation({
    mutationFn: (data: { warframeAlias: string; platform: string; status: string }) =>
      upsertProfile({ data }),
    onSuccess: () => router.navigate({ to: '/' }),
  })

  if (isLoading) return <div className="p-8">Chargement...</div>

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mon profil</h1>
          <p className="text-muted-foreground mt-2">
            Configure ton profil Warframe
          </p>
        </div>

        <div className="space-y-4">
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

          <div className="space-y-2">
            <Label>Statut</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offline">Hors ligne</SelectItem>
                <SelectItem value="online">En ligne</SelectItem>
                <SelectItem value="available">Disponible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            disabled={mutation.isPending || !warframeAlias}
            onClick={() => mutation.mutate({ warframeAlias, platform, status })}
          >
            {mutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>

          {mutation.isError && (
            <p className="text-sm text-red-500">Une erreur est survenue</p>
          )}
        </div>
      </div>
    </div>
  )
}