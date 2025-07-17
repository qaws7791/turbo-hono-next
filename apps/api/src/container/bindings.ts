import { Container } from "inversify";

import { TYPES } from "./types";

// Import interfaces
import type { AuthRepository } from "../modules/auth/data-access/auth.repository";
import type { SessionRepository } from "../modules/auth/data-access/session.repository";
import type { IUserRepository } from "../modules/users/domain/user.types";

// Import implementations
import { AuthRepositoryImpl } from "../modules/auth/data-access/auth.repository";
import { SessionRepositoryImpl } from "../modules/auth/data-access/session.repository";
import { AuthService } from "../modules/auth/domain/auth.service";
import { KakaoService } from "../modules/auth/external/kakao-oauth.service";
import { MagicLinkService } from "../modules/auth/external/magic-link.service";
import { UploadService } from "../modules/uploads/domain/upload.service";
import { R2Service } from "../modules/uploads/external/r2.service";
import { UserRepository } from "../modules/users/data-access/user.repository";
import {
  IUserService,
  UserService,
} from "../modules/users/domain/user.service";
import { Database, getDatabase } from "../shared/database/connection";

const container = new Container();

// Database binding
container.bind<Database>(TYPES.Database).toDynamicValue(() => getDatabase());

// Repository bindings
container
  .bind<AuthRepository>(TYPES.AuthRepository)
  .to(AuthRepositoryImpl)
  .inSingletonScope();

container
  .bind<SessionRepository>(TYPES.SessionRepository)
  .to(SessionRepositoryImpl)
  .inSingletonScope();

container
  .bind<IUserRepository>(TYPES.UserRepository)
  .to(UserRepository)
  .inSingletonScope();

// Service bindings
container
  .bind<MagicLinkService>(TYPES.MagicLinkService)
  .to(MagicLinkService)
  .inSingletonScope();

container
  .bind<KakaoService>(TYPES.KakaoService)
  .to(KakaoService)
  .inSingletonScope();

container
  .bind<AuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope();

container
  .bind<IUserService>(TYPES.UserService)
  .to(UserService)
  .inSingletonScope();

container
  .bind<UploadService>(TYPES.UploadService)
  .to(UploadService)
  .inSingletonScope();

container.bind<R2Service>(TYPES.R2Service).to(R2Service).inSingletonScope();

export { container };
