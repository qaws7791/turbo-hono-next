import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


import { deleteMaterial, fetchSpaceMaterials, uploadMaterial } from "./api";

import type {
  SpaceMaterialsResponse,
  UploadCompleteAcceptedResponse,
  UploadCompleteCreatedResponse,
} from "./types";
import type { ApiError } from "~/modules/api";

const materialKeys = {
  all: ["materials"] as const,
  listBySpace: (input: {
    spaceId: string;
    page?: number;
    limit?: number;
    status?: "PENDING" | "PROCESSING" | "READY" | "FAILED";
    search?: string;
    sort?: string;
  }) =>
    [
      ...materialKeys.all,
      "space",
      input.spaceId,
      "list",
      input.page ?? 1,
      input.limit ?? 20,
      input.status ?? "ALL",
      input.search ?? "",
      input.sort ?? "",
    ] as const,
};

export function useSpaceMaterialsQuery(input: {
  spaceId: string;
  page?: number;
  limit?: number;
  status?: "PENDING" | "PROCESSING" | "READY" | "FAILED";
  search?: string;
  sort?: string;
}) {
  return useQuery<SpaceMaterialsResponse, ApiError>({
    queryKey: materialKeys.listBySpace(input),
    queryFn: () => fetchSpaceMaterials(input),
    enabled: input.spaceId.length > 0,
  });
}

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

