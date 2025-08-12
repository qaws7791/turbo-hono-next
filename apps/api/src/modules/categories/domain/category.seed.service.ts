import { inject, injectable } from "inversify";
import type { ICategoryRepository } from "./category.types";
import { TYPES } from "../../../container/types";
import { DEFAULT_CATEGORIES } from "../../../shared/constants/category.constants";

@injectable()
export class CategorySeedService {
  constructor(
    @inject(TYPES.CategoryRepository)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async seedDefaultCategories(): Promise<void> {
    console.log("🌱 카테고리 시드 데이터 생성을 시작합니다...");

    let createdCount = 0;
    let skippedCount = 0;

    for (const categoryData of DEFAULT_CATEGORIES) {
      try {
        const existingCategory = await this.categoryRepository.findBySlug(
          categoryData.slug,
        );

        if (existingCategory) {
          console.log(`⏭️  카테고리 '${categoryData.name}' 이미 존재함 (건너뛰기)`);
          skippedCount++;
          continue;
        }

        await this.categoryRepository.create({
          name: categoryData.name,
          description: categoryData.description,
          slug: categoryData.slug,
        });

        console.log(`✅ 카테고리 '${categoryData.name}' 생성 완료`);
        createdCount++;
      } catch (error) {
        console.error(
          `❌ 카테고리 '${categoryData.name}' 생성 실패:`,
          error,
        );
        throw error;
      }
    }

    console.log(
      `🎉 카테고리 시드 완료! 생성: ${createdCount}개, 건너뛰기: ${skippedCount}개`,
    );
  }

  async clearAllCategories(): Promise<void> {
    console.log("🗑️  모든 카테고리 데이터를 삭제합니다...");

    const categories = await this.categoryRepository.findAll();
    
    for (const category of categories) {
      await this.categoryRepository.delete(category.id);
      console.log(`🗑️  카테고리 '${category.name}' 삭제 완료`);
    }

    console.log("✅ 모든 카테고리 삭제 완료");
  }

  async reseedCategories(): Promise<void> {
    console.log("🔄 카테고리 데이터를 재생성합니다...");
    
    await this.clearAllCategories();
    await this.seedDefaultCategories();
    
    console.log("🎉 카테고리 재생성 완료!");
  }
}