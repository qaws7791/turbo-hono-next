export const DI_SYMBOLS = {
  db: Symbol("db"),
  // Repositories
  emailVerificationTokenRepository: Symbol("emailVerificationTokenRepository"),
  userRepository: Symbol("userRepository"),
  accountRepository: Symbol("accountRepository"),
  sessionRepository: Symbol("sessionRepository"),
  objectRepository: Symbol("objectRepository"),
  storyRepository: Symbol("storyRepository"),
  reactionRepository: Symbol("reactionRepository"),
  // Services
  authService: Symbol("authService"),
  objectService: Symbol("objectService"),
  r2Service: Symbol("r2Service"),
  storyService: Symbol("storyService"),
  reactionService: Symbol("reactionService"),
  userService: Symbol("userService"),
  resendService: Symbol("resendService"),
  passwordService: Symbol("passwordService"),
  kakaoOAuthService: Symbol("kakaoOAuthService"),
};
