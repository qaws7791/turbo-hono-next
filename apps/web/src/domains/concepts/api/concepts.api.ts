import {
  toConceptFromApiDetail,
  toConceptFromApiListItem,
  toRelatedConceptFromApi,
} from "./concepts.mapper";

import type {
  ConceptLibraryListOk,
  ConceptLibraryListQuery,
  SpaceConceptsListOk,
  SpaceConceptsListQuery,
} from "./concepts.dto";
import type {
  ConceptDetail,
  ConceptSummary,
  RelatedConcept,
} from "../model/concepts.types";

import { apiClient } from "~/foundation/api/client";
import { ApiError } from "~/foundation/api/error";

export type SpaceConceptsList = {
  data: Array<ConceptSummary>;
  meta: SpaceConceptsListOk["meta"];
};

export type ConceptDetailData = {
  concept: ConceptDetail;
  relatedConcepts: Array<RelatedConcept>;
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
  conceptId: string,
): Promise<ConceptDetailData> {
  const { data, error, response } = await apiClient.GET(
    "/api/concepts/{conceptId}",
    { params: { path: { conceptId } } },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to get concept detail", response.status, error);
  }

  return {
    concept: toConceptFromApiDetail(data.data),
    relatedConcepts: data.data.relatedConcepts.map(toRelatedConceptFromApi),
  };
}

export type ConceptLibraryList = {
  data: Array<ConceptSummary>;
  meta: ConceptLibraryListOk["meta"];
};

export async function listConceptLibrary(
  query?: ConceptLibraryListQuery,
): Promise<ConceptLibraryList> {
  const { data, error, response } = await apiClient.GET("/api/concepts", {
    params: { query },
  });
  if (!response.ok || !data) {
    throw new ApiError(
      "Failed to list concept library",
      response.status,
      error,
    );
  }

  return {
    data: data.data.map((item) => toConceptFromApiListItem(item.spaceId, item)),
    meta: data.meta,
  };
}
