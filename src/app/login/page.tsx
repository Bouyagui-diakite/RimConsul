"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError("Adresse e-mail ou mot de passe incorrect.");
      return;
    }
    router.replace("/tableau-de-bord");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* brand panel */}
      <div
        className="relative hidden w-1/2 flex-col justify-between p-10 text-white lg:flex"
        style={{ background: "linear-gradient(160deg, #00733b 0%, #00592f 60%, #004025 100%)" }}
      >
        <span className="font-display text-2xl font-bold">AfroConsul</span>
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/mauritania-emblem.jpg"
            alt="République Islamique de Mauritanie"
            className="w-40 rounded-xl shadow-lg ring-1 ring-white/20"
          />
          <h2 className="mt-6 font-display text-2xl font-semibold">
            République Islamique de Mauritanie
          </h2>
          <p className="mt-2 max-w-sm text-sm text-white/70">
            Plateforme de gestion des cartes consulaires pour les ressortissants
            des pays africains.
          </p>
        </div>
        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} AfroConsul — Affaires consulaires
        </p>
      </div>

      {/* form panel */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="lg:hidden">
            <span className="font-display text-2xl font-bold">
              <span className="text-heading">Afro</span>
              <span className="text-primary">Consul</span>
            </span>
          </div>

          <h1 className="mt-6 font-display text-2xl font-semibold text-heading">
            Connexion
          </h1>
          <p className="mt-1 text-sm text-muted">
            Connectez-vous à votre espace agent.
          </p>

          <div className="mt-8 space-y-4">
            <div className="relative">
              <label className="absolute -top-2 left-3 z-10 bg-surface px-1 text-xs text-muted">
                Adresse e-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@consulat.mr"
                className="h-12 w-full rounded-lg border border-border bg-transparent px-3 text-sm text-foreground placeholder:text-muted-light focus:border-primary focus:outline-none"
              />
            </div>
            <div className="relative">
              <label className="absolute -top-2 left-3 z-10 bg-surface px-1 text-xs text-muted">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 w-full rounded-lg border border-border bg-transparent px-3 text-sm text-foreground placeholder:text-muted-light focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-mr-red">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>

          <p className="mt-6 text-center text-xs text-muted-light">
            Accès réservé aux agents consulaires.
          </p>
        </form>
      </div>
    </div>
  );
}
