export interface ProjectCreator {
  id: number;
  username: string;
  displayName: string;
  profileImage: string;
  creator: {
    brandName: string;
    region: string;
    category: string;
    socialLinks: Record<string, string> | null;
    description: string | null;
  } | null;
}

export interface ProjectStats {
  storiesCount: number;
  bookmarksCount: number;
  commentsCount: number;
  viewsCount: number;
  isBookmarked?: boolean;
}

export interface ProjectFilters {
  region?: string;
  category?: string;
  search?: string;
  status?: "draft" | "published" | "all";
  sort?: "latest" | "popular";
  creatorId?: number;
}

export interface ProjectListParams {
  cursor?: string; // 마지막 항목의 커서 (created_at timestamp + id)
  limit: number;
  filters: ProjectFilters;
}

export interface CreateProjectData {
  title: string;
  description: string;
  coverImage?: string;
  status?: "draft" | "published";
  categoryId: number;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  coverImage?: string;
  status?: "draft" | "published";
  categoryId?: number;
}
