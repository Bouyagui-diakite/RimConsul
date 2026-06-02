import { listRequests } from "@/lib/db";
import { DemandesTable } from "@/components/demandes/DemandesTable";

export default async function DemandesPage() {
  const requests = await listRequests();
  return <DemandesTable requests={requests} />;
}
