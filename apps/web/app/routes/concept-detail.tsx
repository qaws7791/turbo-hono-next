import { useParams } from "react-router";

import { ConceptDetailView, useConceptQuery } from "~/modules/concepts";

export function meta() {
  return [{ title: "개념" }];
}

function ConceptDetailRouteWithId({ conceptId }: { conceptId: string }) {
  const concept = useConceptQuery(conceptId);

  if (!concept.data) return null;

  return <ConceptDetailView concept={concept.data} />;
}

export default function ConceptDetailRoute() {
  const { conceptId } = useParams();
  if (!conceptId) {
    throw new Response("Not Found", { status: 404 });
  }

  return <ConceptDetailRouteWithId conceptId={conceptId} />;
}
