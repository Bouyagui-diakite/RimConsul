"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  STATUS_LABELS,
  type Beneficiary,
  type CardRequest,
  type RequestStatus,
} from "@/lib/mock";
import { updateRequestStatus } from "@/lib/actions";
import { CardPreviewModal } from "@/components/card/CardPreviewModal";
import { buildCardData } from "@/components/card/ConsularCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Silhouette } from "@/components/card/symbols";
import { ArrowLeft, CheckCircle, ChevronDown } from "@/components/icons";

const STATUS_ORDER: RequestStatus[] = [
  "nouveau",
  "en_cours",
  "traite",
  "cloture",
];

function initials(b: Beneficiary) {
  return `${b.firstName[0] ?? ""}${b.lastName[0] ?? ""}`.toUpperCase();
}

export function DemandeDetail({ request }: { request: CardRequest }) {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    request.beneficiaries[0]?.id,
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  const selected =
    request.beneficiaries.find((b) => b.id === selectedId) ??
    request.beneficiaries[0];

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="rounded-card border border-border bg-surface p-6 shadow-sm lg:col-span-2">
        <Link
          href="/demandes"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft size={16} /> Liste de mes demandes
        </Link>

        <h1 className="mt-4 font-display text-2xl font-bold text-heading">
          Demande #{request.id.slice(0, 8)}
        </h1>

        <StatusControl requestId={request.id} current={request.status} />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <Meta label="Type de carte" value={request.cardType} />
          <Meta label="Nombre" value={`${request.unitCount} bénéficiaires`} alignRight />
          <Meta label="Date de soumission" value={request.submissionDate} />
          <Meta label="Deadline" value={request.deadline} alignRight />
        </div>

        <div className="mt-6 overflow-x-auto">
          {selected ? (
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="py-3">Prénom(s) et nom</th>
                  <th className="py-3">Date de naissance</th>
                  <th className="py-3 text-right pr-2">Carte</th>
                </tr>
              </thead>
              <tbody>
                {request.beneficiaries.map((b) => {
                  const active = b.id === selected.id;
                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedId(b.id)}
                      className={`cursor-pointer border-b border-border last:border-0 ${
                        active ? "bg-primary text-primary-foreground" : "hover:bg-background"
                      }`}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                              active ? "bg-white/20 text-white" : "bg-primary-light text-primary"
                            }`}
                          >
                            {initials(b)}
                          </span>
                          <span className="font-medium">
                            {b.firstName} {b.lastName}
                          </span>
                        </div>
                      </td>
                      <td className={active ? "py-3 text-white/90" : "py-3 text-foreground"}>
                        {b.dob}
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <CheckCircle
                          size={18}
                          className={`ml-auto ${active ? "text-white" : "text-status-new"}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="py-6 text-center text-sm text-muted">
              Aucun bénéficiaire pour cette demande.
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted">
          <span>
            1–{request.beneficiaries.length} sur {request.unitCount}
          </span>
        </div>
      </section>

      {selected && (
        <aside className="rounded-card border border-border bg-surface p-6 shadow-sm">
          <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full ring-2 ring-primary-light">
            {selected.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Silhouette className="h-full w-full" />
            )}
          </div>

          <div className="space-y-3 text-sm">
            <Identity label="Nom" value={selected.lastName} />
            <Identity label="Prénoms" value={selected.firstName} />
            <Identity label="Date de naissance" value={selected.dob} />
            <Identity label="Lieu de naissance" value={selected.placeOfBirth} />
            <Identity label="Nationalité" value={selected.nationality} />
            <Identity label="Adresse" value={selected.address} />
            <Identity label="Taille" value={`${selected.height} cm`} />
            <Identity
              label="Genre"
              value={selected.gender === "feminin" ? "Féminin" : "Masculin"}
            />
          </div>

          <button
            onClick={() => setPreviewOpen(true)}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
          >
            Visualiser la carte
          </button>

          <CardPreviewModal
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            data={buildCardData(selected, request)}
          />
        </aside>
      )}
    </div>
  );
}

function StatusControl({
  requestId,
  current,
}: {
  requestId: string;
  current: RequestStatus;
}) {
  const [status, setStatus] = useState<RequestStatus>(current);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function change(next: RequestStatus) {
    if (next === status) return;
    const prev = status;
    setStatus(next);
    setError(null);
    startTransition(async () => {
      const res = await updateRequestStatus(requestId, next);
      if (res.error) {
        setStatus(prev);
        setError(res.error);
      }
    });
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <span className="text-xs text-muted">Statut</span>
      <StatusBadge status={status} />
      <div className="relative">
        <select
          value={status}
          disabled={pending}
          onChange={(e) => change(e.target.value as RequestStatus)}
          aria-label="Modifier le statut"
          className="h-9 appearance-none rounded-lg border border-border bg-transparent pl-3 pr-9 text-sm font-medium text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-light">
          <ChevronDown size={16} />
        </span>
      </div>
      {pending && <span className="text-xs text-muted">Enregistrement…</span>}
      {error && <span className="text-xs text-mr-red">{error}</span>}
    </div>
  );
}

function Meta({
  label,
  value,
  alignRight,
}: {
  label: string;
  value: string;
  alignRight?: boolean;
}) {
  return (
    <div className={alignRight ? "text-right" : undefined}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-semibold text-heading">{value}</p>
    </div>
  );
}

function Identity({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-medium text-heading">{value}</p>
    </div>
  );
}
