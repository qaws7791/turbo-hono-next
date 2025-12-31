import { redirect } from "react-router";

import type { Route } from "./+types/concept-detail-alias";

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  const conceptId = params.conceptId;
  if (!conceptId) {
    throw new Response("Not Found", { status: 404 });
  }
  throw redirect(`/concept/${conceptId}`);
}

export default function ConceptDetailAliasRoute() {
  return null;
}
