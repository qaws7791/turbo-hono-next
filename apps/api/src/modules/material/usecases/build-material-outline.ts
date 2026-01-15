import { analyzeMaterial } from "../../../ai/material";

import type { NewOutlineNode } from "@repo/database/types";
import type { MaterialOutlineNode } from "../../../ai/material";

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

    for (let i = 0; i < nodes.length; i += 1) {
      if (rows.length >= params.maxNodes) break;
      const node = nodes[i];
      if (!node) continue;

      const id = crypto.randomUUID();
      const path = `${parentPath}.${i + 1}`;

      rows.push({
        id,
        materialId: params.materialId,
        parentId,
        nodeType: node.nodeType,
        title: node.title,
        summary: node.summary,
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

export async function analyzeMaterialForOutline(
  params: BuildOutlineParams,
): Promise<{
  readonly summary: string;
  readonly title: string;
  readonly outlineRows: ReadonlyArray<OutlineNodeRow>;
}> {
  const analyzed = await analyzeMaterial({
    fullText: params.fullText,
    mimeType: params.mimeType,
  });

  const rootId = crypto.randomUUID();
  const rootPath = "0";

  const rootRow: OutlineNodeRow = {
    id: rootId,
    materialId: params.materialId,
    parentId: null,
    nodeType: "SECTION",
    title: analyzed.title,
    summary: analyzed.summary,
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

  return {
    summary: analyzed.summary,
    title: analyzed.title,
    outlineRows: [rootRow, ...childRows],
  };
}
