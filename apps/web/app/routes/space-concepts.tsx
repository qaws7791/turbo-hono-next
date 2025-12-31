import { useParams } from "react-router";

import { SpaceConceptsView, useSpaceConceptsQuery } from "~/modules/concepts";
import { useSpaceQuery } from "~/modules/spaces";

export function meta() {
  return [{ title: "개념" }];
}

export default function SpaceConceptsRoute() {
  const { spaceId } = useParams();
  if (!spaceId) {
    throw new Response("Not Found", { status: 404 });
  }

  const space = useSpaceQuery(spaceId);
  const concepts = useSpaceConceptsQuery({ spaceId, page: 1, limit: 100 });

  if (!space.data || !concepts.data) return null;

  return (
    <SpaceConceptsView
      space={space.data}
      concepts={concepts.data.data}
    />
  );
}
