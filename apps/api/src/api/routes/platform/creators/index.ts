import { createOpenAPI } from "@/api/helpers/openapi";
import { HTTPError } from "@/common/errors/http-error";
import { APIResponse } from "@/common/utils/response";
import { container } from "@/containers";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import { ICreatorService } from "@/domain/service/creator/creator.service.interface";
import status from "http-status";
import * as routes from "./creators.routes";

const creatorService = container.get<ICreatorService>(DI_SYMBOLS.CreatorService);

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
    {
      brandName: body.brandName,
      introduction: body.introduction,
      businessNumber: body.businessNumber,
      businessName: body.businessName,
      ownerName: body.ownerName,
      contactInfo: body.contactInfo,
      sidoId: body.sidoId,
      sigunguId: body.sigunguId,
      categoryId: body.categoryId,
    }
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

  return c.json(APIResponse.success(profile), status.OK);
});

platformCreators.openapi(routes.updateMyCreatorProfile, async (c) => {
  const user = c.get("user");

  const body = c.req.valid("json");

  await creatorService.updateMyCreatorProfile(user.id, body);

  return c.newResponse(null, status.NO_CONTENT);
})


platformCreators.openapi(routes.getCreator, async (c) => {
  const { id } = c.req.valid("param");

  const profile = await creatorService.getCreatorById(id);

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
