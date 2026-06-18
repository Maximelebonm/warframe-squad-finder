import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { searchRelics, searchMods, searchResources, createListing, fetchMyListings, toggleListing, deleteListing, updateListing } from '#/functions/listings'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Switch } from '#/components/ui/switch'
import { getProfile } from '#/functions/profile'

type Category = 'relic' | 'mod' | 'resource'

export const Route = createFileRoute('/my-listings')({
  ssr: false,
  component: MyListingsPage,
})

function MyListingsPage() {
  const queryClient = useQueryClient()
  const [category, setCategory] = useState<Category>('relic')
  const [query, setQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<{ id: number; name: string; tier?: string | null } | null>(null)
  const [quality, setQuality] = useState('intact')
  const [note, setNote] = useState('')
  const [quantity, setQuantity] = useState(1)

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

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile(),
  })

  const { data: myListings } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => fetchMyListings(),
  })

  const createMutation = useMutation({
    mutationFn: () => createListing({
      data: {
        category,
        relicId: category === 'relic' ? selectedItem!.id : undefined,
        modId: category === 'mod' ? selectedItem!.id : undefined,
        resourceId: category === 'resource' ? selectedItem!.id : undefined,
        quality: category === 'relic' && selectedItem?.tier ? quality : undefined,
        quantity,
        note: note || undefined,
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'], refetchType: 'all' })
      setSelectedItem(null)
      setQuery('')
      setNote('')
      setQuantity(1)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (data: { listingId: number; isActive: boolean }) => toggleListing({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-listings'], refetchType: 'all' }),
  })

  const updateMutation = useMutation({
    mutationFn: (data: { listingId: number; quality?: string; quantity?: number; note?: string }) =>
      updateListing({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: ['recent-listings'], refetchType: 'all' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (listingId: number) => deleteListing({ data: listingId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-listings'], refetchType: 'all' }),
  })

  if (profileLoading) return <div className="p-8">Chargement...</div>

  if (!profile?.warframeAlias) {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-4">
        <h1 className="text-3xl font-bold">Mes annonces</h1>
        <div className="border rounded-lg p-6 space-y-4 text-center">
          <p className="text-muted-foreground">Tu dois configurer ton profil avant de créer des annonces.</p>
          <Link to="/profile"><Button>Configurer mon profil</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-10">
      <h1 className="text-3xl font-bold">Mes annonces</h1>

      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Nouvelle annonce</h2>

        {/* Catégorie */}
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select value={category} onValueChange={(v) => { setCategory(v as Category); setSelectedItem(null); setQuery('') }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relic">Relique</SelectItem>
              <SelectItem value="mod">Mod</SelectItem>
              <SelectItem value="resource">Ressource</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Recherche */}
        <div className="space-y-2">
          <Label>{category === 'relic' ? 'Relique' : category === 'mod' ? 'Mod' : 'Ressource'}</Label>
          <Input
            placeholder={`Recherche un${category === 'relic' ? 'e relique' : category === 'mod' ? ' mod' : 'e ressource'}...`}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedItem(null) }}
          />
          {searchResults && searchResults.length > 0 && !selectedItem && (
            <div className="border rounded-lg divide-y">
              {searchResults.map((item : any) => (
                <button
                  key={item.id}
                  className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                  onClick={() => { setSelectedItem(item); setQuery(item.name) }}
                >
                  {item.name}
                  {'vaulted' in item && item.vaulted && (
                    <span className="ml-2 text-xs text-orange-500">Vaulted</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Qualité (reliques seulement) */}
        {category === 'relic' && (
          <div className="space-y-2">
            <Label>Qualité</Label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="intact">Intact</SelectItem>
                <SelectItem value="exceptional">Exceptional</SelectItem>
                <SelectItem value="flawless">Flawless</SelectItem>
                <SelectItem value="radiant">Radiant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Quantité */}
        {category === 'relic' &&        
        <div className="space-y-2">
          <Label>Quantité ouvrable</Label>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>}

        {/* Note */}
        <div className="space-y-2">
          <Label>Note (optionnel)</Label>
          <Input
            placeholder="ex: dispo après 20h"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <Button
          className="w-full"
          disabled={!selectedItem || createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? 'Création...' : "Créer l'annonce"}
        </Button>
      </div>

      {/* Liste */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Mes annonces</h2>
        {!myListings || myListings.length === 0 ? (
          <p className="text-muted-foreground">Aucune annonce pour le moment</p>
        ) : (
          <div className="border rounded-lg divide-y">
            {myListings.map((listing) => (
              <EditableListingRow
                key={listing.id}
                listing={listing}
                onToggle={(checked) => toggleMutation.mutate({ listingId: listing.id, isActive: checked })}
                onDelete={() => deleteMutation.mutate(listing.id)}
                onUpdate={(data) => updateMutation.mutate({ listingId: listing.id, ...data })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EditableListingRow({ listing, onToggle, onDelete, onUpdate }: {
  listing: any
  onToggle: (checked: boolean) => void
  onDelete: () => void
  onUpdate: (data: { quality?: string; quantity?: number; note?: string }) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editQuality, setEditQuality] = useState(listing.quality ?? 'intact')
  const [editNote, setEditNote] = useState(listing.note ?? '')
  const [editQuantity, setEditQuantity] = useState(listing.quantity ?? 1)

  // Nom de l'item selon la catégorie
  const itemName = listing.relic?.name ?? listing.mod?.name ?? listing.resource?.name ?? '?'
  const isRelic = listing.category === 'relic'
  const hasTier = !!listing.relic?.tier

  function handleSave() {
    onUpdate({ quality: editQuality || undefined, quantity: editQuantity, note: editNote || undefined })
    setEditing(false)
  }

  function handleCancel() {
    setEditQuality(listing.quality ?? 'intact')
    setEditNote(listing.note ?? '')
    setEditQuantity(listing.quantity ?? 1)
    setEditing(false)
  }

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wide mr-2">{listing.category}</span>
          <span className="font-medium">{itemName}</span>
          {listing.category === 'relic' && listing.quantity && (
            <span className="ml-2 text-sm text-muted-foreground">x{listing.quantity}</span>
          )}
          {!editing && listing.quality && (
            <span className="ml-2 text-sm text-muted-foreground capitalize">{listing.quality}</span>
          )}
          {!editing && listing.note && (
            <p className="text-sm text-muted-foreground mt-1">{listing.note}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={listing.isActive ?? true} onCheckedChange={onToggle} />
          <button onClick={() => setEditing(!editing)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <Button variant="destructive" size="sm" onClick={onDelete}>Supprimer</Button>
        </div>
      </div>

      {editing && (
        <div className="space-y-3 pt-2 border-t">
          {isRelic && hasTier && (
            <div className="space-y-1">
              <Label>Qualité</Label>
              <Select value={editQuality} onValueChange={setEditQuality}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="intact">Intact</SelectItem>
                  <SelectItem value="exceptional">Exceptional</SelectItem>
                  <SelectItem value="flawless">Flawless</SelectItem>
                  <SelectItem value="radiant">Radiant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <Label>Note</Label>
            <Input value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="ex: dispo après 20h" />
          </div>
          <div className="space-y-1">
            <Label>Quantité</Label>
            <Input type="number" min={1} value={editQuantity} onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}><Check className="w-4 h-4 mr-1" /> Sauvegarder</Button>
            <Button size="sm" variant="outline" onClick={handleCancel}><X className="w-4 h-4 mr-1" /> Annuler</Button>
          </div>
        </div>
      )}
    </div>
  )
}