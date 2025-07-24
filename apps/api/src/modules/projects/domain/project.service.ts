import { inject, injectable } from "inversify";
import { TYPES } from "../../../container/types";
import { BookmarkRepository } from "../../bookmarks/data-access/bookmark.repository";
import { CategoryRepository } from "../../categories/data-access/category.repository";
import { UserRepository } from "../../users/data-access/user.repository";
import { UserNotFoundError } from "../../users/domain/user.errors";
import { ProjectRepository } from "../data-access/project.repository";
import {
  ProjectDetailDto,
  ProjectDto,
  ProjectListResponseDto,
} from "./project.dto";
import {
  CategoryNotFoundError,
  ProjectAccessDeniedError,
  ProjectCreatorOnlyError,
  ProjectNotFoundError,
} from "./project.errors";
import {
  CreateProjectData,
  ProjectFilters,
  ProjectListParams,
  UpdateProjectData,
} from "./project.types";

export interface IProjectService {
  createProject(
    creatorId: number,
    data: CreateProjectData,
  ): Promise<ProjectDto>;
  updateProject(
    projectId: number,
    userId: number,
    data: UpdateProjectData,
  ): Promise<ProjectDto>;
  deleteProject(projectId: number, userId: number): Promise<void>;
  getProject(projectId: number, viewerId?: number): Promise<ProjectDetailDto>;
  getProjects(
    params: ProjectListParams,
    viewerId?: number,
  ): Promise<ProjectListResponseDto>;
  getUserProjects(
    userId: number,
    creatorId: number,
    params: ProjectListParams,
  ): Promise<ProjectListResponseDto>;
  publishProject(projectId: number, userId: number): Promise<ProjectDto>;
}

@injectable()
export class ProjectService implements IProjectService {
  constructor(
    @inject(TYPES.ProjectRepository)
    private projectRepository: ProjectRepository,
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.CategoryRepository)
    private categoryRepository: CategoryRepository,
    @inject(TYPES.BookmarkRepository)
    private bookmarkRepository: BookmarkRepository,
  ) {}

  async createProject(
    creatorId: number,
    data: CreateProjectData,
  ): Promise<ProjectDto> {
    // Creator 권한 확인
    const user = await this.userRepository.findById(creatorId);
    if (!user || user.role !== "creator") {
      throw new ProjectCreatorOnlyError();
    }

    // 카테고리 존재 확인
    const categoryExists = await this.projectRepository.categoryExists(
      data.categoryId,
    );
    if (!categoryExists) {
      throw new CategoryNotFoundError(data.categoryId);
    }

    return this.projectRepository.create(creatorId, data);
  }

  async updateProject(
    projectId: number,
    userId: number,
    data: UpdateProjectData,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    if (!project.canEdit(userId)) {
      throw new ProjectAccessDeniedError();
    }

    // 카테고리 변경 시 존재 확인
    if (data.categoryId) {
      const categoryExists = await this.projectRepository.categoryExists(
        data.categoryId,
      );
      if (!categoryExists) {
        throw new CategoryNotFoundError(data.categoryId);
      }
    }

    return this.projectRepository.update(projectId, data);
  }

  async deleteProject(projectId: number, userId: number): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    if (!project.canEdit(userId)) {
      throw new ProjectAccessDeniedError();
    }

    await this.projectRepository.delete(projectId);
  }

  async getProject(
    projectId: number,
    viewerId?: number,
  ): Promise<ProjectDetailDto> {
    const projectDetail = await this.projectRepository.findById(projectId);
    if (!projectDetail) {
      throw new ProjectNotFoundError(projectId);
    }

    const projectAuthor = await this.userRepository.findById(
      projectDetail.creatorId,
    );
    if (!projectAuthor) {
      throw new UserNotFoundError();
    }

    if (!projectDetail.canView(viewerId)) {
      throw new ProjectAccessDeniedError();
    }

    const ProjectCategory = await this.categoryRepository.findById(
      projectDetail.categoryId,
    );

    if (!ProjectCategory) {
      throw new CategoryNotFoundError(projectDetail.categoryId);
    }

    // 북마크 여부 확인
    let isBookmarked = false;
    if (viewerId) {
      const bookmark = await this.bookmarkRepository.findByUserAndTarget(
        viewerId,
        projectId,
        "project",
      );
      isBookmarked = !!bookmark;
    }

    return {
      project: projectDetail,
      creator: projectAuthor,
      category: ProjectCategory,
      isBookmarked,
    };
  }

  async getProjects(
    params: ProjectListParams,
    viewerId?: number,
  ): Promise<ProjectListResponseDto> {
    // draft 상태 프로젝트는 작성자만 조회 가능
    if (params.filters.status === "draft" || params.filters.status === "all") {
      if (
        !viewerId ||
        !params.filters.creatorId ||
        params.filters.creatorId !== viewerId
      ) {
        params.filters.status = "published";
      }
    }

    return this.projectRepository.findMany(params, viewerId);
  }

  async getUserProjects(
    userId: number,
    creatorId: number,
    params: ProjectListParams,
  ): Promise<ProjectListResponseDto> {
    // 본인의 프로젝트만 조회 가능
    if (userId !== creatorId) {
      throw new ProjectAccessDeniedError();
    }

    const filters: ProjectFilters = { ...params.filters, creatorId };
    return this.projectRepository.findMany({ ...params, filters }, userId);
  }

  async publishProject(projectId: number, userId: number): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    if (!project.canEdit(userId)) {
      throw new ProjectAccessDeniedError();
    }

    const publishedProject = project.publish();
    return this.projectRepository.update(projectId, {
      status: publishedProject.status,
    });
  }
}
