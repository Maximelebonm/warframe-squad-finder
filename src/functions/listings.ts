import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { listings, items } from '../db/schema'
import { eq, ilike, and, or, isNull, gt } from 'drizzle-orm'
import { auth } from '../lib/auth'
import { getRequest } from '@tanstack/react-start/server'

// Rechercher des items par nom
export const searchItems = createServerFn({ method: 'GET' })
  .validator((query: string) => query)
  .handler(async ({ data: query }) => {
    return await db.query.items.findMany({
      where: ilike(items.name, `%${query}%`),
      limit: 20,
    })
  })

// Récupérer les annonces pour un item
export const getListings = createServerFn({ method: 'GET' })
  .validator((itemId: number) => itemId)
  .handler(async ({ data: itemId }) => {

    const now = new Date()

    const result = await db.query.listings.findMany({
      where: and(
        eq(listings.itemId, itemId),
        eq(listings.isActive, true)
      ),
      with: {
        item: true,
        user: {
          with: {
            profile: true,
          },
        },
      },
    })

    return result.map(listing => {
      const expiresAt = listing.user.profile.statusExpiresAt
      if (expiresAt && expiresAt < now) {
        listing.user.profile.status = 'offline'
        listing.user.profile.statusExpiresAt = null
      }
      return listing
    })
  })

// Créer une annonce
export const createListing = createServerFn({ method: 'POST' })
  .validator((data: {
    itemId: number
    mode: 'have' | 'want'
    quality?: string
    quantity?: number
    note?: string
  }) => data)
  .handler(async ({ data }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Non authentifié')

    await db.insert(listings).values({
      userId: session.user.id,
      itemId: data.itemId,
      mode: data.mode,
      quality: data.quality,
      quantity: data.quantity ?? 1,
      note: data.note,
    })

    return { success: true }
  })

// Activer / désactiver une annonce
export const toggleListing = createServerFn({ method: 'POST' })
  .validator((data: { listingId: number; isActive: boolean }) => data)
  .handler(async ({ data }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Non authentifié')

    await db
      .update(listings)
      .set({ isActive: data.isActive })
      .where(
        and(
          eq(listings.id, data.listingId),
          eq(listings.userId, session.user.id)
        )
      )

    return { success: true }
  })

// Supprimer une annonce
export const deleteListing = createServerFn({ method: 'POST' })
  .validator((listingId: number) => listingId)
  .handler(async ({ data: listingId }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Non authentifié')

    await db
      .delete(listings)
      .where(
        and(
          eq(listings.id, listingId),
          eq(listings.userId, session.user.id)
        )
      )

    return { success: true }
  })

  export const fetchRecentListings = createServerFn({ method: 'GET' })
  .validator(() => undefined)
  .handler(async () => {
    const now = new Date()
  const result = await db.query.listings.findMany({
    where: eq(listings.isActive, true),
    with: {
      item: true,
      user: {
        with: {
          profile: true,
        },
      },
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: 10,
  })

  return result.map(listing => {
      const expiresAt = listing.user.profile.statusExpiresAt
      if (expiresAt && expiresAt < now) {
        listing.user.profile.status = 'offline'
        listing.user.profile.statusExpiresAt = null
      }
      return listing
    })
})

  export const fetchMyListings = createServerFn({ method: 'GET' })
  .validator(() => undefined)
  .handler(async () => {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Non authentifié')

  return await db.query.listings.findMany({
    where: eq(listings.userId, session.user.id),
    with: {
      item: true,
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  })
})

export const updateListing = createServerFn({ method: 'POST' })
  .validator((data: {
    listingId: number
    quality?: string
    quantity?: number
    note?: string
  }) => data)
  .handler(async ({ data }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Non authentifié')

    await db
      .update(listings)
      .set({
        quality: data.quality,
        quantity: data.quantity,
        note: data.note,
      })
      .where(
        and(
          eq(listings.id, data.listingId),
          eq(listings.userId, session.user.id)
        )
      )

    return { success: true }
  })