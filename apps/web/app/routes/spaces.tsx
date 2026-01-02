import {
  SpacesView,
  useCreateSpaceMutation,
  useSpacesQuery,
} from "~/modules/spaces";

export function meta() {
  return [{ title: "스페이스" }];
}

export default function SpacesRoute() {
  const spaces = useSpacesQuery();
  const createSpace = useCreateSpaceMutation();

  return (
    <SpacesView
      spaces={spaces.data ?? []}
      isCreating={createSpace.isPending}
      onCreateSpace={async (input) => {
        await createSpace.mutateAsync({
          name: input.name,
          description: input.description,
        });
      }}
    />
  );
}
