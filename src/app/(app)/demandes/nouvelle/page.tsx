"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AFRICAN_COUNTRIES, type Gender } from "@/lib/mock";
import { createClient } from "@/lib/supabase/client";
import { isoToFr, toISODate } from "@/lib/format";
import { CardPreviewModal } from "@/components/card/CardPreviewModal";
import type { ConsularCardData } from "@/components/card/ConsularCard";
import { Silhouette } from "@/components/card/symbols";
import {
  ChevronLeft,
  ChevronRight,
  UploadIcon,
  TrashIcon,
  CardIcon,
  CheckCircle,
} from "@/components/icons";

const MAX_BENEFICIARIES = 20;
const CARD_TYPES = ["Carte consulaire", "Carte de séjour"] as const;

interface Draft {
  lastName: string;
  firstName: string;
  dob: string;
  placeOfBirth: string;
  nationality: string;
  address: string;
  height: string;
  gender: Gender;
  photoUrl?: string;
  photoFile?: File;
}

const emptyDraft = (): Draft => ({
  lastName: "",
  firstName: "",
  dob: "",
  placeOfBirth: "",
  nationality: "",
  address: "",
  height: "",
  gender: "masculin",
  photoUrl: undefined,
  photoFile: undefined,
});

const REQUIRED: (keyof Draft)[] = ["lastName", "firstName", "dob", "nationality"];

function isComplete(d: Draft) {
  return REQUIRED.every((k) => String(d[k] ?? "").trim() !== "");
}

const REFERENCE_PLACEHOLDER = "N° attribué à la soumission";

