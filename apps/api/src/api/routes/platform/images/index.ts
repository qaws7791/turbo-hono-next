import { createOpenAPI } from "@/api/helpers/openapi";
import { container } from "@/containers";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import { IFileService } from "@/domain/service/file/file.service.interface";
import { nanoid } from "nanoid";
import * as routes from "./images.routes";
const platformImages = createOpenAPI();

const fileService = container.get<IFileService>(DI_SYMBOLS.FileService);
platformImages.openapi(routes.createUploadRequest, async (c) => {
  const userId = c.get("user").id;

  const json = c.req.valid("json");
  console.log("json", json);

  const fileName = nanoid();
  const result = await fileService.prepareUpload(
    userId,
    fileName,
    json.contentType,
    json.size
  );

  return c.json({
    id: result.fileObject.id,
    uploadUrl: result.uploadUrl,
  });
});

platformImages.openapi(routes.completeUpload, async (c) => {
  const userId = c.get("user").id;

  const { id } = await c.req.valid("json");

  await fileService.completeUpload(id,userId);

  return c.json({ message: "Upload completed" });
});

export default platformImages;
