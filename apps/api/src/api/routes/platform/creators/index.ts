import { createOpenAPI } from "@/api/helpers/openapi";
import { CreatorService } from "@/application/platform/creator.service";
import { HTTPError } from "@/common/errors/http-error";
import { APIResponse } from "@/common/utils/response";
import { container } from "@/containers";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import status from "http-status";
import * as routes from "./creators.routes";

const creatorService = container.get<CreatorService>(DI_SYMBOLS.creatorService);

const platformCreators = createOpenAPI();

platformCreators.openapi(routes.applyCreator, async (c) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPError(
      {
        message: "사용자 정보가 없습니다.",
      },
      401,
    );
  }

  const body = c.req.valid("json");

  await creatorService.applyCreator(
    user.id,
    body.brandName,
    body.introduction,
    body.businessNumber,
    body.businessName,
    body.ownerName,
    body.sidoId,
    body.sigunguId,
    body.contactInfo,
    body.categoryId,
  );
  return c.json({ message: "크리에이터 신청이 완료되었습니다." }, 201);
});

platformCreators.openapi(routes.getMyCreatorProfile, async (c) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPError(
      {
        message: "사용자 정보가 없습니다.",
      },
      401,
    );
  }

  const profile = await creatorService.getMyCreatorProfile(user.id);
  if (!profile) {
    throw new HTTPError(
      {
        message: "크리에이터 프로필이 없습니다.",
      },
      404,
    );
  }

  return c.json(profile, 200);
});

platformCreators.openapi(routes.updateMyCreatorProfile, async (c) => {
  const user = c.get("user");

  const body = c.req.valid("json");

  await creatorService.updateMyCreatorProfile(user.id, body);

  return c.newResponse(null, status.NO_CONTENT);
})


platformCreators.openapi(routes.getCreator, async (c) => {
  const { id } = c.req.valid("param");

  const profile = await creatorService.getCreatorProfile(id);

  return c.json(APIResponse.success(profile), status.OK);
})

platformCreators.openapi(routes.followCreator, async (c) => {
  const user = c.get("user");

  const { id:creatorId } = c.req.valid("param");

  await creatorService.followCreator(user.id, creatorId);
  return c.json({ message: "크리에이터를 팔로우했습니다." }, 200);
})

platformCreators.openapi(routes.unfollowCreator, async (c) => {
  const user = c.get("user");

  const { id:creatorId } = c.req.valid("param");

  await creatorService.unfollowCreator(user.id, creatorId);
  return c.json({ message: "크리에이터를 언팔로우했습니다." }, 200);
})

export default platformCreators;
