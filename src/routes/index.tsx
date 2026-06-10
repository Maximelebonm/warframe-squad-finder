import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { MessageCircle, Copy, Check, Mail } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { searchItems, getListings, fetchRecentListings   } from '#/functions/listings'
import { Input } from '#/components/ui/input'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/')({
  ssr: false,
  component: HomePage,
})

function HomePage() {

  const [query, setQuery] = useState('')
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const { data: session } = authClient.useSession()

  const { data: searchResults } = useQuery({
    queryKey: ['items', query],
    queryFn: () => searchItems({ data: query }),
    enabled: query.length >= 2,
  })

  const { data: listingsData } = useQuery({
    queryKey: ['listings', selectedItemId],
    queryFn: () => getListings({ data: selectedItemId! }),
    enabled: selectedItemId !== null,
  })

  const { data: recentListings } = useQuery({
  queryKey: ['recent-listings'],
  queryFn: () => fetchRecentListings (),
  })

  const havePlayers = listingsData?.filter((l) => l.mode === 'have') ?? []
  const wantPlayers = listingsData?.filter((l) => l.mode === 'want') ?? []

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Warframe Squad Finder</h1>
        <p className="text-muted-foreground mt-2">
          Trouve des joueurs pour ouvrir tes reliques
        </p>
      </div>

      {/* Barre de recherche */}
      <Input
        placeholder="Recherche une relique... ex: Lith V6"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setSelectedItemId(null)
        }}
      />

      {/* Résultats de recherche */}
      {searchResults && searchResults.length > 0 && !selectedItemId && (
        <div className="border rounded-lg divide-y">
          {searchResults.map((item) => (
            <button
              key={item.id}
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors"
              onClick={() => {
                setSelectedItemId(item.id)
                setQuery(item.name)
              }}
            >
              <span className="font-medium">{item.name}</span>
              {item.tier && (
                <span className="ml-2 text-sm text-muted-foreground">{item.tier}</span>
              )}
              {item.vaulted && (
                <span className="ml-2 text-xs text-orange-500">Vaulted</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Listings */}
      {selectedItemId && listingsData && (
        <div className="space-y-6">
          {/* Joueurs qui ont la relique */}
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Joueurs qui ont cette relique ({havePlayers.length})
            </h2>
            {havePlayers.length === 0 ? (
              <p className="text-muted-foreground">Aucun joueur disponible</p>
            ) : (
              <div className="border rounded-lg divide-y">
                {havePlayers.map((listing) => {
                  const alias = listing.user.profile.warframeAlias || listing.user.name
                  return (
                    <ListingRow
                      key={listing.id}
                      listing={listing}
                      alias={alias}
                      itemName={listing.item.name || ''}  // adapte selon ta structure
                      session={session} 
                    />
                  )
                })}
              </div>
            )}
          </div>

          {/* Joueurs qui cherchent la relique */}
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Joueurs qui cherchent cette relique ({wantPlayers.length})
            </h2>
            {wantPlayers.length === 0 ? (
              <p className="text-muted-foreground">Aucun joueur ne cherche cette relique</p>
            ) : (
              <div className="border rounded-lg divide-y">
                {wantPlayers.map((listing) => {
                  const alias = listing.user.profile.warframeAlias || listing.user.name
                  return (
                    <ListingRow
                      key={listing.id}
                      listing={listing}
                      alias={alias}
                      itemName={listing.item.name}
                      session={session} 
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedItemId && (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Annonces récentes</h2>
    {!recentListings || recentListings.length === 0 ? (
      <p className="text-muted-foreground">Aucune annonce pour le moment</p>
    ) : (
      <div className="border rounded-lg divide-y">
        {recentListings.map((listing) => {
          const alias = listing.user.profile.warframeAlias || listing.user.name
          return (
            <ListingRow
              key={listing.id}
              listing={listing}
              alias={alias}
              itemName={listing.item.name}
              session={session}
            />
          )
        })}
      </div>
    )}
  </div>
)}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    available: { label: 'Disponible', className: 'bg-green-500' },
    online: { label: 'En ligne', className: 'bg-blue-500' },
    offline: { label: 'Hors ligne', className: 'bg-gray-400' },
  }[status] ?? { label: status, className: 'bg-gray-400' }

  return (
    <span className="flex items-center gap-1.5 text-sm">
      <span className={`w-2 h-2 rounded-full ${config.className}`} />
      {config.label}
    </span>
  )
}

function ContactMessage({ alias, itemName }: { alias: string; itemName: string }) {
  const [copied, setCopied] = useState(false)
  const message = `/w ${alias} Hi ! I contact you for farm ${itemName} (WSF).`

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

function ListingRow({ listing, alias, itemName,session}: {
  listing: any
  alias: string
  itemName: string
  session : any
}) {
  const [showMessage, setShowMessage] = useState(false)
  const navigate = useNavigate()


  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">{itemName}</span>
          {listing.quality && (
            <span className="font-medium ml-2 text-sm text-muted-foreground capitalize">
              {listing.quality}
            </span>
          )}
          <span className="ml-2 text-sm text-muted-foreground">{alias}</span>
          <span className="ml-2 text-sm text-muted-foreground">
            {listing.mode === 'have' ? 'Possède' : 'Cherche'}
          </span>
          {listing.note && (
            <p className="text-sm text-muted-foreground mt-1">{listing.note}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={listing.user.profile.status ?? 'offline'} />
          <button
            onClick={() => setShowMessage(!showMessage)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
           <button
                onClick={() => {
                  if (listing.user.id === session?.user.id) return
                  navigate({ 
                    to: '/messages',
                    search: { recipientId: listing.user.id }
                  })
                }}
                className={`transition-colors ${
                  listing.user.id === session?.user.id 
                    ? 'text-muted-foreground/30 cursor-not-allowed' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                disabled={listing.user.id === session?.user.id}
              >
            <Mail className="w-5 h-5" />
          </button>
        </div>
      </div>
      {showMessage && <ContactMessage alias={alias} itemName={itemName} />}
    </div>
  )
}