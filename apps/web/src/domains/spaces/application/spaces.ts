import {
  createSpace,
  getSpace,
  listSpaces,
  updateSpace,
} from "../api/spaces.api";

import type { Space } from "../model/spaces.types";

export async function listSpacesForUi(): Promise<Array<Space>> {
  return listSpaces();
}

export async function getSpaceForUi(spaceId: string): Promise<Space> {
  return getSpace(spaceId);
}

export async function createSpaceForUi(input: {
  name: string;
  description?: string;
}): Promise<Space> {
  return createSpace(input);
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
  return updateSpace(spaceId, input);
}
