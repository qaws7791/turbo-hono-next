import {
  toConceptFromApiDetail,
  toConceptFromApiListItem,
} from "./concepts.mapper";

import type {
  ApiRelatedConcept,
  SpaceConceptsListOk,
  SpaceConceptsListQuery,
} from "./concepts.dto";
import type { Concept } from "../model/concepts.types";

import { apiClient } from "~/foundation/api/client";
import { ApiError } from "~/foundation/api/error";

export type SpaceConceptsList = {
  data: Array<Concept>;
  meta: SpaceConceptsListOk["meta"];
};

export type RelatedConceptSummary = Pick<ApiRelatedConcept, "id" | "title">;

export type ConceptDetail = {
  concept: Concept;
  relatedConcepts: Array<RelatedConceptSummary>;
};

export async function listSpaceConcepts(
  spaceId: string,
  query?: SpaceConceptsListQuery,
): Promise<SpaceConceptsList> {
  const { data, error, response } = await apiClient.GET(
    "/api/spaces/{spaceId}/concepts",
    { params: { path: { spaceId }, query } },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to list concepts", response.status, error);
  }

  return {
    data: data.data.map((item) => toConceptFromApiListItem(spaceId, item)),
    meta: data.meta,
  };
}

export async function getConceptDetail(
  spaceId: string,
  conceptId: string,
): Promise<ConceptDetail> {
  const { data, error, response } = await apiClient.GET(
    "/api/concepts/{conceptId}",
    { params: { path: { conceptId } } },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to get concept detail", response.status, error);
  }

  return {
    concept: toConceptFromApiDetail(spaceId, data.data),
    relatedConcepts: data.data.relatedConcepts.map((item) => ({
      id: item.id,
      title: item.title,
    })),
  };
}
