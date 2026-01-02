import { useParams } from "react-router";

import { SpaceDocumentsView } from "~/modules/documents";
import {
  useDeleteMaterialMutation,
  useSpaceMaterialsQuery,
  useUploadMaterialMutation,
} from "~/modules/materials";

export function meta() {
  return [{ title: "문서" }];
}

export default function SpaceDocumentsRoute() {
  const { spaceId } = useParams();
  if (!spaceId) {
    throw new Response("Not Found", { status: 404 });
  }

  const materials = useSpaceMaterialsQuery({ spaceId, page: 1, limit: 50 });
  const upload = useUploadMaterialMutation();
  const remove = useDeleteMaterialMutation();

  const documents = materials.data?.data ?? [];

  return (
    <SpaceDocumentsView
      documents={documents}
      isSubmitting={upload.isPending || remove.isPending}
      onDelete={(materialId) => {
        remove.mutate({ materialId });
      }}
      onUploadFile={(input) => {
        upload.mutate({ spaceId, file: input.file, title: input.title });
      }}
    />
  );
}
