interface ReasoningDisplayProps {
  reasoning: string;
}

export const ReasoningDisplay = ({ reasoning }: ReasoningDisplayProps) => {
  if (!reasoning) return null;

  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <p className="text-sm font-medium text-purple-900 mb-1">
        💡 AI 추천 이유
      </p>
      <p className="text-sm text-purple-700">{reasoning}</p>
    </div>
  );
};
