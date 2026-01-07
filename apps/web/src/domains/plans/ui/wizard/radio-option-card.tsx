import { RadioGroupItem } from "@repo/ui/radio-group";

type RadioOptionCardProps = {
  value: string;
  label: string;
  description?: string;
};

/**
 * 라디오 버튼이 있는 옵션 카드 컴포넌트
 * Step 2, 3에서 공통으로 사용
 */
export function RadioOptionCard({
  value,
  label,
  description,
}: RadioOptionCardProps) {
  return (
    <label className="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-xl border p-3">
      <RadioGroupItem value={value} />
      <div className="space-y-0.5">
        <div className="text-sm font-medium">{label}</div>
        {description ? (
          <div className="text-muted-foreground text-xs">{description}</div>
        ) : null}
      </div>
    </label>
  );
}
