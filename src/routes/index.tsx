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



  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
        hello
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