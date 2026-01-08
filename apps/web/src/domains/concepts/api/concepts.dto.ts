import type { paths } from "~/foundation/types/api";

export type SpaceConceptsListOk =
  paths["/api/spaces/{spaceId}/concepts"]["get"]["responses"]["200"]["content"]["application/json"];

export type SpaceConceptsListQuery =
  paths["/api/spaces/{spaceId}/concepts"]["get"]["parameters"]["query"];

export type ApiConceptListItem = SpaceConceptsListOk["data"][number];

export type ConceptDetailOk =
  paths["/api/concepts/{conceptId}"]["get"]["responses"]["200"]["content"]["application/json"];

export type ApiConceptDetail = ConceptDetailOk["data"];

export type ApiRelatedConcept = ApiConceptDetail["relatedConcepts"][number];

export type ConceptLibraryListOk =
  paths["/api/concepts"]["get"]["responses"]["200"]["content"]["application/json"];

export type ConceptLibraryListQuery =
  paths["/api/concepts"]["get"]["parameters"]["query"];
