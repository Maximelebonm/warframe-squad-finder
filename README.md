# Warframe Squad Finder

Warframe Squad Finder (WSF) est une plateforme communautaire qui aide les joueurs de Warframe à se trouver pour farmer des reliques, échanger des mods et ressources, ou organiser des taxis pour les missions difficiles.

🔗 [warframe-squad-finder.com](https://warframe-squad-finder.com)

## Le concept

Warframe est un jeu coopératif, mais trouver des coéquipiers pour une relique précise ou une mission spécifique reste souvent compliqué en dehors du jeu. WSF résout ce problème en offrant un espace dédié où les joueurs peuvent :

- **Publier des annonces** pour les reliques, mods ou ressources qu'ils possèdent ou recherchent
- **Se proposer comme taxi** pour aider d'autres joueurs sur des missions ou nœuds difficiles (avec ou sans Steel Path)
- **Indiquer leur disponibilité** en temps réel (hors ligne, en ligne, disponible)
- **Échanger directement** via une messagerie intégrée, sans avoir à se contacter en dehors de la plateforme

## Fonctionnalités

- Authentification sécurisée avec vérification d'email et réinitialisation de mot de passe
- Recherche et filtrage d'annonces par catégorie (reliques, mods, ressources)
- Système de taxi dédié pour l'entraide entre joueurs expérimentés et débutants
- Statut de disponibilité avec minuteur automatique
- Messagerie intégrée entre joueurs
- Gestion complète du profil (alias Warframe, plateforme, sécurité du compte)

## Stack technique

- [TanStack Start](https://tanstack.com/start) — framework fullstack React
- [Drizzle ORM](https://orm.drizzle.team/) avec [Neon](https://neon.tech/) (PostgreSQL serverless)
- [Better Auth](https://www.better-auth.com/) pour l'authentification
- [Resend](https://resend.com/) pour l'envoi d'emails transactionnels
- [Tailwind CSS](https://tailwindcss.com/) pour le design
- Déployé sur [Vercel](https://vercel.com/)

## Développement local

### Prérequis

- Node.js 18+
- Une base de données PostgreSQL (Neon recommandé)
- Un compte [Resend](https://resend.com/) pour l'envoi d'emails

### Installation

```bash
git clone https://github.com/Maximelebonm/warframe-squad-finder.git
cd warframe-squad-finder
npm install
```

### Variables d'environnement

Copie le fichier `.env.example` en `.env.local` et renseigne les valeurs :

```bash
cp .env.example .env.local
```

```dotenv
DATABASE_URL=
DATABASE_URL_POOLER=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
RESEND_API_KEY=
```

### Base de données

Applique le schéma à ta base de données :

```bash
npx drizzle-kit push
```

### Lancer le projet

```bash
npm run dev
```

Le site est accessible sur `http://localhost:3000`.

## Avertissement

Ce projet n'est pas affilié à Digital Extremes. Warframe est une marque déposée de Digital Extremes Ltd.