/**
 * 파일 객체 엔티티
 * 사용자가 업로드한 파일 정보를 나타냅니다.
 */
export class FileObject {
  constructor(
    private readonly _id: number,
    private readonly _userId: number,
    private readonly _bucket: string,
    private readonly _key: string,
    private _contentType: string,
    private _size: number,
    private _isUploaded: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // Getters
  get id(): number {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get bucket(): string {
    return this._bucket;
  }

  get key(): string {
    return this._key;
  }

  get contentType(): string {
    return this._contentType;
  }

  get size(): number {
    return this._size;
  }

  get isUploaded(): boolean {
    return this._isUploaded;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateContentType(contentType: string): void {
    if (!contentType || contentType.trim().length === 0) {
      throw new Error('콘텐츠 타입은 비어있을 수 없습니다.');
    }
    this._contentType = contentType;
    this._updatedAt = new Date();
  }

  updateSize(size: number): void {
    if (size < 0) {
      throw new Error('파일 크기는 0보다 작을 수 없습니다.');
    }
    this._size = size;
    this._updatedAt = new Date();
  }

  markAsUploaded(): void {
    this._isUploaded = true;
    this._updatedAt = new Date();
  }

  // 도메인 로직
  isImage(): boolean {
    return this._contentType.startsWith('image/');
  }

  getUrl(): string {
    return `https://${this._bucket}.s3.amazonaws.com/${this._key}`;
  }

  // 팩토리 메서드
  static create(
    userId: number,
    bucket: string,
    key: string,
    contentType: string,
    size: number = 0,
  ): FileObject {
    const now = new Date();
    
    return new FileObject(
      0, // ID는 저장 시 할당
      userId,
      bucket,
      key,
      contentType,
      size,
      false, // 생성 시 기본적으로 업로드 전 상태
      now,
      now,
    );
  }
}
