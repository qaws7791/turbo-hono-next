import "dotenv/config";
import "reflect-metadata";
import { container } from "../src/container/bindings";
import { TYPES } from "../src/container/types";
import { CategorySeedService } from "../src/modules/categories/domain/category.seed.service";

async function main() {
  try {
    const command = process.argv[2];
    const categorySeeder = container.get<CategorySeedService>(
      TYPES.CategorySeedService,
    );

    switch (command) {
      case "seed":
        await categorySeeder.seedDefaultCategories();
        break;
      case "clear":
        await categorySeeder.clearAllCategories();
        break;
      case "reseed":
        await categorySeeder.reseedCategories();
        break;
      default:
        console.log("사용법:");
        console.log("  pnpm seed:categories seed   - 기본 카테고리 추가");
        console.log("  pnpm seed:categories clear  - 모든 카테고리 삭제");
        console.log("  pnpm seed:categories reseed - 카테고리 재생성");
        process.exit(1);
    }

    console.log("✅ 작업이 완료되었습니다!");
    process.exit(0);
  } catch (error) {
    console.error("❌ 작업 중 오류가 발생했습니다:", error);
    process.exit(1);
  }
}

main();
