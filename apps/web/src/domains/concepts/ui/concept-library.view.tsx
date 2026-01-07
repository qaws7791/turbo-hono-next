import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import { conceptsQueries } from "../concepts.queries";

import { ConceptCard } from "./concept-card.card";

import { PageBody, PageHeader } from "~/domains/app-shell";

export function ConceptLibraryView() {
  const { data: concepts } = useSuspenseQuery(conceptsQueries.library());

  return (
    <>
      <PageHeader />
      <PageBody className="space-y-12 mt-24">
        <h1 className="text-foreground text-2xl font-medium">
          개념 라이브러리
        </h1>

        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
          {concepts.map((concept) => (
            <Link
              key={concept.id}
              to={`/concept/${concept.id}`}
              className="block focus:outline-none group"
            >
              <ConceptCard
                concept={concept}
                showSource
              />
            </Link>
          ))}
        </div>

        {concepts.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            저장된 개념이 없습니다.
          </div>
        ) : null}
      </PageBody>
    </>
  );
}
