import { createOpenAPI } from "@/api/helpers/openapi";
import { CreatorService } from "@/application/platform/creator.service";
import { HTTPError } from "@/common/errors/http-error";
import { container } from "@/containers";
import { DI_SYMBOLS } from "@/containers/di-symbols";
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

export default platformCreators;
