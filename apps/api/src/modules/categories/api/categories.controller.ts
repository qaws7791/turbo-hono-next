import { OpenAPIHono } from "@hono/zod-openapi";
import { container } from "../../../container/bindings";
import { TYPES } from "../../../container/types";
import { ICategoryService } from "../domain/category.service";
import {
  createCategoryRoute,
  getCategoriesRoute,
  getCategoryRoute,
  getCategoryBySlugRoute,
  updateCategoryRoute,
  deleteCategoryRoute,
} from "./categories.routes";

const app = new OpenAPIHono();

app.openapi(createCategoryRoute, async (c) => {
  const data = c.req.valid("json");

  const categoryService = container.get<ICategoryService>(TYPES.CategoryService);
  const category = await categoryService.createCategory(data);

  return c.json({ data: category }, 201);
});

app.openapi(getCategoriesRoute, async (c) => {
  const categoryService = container.get<ICategoryService>(TYPES.CategoryService);
  const categories = await categoryService.getAllCategories();

  return c.json({ data: categories });
});

app.openapi(getCategoryRoute, async (c) => {
  const { id } = c.req.valid("param");

  const categoryService = container.get<ICategoryService>(TYPES.CategoryService);
  const category = await categoryService.getCategoryById(id);

  return c.json({ data: category });
});

app.openapi(getCategoryBySlugRoute, async (c) => {
  const { slug } = c.req.valid("param");

  const categoryService = container.get<ICategoryService>(TYPES.CategoryService);
  const category = await categoryService.getCategoryBySlug(slug);

  return c.json({ data: category });
});

app.openapi(updateCategoryRoute, async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");

  const categoryService = container.get<ICategoryService>(TYPES.CategoryService);
  const category = await categoryService.updateCategory(id, data);

  return c.json({ data: category });
});

app.openapi(deleteCategoryRoute, async (c) => {
  const { id } = c.req.valid("param");

  const categoryService = container.get<ICategoryService>(TYPES.CategoryService);
  await categoryService.deleteCategory(id);

  return c.body(null, 204);
});

export default app;