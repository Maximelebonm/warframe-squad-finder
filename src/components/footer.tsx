export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Warframe Squad Finder. Tous droits réservés.
          </p>
          <nav className="flex flex-wrap gap-4">
            <a href="/legal/mentions-legales" className="hover:text-foreground transition-colors">
              Mentions légales
            </a>
            <a href="/legal/confidentialite" className="hover:text-foreground transition-colors">
              Confidentialité (RGPD)
            </a>
            <a href="/legal/cookies" className="hover:text-foreground transition-colors">
              Cookies
            </a>
            <a href="/legal/cgu" className="hover:text-foreground transition-colors">
              CGU
            </a>
          </nav>
        </div>

        <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
          Warframe Squad Finder est un site communautaire indépendant et non officiel.
          Il n'est ni affilié, ni associé, ni approuvé par Digital Extremes Ltd.
          "Warframe" et tous les logos, noms et éléments visuels associés sont des marques
          déposées de Digital Extremes Ltd. Tous droits réservés à leurs propriétaires respectifs.
        </p>
      </div>
    </footer>
  )
}