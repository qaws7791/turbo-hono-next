import { Badge } from "@repo/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/breadcrumb";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Input } from "@repo/ui/input";
import { Progress } from "@repo/ui/progress";
import { Separator } from "@repo/ui/separator";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
  PlayCircle,
  RefreshCw,
  SkipForward,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { Link } from "react-router";

import { getPlanGoalLabel } from "../../domain";
import { PlanStatusBadge } from "../components/plan-status-badge";

import type { SpaceDetail } from "~/modules/spaces";
import type {
  PlanDetail,
  PlanStatus,
  UpdatePlanSessionBody,
} from "../../domain";

import { PageBody, PageHeader } from "~/modules/app-shell";

function levelLabel(level: PlanDetail["currentLevel"]): string {
  const labels: Record<PlanDetail["currentLevel"], string> = {
    BEGINNER: "초급",
    INTERMEDIATE: "중급",
    ADVANCED: "고급",
  };
  return labels[level];
}

type SessionStatus = PlanDetail["sessions"][number]["status"];
type SessionType = PlanDetail["sessions"][number]["sessionType"];

function getSessionStatusIcon(status: SessionStatus) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "IN_PROGRESS":
      return <PlayCircle className="h-4 w-4 text-blue-500" />;
    case "SCHEDULED":
      return <Circle className="h-4 w-4 text-muted-foreground" />;
    case "SKIPPED":
      return <SkipForward className="h-4 w-4 text-yellow-500" />;
    case "CANCELED":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
}

function getSessionStatusLabel(status: SessionStatus): string {
  const labels: Record<SessionStatus, string> = {
    COMPLETED: "완료",
    IN_PROGRESS: "진행 중",
    SCHEDULED: "예정",
    SKIPPED: "건너뜀",
    CANCELED: "취소됨",
  };
  return labels[status];
}

function getSessionTypeIcon(sessionType: SessionType) {
  switch (sessionType) {
    case "LEARN":
      return <BookOpen className="h-3.5 w-3.5" />;
    case "REVIEW":
      return <RefreshCw className="h-3.5 w-3.5" />;
    default:
      return <BookOpen className="h-3.5 w-3.5" />;
  }
}

function getSessionTypeLabel(sessionType: SessionType): string {
  return sessionType === "REVIEW" ? "복습" : "학습";
}

// 진행률 섹션
function ProgressSection({ plan }: { plan: PlanDetail }) {
  const progressPercent =
    plan.progress.totalSessions > 0
      ? Math.round(
          (plan.progress.completedSessions / plan.progress.totalSessions) * 100,
        )
      : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">진행률</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {plan.progress.completedSessions} / {plan.progress.totalSessions}{" "}
            세션 처리
          </span>
          <span className="font-medium">{progressPercent}%</span>
        </div>
        <Progress
          value={progressPercent}
          className="h-2"
        />
      </CardContent>
    </Card>
  );
}

