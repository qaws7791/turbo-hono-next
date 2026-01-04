import { useLoaderData } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/concepts";

import {
  ConceptLibraryView,
  toConceptFromListItem,
  useConceptLibraryModel,
} from "~/domains/concepts";
import { listSpacesForUi } from "~/domains/spaces";
import { listSpaceConcepts } from "~/foundation/api/concepts";

const SearchSchema = z.object({
  q: z.string().optional(),
});

export function meta() {
  return [{ title: "개념 라이브러리" }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const parsed = SearchSchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
  });

  const filters = parsed.success
    ? parsed.data
    : {
        q: undefined,
      };

  const spaces = await listSpacesForUi();
  const conceptLists = await Promise.all(
    spaces.map((space) =>
      listSpaceConcepts(space.id, {
        page: 1,
        limit: 50,
        search: filters.q?.trim().length ? filters.q.trim() : undefined,
      }),
    ),
  );

  const concepts = conceptLists.flatMap((list, index) =>
    list.data.map((c) => toConceptFromListItem(spaces[index].id, c)),
  );

  return {
    filters,
    concepts,
  };
}

export default function ConceptsRoute() {
  const { filters, concepts } = useLoaderData<typeof clientLoader>();
  const model = useConceptLibraryModel({ filters });
  return (
    <ConceptLibraryView
      concepts={concepts}
      model={model}
    />
  );
}
