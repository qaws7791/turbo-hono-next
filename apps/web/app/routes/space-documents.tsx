import { useLoaderData } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/space-documents";

import { SpaceDocumentsView } from "~/features/documents/space-documents/space-documents-view";
import { useSpaceDocumentsModel } from "~/features/documents/space-documents/use-space-documents-model";
import { deleteDocument, listDocuments, uploadDocument } from "~/mock/api";

const SpaceIdSchema = z.string().uuid();

export function meta() {
  return [{ title: "Documents" }];
}

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  return {
    spaceId: spaceId.data,
    documents: listDocuments(spaceId.data),
  };
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "delete") {
    const documentId = String(formData.get("documentId") ?? "");
    deleteDocument({ spaceId: spaceId.data, documentId });
    return null;
  }

  if (intent === "upload-url") {
    const title = String(formData.get("title") ?? "").trim() || "URL 문서";
    const url = String(formData.get("url") ?? "");
    uploadDocument({
      spaceId: spaceId.data,
      kind: "url",
      title,
      source: { type: "url", url },
    });
    return null;
  }

  if (intent === "upload-text") {
    const title = String(formData.get("title") ?? "").trim() || "텍스트 노트";
    const text = String(formData.get("text") ?? "");
    uploadDocument({
      spaceId: spaceId.data,
      kind: "text",
      title,
      source: { type: "text", text },
    });
    return null;
  }

  if (intent === "upload-file") {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new Response("Invalid file", { status: 400 });
    }
    const title = String(formData.get("title") ?? "").trim() || file.name;
    uploadDocument({
      spaceId: spaceId.data,
      kind: "file",
      title,
      source: { type: "file", fileName: file.name, fileSizeBytes: file.size },
    });
    return null;
  }

  return null;
}

export default function SpaceDocumentsRoute() {
  const { spaceId, documents } = useLoaderData<typeof clientLoader>();
  const model = useSpaceDocumentsModel(documents);
  return <SpaceDocumentsView spaceId={spaceId} documents={documents} model={model} />;
}

