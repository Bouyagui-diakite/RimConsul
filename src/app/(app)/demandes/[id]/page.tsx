import { notFound } from "next/navigation";
import { getRequest } from "@/lib/db";
import { DemandeDetail } from "@/components/demandes/DemandeDetail";

export default async function DemandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getRequest(id);
  if (!request) notFound();
  return <DemandeDetail request={request} />;
}
