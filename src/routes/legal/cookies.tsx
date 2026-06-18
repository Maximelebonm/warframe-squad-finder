import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/legal/cookies')({
  head: () => ({
    meta: [
      { title: 'Politique de cookies — Warframe Squad Finder' },
      { name: 'description', content: 'Politique relative aux cookies utilisés par Warframe Squad Finder.' },
    ],
  }),
  component: CookiesPolicyPage,
})

function CookiesPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-sm leading-relaxed">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Politique relative aux cookies</h1>
        <p className="text-muted-foreground">Dernière mise à jour : 18 juin 2026</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">1. Qu'est-ce qu'un cookie ?</h2>
        <p>
          Un cookie est un petit fichier texte déposé sur votre appareil lors de
          la visite d'un site web. Il permet notamment de conserver des
          informations relatives à votre navigation.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">2. Quels cookies utilisons-nous ?</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-1.5 pr-2 font-medium">Cookie</th>
              <th className="py-1.5 pr-2 font-medium">Finalité</th>
              <th className="py-1.5 pr-2 font-medium">Durée</th>
              <th className="py-1.5 font-medium">Consentement requis</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr>
              <td className="py-1.5 pr-2">Session d'authentification</td>
              <td className="py-1.5 pr-2">Vous garder connecté à votre compte</td>
              <td className="py-1.5 pr-2">Session / selon configuration</td>
              <td className="py-1.5">Non (strictement nécessaire)</td>
            </tr>
          </tbody>
        </table>
        <p>
          Ce cookie est strictement nécessaire au fonctionnement du Site
          (notamment à la fonctionnalité de connexion à votre compte) et ne
          requiert pas votre consentement, conformément aux recommandations de
          la CNIL.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">3. Que ne faisons-nous pas ?</h2>
        <p>
          À ce jour, le Site n'utilise <strong>aucun</strong> cookie ou
          traceur :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>de mesure d'audience (type Google Analytics, Plausible, etc.)</li>
          <li>publicitaire ou de ciblage</li>
          <li>de réseaux sociaux</li>
        </ul>
        <p>
          Si cela venait à évoluer, cette page serait mise à jour et un
          bandeau de consentement vous serait proposé avant tout dépôt de
          cookie non essentiel.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">4. Comment gérer les cookies ?</h2>
        <p>
          Le cookie de session étant indispensable au fonctionnement du Site,
          le bloquer vous empêchera de rester connecté à votre compte. Vous
          pouvez à tout moment supprimer les cookies via les paramètres de
          votre navigateur.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">5. Contact</h2>
        <p>
          Pour toute question relative à cette politique, contactez-nous à{' '}
          <a className="underline" href="mailto:contact@warframe-squad-finder.com">
            contact@warframe-squad-finder.com
          </a>
          .
        </p>
      </section>
    </div>
  )
}