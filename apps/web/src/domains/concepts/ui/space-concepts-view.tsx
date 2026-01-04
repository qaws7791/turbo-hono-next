import { Input } from "@repo/ui/input";
import { useState } from "react";

import type { Concept, Space } from "~/app/mocks/schemas";

import { ConceptCard } from "~/domains/concepts/ui";

export function SpaceConceptsView({
  space,
  concepts,
}: {
  space: Space;
  concepts: Array<Concept>;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConcepts = concepts.filter((concept) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      concept.title.toLowerCase().includes(query) ||
      concept.oneLiner.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="">
        <h2 className="text-foreground text-xl font-semibold">개념 목록</h2>
        <p className="text-muted-foreground text-sm">
          {space.name}의 개념 목록입니다.
        </p>
      </div>

      <div className="max-w-md">
        <Input
          type="text"
          placeholder="개념 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredConcepts.map((concept) => (
          <ConceptCard
            key={concept.id}
            concept={concept}
            showSource={false}
          />
        ))}
      </div>

      {filteredConcepts.length === 0 && searchQuery.trim() ? (
        <div className="text-muted-foreground text-sm">
          &quot;{searchQuery}&quot;에 해당하는 개념이 없습니다.
        </div>
      ) : concepts.length === 0 ? (
        <div className="text-muted-foreground text-sm">
          아직 개념이 없습니다. 세션을 완료하면 자동으로 저장됩니다.
        </div>
      ) : null}
    </div>
  );
}
