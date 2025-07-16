import { OpenAPIHono } from "@hono/zod-openapi";
import { container } from "../../../container/bindings";
import { TYPES } from "../../../container/types";
import { AuthContext } from "../../auth/domain/auth.types";
import { UserService } from "../domain/user.service";
import {
  becomeCreator,
  followUser,
  unfollowUser,
  updateMyProfile,
  viewMyProfile,
  viewUserProfile,
} from "./users.routes";
const userController = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>();

userController.openapi(viewMyProfile, async (c) => {
  const { userId } = c.get("auth");
  const userService = container.get<UserService>(TYPES.UserService);
  const user = await userService.getUserById(userId);
  return c.json(user, 200);
});
userController.openapi(updateMyProfile, async (c) => {
  const { userId } = c.get("auth");
  const json = c.req.valid("json");
  const userService = container.get<UserService>(TYPES.UserService);
  await userService.updateUser(userId, json, userId);
  return new Response(undefined, { status: 204 });
});
userController.openapi(becomeCreator, async (c) => {
  const { userId } = c.get("auth");
  const json = c.req.valid("json");
  const userService = container.get<UserService>(TYPES.UserService);
  await userService.becomeCreator(userId, json, userId);
  return new Response(undefined, { status: 204 });
});
userController.openapi(viewUserProfile, async (c) => {
  const { id } = c.req.valid("param");
  const userService = container.get<UserService>(TYPES.UserService);
  const user = await userService.getUserPublic(id);
  return c.json(user, 200);
});
userController.openapi(followUser, async (c) => {
  const { userId } = c.get("auth");
  const { id } = c.req.valid("param");
  const userService = container.get<UserService>(TYPES.UserService);
  await userService.followUser(userId, id);
  return new Response(undefined, { status: 204 });
});
userController.openapi(unfollowUser, async (c) => {
  const { userId } = c.get("auth");
  const { id } = c.req.valid("param");
  const userService = container.get<UserService>(TYPES.UserService);
  await userService.unfollowUser(userId, id);
  return new Response(undefined, { status: 204 });
});

export default userController;
