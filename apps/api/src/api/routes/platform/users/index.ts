import { createOpenAPI } from "@/api/helpers/openapi";
import { UserService } from "@/application/platform/user.service";
import { container } from "@/containers";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import * as routes from "./users.routes";

const userService = container.get<UserService>(DI_SYMBOLS.userService);

const platformUsers = createOpenAPI();

platformUsers.openapi(routes.getMyInfo, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ message: "로그인이 필요합니다." }, 401);
  }
  const myInfo = await userService.getMyInfo(user.id);
  return c.json(myInfo);
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
