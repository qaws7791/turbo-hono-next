export class Location {
  constructor(
    public readonly sidoId: number,
    public readonly sigunguId: number,
    public readonly sidoName: string,
    public readonly sigunguName: string,
  ) {}

  getFullName(): string {
    return `${this.sidoName} ${this.sigunguName}`;
  }

  equals(other: Location): boolean {
    return this.sidoId === other.sidoId && this.sigunguId === other.sigunguId;
  }
}