// 커리큘럼 섹션
function CurriculumSection({
  plan,
  planHref,
  isSubmitting,
  onUpdateSession,
}: {
  plan: PlanDetail;
  planHref: string;
  isSubmitting: boolean;
  onUpdateSession: (sessionId: string, body: UpdatePlanSessionBody) => void;
}) {
  // 모듈별로 세션을 그룹화
  const sessionsByModule = new Map<string | null, PlanDetail["sessions"]>();

  // 초기화: 모든 모듈에 대해 빈 배열 생성
  for (const module of plan.modules) {
    sessionsByModule.set(module.id, []);
  }
  // moduleId가 null인 세션을 위한 그룹
  sessionsByModule.set(null, []);

  // 세션 분류
  for (const session of plan.sessions) {
    const existing = sessionsByModule.get(session.moduleId) ?? [];
    existing.push(session);
    sessionsByModule.set(session.moduleId, existing);
  }

  // 모듈이 없는 경우 세션만 표시
  if (plan.modules.length === 0 && plan.sessions.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            세션 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SessionList
            sessions={plan.sessions}
            planHref={planHref}
            isSubmitting={isSubmitting}
            onUpdateSession={onUpdateSession}
          />
        </CardContent>
      </Card>
    );
  }

  // 모듈이 있는 경우
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          커리큘럼
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {plan.modules.length === 0 && plan.sessions.length === 0 ? (
          <div className="text-muted-foreground text-sm text-center py-8">
            아직 커리큘럼이 생성되지 않았습니다.
          </div>
        ) : (
          plan.modules.map((module, index) => {
            const moduleSessions = sessionsByModule.get(module.id) ?? [];
            const completedCount = moduleSessions.filter(
              (s) => s.status === "COMPLETED",
            ).length;

            return (
              <div
                key={module.id}
                className="space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-sm">
                      {index + 1}. {module.title}
                    </h4>
                    {module.description && (
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {module.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    {completedCount}/{moduleSessions.length}
                  </Badge>
                </div>
                {moduleSessions.length > 0 ? (
                  <SessionList
                    sessions={moduleSessions}
                    planHref={planHref}
                    isSubmitting={isSubmitting}
                    onUpdateSession={onUpdateSession}
                  />
                ) : (
                  <div className="text-muted-foreground text-xs pl-4">
                    세션이 없습니다.
                  </div>
                )}
                {index < plan.modules.length - 1 && <Separator />}
              </div>
            );
          })
        )}

        {/* moduleId가 null인 세션들 */}
        {(sessionsByModule.get(null)?.length ?? 0) > 0 && (
          <>
            {plan.modules.length > 0 && <Separator />}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">기타 세션</h4>
              <SessionList
                sessions={sessionsByModule.get(null) ?? []}
                planHref={planHref}
                isSubmitting={isSubmitting}
                onUpdateSession={onUpdateSession}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// 세션 목록 컴포넌트
function SessionList({
  sessions,
  planHref,
  isSubmitting,
  onUpdateSession,
}: {
  sessions: PlanDetail["sessions"];
  planHref: string;
  isSubmitting: boolean;
  onUpdateSession: (sessionId: string, body: UpdatePlanSessionBody) => void;
}) {
  const [rescheduleSessionId, setRescheduleSessionId] = React.useState<
    string | null
  >(null);
  const [rescheduleDate, setRescheduleDate] = React.useState<string>("");

  return (
    <ul className="space-y-2 pl-1">
      {sessions.map((session) => {
        const isEditing = session.id === rescheduleSessionId;
        const sessionHref = `/session?sessionId=${session.id}&redirectTo=${encodeURIComponent(
          planHref,
        )}`;

        const canStart =
          session.status === "SCHEDULED" || session.status === "IN_PROGRESS";

        return (
          <li
            key={session.id}
            className="flex items-start gap-3 text-sm group hover:bg-muted/50 rounded-md p-2 -ml-2 transition-colors"
          >
            <div className="mt-0.5">{getSessionStatusIcon(session.status)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={
                    session.status === "COMPLETED"
                      ? "text-muted-foreground line-through"
                      : ""
                  }
                >
                  {session.title}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 gap-1"
                >
                  {getSessionTypeIcon(session.sessionType)}
                  {getSessionTypeLabel(session.sessionType)}
                </Badge>
              </div>
              {session.objective && (
                <p className="text-muted-foreground text-xs mt-0.5 truncate">
                  {session.objective}
                </p>
              )}
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {session.scheduledForDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {session.estimatedMinutes}분
                </span>
                {session.status !== "SCHEDULED" && (
                  <Badge
                    variant={
                      session.status === "COMPLETED"
                        ? "default"
                        : session.status === "IN_PROGRESS"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-[10px] px-1.5 py-0 h-4"
                  >
                    {getSessionStatusLabel(session.status)}
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Input
                    type="date"
                    className="w-40"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={isSubmitting || rescheduleDate.length === 0}
                    onClick={() => {
                      onUpdateSession(session.id, {
                        status: "SCHEDULED",
                        scheduledForDate: rescheduleDate,
                      });
                      setRescheduleSessionId(null);
                    }}
                  >
                    저장
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => setRescheduleSessionId(null)}
                  >
                    취소
                  </Button>
                </div>
              ) : null}
            </div>

            {session.status !== "COMPLETED" ? (
              <div className="flex items-center gap-2">
                {canStart ? (
                  <Button
                    size="sm"
                    disabled={isSubmitting}
                    render={<Link to={sessionHref} />}
                  >
                    {session.status === "IN_PROGRESS" ? "재개" : "시작"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() =>
                      onUpdateSession(session.id, { status: "SCHEDULED" })
                    }
                  >
                    다시 예정
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={isSubmitting}
                      />
                    }
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-44"
                  >
                    <DropdownMenuItem
                      disabled={
                        isSubmitting || session.status === "IN_PROGRESS"
                      }
                      onClick={() => {
                        if (session.status === "IN_PROGRESS") return;
                        setRescheduleSessionId(session.id);
                        setRescheduleDate(session.scheduledForDate);
                      }}
                    >
                      날짜 변경
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    {session.status === "SCHEDULED" ? (
                      <DropdownMenuItem
                        disabled={isSubmitting}
                        onClick={() =>
                          onUpdateSession(session.id, { status: "SKIPPED" })
                        }
                      >
                        건너뜀
                      </DropdownMenuItem>
                    ) : null}

                    {session.status === "SKIPPED" ? (
                      <DropdownMenuItem
                        disabled={isSubmitting}
                        onClick={() =>
                          onUpdateSession(session.id, { status: "SCHEDULED" })
                        }
                      >
                        건너뜀 취소
                      </DropdownMenuItem>
                    ) : null}

                    {session.status !== "IN_PROGRESS" &&
                    session.status !== "CANCELED" ? (
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={isSubmitting}
                        onClick={() =>
                          onUpdateSession(session.id, { status: "CANCELED" })
                        }
                      >
                        취소
                      </DropdownMenuItem>
                    ) : null}

                    {session.status === "CANCELED" ? (
                      <DropdownMenuItem
                        disabled={isSubmitting}
                        onClick={() =>
                          onUpdateSession(session.id, { status: "SCHEDULED" })
                        }
                      >
                        취소 해제
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function PlanDetailView({
  space,
  plan,
  isSubmitting,
  onActivate,
  onSetStatus,
  onUpdateSession,
}: {
  space: SpaceDetail;
  plan: PlanDetail;
  isSubmitting: boolean;
  onActivate: () => void;
  onSetStatus: (status: PlanStatus) => void;
  onUpdateSession: (sessionId: string, body: UpdatePlanSessionBody) => void;
}) {
  const planHref = `/spaces/${space.id}/plan/${plan.id}`;

  return (
    <>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to={`/spaces/${space.id}`} />}>
                {space.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{plan.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeader>

      <PageBody className="mt-24 space-y-6 max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-foreground text-2xl font-semibold">
                {plan.title}
              </h2>
              <PlanStatusBadge status={plan.status} />
            </div>
            <div className="text-muted-foreground text-sm">
              목표 {getPlanGoalLabel(plan.goalType)} · 수준{" "}
              {levelLabel(plan.currentLevel)} · 목표 기한 {plan.targetDueDate}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={onActivate}
              disabled={isSubmitting}
            >
              활성화
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onSetStatus("PAUSED")}
              disabled={isSubmitting}
            >
              일시정지
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onSetStatus("COMPLETED")}
              disabled={isSubmitting}
            >
              완료
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onSetStatus("ARCHIVED")}
              disabled={isSubmitting}
            >
              보관
            </Button>
          </div>
        </div>

        {plan.specialRequirements ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">특별 요구사항</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm whitespace-pre-wrap">
              {plan.specialRequirements}
            </CardContent>
          </Card>
        ) : null}

        {/* 진행률 */}
        <ProgressSection plan={plan} />

        <Separator />

        {/* 커리큘럼 */}
        <CurriculumSection
          plan={plan}
          planHref={planHref}
          isSubmitting={isSubmitting}
          onUpdateSession={onUpdateSession}
        />

        <Separator />

        <div className="space-y-2">
          <div className="text-sm font-medium">다음 할 일</div>
          <div className="text-muted-foreground text-sm">
            홈의 오늘 할 일 큐에서 세션을 시작할 수 있습니다.
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              render={<Link to="/home" />}
            >
              홈으로
            </Button>
            <Button
              variant="outline"
              render={<Link to="/today" />}
            >
              오늘 할 일
            </Button>
          </div>
        </div>
      </PageBody>
    </>
  );
}
