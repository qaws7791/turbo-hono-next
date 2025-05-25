import { createOpenAPI } from "@/api/helpers/openapi";
import platformAuth from "@/api/routes/platform/auth";
import platformCreators from "@/api/routes/platform/creators";
import platformImages from "@/api/routes/platform/images";
import platformSido from "@/api/routes/platform/sido";
import platformStories from "@/api/routes/platform/stories";

const platformRoutes = createOpenAPI();

platformRoutes.route("/auth", platformAuth);
platformRoutes.route("/images", platformImages);
platformRoutes.route("/stories", platformStories);
platformRoutes.route("/creators", platformCreators);
platformRoutes.route("/sido", platformSido);

export default platformRoutes;
