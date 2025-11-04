import { BaseError } from "../../errors/base.error";
import { ErrorCodes } from "../../errors/error-codes";

/**
 * Error thrown when authorization fails
 */
export class AuthorizationError extends BaseError {
  constructor(message: string) {
    super(403, ErrorCodes.AUTH_FORBIDDEN, message);
  }
}

/**
 * Interface for resources that have ownership
 */
export interface OwnedResource {
  id: number;
  userId: string;
}

/**
 * Helper class for verifying resource ownership
 */
export class OwnershipHelper {
  /**
   * Verify that a resource exists and belongs to the specified user
   * @param resource - Resource to verify (can be null)
   * @param userId - Expected owner's user ID
   * @param resourceName - Name of the resource type for error messages
   * @returns The verified resource
   * @throws AuthorizationError if resource doesn't exist or user doesn't own it
   */
  verifyOwnership<T extends OwnedResource>(
    resource: T | null,
    userId: string,
    resourceName: string,
  ): T {
    if (!resource) {
      throw new AuthorizationError(`${resourceName} not found`);
    }

    if (resource.userId !== userId) {
      throw new AuthorizationError(`Unauthorized access to ${resourceName}`);
    }

    return resource;
  }

  /**
   * Verify ownership for multiple resources at once
   * @param resources - Array of resources to verify
   * @param userId - Expected owner's user ID
   * @param resourceName - Name of the resource type for error messages
   * @returns The verified resources array
   * @throws AuthorizationError if any resource doesn't belong to the user
   */
  verifyBatchOwnership<T extends OwnedResource>(
    resources: Array<T>,
    userId: string,
    resourceName: string,
  ): Array<T> {
    for (const resource of resources) {
      if (resource.userId !== userId) {
        throw new AuthorizationError(`Unauthorized access to ${resourceName}`);
      }
    }

    return resources;
  }

  /**
   * Check if a user owns a resource without throwing
   * @param resource - Resource to check (can be null)
   * @param userId - User ID to check against
   * @returns true if user owns the resource, false otherwise
   */
  isOwner<T extends OwnedResource>(
    resource: T | null,
    userId: string,
  ): boolean {
    return resource !== null && resource.userId === userId;
  }
}

/**
 * Singleton instance for convenience
 */
export const ownershipHelper = new OwnershipHelper();
