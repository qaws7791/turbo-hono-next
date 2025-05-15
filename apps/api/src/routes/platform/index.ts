import { createOpenAPI } from "../../helpers/openapi";
import platformAuth from "./auth";
import platformImages from "./images";

const platformRoutes = createOpenAPI();

platformRoutes.route("/auth", platformAuth);
platformRoutes.route("/images", platformImages);

export default platformRoutes;
