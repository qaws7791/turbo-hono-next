import { FileObject } from "@/domain/entity/file.entity";
import { IBaseRepository } from "@/infrastructure/database/repository/base.repository.interface";

/**
 * 파일 리포지토리 인터페이스
 * 파일 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface IFileRepository extends IBaseRepository<FileObject> {
    
}