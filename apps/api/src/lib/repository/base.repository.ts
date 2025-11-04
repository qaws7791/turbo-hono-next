import type { DatabaseTransaction } from "../transaction.helper";

/**
 * Base repository interface for common CRUD operations
 * All specific repositories should extend this interface
 *
 * @template TEntity - The entity type (e.g., LearningPlan)
 * @template TInsert - The insert type (e.g., LearningPlanInsert)
 * @template TUpdate - The update type (e.g., LearningPlanUpdate)
 */
export interface BaseRepository<TEntity, TInsert, TUpdate> {
  /**
   * Find an entity by its numeric ID
   * @param id - The numeric ID
   * @param tx - Optional transaction context
   * @returns The entity or null if not found
   */
  findById: (id: number, tx?: DatabaseTransaction) => Promise<TEntity | null>;

  /**
   * Create a new entity
   * @param data - Data to insert
   * @param tx - Optional transaction context
   * @returns The created entity
   */
  create: (data: TInsert, tx?: DatabaseTransaction) => Promise<TEntity>;

  /**
   * Update an existing entity
   * @param id - The entity ID
   * @param data - Data to update
   * @param tx - Optional transaction context
   * @returns The updated entity
   */
  update: (
    id: number,
    data: TUpdate,
    tx?: DatabaseTransaction,
  ) => Promise<TEntity>;

  /**
   * Delete an entity
   * @param id - The entity ID
   * @param tx - Optional transaction context
   * @returns void
   */
  delete: (id: number, tx?: DatabaseTransaction) => Promise<void>;
}

/**
 * Extended repository interface for entities with public IDs
 * Used for user-facing APIs where public IDs are exposed instead of internal IDs
 *
 * @template TEntity - The entity type with publicId field
 * @template TInsert - The insert type
 * @template TUpdate - The update type
 */
export interface PublicIdRepository<TEntity, TInsert, TUpdate>
  extends BaseRepository<TEntity, TInsert, TUpdate> {
  /**
   * Find an entity by its public ID and user ID (for authorization)
   * @param publicId - The public-facing ID (e.g., nanoid or UUID)
   * @param userId - The owner's user ID
   * @param tx - Optional transaction context
   * @returns The entity or null if not found or not owned by user
   */
  findByPublicId: (
    publicId: string,
    userId: string,
    tx?: DatabaseTransaction,
  ) => Promise<TEntity | null>;
}

/**
 * Interface for repositories that support user-scoped queries
 * Used when entities belong to specific users
 *
 * @template TEntity - The entity type with userId field
 */
export interface UserScopedRepository<TEntity> {
  /**
   * Find all entities belonging to a user
   * @param userId - The owner's user ID
   * @param tx - Optional transaction context
   * @returns Array of entities
   */
  findByUserId: (
    userId: string,
    tx?: DatabaseTransaction,
  ) => Promise<Array<TEntity>>;
}
