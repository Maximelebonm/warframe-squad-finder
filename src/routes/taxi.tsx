import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { MessageCircle, Copy, Check, Mail } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTaxiListings, fetchMyTaxi, upsertTaxi, toggleTaxi } from '#/functions/taxi'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'

export const Route = createFileRoute('/taxi')({
  head: () => ({
    meta: [
      { title: 'Taxi Warframe — Warframe Squad Finder' },
      { name: 'description', content: 'Trouve un joueur expérimenté pour te faire passer des missions difficiles sur Warframe.' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: TaxiPage,
})

function TaxiPage() {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  const [steelPath, setSteelPath] = useState(false)
  const [note, setNote] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)

  const [showMessage, setShowMessage] = useState(false)

  const { data: taxiList } = useQuery({
    queryKey: ['taxi-listings'],
    queryFn: () => fetchTaxiListings(),
    refetchInterval: 10000,
  })

  const { data: myTaxi } = useQuery({
    queryKey: ['my-taxi'],
    queryFn: () => fetchMyTaxi(),
    enabled: !!session,
  })

  useEffect(() => {
    if (myTaxi) {
      setSteelPath(myTaxi.steelPath ?? false)
      setNote(myTaxi.note ?? '')
    }
  }, [myTaxi])

  const upsertMutation = useMutation({
    mutationFn: () => upsertTaxi({ data: { steelPath, isAvailable: true, note: note || undefined } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxi-listings'] })
      queryClient.invalidateQueries({ queryKey: ['my-taxi'] })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (isAvailable: boolean) => toggleTaxi({ data: isAvailable }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxi-listings'] })
      queryClient.invalidateQueries({ queryKey: ['my-taxi'] })
    },
  })

  return (
    <div className="w-full max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Joueurs Taxi</h1>
        <p className="text-muted-foreground mt-2">
          Joueurs expérimentés disponibles pour t'aider à passer des missions difficiles.
        </p>
      </div>

      {/* Mon statut taxi */}
      {session && (
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Mon statut taxi</h2>
            {myTaxi && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {myTaxi.isAvailable ? 'Disponible' : 'Indisponible'}
                </span>
                <Switch
                  checked={myTaxi.isAvailable ?? false}
                  onCheckedChange={(checked) => toggleMutation.mutate(checked)}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Steel Path</Label>
              <Switch checked={steelPath} onCheckedChange={setSteelPath} />
            </div>

            <div className="space-y-2">
              <Label>Note (optionnel)</Label>
              <Input
                placeholder="ex: dispo pour toutes missions sauf Eidolon"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={() => upsertMutation.mutate()}
              disabled={upsertMutation.isPending}
            >
              {upsertMutation.isPending
                ? 'Enregistrement...'
                : myTaxi
                ? 'Mettre à jour'
                : 'Me proposer comme taxi'}
            </Button>
          </div>
        </div>
      )}

      {/* Liste des taxis */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Taxis disponibles ({taxiList?.length ?? 0})
        </h2>
        {!taxiList || taxiList.length === 0 ? (
          <p className="text-muted-foreground">Aucun joueur taxi disponible pour le moment</p>
        ) : (
          <div className="border rounded-lg divide-y">
            {taxiList.map((taxi) => (
            <TaxiRow
                key={taxi.id}
                taxi={taxi}
                session={session}
                onContact={() => {
                if (!session) { setShowAuthModal(true); return }
                navigate({ to: '/messages', search: { recipientId: taxi.user.id } })
                }}
            />
            ))}
         </div>
         )
        }
    </div>
    </div>
    )
}

function TaxiRow({ taxi, session, onContact }: { taxi: any; session: any; onContact: () => void }) {
  const [showMessage, setShowMessage] = useState(false)
  const alias = taxi.user.profile.warframeAlias || taxi.user.name
  const isMe = taxi.user.id === session?.user.id
  const status = taxi.user.profile.status ?? 'offline'

  return (
    <div key={taxi.id} className="px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">{alias}</span>
          {taxi.steelPath && (
            <span className="ml-2 text-xs text-yellow-500 font-medium">⚔ Steel Path</span>
          )}
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {taxi.user.profile.platform ?? 'pc'}
          </span>
          {taxi.note && (
            <p className="text-sm text-muted-foreground mt-1">{taxi.note}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm">
            <span className={`w-2 h-2 rounded-full ${
              status === 'available' ? 'bg-green-500' :
              status === 'online' ? 'bg-blue-500' : 'bg-gray-400'
            }`} />
            {status === 'available' ? 'Disponible' :
             status === 'online' ? 'En ligne' : 'Hors ligne'}
          </span>
          {!isMe && (
            <>
              <button
                onClick={() => setShowMessage(!showMessage)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button
                onClick={onContact}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
      {showMessage && <ContactMessage alias={alias} />}
    </div>
  )
}

function ContactMessage({ alias }: { alias: string }) {
  const [copied, setCopied] = useState(false)
  const message = `/w ${alias} Hi ! I saw you're available as a taxi on WSF, can you help me?`

  async function handleCopy() {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-2 p-3 bg-muted rounded-lg space-y-2">
      <p className="text-sm font-mono">{message}</p>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        {copied ? 'Copié !' : 'Copier'}
      </button>
    </div>
  )
}