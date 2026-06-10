import { Link, useRouter } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { updateStatus, getProfile } from '#/functions/profile'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchUnreadCount } from '#/functions/messages'


export function Navbar() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const { data: session } = authClient.useSession()

  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [duration, setDuration] = useState('30')

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile(),
    enabled: !!session,
  })

  const { data: unread } = useQuery({
  queryKey: ['unread-count'],
  queryFn: () => fetchUnreadCount(),
  enabled: !!session,
  refetchInterval: 5000,
})

const statusMutation = useMutation({
  mutationFn: (data: { status: string; duration?: number }) =>
  updateStatus({ data }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] })
    queryClient.invalidateQueries({ queryKey: ['recent-listings'] })
    queryClient.invalidateQueries({ queryKey: ['listings'] })
  },
})

  // Countdown timer
useEffect(() => {
  if (!profile?.statusExpiresAt || profile.status === 'offline') {
    setTimeLeft(null)
    return
  }

  const expiresAt = new Date(profile.statusExpiresAt).getTime()

  const tick = () => {
    const remaining = Math.max(0, expiresAt - Date.now())
    setTimeLeft(remaining)
    if (remaining === 0) {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['recent-listings'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
    }
  }

  tick()
  const interval = setInterval(tick, 1000)
  return () => clearInterval(interval)
}, [profile?.statusExpiresAt, profile?.status])

  function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    if (h > 0) return `${h}h${m.toString().padStart(2, '0')}m`
    return `${m}m${s.toString().padStart(2, '0')}s`
  }

  async function handleLogout() {
    await authClient.signOut()
    router.navigate({ to: '/login' })
  }

    const statusConfig = {
    offline: { label: 'Hors ligne', color: 'bg-gray-400' },
    online: { label: 'En ligne', color: 'bg-blue-500' },
    available: { label: 'Disponible', color: 'bg-green-500' },
  }

  const currentStatus = profile?.status ?? 'offline'

   return (
    <nav className="border-b px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/" className="font-bold text-lg">WSF</Link>
        {mounted && session && (
          <>
          <Link
            to="/my-listings"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Mes annonces
          </Link>
            <Link
            search={{}}
            to="/messages"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors gap-1.5"
          >
            Mes messages
            {unread && unread.count > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full">
                {unread.count > 9 ? '9+' : unread.count}
              </span>
            )}
          </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {session && profile && (
          <div className="flex items-center gap-2">
            {/* Indicateur statut */}
            <span className="flex items-center gap-1.5 text-sm">
              <span className={`w-2 h-2 rounded-full ${statusConfig[currentStatus as keyof typeof statusConfig].color || 'bg-gray-400'}`} />
              {statusConfig[currentStatus as keyof typeof statusConfig].label || currentStatus}
              {timeLeft !== null && timeLeft > 0 && (
                <span className="text-xs text-muted-foreground">({formatTime(timeLeft)})</span>
              )}
            </span>

            {/* Sélecteur durée */}
            {currentStatus === 'offline' && (
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="h-8 w-20 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30min</SelectItem>
                  <SelectItem value="60">1h</SelectItem>
                  <SelectItem value="120">2h</SelectItem>
                  <SelectItem value="180">3h</SelectItem>
                  <SelectItem value="240">4h</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Boutons statut */}
            {currentStatus === 'offline' ? (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => statusMutation.mutate({ status: 'online', duration: parseInt(duration) })}
                >
                  En ligne
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-green-600 hover:bg-green-700"
                  onClick={() => statusMutation.mutate({ status: 'available', duration: parseInt(duration) })}
                >
                  Disponible
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => statusMutation.mutate({ status: 'offline' })}
              >
                Se déconnecter
              </Button>
            )}
          </div>
        )}

        {mounted && session ? (
          <>
            <Link
              to="/profile"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {session.user.name}
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline" size="sm">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">S'inscrire</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}