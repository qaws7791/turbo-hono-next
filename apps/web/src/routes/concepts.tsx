import { useSuspenseQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/concepts";

import { ConceptLibraryView, conceptsQueries } from "~/domains/concepts";
import { queryClient } from "~/foundation/query-client";

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

  await queryClient.prefetchQuery(conceptsQueries.library(filters));

  return { filters };
}

export default function ConceptsRoute() {
  const { filters } = useLoaderData<typeof clientLoader>();
  const { data: concepts } = useSuspenseQuery(conceptsQueries.library(filters));
  return (
    <ConceptLibraryView
      concepts={concepts}
      initialQuery={filters.q}
    />
  );
}
