export class BrandName {
  private constructor(private readonly value: string) {}

  static create(name: string): BrandName {
    if (!name || name.trim().length === 0) {
      throw new Error("Brand name cannot be empty");
    }
    if (name.length > 255) {
      throw new Error("Brand name cannot exceed 255 characters");
    }
    return new BrandName(name.trim());
  }

  getValue(): string {
    return this.value;
  }
}
