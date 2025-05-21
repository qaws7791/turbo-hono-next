import { createOpenAPI } from "@/api/helpers/openapi";
import { ObjectService } from "@/application/platform/object.service";
import { container } from "@/containers";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import * as routes from "./images.routes";
const platformImages = createOpenAPI();

const objectService = container.get<ObjectService>(DI_SYMBOLS.objectService);
platformImages.openapi(routes.createUploadRequest, async (c) => {
  const userId = c.get("user")?.id!;

  const json = c.req.valid("json");
  console.log("json", json);

  const result = await objectService.createUploadRequest({
    userId,
    contentType: json.contentType,
    size: json.size,
    customMetadata: json.customMetadata,
  });

  return c.json(result);
});

platformImages.openapi(routes.completeUpload, async (c) => {
  const userId = c.get("user")?.id!;

  const { id } = await c.req.valid("json");

  await objectService.completeUpload({
    id,
    userId,
  });

  return c.json({ message: "Upload completed" });
});

export default platformImages;
