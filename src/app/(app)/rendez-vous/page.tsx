import Link from "next/link";
import { listAppointments } from "@/lib/db";
import type { Appointment } from "@/lib/mock";
import { CalendarIcon, ClockIcon, PlusIcon } from "@/components/icons";

const DOT: Record<Appointment["status"], string> = {
  assiste: "bg-status-new",
  manque: "bg-mr-red",
  a_venir: "bg-primary",
};

export default async function RendezVousHistoriquePage() {
  const appointments = await listAppointments();
  const next = appointments.find((a) => a.status === "a_venir");
  const past = appointments.filter((a) => a.status !== "a_venir");

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <section className="rounded-card border border-border bg-surface p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-semibold text-heading">
            Prochain rendez-vous
          </h2>
          {next ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-primary">
                  <CalendarIcon size={22} />
                </span>
                <div>
                  <p className="text-xs text-muted">Date du rendez-vous</p>
                  <p className="font-semibold text-heading">{next.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary">
                  <ClockIcon size={22} />
                </span>
                <div>
                  <p className="text-xs text-muted">Créneau horaire</p>
                  <p className="font-semibold text-heading">{next.slot}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">Aucun rendez-vous à venir.</p>
          )}
        </section>

        <Link
          href="/rendez-vous/nouveau"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
        >
          <PlusIcon size={18} /> Nouveau rendez-vous
        </Link>
      </div>

      <section className="rounded-card border border-border bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-heading">Historique</h2>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-status-new" /> Rendez-vous assisté
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-mr-red" /> Rendez-vous manqué
            </span>
          </div>
        </div>

        {past.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            Aucun rendez-vous passé.
          </p>
        ) : (
          <ul className="relative ml-1">
            {past.map((a, i) => (
              <li key={a.id} className="relative flex gap-4 pb-6 last:pb-0">
                {i < past.length - 1 && (
                  <span className="absolute left-[5px] top-4 h-full w-px bg-border" />
                )}
                <span
                  className={`relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full ${DOT[a.status]}`}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-heading">Demande {a.requestRef}</p>
                    <span className="shrink-0 text-xs text-muted">{a.date}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    Rendez-vous de {a.slot} au consulat
                  </p>
                  <p className="text-sm text-muted">Récupération des cartes consulaires</p>
                  <p className="mt-0.5 text-xs text-muted-light">{a.unitCount} cartes</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
