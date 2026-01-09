import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Separator } from "@repo/ui/separator";
import { Switch } from "@repo/ui/switch";
import {
  IconBell,
  IconBook,
  IconDatabase,
  IconDownload,
  IconSettings,
  IconTrash,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import * as React from "react";

type SettingsTab = "profile" | "general" | "notification" | "learning" | "data";

interface SettingsState {
  // Profile
  name: string;
  email: string;

  // General
  theme: string;
  accentColor: string;
  reduceMotion: boolean;
  // Notification
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  dailyReminderDays: Array<string>;
  queueNotification: boolean;
  dndEnabled: boolean;
  dndStart: string;
  dndEnd: string;

  // Learning
  sessionLength: string;
  ariStyle: string;
  autoAdaptDifficulty: boolean;
  // Data
  retentionPolicy: string;
}

const defaultSettings: SettingsState = {
  name: "사용자",
  email: "user@example.com",

  theme: "system",
  accentColor: "blue",
  reduceMotion: false,
  dailyReminderEnabled: true,
  dailyReminderTime: "09:00",
  dailyReminderDays: ["월", "화", "수", "목", "금"],
  queueNotification: true,
  dndEnabled: false,
  dndStart: "22:00",
  dndEnd: "08:00",
  sessionLength: "25",
  ariStyle: "coach",
  autoAdaptDifficulty: true,
  retentionPolicy: "forever",
};

// 레이블 변환 함수들
function getThemeLabel(value: string): string {
  const labels: Record<string, string> = {
    light: "라이트",
    dark: "다크",
    system: "시스템",
  };
  return labels[value] ?? value;
}

function getSessionLengthLabel(value: string): string {
  const labels: Record<string, string> = {
    "15": "15분",
    "25": "25분",
    "40": "40분",
  };
  return labels[value] ?? value;
}

function getAriStyleLabel(value: string): string {
  const labels: Record<string, string> = {
    coach: "코치",
    socratic: "소크라테스",
    friendly: "친근한 튜터",
  };
  return labels[value] ?? value;
}

function getRetentionPolicyLabel(value: string): string {
  const labels: Record<string, string> = {
    "30days": "30일",
    "90days": "90일",
    "1year": "1년",
    forever: "영구 보관",
  };
  return labels[value] ?? value;
}

const tabConfig = [
  { key: "profile" as const, label: "프로필", icon: IconUser },
  { key: "general" as const, label: "일반", icon: IconSettings },
  { key: "notification" as const, label: "알림", icon: IconBell },
  { key: "learning" as const, label: "학습", icon: IconBook },
  { key: "data" as const, label: "데이터", icon: IconDatabase },
];

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("profile");
  const [settings, setSettings] =
    React.useState<SettingsState>(defaultSettings);

  const updateSetting = <TKey extends keyof SettingsState>(
    key: TKey,
    value: SettingsState[TKey],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[800px] p-0 gap-0 overflow-hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>설정</DialogTitle>
          <DialogDescription>학습 환경을 조정합니다.</DialogDescription>
        </DialogHeader>

        {/* 헤더 */}
        <div className="flex items-center justify-between pl-4 pr-2 pt-2  md:pl-6 md:pr-4 md:pt-4">
          <h2 className="text-xl font-semibold">설정</h2>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            <IconX className="size-5" />
            <span className="sr-only">닫기</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] h-auto md:h-[600px]">
          {/* 사이드바 네비게이션 */}
          <div className=" md:overflow-y-auto">
            {/* 모바일: 가로 스크롤 탭 */}
            <div className="relative md:hidden">
              {/* 왼쪽 그레디언트 페이드 */}
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-6 bg-gradient-to-r from-background to-transparent" />
              {/* 오른쪽 그레디언트 페이드 */}
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-6 bg-gradient-to-l from-background to-transparent" />
              {/* 스크롤 컨테이너 */}
              <div className="flex gap-1 overflow-x-auto px-2 py-2 scrollbar-none">
                {tabConfig.map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={activeTab === key ? "secondary" : "ghost"}
                    className="shrink-0"
                    size="sm"
                    onClick={() => setActiveTab(key)}
                  >
                    <Icon className="size-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            {/* 데스크탑: 세로 탭 목록 */}
            <div className="hidden md:flex flex-col gap-1 p-3">
              {tabConfig.map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={activeTab === key ? "secondary" : "ghost"}
                  className={`w-full justify-start font-normal ${
                    activeTab === key ? "font-medium" : ""
                  }`}
                  onClick={() => setActiveTab(key)}
                >
                  <Icon className="size-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="overflow-y-auto md:p-6 md:pl-4 p-4 pt-0">
            <div className="max-w-2xl mx-auto">
              {activeTab === "profile" && (
                <ProfileSettings
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}
              {activeTab === "general" && (
                <GeneralSettings
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}
              {activeTab === "notification" && (
                <NotificationSettings
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}
              {activeTab === "learning" && (
                <LearningSettings
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}
              {activeTab === "data" && (
                <DataSettings
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// 프로필 설정
// ============================================
function ProfileSettings({
  settings,
  updateSetting,
}: {
  settings: SettingsState;
  updateSetting: <TKey extends keyof SettingsState>(
    key: TKey,
    value: SettingsState[TKey],
  ) => void;
}) {
  return (
    <SettingSection
      title="프로필"
      description="계정 정보와 사용 환경을 설정합니다."
    >
      <SettingRow
        title="이름"
        description="다른 사용자에게 표시될 이름입니다."
      >
        <Input
          value={settings.name}
          onChange={(e) => updateSetting("name", e.target.value)}
          className="w-40"
        />
      </SettingRow>

      <SettingRow
        title="이메일"
        description="계정에 연결된 이메일입니다. (읽기 전용)"
      >
        <Input
          value={settings.email}
          disabled
          className="w-48 opacity-60"
        />
      </SettingRow>
    </SettingSection>
  );
}

// ============================================
// 일반 설정
// ============================================
function GeneralSettings({
  settings,
  updateSetting,
}: {
  settings: SettingsState;
  updateSetting: <TKey extends keyof SettingsState>(
    key: TKey,
    value: SettingsState[TKey],
  ) => void;
}) {
  const accentColors = [
    { value: "blue", label: "블루", color: "bg-blue-500" },
    { value: "purple", label: "퍼플", color: "bg-purple-500" },
    { value: "green", label: "그린", color: "bg-green-500" },
    { value: "orange", label: "오렌지", color: "bg-orange-500" },
    { value: "pink", label: "핑크", color: "bg-pink-500" },
  ];

  return (
    <SettingSection
      title="일반"
      description="앱의 전반적인 모양과 동작을 설정합니다."
    >
      <SettingRow
        title="테마"
        description="앱의 색상 모드를 선택합니다."
      >
        <Select
          value={settings.theme}
          onValueChange={(val) => val && updateSetting("theme", val)}
        >
          <SelectTrigger className="w-32">
            <SelectValue>{getThemeLabel(settings.theme)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">라이트</SelectItem>
            <SelectItem value="dark">다크</SelectItem>
            <SelectItem value="system">시스템</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow
        title="강조색"
        description="버튼과 링크에 사용될 강조색입니다."
      >
        <div className="flex gap-2">
          {accentColors.map(({ value, color }) => (
            <button
              type="button"
              key={value}
              onClick={() => updateSetting("accentColor", value)}
              className={`size-6 rounded-full ${color} transition-all ${
                settings.accentColor === value
                  ? "ring-2 ring-offset-2 ring-offset-background ring-primary"
                  : "hover:scale-110"
              }`}
              title={value}
            />
          ))}
        </div>
      </SettingRow>

      <SettingRow
        title="모션 감소"
        description="애니메이션과 전환 효과를 줄입니다."
      >
        <Switch
          checked={settings.reduceMotion}
          onCheckedChange={(val) => updateSetting("reduceMotion", val)}
        />
      </SettingRow>
    </SettingSection>
  );
}

// ============================================
// 알림 설정
// ============================================
function NotificationSettings({
  settings,
  updateSetting,
}: {
  settings: SettingsState;
  updateSetting: <TKey extends keyof SettingsState>(
    key: TKey,
    value: SettingsState[TKey],
  ) => void;
}) {
  const weekDays = ["월", "화", "수", "목", "금", "토", "일"];

  const toggleDay = (day: string) => {
    const newDays = settings.dailyReminderDays.includes(day)
      ? settings.dailyReminderDays.filter((d) => d !== day)
      : [...settings.dailyReminderDays, day];
    updateSetting("dailyReminderDays", newDays);
  };

  return (
    <SettingSection
      title="알림"
      description="학습 리마인더와 알림을 관리합니다."
    >
      <SettingRow
        title="데일리 리마인더"
        description="매일 학습 알림을 받습니다."
      >
        <Switch
          checked={settings.dailyReminderEnabled}
          onCheckedChange={(val) => updateSetting("dailyReminderEnabled", val)}
        />
      </SettingRow>

      {settings.dailyReminderEnabled && (
        <>
          <SettingRow
            title="알림 시간"
            description="리마인더를 받을 시간입니다."
          >
            <Input
              type="time"
              value={settings.dailyReminderTime}
              onChange={(e) =>
                updateSetting("dailyReminderTime", e.target.value)
              }
            />
          </SettingRow>

          <SettingRow
            title="알림 요일"
            description="리마인더를 받을 요일을 선택합니다."
          >
            <div className="flex gap-1">
              {weekDays.map((day) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`size-8 rounded-full text-xs font-medium transition-all ${
                    settings.dailyReminderDays.includes(day)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </SettingRow>
        </>
      )}

      <Separator className="my-2" />

      <SettingRow
        title="큐 생성 알림"
        description="새로운 학습 큐가 생성되면 알림을 받습니다."
      >
        <Switch
          checked={settings.queueNotification}
          onCheckedChange={(val) => updateSetting("queueNotification", val)}
        />
      </SettingRow>

      <Separator className="my-2" />

      <SettingRow
        title="방해금지 모드"
        description="특정 시간대에 알림을 차단합니다."
      >
        <Switch
          checked={settings.dndEnabled}
          onCheckedChange={(val) => updateSetting("dndEnabled", val)}
        />
      </SettingRow>

      {settings.dndEnabled && (
        <SettingRow
          title="방해금지 시간"
          description="알림이 차단되는 시간대입니다."
        >
          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={settings.dndStart}
              onChange={(e) => updateSetting("dndStart", e.target.value)}
              className="w-28"
            />
            <span className="text-muted-foreground">~</span>
            <Input
              type="time"
              value={settings.dndEnd}
              onChange={(e) => updateSetting("dndEnd", e.target.value)}
              className="w-28"
            />
          </div>
        </SettingRow>
      )}
    </SettingSection>
  );
}

// ============================================
// 학습 개인화 설정
// ============================================
function LearningSettings({
  settings,
  updateSetting,
}: {
  settings: SettingsState;
  updateSetting: <TKey extends keyof SettingsState>(
    key: TKey,
    value: SettingsState[TKey],
  ) => void;
}) {
  return (
    <SettingSection
      title="학습 개인화"
      description="핵심 설정만 제공합니다. 고급 옵션은 추후 확장됩니다."
    >
      <SettingRow
        title="기본 세션 길이"
        description="15~40분 사이에서 선택합니다."
      >
        <Select
          value={settings.sessionLength}
          onValueChange={(val) => val && updateSetting("sessionLength", val)}
        >
          <SelectTrigger className="w-24">
            <SelectValue>
              {getSessionLengthLabel(settings.sessionLength)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15분</SelectItem>
            <SelectItem value="25">25분</SelectItem>
            <SelectItem value="40">40분</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow
        title="Ari 스타일"
        description="AI 튜터의 대화 스타일을 선택합니다."
      >
        <Select
          value={settings.ariStyle}
          onValueChange={(val) => val && updateSetting("ariStyle", val)}
        >
          <SelectTrigger className="w-32">
            <SelectValue>{getAriStyleLabel(settings.ariStyle)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="coach">코치</SelectItem>
            <SelectItem value="socratic">소크라테스</SelectItem>
            <SelectItem value="friendly">친근한 튜터</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow
        title="난이도 자동 적응"
        description="세션 내 힌트와 설명량에 반영됩니다."
      >
        <Switch
          checked={settings.autoAdaptDifficulty}
          onCheckedChange={(val) => updateSetting("autoAdaptDifficulty", val)}
        />
      </SettingRow>
    </SettingSection>
  );
}

// ============================================
// 데이터 설정
// ============================================
function DataSettings({
  settings,
  updateSetting,
}: {
  settings: SettingsState;
  updateSetting: <TKey extends keyof SettingsState>(
    key: TKey,
    value: SettingsState[TKey],
  ) => void;
}) {
  return (
    <SettingSection
      title="데이터"
      description="문서와 학습 데이터를 관리합니다."
    >
      <SettingRow
        title="문서 보관 정책"
        description="삭제된 문서를 보관하는 기간입니다."
      >
        <Select
          value={settings.retentionPolicy}
          onValueChange={(val) => val && updateSetting("retentionPolicy", val)}
        >
          <SelectTrigger className="w-28">
            <SelectValue>
              {getRetentionPolicyLabel(settings.retentionPolicy)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">30일</SelectItem>
            <SelectItem value="90days">90일</SelectItem>
            <SelectItem value="1year">1년</SelectItem>
            <SelectItem value="forever">영구 보관</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>

      <Separator className="my-4" />

      <SettingRow
        title="데이터 내보내기"
        description="모든 학습 데이터를 JSON 형식으로 다운로드합니다."
      >
        <Button
          variant="outline"
          size="sm"
        >
          <IconDownload className="mr-1" />
          다운로드
        </Button>
      </SettingRow>

      <Separator className="my-4" />

      <div className="border-destructive/30 bg-destructive/5 rounded-xl border p-4">
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium text-destructive">
              위험 구역
            </div>
            <div className="text-muted-foreground text-sm">
              아래 작업은 되돌릴 수 없습니다.
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
          >
            <IconTrash className="mr-1" />
            계정 삭제
          </Button>
        </div>
      </div>
    </SettingSection>
  );
}

// ============================================
// 공통 컴포넌트
// ============================================
function SettingSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-base font-semibold">{title}</div>
        <div className="text-muted-foreground text-sm">{description}</div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-0.5">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-muted-foreground text-xs">{description}</div>
      </div>
      <div className="flex justify-end">{children}</div>
    </div>
  );
}
