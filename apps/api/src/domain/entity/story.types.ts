/**
 * 스토리 상태 열거형
 * 스토리의 상태를 정의합니다.
 */
export enum StoryStatus {
  PUBLISHED = 'published', // 발행됨 (사용자에게 공개)
  HIDDEN = 'hidden',       // 관리자에 의해 숨김
  DELETED = 'deleted',     // (소프트 삭제) 삭제됨
}

/**
 * 스토리 반응 유형 열거형
 * 스토리에 대한 사용자 반응 유형을 정의합니다.
 */
export enum ReactionType {
  LIKE = 'like',
  HEART = 'heart',
  CLAP = 'clap',
  FIRE = 'fire',
  IDEA = 'idea',
}
