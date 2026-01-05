import { getConceptDetail, listSpaceConcepts } from "../api/concepts.api";

import type { ConceptDetail, SpaceConceptsList } from "../api/concepts.api";

export async function listSpaceConceptsForUi(
  spaceId: string,
  query?: Parameters<typeof listSpaceConcepts>[1],
): Promise<SpaceConceptsList> {
  return listSpaceConcepts(spaceId, query);
}

export async function getConceptCountForSpaceUi(
  spaceId: string,
): Promise<number> {
  const { meta } = await listSpaceConcepts(spaceId, { page: 1, limit: 1 });
  return meta.total;
}

export async function getConceptDetailForUi(
  spaceId: string,
  conceptId: string,
): Promise<ConceptDetail> {
  return getConceptDetail(spaceId, conceptId);
}
