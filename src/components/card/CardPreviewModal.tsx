"use client";

import { useEffect } from "react";
import { CardRecto, CardVerso, type ConsularCardData } from "./ConsularCard";

export function CardPreviewModal({
  open,
  onClose,
  data,
  title = "Visualisation de la carte",
}: {
  open: boolean;
  onClose: () => void;
  data: ConsularCardData;
  title?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-surface p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-heading">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-foreground"
            aria-label="Fermer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Face label="RECTO">
            <CardRecto data={data} width={340} />
          </Face>
          <Face label="VERSO">
            <CardVerso data={data} width={340} />
          </Face>
        </div>
      </div>
    </div>
  );
}

function Face({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs font-semibold tracking-[0.2em] text-muted">
        {label}
      </span>
      {children}
    </div>
  );
}
