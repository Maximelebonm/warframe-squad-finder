import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { db } from '../db'
import { user, session, account, verification } from '../db/schema'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
   emailVerification: {
    sendVerificationEmail: async ({ user: emailUser, url }) => {
      await resend.emails.send({
        from: 'WSF <noreply@warframe-squad-finder.com>',
        to: emailUser.email,
        subject: 'Vérifie ton adresse email',
        html: `<p>Clique sur ce lien pour vérifier ton compte : <a href="${url}">${url}</a></p>`,
      })
    },
    autoSignInAfterVerification: true,
  },
  plugins: [tanstackStartCookies()],
})