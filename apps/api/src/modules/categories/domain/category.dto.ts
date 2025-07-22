import type { Category } from "./category.entity";

export interface CategoryDto {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string | null;
}

export class CategoryDtoMapper {
  static toDto(category: Category): CategoryDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  static toDtoList(categories: Category[]): CategoryDto[] {
    return categories.map(this.toDto);
  }
}