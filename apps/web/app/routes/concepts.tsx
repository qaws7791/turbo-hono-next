import { useSearchParams } from "react-router";

import {
  ConceptLibraryView,
  useConceptLibraryModel,
  useConceptSearchQuery,
} from "~/modules/concepts";

export function meta() {
  return [{ title: "개념 라이브러리" }];
}

export default function ConceptsRoute() {
  const [searchParams] = useSearchParams();
  const q = String(searchParams.get("q") ?? "");
  const filters = { q: q.trim().length > 0 ? q : undefined };
  const model = useConceptLibraryModel({ filters });
  const conceptsQuery = useConceptSearchQuery({
    q,
    enabled: q.trim().length > 0,
  });

  return (
    <ConceptLibraryView
      concepts={conceptsQuery.data?.data ?? []}
      model={model}
    />
  );
}
