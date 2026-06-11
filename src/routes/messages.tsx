import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchConversations, fetchMessages, sendMessage, getOrCreateConversation } from '#/functions/messages'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

export const Route = createFileRoute('/messages')({
  validateSearch: (search: Record<string, unknown>): { recipientId?: string } => ({
    recipientId: search.recipientId as string | undefined,
  }),
  component: MessagesPage,
})

function MessagesPage() {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null)
  const [content, setContent] = useState('')
  const { recipientId } = Route.useSearch()

  useEffect(() => {
  if (!recipientId) return
  getOrCreateConversation({ data: recipientId }).then(({ conversationId }: { conversationId: number }) => {
    setSelectedConvId(conversationId)
    queryClient.invalidateQueries({ queryKey: ['conversations'] })
  })
}, [recipientId])

  const { data: convList } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => fetchConversations(),
    refetchInterval: 5000,
  })

  const { data: msgs } = useQuery({
    queryKey: ['messages', selectedConvId],
    queryFn: () => fetchMessages({ data: selectedConvId! }),
    enabled: selectedConvId !== null,
    refetchInterval: 3000,
  })

  const sendMutation = useMutation({
    mutationFn: (data: { recipientId: string; content: string }) =>
      sendMessage({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConvId], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: ['conversations'], refetchType: 'all' })
      setContent('')
    },
  })

  const selectedConv = convList?.find(c => c.id === selectedConvId)

  function getOtherUser(conv: typeof selectedConv) {
    if (!conv || !session) return null
    return conv.user1Id === session.user.id ? conv.user2 : conv.user1
  }

  function handleSend() {
    if (!content.trim() || !selectedConv) return
    const other = getOtherUser(selectedConv)
    if (!other) return
    sendMutation.mutate({ recipientId: other.id, content: content.trim() })
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      <div className="border rounded-lg flex h-[600px]">
        {/* Liste des conversations */}
        <div className="w-72 border-r flex flex-col">
          <div className="p-3 border-b text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Conversations
          </div>
          <div className="flex-1 overflow-y-auto">
            {!convList || convList.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Aucune conversation</p>
            ) : (
              convList.map(conv => {
                const other = getOtherUser(conv)
                const lastMsg = conv.messages[0] as typeof conv.messages[0] | undefined
                const isSelected = conv.id === selectedConvId
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b ${isSelected ? 'bg-muted' : ''}`}
                  >
                    <p className="font-medium text-sm">
                      {other?.profile.warframeAlias || other?.name}
                    </p>
                    
                  {lastMsg && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {lastMsg.content}
                    </p>
                    )}
                    
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Zone de messages */}
        <div className="flex-1 flex flex-col">
          {!selectedConvId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Sélectionne une conversation
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b font-medium">
                {getOtherUser(selectedConv)?.profile.warframeAlias || getOtherUser(selectedConv)?.name}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgs?.map(msg => {
                  const isMe = msg.senderId === session?.user.id
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {msg.content}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Input */}
              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder="Ton message..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} disabled={sendMutation.isPending}>
                  Envoyer
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}