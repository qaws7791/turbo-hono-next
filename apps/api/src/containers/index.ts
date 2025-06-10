
import { DI_SYMBOLS } from "@/containers/di-symbols";
import { AuthService } from "@/domain/service/auth/auth.service";
import { IAuthService } from "@/domain/service/auth/auth.service.interface";
import { CreatorService } from "@/domain/service/creator/creator.service";
import { FileService } from "@/domain/service/file/file.service";
import { IFileService } from "@/domain/service/file/file.service.interface";
import { LocationService } from "@/domain/service/location/location.service";
import { StoryService } from "@/domain/service/story/story.service";
import { IStoryService } from "@/domain/service/story/story.service.interface";
import { UserService } from "@/domain/service/user/user.service";
import { IUserService } from "@/domain/service/user/user.service.interface";
import { Argon2PasswordService } from "@/infrastructure/auth/argon2password.service";
import { IPasswordService } from "@/infrastructure/auth/password.service.interface";
import { initializeDatabase } from "@/infrastructure/database";
import { AccountRepository } from "@/infrastructure/database/repository/account/account.repository";
import { CreatorRepository } from "@/infrastructure/database/repository/creator/creator.repository";
import { EmailVerificationTokenRepository } from "@/infrastructure/database/repository/email-verification/email-verification.repository";
import { FileRepository } from "@/infrastructure/database/repository/file/file.repository";
import { SidoRepository } from "@/infrastructure/database/repository/location/sido.repository";
import { SigunguRepository } from "@/infrastructure/database/repository/location/sigungu.repository";
import { ReactionRepository } from "@/infrastructure/database/repository/reaction/reaction.repository";
import { SessionRepository } from "@/infrastructure/database/repository/session/session.repository";
import { StoryRepository } from "@/infrastructure/database/repository/story/story.repository";
import { UserRepository } from "@/infrastructure/database/repository/user/user.repository";
import { type DbClient } from "@/infrastructure/database/types";
import { ResendService } from "@/infrastructure/email/resend.service";
import { KakaoOAuthService } from "@/infrastructure/oauth/kakao-oauth.service";
import { R2Service } from "@/infrastructure/storage/r2.service";
import { IR2Service } from "@/infrastructure/storage/r2.service.interface";
import { Container } from "inversify";

export const container = new Container();
const db = initializeDatabase();

// DB
container.bind<DbClient>(DI_SYMBOLS.db).toDynamicValue(() => db);

// Repositories
container
  .bind<EmailVerificationTokenRepository>(
    DI_SYMBOLS.EmailVerificationTokenRepository,
  )
  .to(EmailVerificationTokenRepository);
container.bind<UserRepository>(DI_SYMBOLS.UserRepository).to(UserRepository);
container
  .bind<AccountRepository>(DI_SYMBOLS.AccountRepository)
  .to(AccountRepository);
container
  .bind<SessionRepository>(DI_SYMBOLS.SessionRepository)
  .to(SessionRepository);
container
  .bind<FileRepository>(DI_SYMBOLS.FileRepository)
  .to(FileRepository);
container.bind<StoryRepository>(DI_SYMBOLS.StoryRepository).to(StoryRepository);
container
  .bind<ReactionRepository>(DI_SYMBOLS.ReactionRepository)
  .to(ReactionRepository);
container
  .bind<CreatorRepository>(DI_SYMBOLS.CreatorRepository)
  .to(CreatorRepository);
container.bind<SidoRepository>(DI_SYMBOLS.SidoRepository).to(SidoRepository);
container
  .bind<SigunguRepository>(DI_SYMBOLS.SigunguRepository)
  .to(SigunguRepository);
// Services
container.bind<IAuthService>(DI_SYMBOLS.AuthService).to(AuthService);
container.bind<IFileService>(DI_SYMBOLS.FileService).to(FileService);
container.bind<IR2Service>(DI_SYMBOLS.R2Service).to(R2Service);
container.bind<IStoryService>(DI_SYMBOLS.StoryService).to(StoryService);
container.bind<IUserService>(DI_SYMBOLS.UserService).to(UserService);
container.bind<ResendService>(DI_SYMBOLS.ResendService).to(ResendService);
container.bind<IPasswordService>(DI_SYMBOLS.Argon2PasswordService).to(Argon2PasswordService);
container
  .bind<KakaoOAuthService>(DI_SYMBOLS.KakaoOAuthService)
  .to(KakaoOAuthService);
container
  .bind<CreatorService>(DI_SYMBOLS.CreatorService)
  .to(CreatorService)
  .inSingletonScope();
container.bind<LocationService>(DI_SYMBOLS.LocationService).to(LocationService);
