import { createOpenAPI } from "@/api/helpers/openapi";
import { RegionService } from "@/application/platform/region.service";
import { HTTPError } from "@/common/errors/http-error";
import { APIResponse } from "@/common/utils/response";
import { container } from "@/containers";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import * as routes from "./sido.routes";

const regionService = container.get<RegionService>(DI_SYMBOLS.regionService);

const platformSido = createOpenAPI();

platformSido.openapi(routes.getSidoList, async (c) => {
  const sidoList = await regionService.getAllSido();
  return c.json(APIResponse.success(sidoList));
});

platformSido.openapi(routes.getSigunguList, async (c) => {
  const sidoId = c.req.param("id");
  if (!sidoId || isNaN(Number(sidoId)) || Number(sidoId) <= 0) {
    throw new HTTPError(
      {
        message: "Invalid sidoId parameter. It must be a positive number.",
      },
      400,
    );
  }
  const sigunguList = await regionService.getSigunguBySidoId(Number(sidoId));
  return c.json(APIResponse.success(sigunguList));
});

export default platformSido;
