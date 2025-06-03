import { createOpenAPI } from "@/api/helpers/openapi";
import { HTTPError } from "@/common/errors/http-error";
import { APIResponse } from "@/common/utils/response";
import { container } from "@/containers";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import { ILocationService } from "@/domain/service/location/location.service.interface";
import * as routes from "./sido.routes";

const locationService = container.get<ILocationService>(DI_SYMBOLS.LocationService);

const platformSido = createOpenAPI();

platformSido.openapi(routes.getSidoList, async (c) => {
  const sidoList = await locationService.getAllSido();
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
  const sigunguList = await locationService.getSigunguBySidoId(Number(sidoId));
  
  return c.json(APIResponse.success(sigunguList.map((sigungu) => ({
    id: sigungu.id,
    sidoId: sigungu.sidoId,
    name: sigungu.name,
  }))));
});

export default platformSido;
