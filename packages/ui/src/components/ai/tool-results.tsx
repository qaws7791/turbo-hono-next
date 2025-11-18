/**
 * Tool별 결과 표시 컴포넌트
 */

import type {
  BulkUpdateTasksOutput,
  CompleteTasksOutput,
  CreateModuleOutput,
  CreateTaskOutput,
  DeleteModuleOutput,
  DeleteTaskOutput,
  GetModuleDetailsOutput,
  GetPlanDetailsOutput,
  GetProgressOutput,
  ListModulesOutput,
  ListTasksOutput,
  UpdateModuleOutput,
  UpdateTaskOutput,
} from "@repo/ai-types";

/**
 * 모듈 생성 결과 표시
 */
export function CreateModuleResult({ result }: { result: CreateModuleOutput }) {
  if (!result.success) {
    return <ErrorResult error={result.error} />;
  }

  return (
    <div className="space-y-2">
      <p className="text-green-700 font-medium">모듈이 생성되었습니다</p>
      <div className="bg-white rounded px-3 py-2 border border-gray-200">
        <p className="font-semibold text-gray-900">{result.data.title}</p>
        {result.data.description && (
          <p className="text-sm text-gray-600 mt-1">
            {result.data.description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * 모듈 수정 결과 표시
 */
export function UpdateModuleResult({ result }: { result: UpdateModuleOutput }) {
  if (!result.success) {
    return <ErrorResult error={result.error} />;
  }

  return (
    <div className="space-y-2">
      <p className="text-green-700 font-medium">모듈이 수정되었습니다</p>
      <div className="bg-white rounded px-3 py-2 border border-gray-200">
        <p className="font-semibold text-gray-900">{result.data.title}</p>
        {result.data.description && (
          <p className="text-sm text-gray-600 mt-1">
            {result.data.description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * 모듈 삭제 결과 표시
 */
export function DeleteModuleResult({ result }: { result: DeleteModuleOutput }) {
  if (!result.success) {
    return <ErrorResult error={result.error} />;
  }

  return (
    <div className="space-y-2">
      <p className="text-orange-700 font-medium">{result.data.message}</p>
    </div>
  );
}

/**
 * 태스크 생성 결과 표시
 */
export function CreateTaskResult({ result }: { result: CreateTaskOutput }) {
  if (!result.success) {
    return <ErrorResult error={result.error} />;
  }

  return (
    <div className="space-y-2">
      <p className="text-green-700 font-medium">태스크가 생성되었습니다</p>
      <div className="bg-white rounded px-3 py-2 border border-gray-200">
        <p className="font-semibold text-gray-900">{result.data.title}</p>
        {result.data.description && (
          <p className="text-sm text-gray-600 mt-1">
            {result.data.description}
          </p>
        )}
        {result.data.dueDate && (
          <p className="text-xs text-gray-500 mt-1">
            마감일: {new Date(result.data.dueDate).toLocaleDateString("ko-KR")}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * 태스크 수정 결과 표시
 */
export function UpdateTaskResult({ result }: { result: UpdateTaskOutput }) {
  if (!result.success) {
    return <ErrorResult error={result.error} />;
  }

  return (
    <div className="space-y-2">
      <p className="text-green-700 font-medium">태스크가 수정되었습니다</p>
      <div className="bg-white rounded px-3 py-2 border border-gray-200">
        <p className="font-semibold text-gray-900">{result.data.title}</p>
        {result.data.isCompleted && (
          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
            완료됨
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * 태스크 삭제 결과 표시
 */
export function DeleteTaskResult({ result }: { result: DeleteTaskOutput }) {
  if (!result.success) {
    return <ErrorResult error={result.error} />;
  }

  return (
    <div className="space-y-2">
      <p className="text-orange-700 font-medium">{result.data.message}</p>
    </div>
  );
}

/**
 * 태스크 완료 결과 표시
 */
export function CompleteTasksResult({
  result,
}: {
  result: CompleteTasksOutput;
}) {
  if (!result.success) {
    return <ErrorResult error={result.error} />;
  }

  return (
    <div className="space-y-2">
      <p className="text-green-700 font-medium">
        {result.data.completedCount}개의 태스크를 완료했습니다
      </p>
      {result.data.results.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
            완료된 태스크 목록 보기
          </summary>
          <ul className="mt-2 space-y-1 ml-4">
            {result.data.results.map((task) => (
              <li
                key={task.id}
                className="text-gray-700"
              >
                • {task.title}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/**
 * 태스크 일괄 수정 결과 표시
 */
export function BulkUpdateTasksResult({
  result,
}: {
  result: BulkUpdateTasksOutput;
}) {
  if (!result.success) {
    return <ErrorResult error={result.error} />;
  }

  return (
    <div className="space-y-2">
      <p className="text-green-700 font-medium">{result.data.message}</p>
      <p className="text-sm text-gray-600">
        {result.data.successCount} / {result.data.totalCount} 성공
      </p>
      {result.data.updatedTasks.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
            수정된 태스크 목록 보기
          </summary>
          <ul className="mt-2 space-y-1 ml-4">
            {result.data.updatedTasks.map((task) => (
              <li
                key={task.id}
                className="text-gray-700"
              >
                • {task.title}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/**
 * 진행률 조회 결과 표시
 */
export function GetProgressResult({ result }: { result: GetProgressOutput }) {
  if (!result.success) {
    return <ErrorResult error={result.error} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-700 font-medium">전체 진행률</span>
        <span className="text-lg font-bold text-blue-600">
          {result.data.progressPercentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${result.data.progressPercentage}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div>
          완료 태스크: {result.data.completedTasks} / {result.data.totalTasks}
        </div>
        <div>전체 모듈: {result.data.totalModules}개</div>
      </div>
    </div>
  );
}

/**
 * 모듈 목록 조회 결과 표시
 */
export function ListModulesResult({ result }: { result: ListModulesOutput }) {
  if (!result.success) {
    return <ErrorResult error={result.error} />;
  }

  return (
    <div className="space-y-2">
      <p className="text-gray-700 font-medium">모듈 {result.data.length}개</p>
      <div className="space-y-2">
        {result.data.map((module) => (
          <div
            key={module.id}
            className="bg-white rounded px-3 py-2 border border-gray-200"
          >
            <p className="font-semibold text-gray-900">{module.title}</p>
            {module.description && (
              <p className="text-sm text-gray-600 mt-1">{module.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 태스크 목록 조회 결과 표시
 */
export function ListTasksResult({ result }: { result: ListTasksOutput }) {
  if (!result.success) {
    return <ErrorResult error={result.error} />;
  }

  return (
    <div className="space-y-2">
      <p className="text-gray-700 font-medium">태스크 {result.data.length}개</p>
      <div className="space-y-2">
        {result.data.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded px-3 py-2 border border-gray-200"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.isCompleted}
                readOnly
                className="rounded"
              />
              <p
                className={`font-semibold ${task.isCompleted ? "text-gray-500 line-through" : "text-gray-900"}`}
              >
                {task.title}
              </p>
            </div>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1 ml-6">
                {task.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 학습 계획 상세 조회 결과 표시
 */
export function GetPlanDetailsResult({
  result,
}: {
  result: GetPlanDetailsOutput;
}) {
  if (!result.success) {
    return <ErrorResult error={result.error} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{result.data.emoji}</span>
        <h3 className="text-lg font-bold text-gray-900">{result.data.title}</h3>
      </div>
      {result.data.description && (
        <p className="text-sm text-gray-600">{result.data.description}</p>
      )}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-600">
          주제: <span className="font-medium">{result.data.learningTopic}</span>
        </div>
        <div className="text-gray-600">
          수준: <span className="font-medium">{result.data.userLevel}</span>
        </div>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
          모듈 {result.data.modules.length}개 보기
        </summary>
        <div className="mt-2 space-y-2">
          {result.data.modules.map((module) => (
            <div
              key={module.id}
              className="bg-white rounded px-3 py-2 border border-gray-200"
            >
              <p className="font-semibold text-gray-900">{module.title}</p>
              <p className="text-xs text-gray-500 mt-1">
                태스크 {module.tasks.length}개
              </p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

/**
 * 모듈 상세 조회 결과 표시
 */
export function GetModuleDetailsResult({
  result,
}: {
  result: GetModuleDetailsOutput;
}) {
  if (!result.success) {
    return <ErrorResult error={result.error} />;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900">{result.data.title}</h3>
      {result.data.description && (
        <p className="text-sm text-gray-600">{result.data.description}</p>
      )}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">
          태스크 {result.data.tasks.length}개
        </p>
        {result.data.tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded px-3 py-2 border border-gray-200"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.isCompleted}
                readOnly
                className="rounded"
              />
              <p
                className={`font-semibold text-sm ${task.isCompleted ? "text-gray-500 line-through" : "text-gray-900"}`}
              >
                {task.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 에러 결과 표시
 */
function ErrorResult({ error }: { error: string }) {
  return (
    <div className="space-y-1">
      <p className="text-red-700 font-medium">오류가 발생했습니다</p>
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );
}