export default function NouvelleDemandePage() {
  const [cardType, setCardType] = useState<string>(CARD_TYPES[0]);
  const [drafts, setDrafts] = useState<Draft[]>([emptyDraft()]);
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([false]);
  const [showErrors, setShowErrors] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{
    reference: string;
    count: number;
    deadline: string;
  } | null>(null);
  const [today, setToday] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setToday(isoToFr(toISODate(new Date())));
  }, []);

  const draft = drafts[current];

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDrafts((prev) => prev.map((d, i) => (i === current ? { ...d, [key]: value } : d)));
  }

  function goTo(i: number) {
    setShowErrors(false);
    setCurrent(i);
  }

  function handlePrev() {
    if (current > 0) goTo(current - 1);
  }

  function handleSave() {
    setShowErrors(true);
    if (!isComplete(draft)) return;
    setCompleted((prev) => prev.map((c, i) => (i === current ? true : c)));
  }

  function handleNext() {
    setShowErrors(true);
    if (!isComplete(draft)) return;
    setCompleted((prev) => prev.map((c, i) => (i === current ? true : c)));

    if (current < drafts.length - 1) {
      goTo(current + 1);
    } else if (drafts.length < MAX_BENEFICIARIES) {
      setDrafts((prev) => [...prev, emptyDraft()]);
      setCompleted((prev) => [...prev, false]);
      goTo(drafts.length);
    }
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (draft.photoUrl) URL.revokeObjectURL(draft.photoUrl);
    setDrafts((prev) =>
      prev.map((d, i) =>
        i === current ? { ...d, photoUrl: URL.createObjectURL(file), photoFile: file } : d,
      ),
    );
    e.target.value = "";
  }

  function removePhoto() {
    if (draft.photoUrl) URL.revokeObjectURL(draft.photoUrl);
    setDrafts((prev) =>
      prev.map((d, i) => (i === current ? { ...d, photoUrl: undefined, photoFile: undefined } : d)),
    );
  }

  async function handleSubmit() {
    const complete = drafts.filter(isComplete);
    if (complete.length === 0) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + 14);
    const deadlineISO = toISODate(deadlineDate);

    // Generate the request id client-side so photos (keyed by request id) can be
    // uploaded before the request + beneficiaries are inserted atomically.
    const requestId = crypto.randomUUID();

    try {
      const beneficiaries = [];
      for (let i = 0; i < complete.length; i++) {
        const d = complete[i];
        let photo_path: string | null = null;
        if (d.photoFile) {
          const ext = d.photoFile.name.split(".").pop() || "jpg";
          const path = `${requestId}/${i}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("photos")
            .upload(path, d.photoFile, { upsert: true });
          if (!upErr) photo_path = path;
        }
        beneficiaries.push({
          last_name: d.lastName,
          first_name: d.firstName,
          dob: d.dob || null,
          place_of_birth: d.placeOfBirth || null,
          nationality: d.nationality,
          address: d.address || null,
          height: d.height ? Number(d.height) : null,
          gender: d.gender,
          photo_path,
          position: i,
        });
      }

      // Atomic: request + beneficiaries inserted in one transaction (RPC).
      const { data, error: rpcErr } = await supabase.rpc(
        "create_request_with_beneficiaries",
        {
          p_id: requestId,
          p_card_type: cardType,
          p_deadline: deadlineISO,
          p_beneficiaries: beneficiaries,
        },
      );
      if (rpcErr) throw rpcErr;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error("création de la demande échouée");

      setSubmitted({
        reference: row.out_reference,
        count: complete.length,
        deadline: isoToFr(deadlineISO),
      });
    } catch (e) {
      console.error("Submit demande failed:", e);
      const detail =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "";
      setError(
        `Échec de l'enregistrement de la demande.${detail ? ` (${detail})` : ""} Vérifiez votre connexion et réessayez.`,
      );
    } finally {
      setSaving(false);
    }
  }

  const previewData: ConsularCardData = {
    reference: "—",
    lastName: draft.lastName || "—",
    firstName: draft.firstName,
    dob: isoToFr(draft.dob),
    placeOfBirth: draft.placeOfBirth || "—",
    nationality: draft.nationality || "—",
    address: draft.address || "—",
    height: Number(draft.height) || 0,
    gender: draft.gender,
    photoUrl: draft.photoUrl,
    issueDate: today,
    cardType,
  };

  if (submitted) {
    return <Confirmation cardType={cardType} {...submitted} />;
  }

  const err = (key: keyof Draft) =>
    showErrors && REQUIRED.includes(key) && String(draft[key] ?? "").trim() === "";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/demandes"
          className="rounded-md p-1 text-primary hover:bg-primary-light"
          aria-label="Retour"
        >
          <ChevronLeft size={22} />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {cardType}
          </p>
          <p className="text-sm text-muted">Informations des bénéficiaires</p>
        </div>
      </div>

      <div className="rounded-card border border-border bg-surface shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-display text-xl font-semibold text-heading">
            Informations des bénéficiaires
          </h1>
          <div className="inline-flex rounded-lg border border-border p-1">
            {CARD_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setCardType(t)}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  cardType === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <CardIcon size={16} /> {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-border px-3">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="shrink-0 rounded-md p-1.5 text-muted hover:bg-background disabled:opacity-30"
            aria-label="Précédent"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex flex-1 gap-1 overflow-x-auto">
            {drafts.map((d, i) => {
              const label =
                d.firstName || d.lastName
                  ? `${d.firstName} ${d.lastName}`.trim()
                  : `Personne #${i + 1}`;
              const active = i === current;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors ${
                    active
                      ? "border-primary font-semibold text-primary"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  {completed[i] && (
                    <CheckCircle size={15} className={active ? "text-primary" : "text-status-new"} />
                  )}
                  {label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => current < drafts.length - 1 && goTo(current + 1)}
            disabled={current >= drafts.length - 1}
            className="shrink-0 rounded-md p-1.5 text-muted hover:bg-background disabled:opacity-30"
            aria-label="Suivant"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5">
          <div className="flex items-center gap-4">
            <span className="font-display text-sm font-medium italic text-muted">
              {REFERENCE_PLACEHOLDER}
            </span>
            <button
              onClick={() => setPreviewOpen(true)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Prévisualiser carte
            </button>
          </div>
          <span className="text-sm text-muted">
            {drafts.length}/{MAX_BENEFICIARIES} bénéficiaires
          </span>
        </div>

        <div className="p-5">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-background">
              {draft.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Silhouette className="h-full w-full opacity-60" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background"
              >
                <UploadIcon size={16} /> Importer
              </button>
              <button
                onClick={removePhoto}
                disabled={!draft.photoUrl}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-background disabled:opacity-40"
              >
                <TrashIcon size={16} /> Supprimer
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Nom" required error={err("lastName")}>
              <input
                value={draft.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                placeholder="Nom"
                className={inputCls(err("lastName"))}
              />
            </Field>
            <Field label="Prénoms" required error={err("firstName")}>
              <input
                value={draft.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                placeholder="Prénoms"
                className={inputCls(err("firstName"))}
              />
            </Field>
            <Field label="Date de naissance" required error={err("dob")}>
              <input
                type="date"
                value={draft.dob}
                onChange={(e) => update("dob", e.target.value)}
                className={inputCls(err("dob"))}
              />
            </Field>
            <Field label="Lieu de naissance">
              <input
                value={draft.placeOfBirth}
                onChange={(e) => update("placeOfBirth", e.target.value)}
                placeholder="Lieu de naissance"
                className={inputCls(false)}
              />
            </Field>
            <Field label="Nationalité" required error={err("nationality")} hint="Pays africains uniquement">
              <select
                value={draft.nationality}
                onChange={(e) => update("nationality", e.target.value)}
                className={`${inputCls(err("nationality"))} appearance-none`}
              >
                <option value="">Sélectionner la nationalité</option>
                {AFRICAN_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Taille (en cm)">
              <input
                type="number"
                value={draft.height}
                onChange={(e) => update("height", e.target.value)}
                placeholder="170"
                className={inputCls(false)}
              />
            </Field>
            <Field label="Adresse" className="md:col-span-2">
              <input
                value={draft.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Adresse"
                className={inputCls(false)}
              />
            </Field>

            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium text-foreground">Genre</p>
              <div className="flex gap-6">
                {(
                  [
                    ["masculin", "Masculin"],
                    ["feminin", "Féminin"],
                  ] as [Gender, string][]
                ).map(([val, lbl]) => (
                  <label key={val} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="gender"
                      checked={draft.gender === val}
                      onChange={() => update("gender", val)}
                      className="accent-primary"
                    />
                    {lbl}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {showErrors && !isComplete(draft) && (
            <p className="mt-4 text-sm text-mr-red">
              Veuillez renseigner les champs obligatoires (Nom, Prénoms, Date de naissance,
              Nationalité).
            </p>
          )}
          {error && <p className="mt-4 text-sm text-mr-red">{error}</p>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-5">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="rounded-lg bg-muted-light/30 px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted-light/50 disabled:opacity-40"
          >
            Précédent
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              className="rounded-lg bg-success px-5 py-2.5 text-sm font-semibold text-white hover:bg-success-dark"
            >
              Enregistrer
            </button>
            <button
              onClick={handleNext}
              disabled={current === drafts.length - 1 && drafts.length >= MAX_BENEFICIARIES}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-40"
            >
              {current === drafts.length - 1 ? "Ajouter une personne" : "Suivant"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary-light disabled:opacity-50"
            >
              {saving ? "Envoi…" : "Soumettre la demande"}
            </button>
          </div>
        </div>
      </div>

      <CardPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={previewData}
        title="Prévisualisation de la carte"
      />
    </div>
  );
}

function inputCls(error: boolean) {
  return `h-12 w-full rounded-lg border bg-transparent px-3 text-sm text-foreground placeholder:text-muted-light focus:outline-none ${
    error ? "border-mr-red focus:border-mr-red" : "border-border focus:border-primary"
  }`;
}

function Field({
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <label
        className={`absolute -top-2 left-3 z-10 bg-surface px-1 text-xs ${
          error ? "text-mr-red" : "text-muted"
        }`}
      >
        {label}
        {required && <span className="text-mr-red"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 pl-1 text-xs text-muted-light">{hint}</p>}
    </div>
  );
}

function Confirmation({
  reference,
  cardType,
  count,
  deadline,
}: {
  reference: string;
  cardType: string;
  count: number;
  deadline: string;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-card border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-5">
          <h1 className="font-display text-lg font-semibold text-heading">Information</h1>
        </div>
        <div className="grid grid-cols-1 divide-y divide-border p-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Info icon={<CardIcon size={22} />} label="Type de carte" value={cardType} />
          <Info icon={<CheckCircle size={22} />} label="Nombre de cartes" value={`${count} unités`} />
          <Info icon={<ChevronRight size={22} />} label="Deadline" value={deadline} />
        </div>
        <div className="px-5 pb-5">
          <p className="text-sm text-foreground">
            Bonjour,
            <br />
            Votre demande de cartes <span className="font-semibold text-heading">{reference}</span>{" "}
            a été soumise.
          </p>
          <Link
            href="/demandes"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ChevronLeft size={16} /> Liste de mes demandes
          </Link>
        </div>
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-2 py-3 sm:px-4">
      <span className="text-primary">{icon}</span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-display font-bold uppercase text-heading">{value}</p>
      </div>
    </div>
  );
}
