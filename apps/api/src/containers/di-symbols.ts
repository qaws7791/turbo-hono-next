export const DI_SYMBOLS = {
  DB: Symbol("DB"),
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  AccountRepository: Symbol.for('AccountRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
  EmailVerificationTokenRepository: Symbol.for('EmailVerificationTokenRepository'),
  CreatorRepository: Symbol.for('CreatorRepository'),
  StoryRepository: Symbol.for('StoryRepository'),
  ReactionRepository: Symbol.for('ReactionRepository'),
  FollowRepository: Symbol.for('FollowRepository'),
  CategoryRepository: Symbol.for('CategoryRepository'),
  SidoRepository: Symbol.for('SidoRepository'),
  SigunguRepository: Symbol.for('SigunguRepository'),
  CurationSpotRepository: Symbol.for('CurationSpotRepository'),
  CurationItemRepository: Symbol.for('CurationItemRepository'),
  FileRepository: Symbol.for('FileRepository'),

  // Domain services
  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),
  CreatorService: Symbol.for('CreatorService'),
  StoryService: Symbol.for('StoryService'),
  StoryQueryService: Symbol.for('StoryQueryService'),
  ReactionService: Symbol.for('ReactionService'),
  FollowService: Symbol.for('FollowService'),
  CategoryService: Symbol.for('CategoryService'),
  LocationService: Symbol.for('LocationService'),
  CurationService: Symbol.for('CurationService'),
  FileService: Symbol.for('FileService'),

  // infrastructure services
  R2Service: Symbol.for("R2Service"),
  ResendService: Symbol.for("ResendService"),
  Argon2PasswordService: Symbol.for("Argon2PasswordService"),
  KakaoOAuthService: Symbol.for("KakaoOAuthService"),
};
