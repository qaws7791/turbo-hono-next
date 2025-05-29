import { HTTPError } from '@/common/errors/http-error';
import { DI_SYMBOLS } from '@/containers/di-symbols';
import status from 'http-status';
import { inject, injectable } from 'inversify';
import type { ICategoryRepository } from '../../../infrastructure/database/repository/category/category.repository.interface';
import { Category } from '../../entity/category.entity';
import { ICategoryService } from './category.service.interface';

/**
 * 카테고리 서비스 구현
 */
@injectable()
export class CategoryService implements ICategoryService {
  constructor(
    @inject(DI_SYMBOLS.CategoryRepository)
    private categoryRepository: ICategoryRepository
  ) {}  

  /**
   * 모든 카테고리 목록 조회
   */
  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  /**
   * 카테고리 ID로 카테고리 조회
   */
  async getCategoryById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new HTTPError({
        message: '카테고리를 찾을 수 없습니다.',
     
      }, status.NOT_FOUND);
    }
    return category;
  }

  /**
   * 카테고리 슬러그로 카테고리 조회
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new HTTPError({
        message: '카테고리를 찾을 수 없습니다.',
       
      }, status.NOT_FOUND);
    }
    return category;
  }

  /**
   * 카테고리 생성 (관리자용)
   */
  async createCategory(name: string, slug: string): Promise<Category> {
    // 이름 중복 확인
    const existingByName = await this.categoryRepository.findByName(name);
    if (existingByName) {
      throw new HTTPError({
        message: '이미 존재하는 카테고리 이름입니다.',
      
      }, status.BAD_REQUEST);
    }

    // 슬러그 중복 확인
    const existingBySlug = await this.categoryRepository.findBySlug(slug);
    if (existingBySlug) {
      throw new HTTPError({
        message: '이미 존재하는 카테고리 슬러그입니다.',
      }, status.BAD_REQUEST);
    }

    const category = Category.create(name, slug);
    return this.categoryRepository.create(category);
  }

  /**
   * 카테고리 수정 (관리자용)
   */
  async updateCategory(
    id: number,
    data: {
      name?: string;
      slug?: string;
    }
  ): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new HTTPError({
        message: '카테고리를 찾을 수 없습니다.',
      }, status.NOT_FOUND);
    }

    // 이름 업데이트
    if (data.name !== undefined) {
      // 이름 중복 확인
      const existingByName = await this.categoryRepository.findByName(data.name);
      if (existingByName && existingByName.id !== id) {
        throw new HTTPError({
          message: '이미 존재하는 카테고리 이름입니다.',
        }, status.BAD_REQUEST);
      }
      category.updateName(data.name);
    }

    // 슬러그 업데이트
    if (data.slug !== undefined) {
      // 슬러그 중복 확인
      const existingBySlug = await this.categoryRepository.findBySlug(data.slug);
      if (existingBySlug && existingBySlug.id !== id) {
        throw new HTTPError({
          message: '이미 존재하는 카테고리 슬러그입니다.',
        }, status.BAD_REQUEST);
      }
      category.updateSlug(data.slug);
    }

    // 저장
    await this.categoryRepository.update(category);
    return category;
  }

  /**
   * 카테고리 삭제 (관리자용)
   */
  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new HTTPError({
        message: '카테고리를 찾을 수 없습니다.',
      }, status.NOT_FOUND);
    }

    // 카테고리 사용 여부 확인 (크리에이터, 스토리)
    const isInUse = await this.categoryRepository.isInUse(id);
    if (isInUse) {
      throw new HTTPError({
        message: '사용 중인 카테고리는 삭제할 수 없습니다.',
      }, status.BAD_REQUEST);
    }

    await this.categoryRepository.deleteById(id);
  }
}
