import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteMaterial as deleteMaterialApi } from "../api/materials.api";
import { materialsQueries } from "../materials.queries";

export function useDeleteMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (materialId: string) => {
      await deleteMaterialApi(materialId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: materialsQueries.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: materialsQueries.counts(),
      });
    },
  });
}
