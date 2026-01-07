import { ConceptLibraryView, conceptsQueries } from "~/domains/concepts";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [{ title: "개념 라이브러리" }];
}

export async function clientLoader() {
  await queryClient.ensureQueryData(conceptsQueries.library());
}

export default function ConceptsRoute() {
  return <ConceptLibraryView />;
}
