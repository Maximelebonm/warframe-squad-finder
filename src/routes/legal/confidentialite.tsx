import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/legal/confidentialite')({
  head: () => ({
    meta: [
      { title: 'Politique de confidentialité — Warframe Squad Finder' },
      { name: 'description', content: 'Politique de confidentialité et RGPD de Warframe Squad Finder.' },
    ],
  }),
  component: PrivacyPolicyPage,
})

function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-sm leading-relaxed">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Politique de confidentialité</h1>
        <p className="text-muted-foreground">Dernière mise à jour : 18 juin 2026</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">1. Qui sommes-nous ?</h2>
        <p>
          Warframe Squad Finder (« le Site ») est un site communautaire indépendant,
          édité à titre non commercial, permettant aux joueurs de Warframe de se
          regrouper pour jouer ensemble (ouverture de reliques, farm, etc.).
        </p>
        <p>
          Le Site n'est ni affilié, ni associé, ni approuvé par Digital Extremes Ltd.
        </p>
        <p>
          Pour toute question relative à vos données personnelles, vous pouvez
          contacter l'éditeur à l'adresse suivante :{' '}
          <a className="underline" href="mailto:contact@warframe-squad-finder.com">
            contact@warframe-squad-finder.com
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">2. Quelles données collectons-nous ?</h2>
        <p>Lors de la création d'un compte, nous collectons :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Votre adresse email (utilisée pour l'authentification et, le cas échéant, la récupération de compte)</li>
          <li>Votre pseudonyme / nom d'utilisateur affiché sur le Site</li>
          <li>Votre mot de passe, qui n'est jamais stocké en clair (il est haché de manière irréversible)</li>
        </ul>
        <p>
          Nous ne collectons aucune autre donnée personnelle (pas de nom réel, pas
          d'adresse postale, pas de données bancaires) et nous n'utilisons aucun
          outil d'analyse d'audience ou de tracking publicitaire tiers à ce jour.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">3. Pourquoi collectons-nous ces données ?</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-1.5 pr-2 font-medium">Donnée</th>
              <th className="py-1.5 pr-2 font-medium">Finalité</th>
              <th className="py-1.5 font-medium">Base légale</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b">
              <td className="py-1.5 pr-2">Email</td>
              <td className="py-1.5 pr-2">Authentification, communication liée au compte</td>
              <td className="py-1.5">Exécution du contrat (CGU)</td>
            </tr>
            <tr className="border-b">
              <td className="py-1.5 pr-2">Pseudonyme</td>
              <td className="py-1.5 pr-2">Identification au sein de la communauté / des squads</td>
              <td className="py-1.5">Exécution du contrat (CGU)</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-2">Mot de passe (haché)</td>
              <td className="py-1.5 pr-2">Sécurisation de l'accès au compte</td>
              <td className="py-1.5">Intérêt légitime / sécurité</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">4. Combien de temps conservons-nous vos données ?</h2>
        <p>
          Vos données sont conservées tant que votre compte est actif. En cas de
          suppression de votre compte, vos données personnelles sont supprimées de
          nos bases dans un délai raisonnable, sauf obligation légale contraire.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">5. Où sont hébergées vos données ?</h2>
        <p>
          Vos données sont hébergées au sein de l'Union européenne. Nous ne
          procédons à aucun transfert de données personnelles hors de l'UE.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">6. Avec qui partageons-nous vos données ?</h2>
        <p>
          Nous ne vendons ni ne louons vos données personnelles à des tiers. Vos
          données peuvent être traitées par nos prestataires techniques
          (hébergement du site, hébergement de la base de données) uniquement
          dans la mesure nécessaire au fonctionnement du Site, et sous garanties
          contractuelles de confidentialité.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">7. Vos droits</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD)
          et à la loi Informatique et Libertés, vous disposez des droits suivants
          sur vos données personnelles :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement (« droit à l'oubli »)</li>
          <li>Droit à la limitation du traitement</li>
          <li>Droit à la portabilité de vos données</li>
          <li>Droit d'opposition</li>
        </ul>
        <p>
          Vous pouvez exercer ces droits directement depuis les paramètres de
          votre compte, ou en me contactant à{' '}
          <a className="underline" href="mailto:contact@warframe-squad-finder.com">
            contact@warframe-squad-finder.com
          </a>
          . Vous disposez également du droit d'introduire une réclamation auprès
          de la CNIL (
          <a className="underline" href="https://www.cnil.fr" target="_blank" rel="noreferrer">
            www.cnil.fr
          </a>
          ).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">8. Cookies</h2>
        <p>
          Le Site utilise uniquement un cookie technique strictement nécessaire à
          votre authentification (maintien de votre session de connexion). Ce
          cookie est exempté de consentement préalable conformément aux
          recommandations de la CNIL, car indispensable au fonctionnement du
          service. Aucun cookie publicitaire ou de mesure d'audience n'est
          déposé à ce jour. Pour plus de détails, consultez notre{' '}
          <a className="underline" href="/legal/cookies">
            politique relative aux cookies
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">9. Sécurité</h2>
        <p>
          Nous mettons en œuvre des mesures techniques raisonnables (chiffrement
          des mots de passe, connexions sécurisées HTTPS) pour protéger vos
          données contre tout accès non autorisé, perte ou divulgation.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">10. Modifications de cette politique</h2>
        <p>
          Cette politique de confidentialité peut être mise à jour. La date de
          dernière mise à jour est indiquée en haut de cette page. Nous vous
          encourageons à la consulter régulièrement.
        </p>
      </section>
    </div>
  )
}