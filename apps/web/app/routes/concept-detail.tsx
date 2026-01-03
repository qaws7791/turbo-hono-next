import { useLoaderData } from "react-router";

import type { Route } from "./+types/concept-detail";
import type { Concept } from "~/mock/schemas";

import { ConceptDetailView } from "~/features/concepts/detail/concept-detail-view";
import { useConceptDetailModel } from "~/features/concepts/detail/use-concept-detail-model";
import {
  toUiConceptFromDetail,
  toUiConceptFromListItem,
} from "~/api/compat/concepts";
import { getSpaceForUi, listSpacesForUi } from "~/api/compat/spaces";
import { getConceptDetail, listSpaceConcepts } from "~/api/concepts";
import { PublicIdSchema } from "~/mock/schemas";

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
    spaces.map((space) => listSpaceConcepts(space.id, { page: 1, limit: 200 })),
  );

  const index = new Map<
    string,
    {
      spaceId: string;
      item: (typeof conceptLists)[number]["data"][number];
    }
  >();

  for (const [spaceIndex, list] of conceptLists.entries()) {
    const spaceId = spaces[spaceIndex].id;
    for (const item of list.data) {
      index.set(item.id, { spaceId, item });
    }
  }

  const located = index.get(conceptId.data);
  if (!located) {
    throw new Response("Not Found", { status: 404 });
  }

  const space = await getSpaceForUi(located.spaceId);
  const detail = await getConceptDetail(conceptId.data);
  const concept = toUiConceptFromDetail(located.spaceId, detail.data);

  const related = detail.data.relatedConcepts.slice(0, 6).map((r) => {
    const found = index.get(r.id);
    if (found) {
      return toUiConceptFromListItem(found.spaceId, found.item);
    }

    const fallback: Concept = {
      id: r.id,
      spaceId: located.spaceId,
      title: r.title,
      oneLiner: "",
      definition: "",
      exampleCode: undefined,
      gotchas: [],
      tags: [],
      reviewStatus: "good",
      lastStudiedAt: new Date().toISOString(),
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
