import { Link } from "@/components/link";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI 로드맵 빌더
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            AI의 도움으로 개인화된 학습 로드맵을 생성하세요. 목표, 기술 수준 및
            선호하는 학습 스타일에 맞춘 구조화된 학습 경로를 만들기 위해 AI와
            채팅하세요.
          </p>
        </header>

        <div className="flex justify-center">
          <Link
            to="/login"
            variant="primary"
            size="lg"
          >
            시작하기
          </Link>
        </div>

        <footer className="text-center mt-16 py-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            AI 로드맵 빌더는 AI 기술을 사용하여 개인화된 학습 로드맵을 생성하는
            도구입니다.
          </p>
        </footer>
      </div>
    </div>
  );
}
