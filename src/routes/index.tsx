import { createFileRoute, useNavigate, useRouter, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { MessageCircle, Copy, Check, Mail } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { searchRelics, searchMods, searchResources, getListings, fetchRecentListings } from '#/functions/listings'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { authClient } from '#/lib/auth-client'

type Category = 'relic' | 'mod' | 'resource'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Warframe Squad Finder — Trouve des joueurs pour tes reliques' },
      { name: 'description', content: 'Recherche des joueurs Warframe disponibles pour ouvrir des reliques ensemble.' },
      { property: 'og:title', content: 'Warframe Squad Finder' },
      { property: 'og:description', content: 'Trouve des joueurs pour farmer tes reliques Warframe.' },
      { property: 'og:url', content: 'https://warframe-squad-finder.com' },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  const [category, setCategory] = useState<Category>('relic')
  const [query, setQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<{ id: number; name: string } | null>(null)
  const { data: session } = authClient.useSession()

  const { data: relicResults } = useQuery({
    queryKey: ['search-relics', query],
    queryFn: () => searchRelics({ data: query }),
    enabled: query.length >= 2 && category === 'relic',
  })

  const { data: modResults } = useQuery({
    queryKey: ['search-mods', query],
    queryFn: () => searchMods({ data: query }),
    enabled: query.length >= 2 && category === 'mod',
  })

  const { data: resourceResults } = useQuery({
    queryKey: ['search-resources', query],
    queryFn: () => searchResources({ data: query }),
    enabled: query.length >= 2 && category === 'resource',
  })

  const searchResults = category === 'relic' ? relicResults : category === 'mod' ? modResults : resourceResults

  const { data: listingsData } = useQuery({
    queryKey: ['listings', category, selectedItem?.id],
    queryFn: () => getListings({ data: { category, itemId: selectedItem!.id } }),
    enabled: selectedItem !== null,
  })

  const { data: recentListings } = useQuery({
    queryKey: ['recent-listings'],
    queryFn: () => fetchRecentListings(),
  })

  function getItemName(listing: any) {
    return listing.relic?.name ?? listing.mod?.name ?? listing.resource?.name ?? '?'
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Warframe Squad Finder</h1>
        <p className="text-muted-foreground mt-2">Trouve des joueurs pour farmer ensemble</p>
      </div>

      {/* Catégorie + Recherche */}
      <div className="flex gap-2">
        <Select value={category} onValueChange={(v) => { setCategory(v as Category); setSelectedItem(null); setQuery('') }}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relic">Relique</SelectItem>
            <SelectItem value="mod">Mod</SelectItem>
            <SelectItem value="resource">Ressource</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder={`Recherche ${category === 'relic' ? 'une relique... ex: Lith V6' : category === 'mod' ? 'un mod...' : 'une ressource...'}`}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedItem(null) }}
          className="flex-1"
        />
      </div>

      {/* Résultats de recherche */}
      {searchResults && searchResults.length > 0 && !selectedItem && (
        <div className="border rounded-lg divide-y">
          {searchResults.map((item : any) => (
            <button
              key={item.id}
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors"
              onClick={() => { setSelectedItem(item); setQuery(item.name) }}
            >
              <span className="font-medium">{item.name}</span>
              {'tier' in item && item.tier && (
                <span className="ml-2 text-sm text-muted-foreground">{item.tier}</span>
              )}
              {'vaulted' in item && item.vaulted && (
                <span className="ml-2 text-xs text-orange-500">Vaulted</span>
              )}
              {'category' in item && item.category && (
                <span className="ml-2 text-xs text-muted-foreground">{item.category}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Listings */}
{selectedItem && listingsData && (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">
      Annonces pour {selectedItem.name} ({listingsData.length})
    </h2>
    {listingsData.length === 0 ? (
      <p className="text-muted-foreground">Aucune annonce pour le moment</p>
    ) : (
      <div className="border rounded-lg divide-y">
        {listingsData.map((listing) => (
          <ListingRow
            key={listing.id}
            listing={listing}
            alias={listing.user.profile.warframeAlias || listing.user.name}
            itemName={getItemName(listing)}
            session={session}
          />
        ))}
      </div>
    )}
  </div>
)}

      {/* Annonces récentes */}
      {!selectedItem && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Annonces récentes</h2>
          {!recentListings || recentListings.length === 0 ? (
            <p className="text-muted-foreground">Aucune annonce pour le moment</p>
          ) : (
            <div className="border rounded-lg divide-y">
              {recentListings.map((listing) => (
                <ListingRow
                  key={listing.id}
                  listing={listing}
                  alias={listing.user.profile.warframeAlias || listing.user.name}
                  itemName={getItemName(listing)}
                  session={session}
                />
              ))}
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

function ListingRow({ listing, alias, itemName, session }: {
  listing: any
  alias: string
  itemName: string
  session: any
}) {
  const [showMessage, setShowMessage] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wide mr-2">{listing.category}</span>
          <span className="font-medium">{itemName}</span>
          {listing.quality && (
            <span className="font-medium ml-2 text-sm text-muted-foreground capitalize">{listing.quality}</span>
          )}
          <span className="ml-2 text-sm text-muted-foreground">{alias}</span>
          {listing.category === 'relic' && listing.quantity && (
  <span className="ml-2 text-sm text-muted-foreground">x{listing.quantity}</span>
)}

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
              if (!session) { setShowAuthModal(true); return }
              if (listing.user.id === session?.user.id) return
              navigate({ to: '/messages', search: { recipientId: listing.user.id } })
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

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAuthModal(false)}>
          <div className="bg-card border rounded-lg p-6 space-y-4 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold">Connexion requise</h2>
            <p className="text-muted-foreground">
              Tu dois avoir un compte pour contacter un joueur ici. Si il est en ligne clique sur la bulle et copie colle le message !
            </p>
            <div className="flex gap-3">
              <Link to="/register" className="flex-1">
                <Button className="w-full">Créer un compte</Button>
              </Link>
              <Link to="/login" className="flex-1">
                <Button variant="outline" className="w-full">Se connecter</Button>
              </Link>
            </div>
            <button onClick={() => setShowAuthModal(false)} className="w-full text-sm text-muted-foreground hover:text-foreground">
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}