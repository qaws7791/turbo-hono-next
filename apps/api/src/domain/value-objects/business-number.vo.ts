export class BusinessNumber {
  private constructor(private readonly value: string) {}

  static create(businessNumber: string): BusinessNumber {
    if (!this.isValid(businessNumber)) {
      throw new Error("Invalid business number format");
    }
    return new BusinessNumber(businessNumber);
  }

  private static isValid(businessNumber: string): boolean {
    // 한국 사업자등록번호 형식 검증 (XXX-XX-XXXXX)
    const regex = /^\d{3}-\d{2}-\d{5}$/;
    return regex.test(businessNumber);
  }

  getValue(): string {
    return this.value;
  }
}
