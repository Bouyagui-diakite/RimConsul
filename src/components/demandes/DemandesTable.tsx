"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { STATUS_LABELS, type RequestStatus, type CardRequest } from "@/lib/mock";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  DownloadIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  SearchIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "@/components/icons";

export function DemandesTable({ requests }: { requests: CardRequest[] }) {
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const cardTypes = useMemo(
    () => Array.from(new Set(requests.map((r) => r.cardType))),
    [requests],
  );

  const rows = useMemo(() => {
    return requests.filter((r) => {
      if (typeFilter && r.cardType !== typeFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (
        search &&
        !`${r.reference} ${r.cardType}`.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [requests, typeFilter, statusFilter, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-card border border-border bg-surface p-5 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-semibold text-heading">Filtres</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            placeholder="Type de carte"
            options={cardTypes.map((t) => ({ value: t, label: t }))}
          />
          <Select value="" onChange={() => {}} placeholder="Date de soumission" options={[]} />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Statut"
            options={(Object.keys(STATUS_LABELS) as RequestStatus[]).map((s) => ({
              value: s,
              label: STATUS_LABELS[s],
            }))}
          />
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background">
            <DownloadIcon size={18} /> Exporter
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-light">
                <SearchIcon size={16} />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher contact"
                className="h-10 w-56 rounded-lg border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-muted-light focus:border-primary focus:outline-none"
              />
            </div>
            <Link
              href="/demandes/nouvelle"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
            >
              <PlusIcon size={18} /> Nouvelle demande
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="w-10 py-3 pl-2">
                  <input type="checkbox" className="accent-primary" />
                </th>
                <th className="py-3">Type de carte</th>
                <th className="py-3">Nbre d&apos;unités</th>
                <th className="py-3">Deadline</th>
                <th className="py-3">Date de soumission</th>
                <th className="py-3">Statut</th>
                <th className="py-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border last:border-0 hover:bg-background/60"
                >
                  <td className="py-3.5 pl-2">
                    <input type="checkbox" className="accent-primary" />
                  </td>
                  <td className="py-3.5 font-medium text-heading">{r.cardType}</td>
                  <td className="py-3.5 text-foreground">{r.unitCount}</td>
                  <td className="py-3.5 text-foreground">{r.deadline}</td>
                  <td className="py-3.5 text-foreground">{r.submissionDate}</td>
                  <td className="py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3.5 pr-2">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/demandes/${r.id}`}
                        className="rounded-md p-1.5 text-muted hover:bg-primary-light hover:text-primary"
                        aria-label="Voir"
                      >
                        <EyeIcon size={18} />
                      </Link>
                      <button
                        className="rounded-md p-1.5 text-muted hover:bg-red-50 hover:text-mr-red"
                        aria-label="Supprimer"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted">
                    {requests.length === 0
                      ? "Aucune demande enregistrée. Créez-en une via « Nouvelle demande »."
                      : "Aucune demande ne correspond à votre recherche."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted">
          <div className="flex items-center gap-2">
            <span>Lignes par page:</span>
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              10 <ChevronDown size={14} />
            </span>
          </div>
          <span>
            1–{rows.length} sur {rows.length}
          </span>
          <div className="flex items-center gap-1">
            <button className="rounded-md p-1 text-muted-light hover:bg-background" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="rounded-md p-1 text-muted hover:bg-background">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-lg border border-border bg-surface px-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-light">
        <ChevronDown size={16} />
      </span>
    </div>
  );
}
