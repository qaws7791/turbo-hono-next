import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createSpace, deleteSpace, updateSpace } from "../api";

import { spaceKeys } from "./keys";

import type { ApiError } from "~/modules/api";
import type { CreateSpaceBody, SpaceDetail, UpdateSpaceBody } from "../domain";

export function useCreateSpaceMutation() {
  const queryClient = useQueryClient();

  return useMutation<SpaceDetail, ApiError, CreateSpaceBody>({
    mutationFn: createSpace,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: spaceKeys.list() });
    },
  });
}

export function useUpdateSpaceMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    SpaceDetail,
    ApiError,
    { spaceId: string; body: UpdateSpaceBody }
  >({
    mutationFn: updateSpace,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: spaceKeys.list() });
      queryClient.setQueryData(spaceKeys.detail(data.id), data);
    },
  });
}

export function useDeleteSpaceMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { spaceId: string }>({
    mutationFn: ({ spaceId }) => deleteSpace(spaceId),
    onSuccess: async (_, variables) => {
      queryClient.removeQueries({
        queryKey: spaceKeys.detail(variables.spaceId),
      });
      await queryClient.invalidateQueries({ queryKey: spaceKeys.list() });
    },
  });
}
