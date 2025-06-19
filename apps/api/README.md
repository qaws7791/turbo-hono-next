
## DTO 종류

- Request[Body]: `EmailRegisterBodyDto`
- Request[Query]: `VerifyEmailQueryDto`
- Request[Params]: `OAuthProviderParamDto`

## service를 추가하는 방법

1. 필요한 서비스를 추가합니다. (inversify를 사용)

```typescript
// service.ts
import { injectable } from "inversify";

@injectable()
export class Service {
  constructor(
    @inject(DI_SYMBOLS.repository) private readonly repository: Repository,
  ) {}
}
```

2. 서비스에 대한 Symbol을 추가합니다.

```typescript
// di-symbols.ts
export const DI_SYMBOLS = {
  service: Symbol("service"),
};
```

3. 서비스를 컨테이너에 추가합니다.

```typescript
// containers/index.ts
container.bind<Service>(DI_SYMBOLS.service).to(Service);
```

4. 서비스를 사용합니다.

```typescript
const service = container.get<Service>(DI_SYMBOLS.service);
```

## api 디렉토리 구조

- api/routes/[플랫폼]/[경로]/[경로]
  - [경로].controller.ts - HTTP 요청 처리
  - [경로].routes.ts - Hono 라우터 정의
  - [경로].validator.ts - `@hono/zod-openapi(zod)` 를 사용한 요청 데이터 검증
  - [경로].index.ts - 전체 내보내기
- api/middlewares
  - [경로].middleware.ts : 전역 미들웨어
- api/libs
  - [경로].ts : api 공통 라이브러리

## application 디렉토리 구조

- application/platform/[서비스]/[서비스].service.ts : 서비스 로직
- application/platform/[서비스]/[서비스]/dtos : 서비스 데이터 전송 객체

## domain 디렉토리 구조

- domain/[도메인]/[도메인].entity.ts : 도메인 엔티티
- domain/[도메인]/[도메인].repository.ts : 도메인 리포지토리
- domain/[도메인]/[도메인].index.ts : 도메인 전체 내보내기
