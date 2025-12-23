import { useLoaderData } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/concepts";

import { ConceptLibraryView } from "~/features/concepts/library/concept-library-view";
import { useConceptLibraryModel } from "~/features/concepts/library/use-concept-library-model";
import { listConcepts } from "~/mock/api";

const SearchSchema = z.object({
  q: z.string().optional(),
});

export function meta() {
  return [{ title: "Concept Library" }];
}

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const parsed = SearchSchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
  });

  const filters = parsed.success
    ? parsed.data
    : {
        q: undefined,
      };

  const concepts = listConcepts({
    query: filters.q,
  });

  return {
    filters,
    concepts,
  };
}

export default function ConceptsRoute() {
  const { filters, concepts } = useLoaderData<typeof clientLoader>();
  const model = useConceptLibraryModel({ filters });
  console.log(model);
  return (
    <ConceptLibraryView
      concepts={concepts}
      model={model}
    />
  );
}
