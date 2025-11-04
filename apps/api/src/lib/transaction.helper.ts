import { db } from "../database/client";

import { log } from "./logger";

/**
 * Type alias for database transaction
 * Uses the inferred type from the database instance
 */
export type DatabaseTransaction = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

/**
 * Callback function type for transaction operations
 */
export type TransactionCallback<T> = (tx: DatabaseTransaction) => Promise<T>;

/**
 * Execute a callback within a database transaction
 * Automatically handles rollback on errors and logs transaction lifecycle
 *
 * @param callback - Async function to execute within transaction
 * @returns The result of the callback
 * @throws Error if transaction fails
 *
 * @example
 * ```typescript
 * const result = await runInTransaction(async (tx) => {
 *   await tx.insert(table).values(data);
 *   return tx.select().from(table);
 * });
 * ```
 */
export async function runInTransaction<T>(
  callback: TransactionCallback<T>,
): Promise<T> {
  try {
    return await db.transaction(async (tx) => {
      try {
        return await callback(tx);
      } catch (error) {
        log.error("Transaction failed, rolling back", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    });
  } catch (error) {
    log.error("Transaction execution failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

/**
 * Execute multiple operations within a single transaction
 * All operations must succeed or all will be rolled back
 *
 * @param operations - Array of transaction callbacks to execute sequentially
 * @returns Array of results from each operation
 * @throws Error if any operation fails
 *
 * @example
 * ```typescript
 * const [user, profile] = await batchInTransaction([
 *   (tx) => tx.insert(users).values(userData).returning(),
 *   (tx) => tx.insert(profiles).values(profileData).returning(),
 * ]);
 * ```
 */
export async function batchInTransaction<T>(
  operations: Array<TransactionCallback<T>>,
): Promise<Array<T>> {
  return runInTransaction(async (tx) => {
    const results: Array<T> = [];
    for (const operation of operations) {
      results.push(await operation(tx));
    }
    return results;
  });
}
