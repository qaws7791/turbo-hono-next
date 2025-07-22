import { eq, sql } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../container/types";
import { Database } from "../../../shared/database/connection";
import { categories, projects } from "../../../shared/database/schema";
import { CategoryEntity } from "../domain/category.entity";
import type {
  CreateCategoryParams,
  ICategoryRepository,
  UpdateCategoryParams,
} from "../domain/category.types";

@injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(@inject(TYPES.Database) private readonly db: Database) {}

  private mapToEntity(category: typeof categories.$inferSelect): CategoryEntity {
    return new CategoryEntity(
      category.id,
      category.name,
      category.description,
      category.slug,
      category.createdAt,
      category.updatedAt,
    );
  }

  async findById(id: number): Promise<CategoryEntity | null> {
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!result[0]) return null;
    return this.mapToEntity(result[0]);
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (!result[0]) return null;
    return this.mapToEntity(result[0]);
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1);

    if (!result[0]) return null;
    return this.mapToEntity(result[0]);
  }

  async findAll(): Promise<CategoryEntity[]> {
    const result = await this.db
      .select()
      .from(categories)
      .orderBy(categories.name);

    return result.map((category) => this.mapToEntity(category));
  }

  async create(categoryData: CreateCategoryParams): Promise<CategoryEntity> {
    const newCategoryData = CategoryEntity.create(categoryData);
    const result = await this.db
      .insert(categories)
      .values(newCategoryData)
      .returning();

    const createdCategory = result[0];
    return this.mapToEntity(createdCategory);
  }

  async update(id: number, categoryData: UpdateCategoryParams): Promise<void> {
    await this.db
      .update(categories)
      .set({
        ...categoryData,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id));
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(categories).where(eq(categories.id, id));
  }

  async exists(slug: string): Promise<boolean> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(eq(categories.slug, slug));

    return Number(result[0].count) > 0;
  }

  async existsById(id: number): Promise<boolean> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(eq(categories.id, id));

    return Number(result[0].count) > 0;
  }

  async isUsedByProjects(id: number): Promise<boolean> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.categoryId, id));

    return Number(result[0].count) > 0;
  }
}
