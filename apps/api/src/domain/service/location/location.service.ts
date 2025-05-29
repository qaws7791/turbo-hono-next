import { HTTPError } from '@/common/errors/http-error';
import { DI_SYMBOLS } from '@/containers/di-symbols';
import status from 'http-status';
import { inject, injectable } from 'inversify';
import type { ISidoRepository } from '../../../infrastructure/database/repository/location/sido.repository.interface';
import type { ISigunguRepository } from '../../../infrastructure/database/repository/location/sigungu.repository.interface';
import { Sido, Sigungu } from '../../entity/location.entity';
import { ILocationService } from './location.service.interface';

/**
 * 위치 서비스 구현
 */
@injectable()
export class LocationService implements ILocationService {
  constructor(
    @inject(DI_SYMBOLS.SidoRepository)
    private sidoRepository: ISidoRepository,
    
    @inject(DI_SYMBOLS.SigunguRepository)
    private sigunguRepository: ISigunguRepository
  ) {}

  /**
   * 모든 시도 목록 조회
   */
  async getAllSido(): Promise<Sido[]> {
    return this.sidoRepository.findAll();
  }

  /**
   * 시도 ID로 시도 조회
   */
  async getSidoById(sidoId: number): Promise<Sido> {
    const sido = await this.sidoRepository.findById(sidoId);
    if (!sido) {
      throw new HTTPError({
        message: '시도를 찾을 수 없습니다.',
      }, status.NOT_FOUND);
    }
    return sido;
  }

  /**
   * 시도에 속한 시군구 목록 조회
   */
  async getSigunguBySidoId(sidoId: number): Promise<Sigungu[]> {
    // 시도 존재 확인
    const sido = await this.sidoRepository.findById(sidoId);
    if (!sido) {
      throw new HTTPError({
        message: '시도를 찾을 수 없습니다.',
      }, status.NOT_FOUND);
    }
    
    return this.sigunguRepository.findBySidoId(sidoId);
  }

  /**
   * 시군구 ID로 시군구 조회
   */
  async getSigunguById(sigunguId: number): Promise<Sigungu> {
    const sigungu = await this.sigunguRepository.findById(sigunguId);
    if (!sigungu) {
      throw new HTTPError({
        message: '시군구를 찾을 수 없습니다.',
      }, status.NOT_FOUND);
    }
    return sigungu;
  }

  /**
   * 시도 생성 (관리자용)
   */
  async createSido(name: string): Promise<Sido> {
    // 이름 중복 확인
    const existingSido = await this.sidoRepository.findByName(name);
    if (existingSido) {
      throw new HTTPError({
        message: '이미 존재하는 시도입니다.',
      }, status.BAD_REQUEST);
    }
    
    const sido = Sido.create(name);
    return this.sidoRepository.create(sido);
  }

  /**
   * 시군구 생성 (관리자용)
   */
  async createSigungu(sidoId: number, name: string): Promise<Sigungu> {
    // 시도 존재 확인
    const sido = await this.sidoRepository.findById(sidoId);
    if (!sido) {
      throw new HTTPError({
        message: '시도를 찾을 수 없습니다.',
      }, status.NOT_FOUND);
    }
    
    // 이름 중복 확인 (같은 시도 내에서)
    const existingSigungu = await this.sigunguRepository.findByNameInSido(sidoId, name);
    if (existingSigungu) {
      throw new HTTPError({
        message: '이미 존재하는 시군구입니다.',
      }, status.BAD_REQUEST);
    }
    
    const sigungu = Sigungu.create(sidoId, name);
    return this.sigunguRepository.create(sigungu);
  }
}
