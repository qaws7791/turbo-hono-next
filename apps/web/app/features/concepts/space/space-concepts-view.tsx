import { ConceptCard } from "../concept-card";

import type { Concept, Space } from "~/mock/schemas";

export function SpaceConceptsView({
  space,
  concepts,
}: {
  space: Space;
  concepts: Array<Concept>;
}) {
  return (
    <div className="space-y-6">
      <div className="">
        <h2 className="text-foreground text-xl font-semibold">Concepts</h2>
        <p className="text-muted-foreground text-sm">
          {space.name}의 Concept 목록입니다.
        </p>
      </div>

      <div className="grid gap-4">
        {concepts.map((concept) => (
          <ConceptCard
            key={concept.id}
            concept={concept}
            showSource={false}
          />
        ))}
      </div>

      {concepts.length === 0 ? (
        <div className="text-muted-foreground text-sm">
          아직 Concept가 없습니다. 세션을 완료하면 자동으로 저장됩니다.
        </div>
      ) : null}
    </div>
  );
}
