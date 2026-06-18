import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/legal/mentions-legales')({
  head: () => ({
    meta: [
      { title: 'Mentions légales — Warframe Squad Finder' },
    ],
  }),
  component: LegalNoticePage,
})

function LegalNoticePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-sm leading-relaxed">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Mentions légales</h1>
        <p className="text-muted-foreground">Dernière mise à jour : 18 juin 2026</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Éditeur du site</h2>
        <p>
          Le site Warframe Squad Finder est édité par [VOTRE NOM / PSEUDO], à
          titre non professionnel et non commercial.
          {/* TODO: si le site génère un jour des revenus (pub, dons réguliers),
              une déclaration d'activité (micro-entreprise, etc.) et des mentions
              légales complètes (adresse, SIRET) pourront devenir obligatoires. */}
        </p>
        <p>
          Contact :{' '}
          <a className="underline" href="mailto:contact@warframe-squad-finder.com">
            contact@warframe-squad-finder.com
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Hébergement</h2>
        <p>
          Le site est hébergé au sein de l'Union européenne.
          {/* TODO: indiquer le nom et l'adresse de votre hébergeur (Vercel, Netlify, etc.)
              ainsi que celui de Neon pour la base de données. */}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Propriété intellectuelle</h2>
        <p>
          Warframe Squad Finder est un site communautaire de fans, créé dans le
          respect de la{' '}
          <a
            className="underline"
            href="https://www.warframe.com/contentpolicy"
            target="_blank"
            rel="noreferrer"
          >
            Content Policy
          </a>{' '}
          de Digital Extremes. Le Site n'est ni affilié, ni associé, ni
          approuvé par Digital Extremes Ltd.
        </p>
        <p>
          « Warframe » ainsi que l'ensemble des noms, logos, marques et
          éléments visuels associés sont la propriété de Digital Extremes
          Ltd. Le logo du Site reprend des éléments inspirés de l'univers
          Warframe à des fins exclusivement illustratives et non
          commerciales, sans intention de créer une confusion avec les
          marques officielles.
        </p>
        <p>
          Le contenu propre au Site (code, design, textes) est la propriété
          de son éditeur, sauf mention contraire.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Responsabilité</h2>
        <p>
          Le Site est fourni « en l'état », sans garantie d'aucune sorte.
          L'éditeur ne saurait être tenu responsable des éventuelles
          interruptions de service, erreurs ou inexactitudes présentes sur le
          Site.
        </p>
      </section>
    </div>
  )
}