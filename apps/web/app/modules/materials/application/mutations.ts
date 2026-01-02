import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteMaterial } from "../api";

import { uploadMaterial } from "./flows";
import { materialKeys } from "./keys";

import type { ApiError } from "~/modules/api";
import type {
  UploadCompleteAcceptedResponse,
  UploadCompleteCreatedResponse,
} from "../domain";

export function useUploadMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    UploadCompleteCreatedResponse | UploadCompleteAcceptedResponse,
    ApiError,
    { spaceId: string; file: File; title?: string }
  >({
    mutationFn: uploadMaterial,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: materialKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: materialKeys.listBySpace({ spaceId: variables.spaceId }),
      });
    },
  });
}

export function useDeleteMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { materialId: string }>({
    mutationFn: ({ materialId }) => deleteMaterial(materialId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: materialKeys.all });
    },
  });
}
