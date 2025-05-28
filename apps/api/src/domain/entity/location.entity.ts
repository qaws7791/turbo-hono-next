/**
 * 시도 엔티티
 * 한국의 행정구역 중 시/도 단위를 나타냅니다.
 */
export class Sido {
  constructor(
    private readonly _id: number,
    private _name: string,
  ) {}

  // Getters
  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  // Setters with validation
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('시도 이름은 비어있을 수 없습니다.');
    }
    this._name = name;
  }

  // 팩토리 메서드
  static create(name: string): Sido {
    if (!name || name.trim().length === 0) {
      throw new Error('시도 이름은 비어있을 수 없습니다.');
    }
    
    return new Sido(
      0, // ID는 저장 시 할당
      name,
    );
  }
}

/**
 * 시군구 엔티티
 * 한국의 행정구역 중 시/군/구 단위를 나타냅니다.
 */
export class Sigungu {
  constructor(
    private readonly _id: number,
    private readonly _sidoId: number,
    private _name: string,
  ) {}

  // Getters
  get id(): number {
    return this._id;
  }

  get sidoId(): number {
    return this._sidoId;
  }

  get name(): string {
    return this._name;
  }

  // Setters with validation
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('시군구 이름은 비어있을 수 없습니다.');
    }
    this._name = name;
  }

  // 팩토리 메서드
  static create(sidoId: number, name: string): Sigungu {
    if (!name || name.trim().length === 0) {
      throw new Error('시군구 이름은 비어있을 수 없습니다.');
    }
    
    return new Sigungu(
      0, // ID는 저장 시 할당
      sidoId,
      name,
    );
  }
}
