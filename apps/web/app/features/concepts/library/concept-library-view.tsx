import { Input } from "@repo/ui/input";
import { IconSearch } from "@tabler/icons-react";

import { ConceptCard } from "../concept-card";

import type { Concept } from "~/mock/schemas";
import type { ConceptLibraryModel } from "./use-concept-library-model";

import { PageBody } from "~/features/app-shell/page-body";
import { PageHeader } from "~/features/app-shell/page-header";

export function ConceptLibraryView({
  concepts,
  model,
}: {
  concepts: Array<Concept>;
  model: ConceptLibraryModel;
}) {
  return (
    <>
      <PageHeader />
      <PageBody className="space-y-12 mt-24">
        <h1 className="text-foreground text-2xl font-medium">
          컨셉 라이브러리
        </h1>
        <div className="relative">
          <Input
            value={model.query}
            onChange={(e) => model.setQuery(e.target.value)}
            placeholder="검색 (제목/요약/태그)"
            className="w-full px-4 h-10 bg-background peer ps-9"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconSearch className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
          {concepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              showSource
            />
          ))}
        </div>

        {concepts.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            조건에 맞는 Concept가 없습니다.
          </div>
        ) : null}
      </PageBody>
    </>
  );
}
