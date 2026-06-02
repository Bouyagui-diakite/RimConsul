"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function initials(name: string) {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProfileMenu({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3"
        aria-label="Menu du profil"
      >
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-heading">{name}</p>
          <p className="text-xs text-muted">Agent consulaire</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {initials(name || email || "AG")}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-border bg-surface py-1 shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium text-heading">{name}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
          <button
            onClick={logout}
            disabled={loading}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-background disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {loading ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      )}
    </div>
  );
}
