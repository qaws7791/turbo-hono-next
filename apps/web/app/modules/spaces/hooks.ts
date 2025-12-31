import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


import {
  createSpace,
  deleteSpace,
  fetchSpace,
  fetchSpaces,
  updateSpace,
} from "./api";

import type { CreateSpaceBody, Space, SpaceDetail, UpdateSpaceBody } from "./types";
import type { ApiError } from "~/modules/api";

const spaceKeys = {
  all: ["spaces"] as const,
  list: () => [...spaceKeys.all, "list"] as const,
  detail: (spaceId: string) => [...spaceKeys.all, "detail", spaceId] as const,
};

export function useSpacesQuery() {
  return useQuery<Array<Space>, ApiError>({
    queryKey: spaceKeys.list(),
    queryFn: fetchSpaces,
  });
}

export function useSpaceQuery(spaceId: string) {
  return useQuery<SpaceDetail, ApiError>({
    queryKey: spaceKeys.detail(spaceId),
    queryFn: () => fetchSpace(spaceId),
    enabled: spaceId.length > 0,
  });
}

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
      queryClient.removeQueries({ queryKey: spaceKeys.detail(variables.spaceId) });
      await queryClient.invalidateQueries({ queryKey: spaceKeys.list() });
    },
  });
}

