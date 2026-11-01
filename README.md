# RimConsul (AfroConsul)

Plateforme de gestion des cartes consulaires pour les ressortissants des pays africains en Mauritanie.
Console réservée aux agents consulaires.

## Fonctionnalités

- Tableau de bord : demandes en cours, traitées, bénéficiaires, prochain rendez-vous
- Demandes de cartes (consulaire, séjour) avec plusieurs bénéficiaires et workflow de statuts
- Références de demande générées côté serveur, sans collision
- Prise de rendez-vous avec créneaux réels et protection contre la double réservation
- Stockage privé des pièces justificatives et politiques d'accès (RLS)

## Stack

Next.js 16 · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage)

## Démarrage

```bash
npm install
npx supabase start      # Supabase local (Docker)
cp .env.local.example .env.local   # puis renseigner les clés affichées par supabase start
npm run dev
```
