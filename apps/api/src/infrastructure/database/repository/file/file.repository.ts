import { DatabaseError } from "@/common/errors/database-error";
import { FileObject } from "@/domain/entity/file.entity";
import { PaginationOptions, PaginationResult } from "@/domain/service/service.types";
import { IFileRepository } from "@/infrastructure/database/repository/file/file.repository.interface";
import { SortOptions } from "@/infrastructure/database/repository/repository.types";
import { files } from "@/infrastructure/database/schema";
import { and, asc, count, desc, eq, SQL } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import status from "http-status";
import { inject, injectable } from "inversify";

@injectable()
export class FileRepository implements IFileRepository {
    constructor(
        @inject('Database')
        private db: PostgresJsDatabase
    ) {}
    async findById(id: number): Promise<FileObject | null> {
        const [result] = await this.db.select().from(files)
            .where(eq(files.id, id))
            .limit(1);
        
        if (!result) {
            return null;
        }
        
        return this.mapToEntity(result);
    }
    async findAll(filter?: Partial<FileObject> | undefined, sort?: SortOptions<FileObject>[] | undefined): Promise<FileObject[]> {
        const query = this.db.select().from(files);
        const filterSQLs: SQL[] = [];
        const orderSQLs: SQL[] = [];

        if (filter) {
            if (filter.id !== undefined) {
                filterSQLs.push(eq(files.id, filter.id));
            }
            if (filter.userId !== undefined) {
                filterSQLs.push(eq(files.userId, filter.userId));
            }
        }

        if (sort && sort.length > 0) {
            for (const sortOption of sort) {
                switch (sortOption.field) {
                    case 'id':
                        orderSQLs.push(sortOption.order === 'desc' 
                            ? desc(files.id) 
                            : asc(files.id));
                        break;
                    case 'userId':
                        orderSQLs.push(sortOption.order === 'desc' 
                            ? desc(files.userId) 
                            : asc(files.userId));
                        break;
                    case 'createdAt':
                        orderSQLs.push(sortOption.order === 'desc' 
                            ? desc(files.createdAt) 
                            : asc(files.createdAt));
                        break;
                }
            }
        } else {
            // 기본 정렬: ID 오름차순
            orderSQLs.push(asc(files.id));
        }

        const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
        return result.map(this.mapToEntity);
    }
    async findWithPagination(options: PaginationOptions, filter?: Partial<FileObject> | undefined, sort?: SortOptions<FileObject>[] | undefined): Promise<PaginationResult<FileObject>> {
        const {limit, page = 1 } = options;
        const query = this.db.select().from(files).limit(limit).offset((page - 1) * limit);
        const filterSQLs: SQL[] = [];
        const orderSQLs: SQL[] = [];

        // 필터 적용
        if (filter) {
            if (filter.id !== undefined) {
                filterSQLs.push(eq(files.id, filter.id));
            }
            if (filter.userId !== undefined) {
                filterSQLs.push(eq(files.userId, filter.userId));
            }
        }

        // 정렬 적용
        if (sort && sort.length > 0) {
            for (const sortOption of sort) {
                switch (sortOption.field) {
                    case 'id':
                        orderSQLs.push(sortOption.order === 'desc' 
                            ? desc(files.id) 
                            : asc(files.id));
                        break;
                    case 'userId':
                        orderSQLs.push(sortOption.order === 'desc' 
                            ? desc(files.userId) 
                            : asc(files.userId));
                        break;
                    case 'createdAt':
                        orderSQLs.push(sortOption.order === 'desc' 
                            ? desc(files.createdAt) 
                            : asc(files.createdAt));
                        break;
                }
            }
        } else {
            // 기본 정렬: ID 오름차순
            orderSQLs.push(asc(files.id));
        }

        const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
            
        // 결과 변환
        const items = result.map(this.mapToEntity);
        const [countResult] = await this.db.select({ totalCount: count() }).from(files).where(and(...filterSQLs));
        const totalCount = countResult?.totalCount || 0;
                
        // 결과 변환
        const totalPages = Math.ceil(totalCount / limit);
        const currentPage = page;
        const itemsPerPage = limit;
        const nextPage = page < totalPages ? page + 1 : null;
        const prevPage = page > 1 ? page - 1 : null;
                    
        return {
          items,
          totalPages,
          totalItems: totalCount,
          currentPage,
          itemsPerPage,
          nextPage,
          prevPage,
        };

    }
    async create(entity: FileObject): Promise<FileObject> {
        const [result] = await this.db.insert(files).values({
            userId: entity.userId,
            bucket: entity.bucket,
            key: entity.key,
            contentType: entity.contentType,
            size: entity.size,
            isUploaded: entity.isUploaded,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });

        if (!result) {
            throw new DatabaseError('파일 생성 실패', status.INTERNAL_SERVER_ERROR);
        }

        return this.mapToEntity(result);
    }
    async update(entity: FileObject): Promise<FileObject> {
        const [result] = await this.db.update(files).set({
            userId: entity.userId,
            bucket: entity.bucket,
            key: entity.key,
            contentType: entity.contentType,
            size: entity.size,
            isUploaded: entity.isUploaded,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        }).where(eq(files.id, entity.id));

        if (!result) {
            throw new DatabaseError('파일 업데이트 실패', status.INTERNAL_SERVER_ERROR);
        }

        return this.mapToEntity(result);
    }
    async deleteById(id: number): Promise<boolean> {
        const result = await this.db.delete(files).where(eq(files.id, id));
        return result > 0;
    }

    private mapToEntity(model: typeof files.$inferSelect): FileObject {
        return new FileObject(
            model.id,
            model.userId,
            model.bucket,
            model.key,
            model.contentType,
            model.size,
            model.isUploaded,
            model.createdAt,
            model.updatedAt
        );
    }
    
}
