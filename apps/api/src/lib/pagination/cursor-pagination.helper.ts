/**
 * Cursor-based pagination helper
 * Provides utilities for encoding/decoding cursors and building paginated results
 */

/**
 * Input interface for cursor pagination
 */
export interface CursorPaginationInput {
  cursor?: string;
  limit: number;
}

/**
 * Result interface for cursor pagination
 */
export interface CursorPaginationResult<T> {
  items: Array<T>;
  nextCursor: string | null;
  hasNext: boolean;
}

/**
 * Decoded cursor data structure
 */
export interface CursorData {
  id: number;
  value: string | Date;
}

/**
 * Helper class for cursor-based pagination operations
 */
export class CursorPaginationHelper {
  /**
   * Decode a base64-encoded cursor string into cursor data
   * @param cursor - Base64 encoded cursor string
   * @returns Decoded cursor data with id and value
   * @throws Error if cursor format is invalid
   */
  decodeCursor(cursor: string): CursorData {
    try {
      const decoded = Buffer.from(cursor, "base64").toString("utf-8");
      const parsed = JSON.parse(decoded) as Record<string, unknown>;

      if (!parsed.id || !parsed.value) {
        throw new Error("Invalid cursor format");
      }

      return {
        id: parsed.id as number,
        value:
          typeof parsed.value === "string" && !isNaN(Date.parse(parsed.value))
            ? new Date(parsed.value)
            : (parsed.value as string),
      };
    } catch (error) {
      throw new Error(
        `Failed to decode cursor: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Encode cursor data into a base64 string
   * @param data - Cursor data to encode
   * @returns Base64 encoded cursor string
   */
  encodeCursor(data: CursorData): string {
    const cursorData = {
      id: data.id,
      value: data.value instanceof Date ? data.value.toISOString() : data.value,
    };

    return Buffer.from(JSON.stringify(cursorData)).toString("base64");
  }

  /**
   * Create a paginated result from items
   * @param items - Array of items (should include limit + 1 items to check for next page)
   * @param limit - Maximum number of items per page
   * @param getCursorValue - Function to extract cursor value from an item
   * @returns Paginated result with items, nextCursor, and hasNext flag
   */
  createResult<T extends { id: number }>(
    items: Array<T>,
    limit: number,
    getCursorValue: (item: T) => string | Date,
  ): CursorPaginationResult<T> {
    const hasNext = items.length > limit;
    const resultItems = hasNext ? items.slice(0, limit) : items;

    let nextCursor: string | null = null;
    if (hasNext && resultItems.length > 0) {
      const lastItem = resultItems[resultItems.length - 1];
      if (lastItem) {
        nextCursor = this.encodeCursor({
          id: lastItem.id,
          value: getCursorValue(lastItem),
        });
      }
    }

    return {
      items: resultItems,
      nextCursor,
      hasNext,
    };
  }
}

/**
 * Singleton instance for convenience
 */
export const cursorPaginationHelper = new CursorPaginationHelper();
