import { OpenAPIHono } from "@hono/zod-openapi";
import changePassword from "./routes/change-password";
import loginWithEmail from "./routes/login-with-email";
import logout from "./routes/logout";
import me from "./routes/me";
import signup from "./routes/signup";

const authApp = new OpenAPIHono();

authApp.route("/", changePassword);
authApp.route("/", loginWithEmail);
authApp.route("/", logout);
authApp.route("/", signup);
authApp.route("/", me);

export default authApp;
