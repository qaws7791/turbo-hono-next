import { container } from "@/containers";
import { createOpenAPI } from "@/helpers/openapi";
import { ObjectService } from "@/services/object.service";
import * as routes from "./images.routes";
const platformImages = createOpenAPI();

const objectService = container.get<ObjectService>("objectService");
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
