import { useLoaderData } from "react-router";

import type { Concept } from "~/domains/concepts";
import type { Route } from "./+types/concept-detail";

import {
  ConceptDetailView,
  getConceptDetailForUi,
  listSpaceConceptsForUi,
  useConceptDetailModel,
} from "~/domains/concepts";
import { getSpaceForUi, listSpacesForUi } from "~/domains/spaces";
import { PublicIdSchema } from "~/foundation/lib";

const ConceptIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "개념" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const conceptId = ConceptIdSchema.safeParse(params.conceptId);
  if (!conceptId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  const spaces = await listSpacesForUi();
  const conceptLists = await Promise.all(
    spaces.map((space) =>
      listSpaceConceptsForUi(space.id, { page: 1, limit: 200 }),
    ),
  );

  const index = new Map<string, Concept>();
  for (const list of conceptLists) {
    for (const item of list.data) {
      index.set(item.id, item);
    }
  }

  const located = index.get(conceptId.data);
  if (!located) {
    throw new Response("Not Found", { status: 404 });
  }

  const space = await getSpaceForUi(located.spaceId);
  const detail = await getConceptDetailForUi(located.spaceId, conceptId.data);
  const concept = detail.concept;

  const related = detail.relatedConcepts.slice(0, 6).map((r) => {
    const found = index.get(r.id);
    if (found) return found;

    const fallback: Concept = {
      id: r.id,
      spaceId: concept.spaceId,
      title: r.title,
      oneLiner: "",
      definition: "",
      exampleCode: undefined,
      gotchas: [],
      tags: [],
      reviewStatus: "good",
      lastStudiedAt: undefined,
      sources: [],
      relatedConceptIds: [],
    };
    return fallback;
  });

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
