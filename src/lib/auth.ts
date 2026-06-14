import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { db } from '../db'
import { user, session, account, verification } from '../db/schema'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    'https://warframe-squad-finder.com',
    'https://*.vercel.app',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  ],
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
    sendResetPassword: async ({ user: emailUser, url }) => {
      await resend.emails.send({
        from: 'WSF <noreply@warframe-squad-finder.com>',
        to: emailUser.email,
        subject: 'Réinitialisation de ton mot de passe',
        html: `<p>Clique sur ce lien pour réinitialiser ton mot de passe : <a href="${url}">${url}</a></p>`,
      })
    },
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
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [tanstackStartCookies()],
})
