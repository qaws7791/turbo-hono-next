import { createOpenAPI } from "@/api/helpers/openapi";
import platformAuth from "@/api/routes/platform/auth";
import platformImages from "@/api/routes/platform/images";

const platformRoutes = createOpenAPI();

platformRoutes.route("/auth", platformAuth);
platformRoutes.route("/images", platformImages);

export default platformRoutes;
