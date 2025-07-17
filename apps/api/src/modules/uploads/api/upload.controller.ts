import { OpenAPIHono } from "@hono/zod-openapi";
import { nanoid } from "nanoid";
import { container } from "../../../container/bindings";
import { TYPES } from "../../../container/types";
import {
  FileSizeExceededError,
  InvalidFileTypeError,
} from "../domain/upload.errors";
import { R2Service } from "../external/r2.service";
import { getSignedUploadUrlRoute } from "./upload.routes";

export const uploadController = new OpenAPIHono();

// Get signed upload URL
uploadController.openapi(getSignedUploadUrlRoute, async (c) => {
  const { filename, contentType, size } = c.req.valid("json");
  const r2Service = container.get<R2Service>(TYPES.R2Service);

  if (!r2Service.isValidFileSize(size)) {
    throw new FileSizeExceededError(size, 50 * 1024 * 1024);
  }

  if (!r2Service.isValidMimeType(contentType)) {
    throw new InvalidFileTypeError(contentType);
  }

  const fileExtension = filename.split(".").pop() || "";
  const r2Key = `uploads/${nanoid()}.${fileExtension}`;

  const uploadUrl = await r2Service.generatePresignedUrl(r2Key, contentType);
  return c.json(
    {
      presignedUrl: uploadUrl.presignedUrl,
      objectKey: uploadUrl.key,
      publicFileUrl: uploadUrl.publicFileUrl,
    },
    200,
  );
});
