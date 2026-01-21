/**
 * 인증 상태에 따른 랜딩 페이지의 primary CTA 링크를 반환합니다.
 */
export function getLandingHref(isAuthenticated: boolean): string {
  return isAuthenticated ? "/home" : "/login";
}
