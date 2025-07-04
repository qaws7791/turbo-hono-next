import createClient from "openapi-fetch";
import { paths } from "../types/api-schema";

export const fetchClient = createClient<paths>({
  baseUrl: "https://api.lolog.site",
});
