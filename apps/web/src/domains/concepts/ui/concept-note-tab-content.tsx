import type { Concept } from "../model";

interface ConceptNoteTabContentProps {
  concept: Concept;
}

export function ConceptNoteTabContent({ concept }: ConceptNoteTabContentProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-sm font-medium">정의</h3>
        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
          {concept.definition}
        </p>
      </section>

      {concept.exampleCode ? (
        <section className="space-y-2">
          <h3 className="text-sm font-medium">예제</h3>
          <pre className="bg-muted overflow-x-auto rounded-xl p-4 text-sm">
            <code>{concept.exampleCode}</code>
          </pre>
        </section>
      ) : null}

      {concept.gotchas.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-sm font-medium">주의사항</h3>
          <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-sm">
            {concept.gotchas.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
