import type { paths } from "~/modules/api";

export type SpaceConceptsApiResponse =
  paths["/api/spaces/{spaceId}/concepts"]["get"]["responses"][200]["content"]["application/json"];

export type ConceptDetailApiResponse =
  paths["/api/concepts/{conceptId}"]["get"]["responses"][200]["content"]["application/json"];

export type ConceptSearchApiResponse =
  paths["/api/concepts/search"]["get"]["responses"][200]["content"]["application/json"];

export type CreateConceptReviewApiBody = NonNullable<
  paths["/api/concepts/{conceptId}/reviews"]["post"]["requestBody"]
>["content"]["application/json"];

export type CreateConceptReviewApiResponse =
  paths["/api/concepts/{conceptId}/reviews"]["post"]["responses"][201]["content"]["application/json"];
