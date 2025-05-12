import { createOpenAPI } from "../../helpers/openapi";
import platformAuth from "./auth";

const platformRoutes = createOpenAPI();

platformRoutes.route("/auth", platformAuth);

export default platformRoutes;
