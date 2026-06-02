import Link from "next/link";
import { ArrowLeft } from "@/components/icons";

export function ComingSoon({
  title,
  description,
  backHref = "/tableau-de-bord",
  backLabel = "Retour au tableau de bord",
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-card border border-dashed border-border bg-surface p-10 text-center shadow-sm">
        <span className="inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
          Bientôt disponible
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-heading">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {description}
          </p>
        )}
        <Link
          href={backHref}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft size={16} /> {backLabel}
        </Link>
      </div>
    </div>
  );
}
