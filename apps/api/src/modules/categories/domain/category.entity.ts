export interface Category {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryEntity implements Category {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string | null,
    public readonly slug: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: {
    name: string;
    description?: string | null;
    slug: string;
  }): Omit<Category, "id" | "createdAt" | "updatedAt"> {
    return {
      name: data.name,
      description: data.description || null,
      slug: data.slug,
    };
  }

  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  update(data: Partial<Pick<Category, "name" | "description" | "slug">>): void {
    // This is a helper method for validation logic
    // Actual updates should be handled by the repository
  }
}