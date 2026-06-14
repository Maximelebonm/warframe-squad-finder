import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { listings, relics, mods, resources } from '../db/schema'
import { eq, ilike, and, or, isNull, gt } from 'drizzle-orm'
import { auth } from '../lib/auth'
import { getRequest } from '@tanstack/react-start/server'

type Category = 'relic' | 'mod' | 'resource'

// Rechercher des reliques
export const searchRelics = createServerFn({ method: 'GET' })
  .validator((query: string) => query)
  .handler(async ({ data: query }) => {
    return await db.query.relics.findMany({
      where: ilike(relics.name, `%${query}%`),
      limit: 20,
    })
  })

// Rechercher des mods
export const searchMods = createServerFn({ method: 'GET' })
  .validator((query: string) => query)
  .handler(async ({ data: query }) => {
    return await db.query.mods.findMany({
      where: ilike(mods.name, `%${query}%`),
      limit: 20,
    })
  })

// Rechercher des ressources
export const searchResources = createServerFn({ method: 'GET' })
  .validator((query: string) => query)
  .handler(async ({ data: query }) => {
    return await db.query.resources.findMany({
      where: ilike(resources.name, `%${query}%`),
      limit: 20,
    })
  })

// Récupérer les annonces pour un item
// Récupérer les annonces par catégorie et id
export const getListings = createServerFn({ method: 'GET' })
  .validator((data: { category: Category; itemId: number }) => data)
  .handler(async ({ data }) => {
    const now = new Date()

    const whereClause = data.category === 'relic'
      ? and(eq(listings.relicId, data.itemId), eq(listings.isActive, true))
      : data.category === 'mod'
      ? and(eq(listings.modId, data.itemId), eq(listings.isActive, true))
      : and(eq(listings.resourceId, data.itemId), eq(listings.isActive, true))

    const result = await db.query.listings.findMany({
      where: whereClause,
      with: {
        relic: true,
        mod: true,
        resource: true,
        user: { with: { profile: true } },
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
    category: Category
    relicId?: number
    modId?: number
    resourceId?: number
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
      category: data.category,
      relicId: data.relicId,
      modId: data.modId,
      resourceId: data.resourceId,
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
      .where(and(eq(listings.id, data.listingId), eq(listings.userId, session.user.id)))

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
      .where(and(eq(listings.id, listingId), eq(listings.userId, session.user.id)))

    return { success: true }
  })

  // recuperer les 10 dernieres annonces
export const fetchRecentListings = createServerFn({ method: 'GET' })
  .validator(() => undefined)
  .handler(async () => {
    const now = new Date()

    const result = await db.query.listings.findMany({
      where: eq(listings.isActive, true),
      with: {
        relic: true,
        mod: true,
        resource: true,
        user: { with: { profile: true } },
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

// recuperer mes annonces
export const fetchMyListings = createServerFn({ method: 'GET' })
  .validator(() => undefined)
  .handler(async () => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Non authentifié')

    return await db.query.listings.findMany({
      where: eq(listings.userId, session.user.id),
      with: {
        relic: true,
        mod: true,
        resource: true,
      },
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    })
  })

  // mettre a jours une annonces
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
      .set({ quality: data.quality, quantity: data.quantity, note: data.note })
      .where(and(eq(listings.id, data.listingId), eq(listings.userId, session.user.id)))

    return { success: true }
  })