import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { profile } from '../db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '../lib/auth'
import { getRequest } from '@tanstack/react-start/server'

export const getProfile = createServerFn({ method: 'GET' })
    .validator(() => undefined)
    .handler(async () => {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) throw new Error('Non authentifié')

  const result = await db.query.profile.findFirst({
    where: eq(profile.id, session.user.id),
  })

  if (!result) return null

  if (
    result.status !== 'offline' &&
    result.statusExpiresAt &&
    result.statusExpiresAt < new Date()
  ) {
    await db
      .update(profile)
      .set({
        status: 'offline',
        statusExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(profile.id, session.user.id))

    return {
      ...result,
      status: 'offline',
      statusExpiresAt: null,
    }
  }

  return result
})

export const upsertProfile = createServerFn({ method: 'POST' })
  .validator((data: { warframeAlias: string; platform: string; status: string }) => data)
  .handler(async ({ data }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) throw new Error('Non authentifié')

    await db
      .insert(profile)
      .values({
        id: session.user.id,
        warframeAlias: data.warframeAlias,
        platform: data.platform,
        status: data.status,
      })
      .onConflictDoUpdate({
        target: profile.id,
        set: {
          warframeAlias: data.warframeAlias,
          platform: data.platform,
          status: data.status,
          updatedAt: new Date(),
        },
      })

    return { success: true }
  })

  export const updateStatus = createServerFn({ method: 'POST' })
  .validator((data: { status: string; duration?: number }) => data) // duration en minutes
  .handler(async ({ data }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Non authentifié')

    const expiresAt = data.duration
      ? new Date(Date.now() + data.duration * 60 * 1000)
      : null

    await db
      .update(profile)
      .set({
        status: data.status,
        statusExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(profile.id, session.user.id))

    return { success: true }
  })