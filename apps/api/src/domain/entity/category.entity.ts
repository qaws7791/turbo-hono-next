/**
 * 카테고리 엔티티
 * 크리에이터와 스토리를 분류하는 카테고리를 나타냅니다.
 */
export class Category {
  constructor(
    private readonly _id: number,
    private _name: string,
    private _slug: string,
    private _description: string | null,
  ) {}

  // Getters
  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get slug(): string {
    return this._slug;
  }

  get description(): string | null {
    return this._description;
  }

  // Setters with validation
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('카테고리 이름은 비어있을 수 없습니다.');
    }
    this._name = name;
  }

  updateSlug(slug: string): void {
    if (!slug || slug.trim().length === 0) {
      throw new Error('카테고리 슬러그는 비어있을 수 없습니다.');
    }
    
    // 슬러그 형식 검증 (소문자, 숫자, 하이픈만 허용)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      throw new Error('슬러그는 소문자, 숫자, 하이픈만 포함할 수 있습니다.');
    }
    
    this._slug = slug;
  }

  updateDescription(description: string | null): void {
    this._description = description;
  }

  // 팩토리 메서드
  static create(
    name: string,
    slug: string,
    description: string | null = null,
  ): Category {
    if (!name || name.trim().length === 0) {
      throw new Error('카테고리 이름은 비어있을 수 없습니다.');
    }
    
    if (!slug || slug.trim().length === 0) {
      throw new Error('카테고리 슬러그는 비어있을 수 없습니다.');
    }
    
    // 슬러그 형식 검증 (소문자, 숫자, 하이픈만 허용)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      throw new Error('슬러그는 소문자, 숫자, 하이픈만 포함할 수 있습니다.');
    }
    
    return new Category(
      0, // ID는 저장 시 할당
      name,
      slug,
      description,
    );
  }
}
