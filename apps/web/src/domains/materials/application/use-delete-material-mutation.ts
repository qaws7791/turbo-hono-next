import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteMaterial as deleteMaterialApi } from "../api/materials.api";
import { materialsQueries } from "../materials.queries";

export function useDeleteMaterialMutation(spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (materialId: string) => {
      await deleteMaterialApi(materialId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: materialsQueries.listForSpace(spaceId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: materialsQueries.countForSpace(spaceId).queryKey,
      });
    },
  });
}
