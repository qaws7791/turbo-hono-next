import { useSuspenseQueries } from "@tanstack/react-query";
import { Link } from "react-router";

import { conceptsQueries } from "../concepts.queries";

import { ConceptCard } from "./concept-card.card";

import type { Concept } from "../model/concepts.types";

import { spacesQueries } from "~/domains/spaces";

export function SpaceConceptsView({ spaceId }: { spaceId: string }) {
  const [spaceQuery, conceptsDataQuery] = useSuspenseQueries({
    queries: [
      spacesQueries.detail(spaceId),
      conceptsQueries.listForSpace(spaceId, { page: 1, limit: 50 }),
    ],
  });

  const space = spaceQuery.data;
  const concepts = conceptsDataQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="">
        <h2 className="text-foreground text-xl font-semibold">개념 목록</h2>
        <p className="text-muted-foreground text-sm">
          {space.name}의 개념 목록입니다.
        </p>
      </div>

      <div className="grid gap-4">
        {concepts.map((concept: Concept) => (
          <Link
            key={concept.id}
            to={`/concept/${concept.id}`}
            className="block focus:outline-none group"
          >
            <ConceptCard
              concept={concept}
              showSource={false}
            />
          </Link>
        ))}
      </div>

      {concepts.length === 0 ? (
        <div className="text-muted-foreground text-sm">
          아직 개념이 없습니다. 세션을 완료하면 자동으로 저장됩니다.
        </div>
      ) : null}
    </div>
  );
}
