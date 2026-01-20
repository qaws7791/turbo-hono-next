import { ok, safeTry } from "neverthrow";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { NewOutlineNode } from "@repo/database/types";
import type {
  MaterialAnalyzerPort,
  MaterialOutlineNode,
} from "../material.ports";

type OutlineNodeRow = NewOutlineNode;

type BuildOutlineParams = {
  readonly materialId: string;
  readonly fullText: string;
  readonly mimeType: string | null;
};

function flattenOutline(params: {
  readonly materialId: string;
  readonly rootId: string;
  readonly rootPath: string;
  readonly depth: number;
  readonly nodes: ReadonlyArray<MaterialOutlineNode>;
  readonly maxNodes: number;
}): Array<OutlineNodeRow> {
  const rows: Array<OutlineNodeRow> = [];

  const stack: Array<{
    parentId: string;
    parentPath: string;
    depth: number;
    nodes: ReadonlyArray<MaterialOutlineNode>;
  }> = [
    {
      parentId: params.rootId,
      parentPath: params.rootPath,
      depth: params.depth,
      nodes: params.nodes,
    },
  ];

  while (stack.length > 0 && rows.length < params.maxNodes) {
    const frame = stack.pop();
    if (!frame) break;

    const { parentId, parentPath, depth, nodes } = frame;
    if (depth > 3) continue;

    for (const [i, node] of nodes.entries()) {
      if (rows.length >= params.maxNodes) break;
      if (!node) continue;

      const id = crypto.randomUUID();
      const path = `${parentPath}.${i + 1}`;

      rows.push({
        id,
        materialId: params.materialId,
        parentId,
        nodeType: node.nodeType,
        title: node.title.replace(/\0/g, ""),
        summary: node.summary.replace(/\0/g, ""),
        keywords: [...node.keywords],
        orderIndex: i,
        depth,
        path,
        metadataJson: {
          pageStart: node.pageStart ?? undefined,
          pageEnd: node.pageEnd ?? undefined,
          lineStart: node.lineStart ?? undefined,
          lineEnd: node.lineEnd ?? undefined,
        },
      });

      if (node.children.length > 0) {
        stack.push({
          parentId: id,
          parentPath: path,
          depth: depth + 1,
          nodes: node.children,
        });
      }
    }
  }

  return rows;
}

export function analyzeMaterialForOutline(
  deps: { readonly materialAnalyzer: MaterialAnalyzerPort },
  params: BuildOutlineParams,
): ResultAsync<
  {
    readonly summary: string;
    readonly title: string;
    readonly outlineRows: ReadonlyArray<OutlineNodeRow>;
  },
  AppError
> {
  return safeTry(async function* () {
    const analyzed = yield* deps.materialAnalyzer.analyze({
      fullText: params.fullText,
      mimeType: params.mimeType,
    });

    const rootId = crypto.randomUUID();
    const rootPath = "0";

    const cleanTitle = analyzed.title.replace(/\0/g, "");
    const cleanSummary = analyzed.summary.replace(/\0/g, "");

    const rootRow: OutlineNodeRow = {
      id: rootId,
      materialId: params.materialId,
      parentId: null,
      nodeType: "SECTION",
      title: cleanTitle,
      summary: cleanSummary,
      keywords: [],
      orderIndex: 0,
      depth: 0,
      path: rootPath,
      metadataJson: {},
    };

    const childRows = flattenOutline({
      materialId: params.materialId,
      rootId,
      rootPath,
      depth: 1,
      nodes: analyzed.outline,
      maxNodes: 200,
    });

    return ok({
      summary: cleanSummary,
      title: cleanTitle,
      outlineRows: [rootRow, ...childRows],
    });
  });
}
