"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CardRequest } from "@/lib/mock";
import { createClient } from "@/lib/supabase/client";
import { toISODate } from "@/lib/format";
import {
  CalendarIcon,
  ClockIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  HashIcon,
} from "@/components/icons";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
const SLOTS: [string, string][] = [
  ["09:00", "10:00"],
  ["10:00", "11:00"],
  ["11:00", "12:00"],
  ["12:00", "13:00"],
  ["14:00", "15:00"],
  ["15:00", "16:00"],
  ["16:00", "17:00"],
];

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}
function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function longDate(d: Date) {
  return cap(
    d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );
}
function slotLabel(idx: number) {
  return `${SLOTS[idx][0].slice(0, 2)}H - ${SLOTS[idx][1].slice(0, 2)}H`;
}
function slotKey(day: Date, idx: number) {
  return `${toISODate(day)}|${slotLabel(idx)}`;
}
/** First Mon–Fri day of `weekStart` that is not in the past, else null. */
function firstSelectable(weekStart: Date, todayStart: Date) {
  for (let i = 0; i < 5; i++) {
    const d = addDays(weekStart, i);
    if (d >= todayStart) return d;
  }
  return null;
}

type SlotStatus = "available" | "past" | "taken";

export function BookingForm({
  requests,
  demandeur,
  bookedSlots,
}: {
  requests: CardRequest[];
  demandeur: string;
  bookedSlots: { date: string; slot: string }[];
}) {
  const [base, setBase] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [todayStart, setTodayStart] = useState<Date | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [reqId, setReqId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Slots discovered as taken this session (e.g. a race lost on submit), merged
  // with the server-provided bookings.
  const [extraTaken, setExtraTaken] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState<{
    date: string;
    slot: string;
    ref: string;
  } | null>(null);

  useEffect(() => {
    const now = new Date();
    const t = new Date(now);
    t.setHours(0, 0, 0, 0);
    let w = startOfWeek(now);
    let sel = firstSelectable(w, t);
    if (!sel) {
      // Whole displayed week is in the past (e.g. weekend) → jump to next week.
      w = addDays(w, 7);
      sel = w;
    }
    setTodayStart(t);
    setBase(w);
    setSelectedDay(sel);
  }, []);

  const takenSet = useMemo(() => {
    const s = new Set(bookedSlots.map((b) => `${b.date}|${b.slot}`));
    for (const k of extraTaken) s.add(k);
    return s;
  }, [bookedSlots, extraTaken]);

  function slotStatus(day: Date, idx: number): SlotStatus {
    if (!todayStart) return "available";
    if (day < todayStart) return "past";
    const start = new Date(day);
    start.setHours(parseInt(SLOTS[idx][0].slice(0, 2), 10), 0, 0, 0);
    if (start <= new Date()) return "past";
    if (takenSet.has(slotKey(day, idx))) return "taken";
    return "available";
  }

  const req = requests.find((r) => r.id === reqId);
  const days = base ? Array.from({ length: 5 }, (_, i) => addDays(base, i)) : [];
  const monthLabel = base
    ? cap(base.toLocaleDateString("fr-FR", { month: "long" }))
    : "";

  function goToWeek(nb: Date) {
    setBase(nb);
    setSelectedDay(todayStart ? (firstSelectable(nb, todayStart) ?? nb) : nb);
    setSlot(null);
  }
  function shiftWeek(weeks: number) {
    if (!base) return;
    goToWeek(addDays(base, weeks * 7));
  }
  function shiftMonth(months: number) {
    if (!base) return;
    goToWeek(startOfWeek(new Date(base.getFullYear(), base.getMonth() + months, 1)));
  }

  const canValidate = !!req && !!selectedDay && slot !== null && !saving;
  const dateHeure =
    selectedDay && slot !== null
      ? `${longDate(selectedDay)} de ${SLOTS[slot][0]} à ${SLOTS[slot][1]}`
      : "Pas encore sélectionné";

  async function handleValidate() {
    if (!req || !selectedDay || slot === null) return;
    if (slotStatus(selectedDay, slot) !== "available") {
      setError("Ce créneau n'est plus disponible. Choisissez-en un autre.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("appointments").insert({
      request_id: req.id,
      appointment_date: toISODate(selectedDay),
      slot: slotLabel(slot),
      status: "a_venir",
    });
    setSaving(false);
    if (error) {
      // 23505 = unique_violation → another agent took this slot first.
      if (error.code === "23505") {
        setExtraTaken((prev) => new Set(prev).add(slotKey(selectedDay, slot)));
        setSlot(null);
        setError("Ce créneau vient d'être réservé. Choisissez-en un autre.");
      } else {
        setError("Échec de l'enregistrement du rendez-vous. Réessayez.");
      }
      return;
    }
    setConfirmed({
      date: longDate(selectedDay),
      slot: slotLabel(slot),
      ref: req.reference,
    });
  }

  if (confirmed) return <Confirmation {...confirmed} />;

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="rounded-card border border-border bg-surface p-5 shadow-sm lg:col-span-2">
        <h2 className="font-display text-lg font-semibold text-heading">
          Choix du créneau horaire
        </h2>

        {!base ? (
          <div className="mt-6 h-64 animate-pulse rounded-lg bg-background" />
        ) : (
          <>
            <div className="mt-4 flex items-center justify-center gap-6">
              <button
                onClick={() => shiftMonth(-1)}
                className="rounded-md p-1 text-muted hover:bg-background"
                aria-label="Mois précédent"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="min-w-28 text-center font-display font-semibold uppercase tracking-wide text-heading">
                {monthLabel}
              </span>
              <button
                onClick={() => shiftMonth(1)}
                className="rounded-md p-1 text-muted hover:bg-background"
                aria-label="Mois suivant"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => shiftWeek(-1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted hover:bg-background"
                aria-label="Semaine précédente"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="grid flex-1 grid-cols-5 gap-2">
                {days.map((d) => {
                  const active = selectedDay && sameDay(d, selectedDay);
                  const past = todayStart ? d < todayStart : false;
                  return (
                    <button
                      key={d.toISOString()}
                      disabled={past}
                      onClick={() => {
                        setSelectedDay(d);
                        setSlot(null);
                      }}
                      className={`flex flex-col items-center rounded-lg border py-2 transition-colors ${
                        active
                          ? "border-primary bg-primary-light"
                          : past
                            ? "cursor-not-allowed border-border opacity-40"
                            : "border-border hover:bg-background"
                      }`}
                    >
                      <span className="text-xs text-muted">
                        {WEEKDAYS[(d.getDay() + 6) % 7]}
                      </span>
                      <span
                        className={`font-display text-lg font-semibold ${
                          active ? "text-primary" : "text-heading"
                        }`}
                      >
                        {d.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => shiftWeek(1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted hover:bg-background"
                aria-label="Semaine suivante"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              {SLOTS.map((s, idx) => {
                const status = selectedDay ? slotStatus(selectedDay, idx) : "past";
                const avail = status === "available";
                const selected = slot === idx;
                return (
                  <button
                    key={idx}
                    disabled={!avail}
                    onClick={() => setSlot(idx)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                      selected
                        ? "border-primary bg-primary-light ring-1 ring-primary"
                        : avail
                          ? "border-border hover:bg-background"
                          : "cursor-not-allowed border-border bg-background opacity-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          selected ? "border-primary bg-primary" : "border-muted-light"
                        }`}
                      >
                        {selected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m5 12 5 5 9-11" />
                          </svg>
                        )}
                      </span>
                      <span className="font-medium text-foreground">
                        {s[0]} → {s[1]}
                      </span>
                    </span>
                    <span className={avail ? "text-status-new" : "text-muted-light"}>
                      {status === "available"
                        ? "Disponible"
                        : status === "taken"
                          ? "Réservé"
                          : "Passé"}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      <section className="rounded-card border border-border bg-surface p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-heading">
          Informations du rendez-vous
        </h2>

        <div className="mt-5 space-y-4 text-sm">
          <Row label="Demandeur" value={demandeur} strong />
          <Row label="Date et heure du rendez-vous" value={dateHeure} strong />

          <div className="relative">
            <label className="absolute -top-2 left-3 z-10 bg-surface px-1 text-xs text-muted">
              Sélectionner demande
            </label>
            <select
              value={reqId}
              onChange={(e) => setReqId(e.target.value)}
              className="h-12 w-full appearance-none rounded-lg border border-border bg-transparent px-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Demande</option>
              {requests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.reference} — {r.cardType}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-light">
              <ChevronDown size={16} />
            </span>
          </div>

          <Row label="Type de carte" value={req?.cardType ?? "Pas encore sélectionné"} strong />
          <Row label="Nombre de cartes" value={req ? `${req.unitCount}` : "Pas encore sélectionné"} strong />
          <Row label="Deadline" value={req?.deadline ?? "Pas encore sélectionné"} strong />
        </div>

        {error && <p className="mt-4 text-sm text-mr-red">{error}</p>}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleValidate}
            disabled={!canValidate}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-40"
          >
            {saving ? "Validation…" : "Valider"}
          </button>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={strong ? "mt-0.5 font-semibold text-heading" : "mt-0.5 text-foreground"}>
        {value}
      </p>
    </div>
  );
}

function Confirmation({ date, slot, ref }: { date: string; slot: string; ref: string }) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-card border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-5">
          <h1 className="font-display text-lg font-semibold text-heading">Information</h1>
        </div>
        <div className="grid grid-cols-1 divide-y divide-border p-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Info icon={<CalendarIcon size={22} />} label="Date du rendez-vous" value={date} />
          <Info icon={<ClockIcon size={22} />} label="Créneau horaire" value={slot} />
          <Info icon={<HashIcon size={22} />} label="Numéro demande" value={ref} />
        </div>
        <div className="px-5 pb-5">
          <p className="text-sm text-foreground">
            Bonjour,
            <br />
            Votre rendez-vous a été confirmé.
          </p>
          <Link
            href="/rendez-vous"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ChevronLeft size={16} /> Liste de mes rendez-vous
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
        <p className="font-display font-bold text-heading">{value}</p>
      </div>
    </div>
  );
}
