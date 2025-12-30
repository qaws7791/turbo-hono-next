import { useLoaderData } from "react-router";

import type { Route } from "./+types/concept-detail";

import { ConceptDetailView } from "~/features/concepts/detail/concept-detail-view";
import { useConceptDetailModel } from "~/features/concepts/detail/use-concept-detail-model";
import { getConcept, getSpace, listConcepts } from "~/mock/api";
import { PublicIdSchema } from "~/mock/schemas";

const ConceptIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "개념" }];
}

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  const conceptId = ConceptIdSchema.safeParse(params.conceptId);
  if (!conceptId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  const concept = getConcept(conceptId.data);
  const space = getSpace(concept.spaceId);
  const related = concept.relatedConceptIds.length
    ? listConcepts({})
        .filter((c) => concept.relatedConceptIds.includes(c.id))
        .slice(0, 6)
    : [];

  return { concept, space, related };
}

export default function ConceptDetailRoute() {
  const { concept, space, related } = useLoaderData<typeof clientLoader>();
  const model = useConceptDetailModel(concept);
  return (
    <ConceptDetailView
      concept={concept}
      space={space}
      related={related}
      model={model}
    />
  );
}
