import { listRequests, listBookedSlots } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { BookingForm } from "@/components/rendezvous/BookingForm";

export default async function NouveauRendezVousPage() {
  const [requests, bookedSlots, supabase] = await Promise.all([
    listRequests(),
    listBookedSlots(),
    createClient(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const demandeur =
    (user?.user_metadata?.name as string | undefined) ||
    (user?.email ? user.email.split("@")[0] : "Agent");

  return (
    <BookingForm
      requests={requests}
      demandeur={demandeur}
      bookedSlots={bookedSlots}
    />
  );
}
