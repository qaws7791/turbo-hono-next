import { err, ok } from "neverthrow";

import { ListSpacesResponse } from "../space.dto";
import { spaceRepository } from "../space.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { ListSpacesResponse as ListSpacesResponseType } from "../space.dto";

function isoDate(value: Date): string {
  return value.toISOString();
}

type IncludeOption = "activePlan" | "lastStudiedAt";

interface ListSpacesOptions {
  include?: Array<IncludeOption>;
}

export async function listSpaces(
  userId: string,
  options: ListSpacesOptions = {},
): Promise<Result<ListSpacesResponseType, AppError>> {
  const { include = [] } = options;

  // 1. Space 목록 조회
  const listResult = await spaceRepository.listByUserId(userId);
  if (listResult.isErr()) return err(listResult.error);
  const spaces = listResult.value;

  // 2. include가 없으면 기본 정보만 반환
  if (include.length === 0) {
    return ok(
      ListSpacesResponse.parse({
        data: spaces.map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description ?? null,
          icon: row.icon,
          color: row.color,
          createdAt: isoDate(row.createdAt),
          updatedAt: isoDate(row.updatedAt),
        })),
      }),
    );
  }

  // 3. include 옵션이 있으면 추가 데이터 조회
  const includeActivePlan = include.includes("activePlan");
  const includeLastStudiedAt = include.includes("lastStudiedAt");

  // Repository에서 추가 정보를 조회하는 함수 호출
  const enrichedResult = await spaceRepository.listWithIncludes(
    userId,
    spaces.map((s) => s.id),
    {
      includeActivePlan,
      includeLastStudiedAt,
    },
  );

  if (enrichedResult.isErr()) return err(enrichedResult.error);
  const enrichedData = enrichedResult.value;

  return ok(
    ListSpacesResponse.parse({
      data: spaces.map((row) => {
        const enrichment = enrichedData.get(row.id);

        return {
          id: row.id,
          name: row.name,
          description: row.description ?? null,
          icon: row.icon,
          color: row.color,
          createdAt: isoDate(row.createdAt),
          updatedAt: isoDate(row.updatedAt),
          ...(includeActivePlan && {
            activePlan: enrichment?.activePlan ?? null,
          }),
          ...(includeLastStudiedAt && {
            lastStudiedAt: enrichment?.lastStudiedAt
              ? isoDate(enrichment.lastStudiedAt)
              : null,
          }),
        };
      }),
    }),
  );
}
