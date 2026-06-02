"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { RequestStatus } from "@/lib/mock";

const VALID_STATUSES: RequestStatus[] = [
  "nouveau",
  "en_cours",
  "traite",
  "cloture",
];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Update the status of a request. Runs as the authenticated agent (RLS-scoped),
 * then revalidates the pages whose data depends on request status.
 */
export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
): Promise<{ error?: string }> {
  if (!UUID_RE.test(id)) return { error: "Demande introuvable." };
  if (!VALID_STATUSES.includes(status)) return { error: "Statut invalide." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("requests")
    .update({ status })
    .eq("id", id);

  if (error) return { error: "Échec de la mise à jour du statut." };

  revalidatePath(`/demandes/${id}`);
  revalidatePath("/demandes");
  revalidatePath("/tableau-de-bord");
  return {};
}
