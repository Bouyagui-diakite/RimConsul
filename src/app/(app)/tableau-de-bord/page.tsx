import Link from "next/link";
import { listRequests, listAppointments } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  CardIcon,
  ClockIcon,
  CheckCircle,
  CalendarIcon,
  ChevronRight,
} from "@/components/icons";

export default async function DashboardPage() {
  const [requests, appointments] = await Promise.all([
    listRequests(),
    listAppointments(),
  ]);

  const total = requests.length;
  const enCours = requests.filter((r) => r.status === "en_cours").length;
  const traite = requests.filter((r) => r.status === "traite").length;
  const beneficiaires = requests.reduce((s, r) => s + r.unitCount, 0);

  const stats = [
    { label: "Demandes totales", value: total, icon: CardIcon, tone: "primary" },
    { label: "En cours", value: enCours, icon: ClockIcon, tone: "progress" },
    { label: "Traitées", value: traite, icon: CheckCircle, tone: "new" },
    { label: "Bénéficiaires", value: beneficiaires, icon: CalendarIcon, tone: "done" },
  ] as const;

  const recent = requests.slice(0, 5);
  const nextAppt = appointments.find((a) => a.status === "a_venir");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-heading">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-muted">
          Bienvenue, voici un aperçu de vos demandes de cartes consulaires.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-card border border-border bg-surface p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-heading">
              Demandes récentes
            </h2>
            <Link
              href="/demandes"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Tout voir <ChevronRight size={16} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Aucune demande pour le moment.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((r) => (
                <Link
                  key={r.id}
                  href={`/demandes/${r.id}`}
                  className="flex items-center justify-between py-3 hover:opacity-80"
                >
                  <div>
                    <p className="text-sm font-medium text-heading">{r.cardType}</p>
                    <p className="text-xs text-muted">
                      {r.reference} · {r.unitCount} unités
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-card border border-border bg-surface p-5 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-heading">
            Prochain rendez-vous
          </h2>
          {nextAppt ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-primary">
                  <CalendarIcon size={22} />
                </span>
                <div>
                  <p className="text-xs text-muted">Date</p>
                  <p className="text-sm font-semibold text-heading">{nextAppt.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary">
                  <ClockIcon size={22} />
                </span>
                <div>
                  <p className="text-xs text-muted">Créneau horaire</p>
                  <p className="text-sm font-semibold text-heading">{nextAppt.slot}</p>
                </div>
              </div>
              <div className="rounded-lg bg-background p-3 text-xs text-muted">
                {nextAppt.cardType} · {nextAppt.requestRef} · {nextAppt.unitCount} unités
              </div>
              <Link
                href="/rendez-vous"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Voir l&apos;historique <ChevronRight size={16} />
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Aucun rendez-vous à venir.</p>
          )}
        </section>
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  primary: "bg-primary-light text-primary",
  progress: "bg-status-progress-bg text-status-progress",
  new: "bg-status-new-bg text-status-new",
  done: "bg-status-done-bg text-status-done",
};

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: (p: { size?: number }) => React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-heading">{value}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${TONES[tone]}`}>
          <Icon size={22} />
        </span>
      </div>
    </div>
  );
}
