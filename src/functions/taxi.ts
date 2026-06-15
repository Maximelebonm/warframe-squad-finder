import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { taxiListings } from '../db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '../lib/auth'
import { getRequest } from '@tanstack/react-start/server'

export const fetchTaxiListings = createServerFn({ method: 'GET' })
  .validator(() => undefined)
  .handler(async () => {
    const now = new Date()

    const result = await db.query.taxiListings.findMany({
      where: eq(taxiListings.isAvailable, true),
      with: {
        user: { with: { profile: true } },
      },
      orderBy: (table, { desc }) => [desc(table.updatedAt)],
    })

    return result.map(taxi => {
      const expiresAt = taxi.user.profile.statusExpiresAt
      if (expiresAt && expiresAt < now) {
        taxi.user.profile.status = 'offline'
        taxi.user.profile.statusExpiresAt = null
      }
      return taxi
    })
  })

export const fetchMyTaxi = createServerFn({ method: 'GET' })
  .validator(() => undefined)
  .handler(async () => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return null

    return await db.query.taxiListings.findFirst({
      where: eq(taxiListings.userId, session.user.id),
    })
  })

export const upsertTaxi = createServerFn({ method: 'POST' })
  .validator((data: { steelPath: boolean; isAvailable: boolean; note?: string }) => data)
  .handler(async ({ data }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Non authentifié')

    await db
      .insert(taxiListings)
      .values({
        userId: session.user.id,
        steelPath: data.steelPath,
        isAvailable: data.isAvailable,
        note: data.note,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: taxiListings.userId,
        set: {
          steelPath: data.steelPath,
          isAvailable: data.isAvailable,
          note: data.note,
          updatedAt: new Date(),
        },
      })

    return { success: true }
  })

export const toggleTaxi = createServerFn({ method: 'POST' })
  .validator((isAvailable: boolean) => isAvailable)
  .handler(async ({ data: isAvailable }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Non authentifié')

    await db
      .update(taxiListings)
      .set({ isAvailable, updatedAt: new Date() })
      .where(eq(taxiListings.userId, session.user.id))

    return { success: true }
  })