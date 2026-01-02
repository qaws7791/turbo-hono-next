import { Input } from "@repo/ui/input";
import { IconSearch } from "@tabler/icons-react";
import { useSearchParams } from "react-router";

import { ConceptCard } from "../components/concept-card";

import type { ConceptSearchItem } from "../../domain";

import { PageBody, PageHeader } from "~/modules/app-shell";

export function ConceptLibraryView({
  concepts,
}: {
  concepts: Array<ConceptSearchItem>;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  function setQuery(nextQuery: string): void {
    const next = new URLSearchParams(searchParams);
    if (nextQuery.trim().length === 0) next.delete("q");
    else next.set("q", nextQuery);
    setSearchParams(next, { replace: true });
  }

  return (
    <>
      <PageHeader />
      <PageBody className="space-y-12 mt-24">
        <h1 className="text-foreground text-2xl font-medium">
          개념 라이브러리
        </h1>
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
            />
          ))}
        </div>

        {concepts.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            조건에 맞는 개념이 없습니다.
          </div>
        ) : null}
      </PageBody>
    </>
  );
}
