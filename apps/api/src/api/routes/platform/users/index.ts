import { createOpenAPI } from "@/api/helpers/openapi";
import { APIResponse } from "@/common/utils/response";
import { container } from "@/containers";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import { IUserService } from "@/domain/service/user/user.service.interface";
import status from "http-status";
import * as routes from "./users.routes";

const userService = container.get<IUserService>(DI_SYMBOLS.UserService);

const platformUsers = createOpenAPI();

platformUsers.openapi(routes.getMyInfo, async (c) => {
  const user = c.get("user");
  const myInfo = await userService.getMyInfo(user.id);
  return c.json(APIResponse.success(myInfo),status.OK);
});

platformUsers.openapi(routes.updateMyInfo, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ message: "로그인이 필요합니다." }, 401);
  }
  const json = await c.req.valid("json");
  await userService.updateMyInfo(user.id, json);
  return c.newResponse(null, 204);
});
