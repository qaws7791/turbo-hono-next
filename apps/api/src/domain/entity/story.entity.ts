import { StoryStatus } from './story.types';

/**
 * 스토리 엔티티
 * 크리에이터가 작성한 스토리를 나타냅니다.
 */
export class Story {
  constructor(
    private readonly _id: number,
    private readonly _authorId: number, // 크리에이터 ID
    private _title: string,
    private _content: string,
    private _coverImageUrl: string | null,
    private _categoryId: number | null,
    private _status: StoryStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // Getters
  get id(): number {
    return this._id;
  }

  get authorId(): number {
    return this._authorId;
  }

  get title(): string {
    return this._title;
  }

  get content(): string {
    return this._content;
  }

  get coverImageUrl(): string | null {
    return this._coverImageUrl;
  }

  get categoryId(): number | null {
    return this._categoryId;
  }

  get status(): StoryStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Setters with validation
  updateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('제목은 비어있을 수 없습니다.');
    }
    this._title = title;
    this._updatedAt = new Date();
  }

  updateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('내용은 비어있을 수 없습니다.');
    }
    this._content = content;
    this._updatedAt = new Date();
  }

  updateCoverImage(url: string | null): void {
    this._coverImageUrl = url;
    this._updatedAt = new Date();
  }

  updateCategory(categoryId: number | null): void {
    this._categoryId = categoryId;
    this._updatedAt = new Date();
  }

  // 상태 변경 메서드
  publish(): void {
    this._status = StoryStatus.PUBLISHED;
    this._updatedAt = new Date();
  }

  hide(): void {
    this._status = StoryStatus.HIDDEN;
    this._updatedAt = new Date();
  }

  delete(): void {
    this._status = StoryStatus.DELETED;
    this._updatedAt = new Date();
  }

  // 도메인 로직
  isPublished(): boolean {
    return this._status === StoryStatus.PUBLISHED;
  }

  isHidden(): boolean {
    return this._status === StoryStatus.HIDDEN;
  }

  isDeleted(): boolean {
    return this._status === StoryStatus.DELETED;
  }

  isVisible(): boolean {
    return this.isPublished();
  }

  // 팩토리 메서드
  static create(
    authorId: number,
    title: string,
    content: string,
    coverImageUrl: string | null = null,
    categoryId: number | null = null,
  ): Story {
    if (!title || title.trim().length === 0) {
      throw new Error('제목은 비어있을 수 없습니다.');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('내용은 비어있을 수 없습니다.');
    }

    const now = new Date();
    
    return new Story(
      0, // ID는 저장 시 할당
      authorId,
      title,
      content,
      coverImageUrl,
      categoryId,
      StoryStatus.PUBLISHED, // 생성 시 기본 상태는 발행됨
      now,
      now,
    );
  }
}
