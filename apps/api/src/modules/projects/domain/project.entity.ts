export class Project {
  constructor(
    public readonly id: number,
    public readonly creatorId: number,
    public readonly title: string,
    public readonly description: string,
    public readonly coverImage: string | null,
    public readonly status: "draft" | "published",
    public readonly categoryId: number,
    public readonly viewCount: number = 0,
    public readonly storyCount: number = 0,
    public readonly bookmarkCount: number = 0,
    public readonly publishedAt: Date | null = null,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  public isPublished(): boolean {
    return this.status === "published";
  }

  public canEdit(userId: number): boolean {
    return this.creatorId === userId;
  }

  public canView(viewerId?: number): boolean {
    if (this.status === "published") {
      return true;
    }
    return this.creatorId === viewerId;
  }

  public publish(): Project {
    if (this.status === "published") {
      throw new Error("Project is already published");
    }

    return new Project(
      this.id,
      this.creatorId,
      this.title,
      this.description,
      this.coverImage,
      "published",
      this.categoryId,
      this.viewCount,
      this.storyCount,
      this.bookmarkCount,
      new Date(),
      this.createdAt,
      new Date(),
    );
  }

  public incrementViewCount(): Project {
    return new Project(
      this.id,
      this.creatorId,
      this.title,
      this.description,
      this.coverImage,
      this.status,
      this.categoryId,
      this.viewCount + 1,
      this.storyCount,
      this.bookmarkCount,
      this.publishedAt,
      this.createdAt,
      new Date(),
    );
  }

  public updateStoryCount(count: number): Project {
    return new Project(
      this.id,
      this.creatorId,
      this.title,
      this.description,
      this.coverImage,
      this.status,
      this.categoryId,
      this.viewCount,
      count,
      this.bookmarkCount,
      this.publishedAt,
      this.createdAt,
      new Date(),
    );
  }
}
