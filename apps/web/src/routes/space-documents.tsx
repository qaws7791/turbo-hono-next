import { useLoaderData } from "react-router";

import type { Route } from "./+types/space-documents";

import { PublicIdSchema } from "~/app/mocks/schemas";
import {
  SpaceDocumentsView,
  deleteDocumentForUi,
  listDocumentsForUi,
  uploadFileDocumentForUi,
  useSpaceDocumentsModel,
} from "~/domains/documents";

const SpaceIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "문서" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  return {
    spaceId: spaceId.data,
    documents: await listDocumentsForUi(spaceId.data),
  };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "delete") {
    const documentId = String(formData.get("documentId") ?? "");
    await deleteDocumentForUi(documentId);
    return null;
  }

  if (intent === "upload-file") {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new Response("Invalid file", { status: 400 });
    }
    const title = String(formData.get("title") ?? "").trim() || file.name;
    await uploadFileDocumentForUi({ spaceId: spaceId.data, file, title });
    return null;
  }

  return null;
}

export default function SpaceDocumentsRoute() {
  const { documents } = useLoaderData<typeof clientLoader>();
  const model = useSpaceDocumentsModel(documents);
  return (
    <SpaceDocumentsView
      documents={documents}
      model={model}
    />
  );
}
