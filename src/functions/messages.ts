import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { conversations, messages } from '../db/schema'
import { eq, or, and } from 'drizzle-orm'
import { auth } from '../lib/auth'
import { getRequest } from '@tanstack/react-start/server'

// Récupérer toutes les conversations de l'utilisateur
export const fetchConversations = createServerFn({ method: 'GET' })
  .validator(() => undefined)
  .handler(async () => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Non authentifié')

    return await db.query.conversations.findMany({
      where: or(
        eq(conversations.user1Id, session.user.id),
        eq(conversations.user2Id, session.user.id)
      ),
      with: {
        user1: { with: { profile: true } },
        user2: { with: { profile: true } },
        messages: {
          orderBy: (table, { desc }) => [desc(table.createdAt)],
          limit: 1,
        },
      },
      orderBy: (table, { desc }) => [desc(table.lastMessageAt)],
    })
  })

// Récupérer les messages d'une conversation
export const fetchMessages = createServerFn({ method: 'GET' })
  .validator((conversationId: number) => conversationId)
  .handler(async ({ data: conversationId }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Non authentifié')

    // Marquer les messages comme lus
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.readAt, null as any),
        )
      )

    return await db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      with: { sender: { with: { profile: true } } },
      orderBy: (table, { asc }) => [asc(table.createdAt)],
    })
  })

// Envoyer un message (crée la conversation si elle n'existe pas)
export const sendMessage = createServerFn({ method: 'POST' })
  .validator((data: { recipientId: string; content: string }) => data)
  .handler(async ({ data }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Non authentifié')

    const senderId = session.user.id

    // Chercher une conversation existante
    let conversation = await db.query.conversations.findFirst({
      where: or(
        and(
          eq(conversations.user1Id, senderId),
          eq(conversations.user2Id, data.recipientId)
        ),
        and(
          eq(conversations.user1Id, data.recipientId),
          eq(conversations.user2Id, senderId)
        )
      ),
    })

    // Créer la conversation si elle n'existe pas
    if (!conversation) {
      const [newConv] = await db
        .insert(conversations)
        .values({ user1Id: senderId, user2Id: data.recipientId })
        .returning()
      conversation = newConv
    }

    // Envoyer le message
    await db.insert(messages).values({
      conversationId: conversation.id,
      senderId,
      content: data.content,
    })

    // Mettre à jour lastMessageAt
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversation.id))

    return { conversationId: conversation.id }
  })

// Compter les messages non lus
export const fetchUnreadCount = createServerFn({ method: 'GET' })
  .validator(() => undefined)
  .handler(async () => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return { count: 0 }

    const result = await db.query.messages.findMany({
      where: and(
        eq(messages.readAt, null as any),
      ),
      with: {
        conversation: true,
      },
    })

    const unread = result.filter(
      m => m.senderId !== session.user.id &&
      (m.conversation.user1Id === session.user.id || m.conversation.user2Id === session.user.id)
    )

    return { count: unread.length }
  })

  export const getOrCreateConversation = createServerFn({ method: 'POST' })
  .validator((recipientId: string) => recipientId)
  .handler(async ({ data: recipientId }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Non authentifié')

    const senderId = session.user.id

    let conversation = await db.query.conversations.findFirst({
      where: or(
        and(eq(conversations.user1Id, senderId), eq(conversations.user2Id, recipientId)),
        and(eq(conversations.user1Id, recipientId), eq(conversations.user2Id, senderId))
      ),
    })

    if (!conversation) {
      const [newConv] = await db
        .insert(conversations)
        .values({ user1Id: senderId, user2Id: recipientId })
        .returning()
      conversation = newConv
    }

    return { conversationId: conversation.id }
  })