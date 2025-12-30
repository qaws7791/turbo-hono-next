import { err, ok } from "neverthrow";

import { ListSpacesResponse } from "../space.dto";
import { spaceRepository } from "../space.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { ListSpacesResponse as ListSpacesResponseType } from "../space.dto";

function isoDate(value: Date): string {
  return value.toISOString();
}

export async function listSpaces(
  userId: string,
): Promise<Result<ListSpacesResponseType, AppError>> {
  // 1. Space 목록 조회
  const listResult = await spaceRepository.listByUserId(userId);
  if (listResult.isErr()) return err(listResult.error);
  const rows = listResult.value;

  return ok(
    ListSpacesResponse.parse({
      data: rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description ?? null,
        icon: row.icon ?? null,
        color: row.color ?? null,
        createdAt: isoDate(row.createdAt),
        updatedAt: isoDate(row.updatedAt),
      })),
    }),
  );
}
