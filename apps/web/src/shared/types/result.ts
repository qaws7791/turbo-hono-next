/**
 * Result 타입 - Discriminated Union 패턴
 *
 * 함수의 성공/실패를 타입 안전하게 표현합니다.
 * `Promise<T | null>` 대신 사용하여 에러 정보를 보존합니다.
 *
 * @example
 * ```typescript
 * async function fetchUser(): Promise<Result<User, ApiError>> {
 *   const response = await api.get('/user')
 *   if (response.error) {
 *     return { success: false, error: response.error }
 *   }
 *   return { success: true, data: response.data }
 * }
 *
 * // Type narrowing으로 에러 처리
 * const result = await fetchUser()
 * if (!result.success) {
 *   console.error(result.error)
 *   return
 * }
 * console.log(result.data) // TypeScript가 data 타입을 안다
 * ```
 */

export type Result<TData, TError = Error> =
  | { success: true; data: TData }
  | { success: false; error: TError };

/**
 * 성공 Result 생성 헬퍼
 */
export function success<TData>(data: TData): Result<TData, never> {
  return { success: true, data };
}

/**
 * 실패 Result 생성 헬퍼
 */
export function failure<TError>(error: TError): Result<never, TError> {
  return { success: false, error };
}

/**
 * Result를 unwrap하여 data를 반환하거나 에러를 throw
 * React Query의 queryFn에서 사용하기 적합
 */
export function unwrap<TData, TError>(result: Result<TData, TError>): TData {
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

/**
 * Result의 data를 변환 (functor map)
 */
export function mapResult<TData, TUData, TError>(
  result: Result<TData, TError>,
  fn: (data: TData) => TUData,
): Result<TUData, TError> {
  if (!result.success) {
    return result;
  }
  return { success: true, data: fn(result.data) };
}
