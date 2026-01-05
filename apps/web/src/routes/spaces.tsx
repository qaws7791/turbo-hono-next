import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

import { SpacesView, spacesQueries, useSpacesModel } from "~/domains/spaces";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [{ title: "스페이스" }];
}

export async function clientLoader() {
  await queryClient.prefetchQuery(spacesQueries.listCards());
  return {};
}

export default function SpacesRoute() {
  const { data: spaces } = useSuspenseQuery(spacesQueries.listCards());
  const [searchParams, setSearchParams] = useSearchParams();

  const model = useSpacesModel({
    spaces,
    searchParams,
    setSearchParams: (next) => setSearchParams(next, { replace: true }),
  });

  return <SpacesView model={model} />;
}
