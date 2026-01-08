import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { ConceptDetail } from "../model";

interface ConceptNoteTabContentProps {
  concept: ConceptDetail;
}

export function ConceptNoteTabContent({ concept }: ConceptNoteTabContentProps) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <Markdown remarkPlugins={[remarkGfm]}>{concept.ariNoteMd}</Markdown>
    </div>
  );
}
