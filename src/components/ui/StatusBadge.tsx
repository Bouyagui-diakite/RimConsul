import { cn } from "@/lib/utils";
import { STATUS_LABELS, type RequestStatus } from "@/lib/mock";

const STYLES: Record<RequestStatus, string> = {
  nouveau: "bg-status-new-bg text-status-new",
  en_cours: "bg-status-progress-bg text-status-progress",
  traite: "bg-status-done-bg text-status-done",
  cloture: "bg-status-closed-bg text-status-closed",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
