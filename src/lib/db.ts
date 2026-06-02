import { createClient } from "@/lib/supabase/server";
import { isoToFr, longFrDate } from "@/lib/format";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CardRequest,
  Beneficiary,
  Appointment,
  RequestStatus,
  Gender,
} from "@/lib/mock";

interface RequestRow {
  id: string;
  reference: string;
  card_type: string;
  status: RequestStatus;
  submission_date: string;
  deadline: string | null;
  beneficiaries?: { count: number }[];
}

interface BeneficiaryRow {
  id: string;
  last_name: string;
  first_name: string;
  dob: string | null;
  place_of_birth: string | null;
  nationality: string;
  address: string | null;
  height: number | null;
  gender: Gender;
  photo_path: string | null;
  position: number;
}

interface AppointmentRow {
  id: string;
  appointment_date: string;
  slot: string;
  status: Appointment["status"];
  requests: {
    reference: string;
    card_type: string;
    deadline: string | null;
    beneficiaries?: { count: number }[];
  } | null;
}

function mapBeneficiary(b: BeneficiaryRow, photoUrl?: string): Beneficiary {
  return {
    id: b.id,
    lastName: b.last_name,
    firstName: b.first_name,
    dob: isoToFr(b.dob),
    placeOfBirth: b.place_of_birth ?? "—",
    nationality: b.nationality,
    address: b.address ?? "—",
    height: b.height ?? 0,
    gender: b.gender,
    photoUrl,
  };
}

/**
 * Create short-lived signed URLs for photos in the private 'photos' bucket.
 * Returns a map of storage path → signed URL. The bucket is no longer public,
 * so reads must go through these (valid for SIGNED_URL_TTL seconds).
 */
const SIGNED_URL_TTL = 60 * 60; // 1 hour

async function signPhotoUrls(
  supabase: SupabaseClient,
  paths: string[],
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (paths.length === 0) return out;
  const { data, error } = await supabase.storage
    .from("photos")
    .createSignedUrls(paths, SIGNED_URL_TTL);
  if (error) return out; // degrade gracefully → silhouette placeholder
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) out.set(item.path, item.signedUrl);
  }
  return out;
}

export async function listRequests(): Promise<CardRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .select(
      "id, reference, card_type, status, submission_date, deadline, beneficiaries(count)",
    )
    .order("submission_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data as RequestRow[]).map((r) => ({
    id: r.id,
    reference: r.reference,
    cardType: r.card_type,
    status: r.status,
    submissionDate: isoToFr(r.submission_date),
    deadline: isoToFr(r.deadline),
    unitCount: r.beneficiaries?.[0]?.count ?? 0,
    beneficiaries: [],
  }));
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getRequest(id: string): Promise<CardRequest | null> {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .select(
      "id, reference, card_type, status, submission_date, deadline, beneficiaries(*)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as Omit<RequestRow, "beneficiaries"> & {
    beneficiaries: BeneficiaryRow[];
  };
  const sorted = (row.beneficiaries ?? [])
    .slice()
    .sort((a, b) => a.position - b.position);
  const paths = sorted
    .map((b) => b.photo_path)
    .filter((p): p is string => !!p);
  const signed = await signPhotoUrls(supabase, paths);
  const bens = sorted.map((b) =>
    mapBeneficiary(b, b.photo_path ? signed.get(b.photo_path) : undefined),
  );

  return {
    id: row.id,
    reference: row.reference,
    cardType: row.card_type,
    status: row.status,
    submissionDate: isoToFr(row.submission_date),
    deadline: isoToFr(row.deadline),
    unitCount: bens.length,
    beneficiaries: bens,
  };
}

export async function listAppointments(): Promise<Appointment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, appointment_date, slot, status, requests(reference, card_type, deadline, beneficiaries(count))",
    )
    .order("appointment_date", { ascending: false });
  if (error) throw error;

  return (data as unknown as AppointmentRow[]).map((a) => ({
    id: a.id,
    requestRef: a.requests?.reference ?? "—",
    cardType: a.requests?.card_type ?? "—",
    unitCount: a.requests?.beneficiaries?.[0]?.count ?? 0,
    date: longFrDate(a.appointment_date),
    slot: a.slot,
    deadline: isoToFr(a.requests?.deadline),
    status: a.status,
  }));
}
