import { BaseError } from "../../../shared/errors/base.error";

export class ProjectNotFoundError extends BaseError {
  constructor(projectId: number) {
    super(`Project with id ${projectId} not found`, 404, "PROJECT_NOT_FOUND");
  }
}

export class ProjectAccessDeniedError extends BaseError {
  constructor() {
    super(
      "You do not have permission to access this project",
      403,
      "PROJECT_ACCESS_DENIED",
    );
  }
}

export class ProjectCreatorOnlyError extends BaseError {
  constructor() {
    super("Only creators can create projects", 403, "PROJECT_CREATOR_ONLY");
  }
}

export class ProjectValidationError extends BaseError {
  constructor(message: string) {
    super(message, 400, "PROJECT_VALIDATION_ERROR");
  }
}

export class CategoryNotFoundError extends BaseError {
  constructor(categoryId: number) {
    super(
      `Category with id ${categoryId} not found`,
      404,
      "CATEGORY_NOT_FOUND",
    );
  }
}
