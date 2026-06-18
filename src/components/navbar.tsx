import { Link, useRouter } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { updateStatus, getProfile } from '#/functions/profile'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchUnreadCount } from '#/functions/messages'
import { UserRound,Mail,CarTaxiFront,Megaphone    } from 'lucide-react';


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
  refetchInterval: 10000,
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
  const interval = setInterval(tick, 10000)
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
     <div className="flex items-center gap-6 ">
      <Link to="/" className="font-bold text-lg">        
      <img
          src={`/images/logowsf.png`}
          alt={"logowsf.png"}
          className="w-auto h-8 object-contain"
        /></Link>
      <Link
        to="/taxi"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
      >
        <CarTaxiFront />
        Taxi
      </Link>
    </div>

      <div className="flex items-center gap-3">
        {mounted && session && (
          <>
          <Link
            to="/my-listings"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <Megaphone />
            Mes annonces
          </Link>
          <Link
            search={{}}
            to="/messages"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <Mail/>
            Mes messages
            
            {unread && unread.count > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full">
                {unread.count > 9 ? '9+' : unread.count}
         
              </span>
            )}
          </Link>
          </>
        )}
{mounted && session && profile ? (
  <ProfileMenu
    session={session}
    profile={profile}
    currentStatus={currentStatus}
    timeLeft={timeLeft}
    duration={duration}
    setDuration={setDuration}
    statusMutation={statusMutation}
    formatTime={formatTime}
    statusConfig={statusConfig}
    handleLogout={handleLogout}
  />
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

function ProfileMenu({
  session,
  profile,
  currentStatus,
  timeLeft,
  duration,
  setDuration,
  statusMutation,
  formatTime,
  statusConfig,
  handleLogout,
}: any) {
  const [open, setOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<'offline' | 'online' | 'available'>(currentStatus)

  function selectStatus(status: 'offline' | 'online' | 'available') {
    setPendingStatus(status)
    if (status === 'offline') {
      statusMutation.mutate({ status: 'offline' })
    } else {
      statusMutation.mutate({ status, duration: parseInt(duration || '30') })
    }
  }
  
  return (
    <div
      className="relative"
      onMouseEnter={() => { setOpen(true); setPendingStatus(currentStatus) }}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
        <span className={`w-2 h-2 rounded-full ${statusConfig[currentStatus]?.color || 'bg-gray-400'}`} />
        {session.user.name}
        {timeLeft !== null && timeLeft > 0 && (
          <span className="text-xs text-muted-foreground">({formatTime(timeLeft)})</span>
        )}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full pt-1 z-50">
          <div className="bg-card border rounded-lg shadow-lg p-3 w-56 space-y-3">

            {/* Étape 1 : choix du statut */}
            <div className="space-y-1">
              {(['offline', 'online', 'available'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => selectStatus(status)}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors hover:bg-muted ${
                    pendingStatus === status ? 'bg-muted font-medium' : ''
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusConfig[status].color}`} />
                  {statusConfig[status].label}
                </button>
              ))}
            </div>

            <hr />

            {/* Étape 2 : durée, grisée si offline */}
 <div className={pendingStatus === 'offline' ? 'opacity-40 pointer-events-none space-y-2' : 'space-y-2'}>
  <div className="flex items-center justify-between gap-1">
    {(['30', '60', '120', '180', '240'] as const).map((d) => {
      const labels: Record<string, string> = { '30': '30min', '60': '1h', '120': '2h', '180': '3h', '240': '4h' }
      const isSelected = duration === d
      return (
        <button
          key={d}
          onClick={() => {
            setDuration(d)
            if (pendingStatus !== 'offline') {
              statusMutation.mutate({ status: pendingStatus, duration: parseInt(d) })
            }
          }}
          disabled={pendingStatus === 'offline'}
          className={`flex-1 text-[10px] py-1.5 rounded transition-colors ${
            isSelected
              ? 'bg-primary text-primary-foreground font-medium'
              : 'bg-muted text-muted-foreground hover:bg-muted/70'
          }`}
        >
          {labels[d]}
        </button>
      )
    })}
  </div>
</div>

            <hr />

            <Link
              to="/profile"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Mon profil
            </Link>

            <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}