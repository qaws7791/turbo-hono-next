import type { Route } from "./+types/concept-detail";

import { ConceptDetailView, conceptsQueries } from "~/domains/concepts";
import { PublicIdSchema } from "~/foundation/lib";
import { queryClient } from "~/foundation/query-client";

const ConceptIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "개념" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const conceptId = ConceptIdSchema.safeParse(params.conceptId);
  if (!conceptId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  await queryClient.ensureQueryData(conceptsQueries.detailPage(conceptId.data));
}

export default function ConceptDetailRoute({ params }: Route.ComponentProps) {
  return <ConceptDetailView conceptId={params.conceptId} />;
}
