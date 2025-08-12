import { inject, injectable } from "inversify";
import { TYPES } from "../../../container/types";
import { CategoryEntity } from "./category.entity";
import {
  CategoryAlreadyExistsError,
  CategoryNotFoundError,
} from "./category.errors";
import type {
  CreateCategoryParams,
  ICategoryRepository,
  UpdateCategoryParams,
} from "./category.types";

export interface ICategoryService {
  createCategory(data: CreateCategoryParams): Promise<CategoryEntity>;
  getAllCategories(): Promise<CategoryEntity[]>;
  getCategoryById(id: number): Promise<CategoryEntity>;
  getCategoryBySlug(slug: string): Promise<CategoryEntity>;
  updateCategory(
    id: number,
    data: UpdateCategoryParams,
  ): Promise<CategoryEntity>;
  deleteCategory(id: number): Promise<void>;
}

@injectable()
export class CategoryService implements ICategoryService {
  constructor(
    @inject(TYPES.CategoryRepository)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async createCategory(data: CreateCategoryParams): Promise<CategoryEntity> {
    if (data.slug && (await this.categoryRepository.exists(data.slug))) {
      throw new CategoryAlreadyExistsError(data.slug);
    }

    if (!data.slug) {
      data.slug = CategoryEntity.generateSlug(data.name);
    }

    if (await this.categoryRepository.exists(data.slug)) {
      throw new CategoryAlreadyExistsError(data.slug);
    }

    const existingCategory = await this.categoryRepository.findByName(
      data.name,
    );
    if (existingCategory) {
      throw new CategoryAlreadyExistsError(data.slug);
    }

    return await this.categoryRepository.create(data);
  }

  async getAllCategories(): Promise<CategoryEntity[]> {
    return await this.categoryRepository.findAll();
  }

  async getCategoryById(id: number): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundError(id);
    }
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new CategoryNotFoundError(slug);
    }
    return category;
  }

  async updateCategory(
    id: number,
    data: UpdateCategoryParams,
  ): Promise<CategoryEntity> {
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new CategoryNotFoundError(id);
    }

    if (data.name) {
      const categoryWithSameName = await this.categoryRepository.findByName(
        data.name,
      );
      if (categoryWithSameName && categoryWithSameName.id !== id) {
        throw new CategoryAlreadyExistsError(categoryWithSameName.name);
      }
    }

    if (data.slug) {
      if (await this.categoryRepository.exists(data.slug)) {
        const categoryWithSameSlug = await this.categoryRepository.findBySlug(
          data.slug,
        );
        if (categoryWithSameSlug && categoryWithSameSlug.id !== id) {
          throw new CategoryAlreadyExistsError(data.slug);
        }
      }
    }

    await this.categoryRepository.update(id, data);

    const updatedCategory = await this.categoryRepository.findById(id);
    if (!updatedCategory) {
      throw new CategoryNotFoundError(id);
    }

    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new CategoryNotFoundError(id);
    }

    await this.categoryRepository.delete(id);
  }
}
