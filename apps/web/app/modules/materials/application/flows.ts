import { postUploadComplete, postUploadInit, putPresignedUpload } from "../api";

import type {
  UploadCompleteAcceptedResponse,
  UploadCompleteCreatedResponse,
} from "../domain";

export async function uploadMaterial(input: {
  spaceId: string;
  file: File;
  title?: string;
}): Promise<UploadCompleteCreatedResponse | UploadCompleteAcceptedResponse> {
  const mimeType =
    input.file.type.trim().length > 0
      ? input.file.type
      : "application/octet-stream";

  const init = await postUploadInit({
    spaceId: input.spaceId,
    body: {
      originalFilename: input.file.name,
      mimeType,
      fileSize: input.file.size,
    },
  });

  const { etag } = await putPresignedUpload({
    uploadUrl: init.data.uploadUrl,
    method: init.data.method,
    headers: init.data.headers,
    file: input.file,
  });

  return postUploadComplete({
    spaceId: input.spaceId,
    body: {
      uploadId: init.data.uploadId,
      title: input.title,
      etag: etag ?? undefined,
    },
  });
}
