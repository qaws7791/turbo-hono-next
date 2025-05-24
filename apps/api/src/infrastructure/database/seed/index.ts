import { initializeDatabase } from "@/infrastructure/database";
import { categories, sido, sigungu } from "@/infrastructure/database/schema";
import { CategoryInsert } from "@/infrastructure/database/types";
import categoryData from "./categories.json";
import sidoData from "./sido.json";

const db = initializeDatabase();

async function seed() {
  await db.transaction(async (tx) => {
    // Add sido and sigungu data
    for (const sidoItem of sidoData) {
      const { name: sidoName, sigungu: sigunguList } = sidoItem;

      const [sidoRow] = await tx
        .insert(sido)
        .values({
          name: sidoName,
        })
        .returning();

      if (!sidoRow) {
        throw new Error(`Failed to insert sido: ${sidoName}`);
      }

      await tx.insert(sigungu).values(
        sigunguList.map((sigunguItem) => ({
          name: sigunguItem,
          sidoId: sidoRow.id,
        })),
      );
    }
    console.log("Sido and Sigungu data inserted successfully");

    // add categories
    const categoriesList: CategoryInsert[] = categoryData.map((category) => ({
      name: category.name,
      slug: category.slug,
    }));
    await tx.insert(categories).values(categoriesList);
    console.log("Categories data inserted successfully");
  });
}

async function main() {
  try {
    await seed();
    console.log("Seeding completed");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}
main();
