import { BaseError } from "../../../shared/errors/base.error";

export class CategoryNotFoundError extends BaseError {
  constructor(identifier: string | number) {
    super(
      `Category with ${typeof identifier === "string" ? "slug" : "id"} '${identifier}' not found`,
      404,
      "CategoryNotFoundError",
    );
  }
}

export class CategoryAlreadyExistsError extends BaseError {
  constructor(slug: string) {
    super(`Category with slug '${slug}' already exists`, 409, "CategoryAlreadyExistsError");
  }
}

export class InvalidCategoryDataError extends BaseError {
  constructor(message: string) {
    super(`Invalid category data: ${message}`, 400, "InvalidCategoryDataError");
  }
}

export class CategoryInUseError extends BaseError {
  constructor(categoryId: number) {
    super(
      `Category with id '${categoryId}' cannot be deleted as it is being used by projects`,
      409,
      "CategoryInUseError",
    );
  }
}