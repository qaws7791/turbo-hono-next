import type { CategoryEntity } from "./category.entity";

export interface ICategoryRepository {
  findById(id: number): Promise<CategoryEntity | null>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;
  findByName(name: string): Promise<CategoryEntity | null>;
  findAll(): Promise<CategoryEntity[]>;
  create(categoryData: CreateCategoryParams): Promise<CategoryEntity>;
  update(id: number, categoryData: UpdateCategoryParams): Promise<void>;
  delete(id: number): Promise<void>;
  exists(slug: string): Promise<boolean>;
  existsById(id: number): Promise<boolean>;
}

export interface CreateCategoryParams {
  name: string;
  description?: string | null;
  slug: string;
}

export interface UpdateCategoryParams {
  name?: string;
  description?: string | null;
  slug?: string;
}