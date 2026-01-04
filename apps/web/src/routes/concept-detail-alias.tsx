import { redirect } from "react-router";

import type { Route } from "./+types/concept-detail-alias";

import { PublicIdSchema } from "~/app/mocks/schemas";

const ConceptIdSchema = PublicIdSchema;

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  const conceptId = ConceptIdSchema.safeParse(params.conceptId);
  if (!conceptId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  throw redirect(`/concept/${conceptId.data}`);
}

export default function ConceptDetailAliasRoute() {
  return null;
}
