import { toSpaceFromApi } from "../model/mappers";

import type { Space } from "../model/types";

import {
  createSpace,
  getSpace,
  listSpaces,
  updateSpace,
} from "~/foundation/api/spaces";

export async function listSpacesForUi(): Promise<Array<Space>> {
  const spaces = await listSpaces();
  return spaces.map(toSpaceFromApi);
}

export async function getSpaceForUi(spaceId: string): Promise<Space> {
  const space = await getSpace(spaceId);
  return toSpaceFromApi(space);
}

export async function createSpaceForUi(input: {
  name: string;
  description?: string;
}): Promise<Space> {
  const created = await createSpace(input);
  return toSpaceFromApi(created);
}

export async function updateSpaceForUi(
  spaceId: string,
  input: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
  },
): Promise<Space> {
  const updated = await updateSpace(spaceId, input);
  return toSpaceFromApi(updated);
}
