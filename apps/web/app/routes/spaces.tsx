import { useNavigate, useSearchParams } from "react-router";

import {
  SpacesView,
  useCreateSpaceMutation,
  useSpacesModel,
  useSpacesQuery,
} from "~/modules/spaces";

export function meta() {
  return [{ title: "스페이스" }];
}

export default function SpacesRoute() {
  const navigate = useNavigate();
  const spaces = useSpacesQuery();
  const createSpace = useCreateSpaceMutation();
  const [searchParams, setSearchParams] = useSearchParams();

  const model = useSpacesModel({
    spaces:
      spaces.data?.map((space) => ({
        id: space.id,
        name: space.name,
        description: space.description,
        icon: space.icon,
        color: space.color,
        createdAt: space.createdAt,
      })) ?? [],
    searchParams,
    setSearchParams: (next) => setSearchParams(next, { replace: true }),
  });

  return (
    <SpacesView
      model={model}
      isCreating={createSpace.isPending}
      onCreateSpace={(input) => {
        createSpace.mutate(
          { name: input.name, description: input.description },
          {
            onSuccess: (space) => {
              model.closeCreate();
              navigate(`/spaces/${space.id}`);
            },
          },
        );
      }}
    />
  );
}
