import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/accordion";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Separator } from "@repo/ui/separator";
import { Link } from "react-router";

import type { ReactNode } from "react";
import type { LandingModel } from "./use-landing-model";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="space-y-2">
        <h2 className="text-foreground text-2xl font-semibold">{title}</h2>
        {subtitle ? (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function LandingView({ model }: { model: LandingModel }) {
  return (
    <div className="bg-background text-foreground min-h-svh">
      <header className="bg-background/70 border-b border-border sticky top-0 z-10 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <Link
            to="/"
            className="font-semibold tracking-tight"
          >
            Learning OS
          </Link>
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              render={<a href="#pricing" />}
            >
              요금제
            </Button>
            <Button render={<Link to={model.primaryHref} />}>
              무료로 시작하기
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <p className="text-muted-foreground text-sm">
                Calm Focus OS · AI 기반 맞춤 학습 로드맵
              </p>
              <h1 className="text-foreground text-4xl font-semibold leading-tight">
                자료만 업로드하세요.
                <br />
                나머지는 AI가 합니다.
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                목표를 말하고 자료를 올리면, AI가 경로를 설계하고 매일 할 일을
                준비합니다. 당신은 매일 한 번만 “시작”을 누르면 됩니다.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button render={<Link to={model.primaryHref} />}>
                  무료로 시작하기
                </Button>
                <Button
                  variant="outline"
                  render={<a href="#how" />}
                >
                  사용법 보기
                </Button>
              </div>
              <div className="text-muted-foreground flex items-center gap-3 text-sm">
                <span>평점 4.9/5.0</span>
                <Separator
                  orientation="vertical"
                  className="h-4"
                />
                <span>사용자 1,200+</span>
                <Separator
                  orientation="vertical"
                  className="h-4"
                />
                <span>학습 시간 절감 35%</span>
              </div>
            </div>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base">앱 프리뷰</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted h-28 rounded-xl" />
                <div className="bg-muted h-28 rounded-xl" />
                <div className="bg-muted h-28 rounded-xl" />
                <p className="text-muted-foreground text-sm">
                  홈에서 오늘 할 일을 확인하고, 세션은 풀스크린 모드에서 몰입해
                  진행합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Section
          title="사용자의 고통을 줄입니다"
          subtitle="학습을 ‘결심’이 아니라 ‘시스템’으로 바꿉니다."
        >
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { title: "무엇부터?", body: "자료는 많은데, 경로가 없습니다." },
              { title: "꾸준함", body: "매번 계획을 세우다 지칩니다." },
              {
                title: "복습",
                body: "기억이 사라지기 전에 챙기기 어렵습니다.",
              },
              { title: "정리", body: "노트 노동이 학습을 대체합니다." },
            ].map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  {item.body}
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          title="해결책은 4가지"
          subtitle="선택을 줄이고, 실행을 늘립니다."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "자동 경로 설계",
                body: "자료를 분석해 모듈/세션 단위로 학습 경로를 구성합니다.",
              },
              {
                title: "적응형 세션",
                body: "세션 내에서 자연스럽게 이해도를 확인하고 맞춤 힌트를 제공합니다.",
              },
              {
                title: "복습 자동화",
                body: "간격 반복 학습 기반으로 복습을 자동 스케줄링합니다.",
              },
              {
                title: "지식 아카이브",
                body: "배운 내용을 개념으로 자동 정리해 검색 중심으로 제공합니다.",
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  {item.body}
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          title="준비 과정"
          subtitle="4단계로 시작합니다."
        >
          <div
            id="how"
            className="grid gap-4 md:grid-cols-4"
          >
            {[
              { title: "1) 자료 업로드", body: "PDF/URL/텍스트를 올립니다." },
              {
                title: "2) 분석 및 설계",
                body: "AI가 구조와 개념을 추출합니다.",
              },
              {
                title: "3) 학습 계획 생성",
                body: "목표/수준을 고르면 즉시 생성됩니다.",
              },
              { title: "4) 매일 시작", body: "Home에서 ‘시작’만 누릅니다." },
            ].map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  {item.body}
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          title="과학적 근거"
          subtitle="학습 과학의 4원리를 반영합니다."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {["간격 반복 학습", "인지 부하 이론", "인출 연습", "지식 추적"].map(
              (item) => (
                <Card key={item}>
                  <CardContent className="flex items-center justify-between p-6">
                    <span className="font-medium">{item}</span>
                    <span className="text-muted-foreground text-sm">
                      적용됨
                    </span>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </Section>

        <Section
          title="요금제"
          subtitle="무료로 시작하고, 필요할 때 업그레이드합니다."
        >
          <div
            id="pricing"
            className="grid gap-4 md:grid-cols-3"
          >
            {[
              {
                title: "무료",
                price: "₩0",
                items: ["스페이스 2개", "문서 10개", "기본 학습 계획/세션"],
                cta: "무료로 시작하기",
              },
              {
                title: "프로",
                price: "₩19,000",
                items: ["무제한 스페이스", "고급 세션 개인화", "우선 지원"],
                cta: "프로 시작하기",
              },
              {
                title: "팀",
                price: "문의",
                items: ["팀 스페이스", "공유 아카이브", "관리/보안 옵션"],
                cta: "문의하기",
              },
            ].map((tier) => (
              <Card key={tier.title}>
                <CardHeader>
                  <CardTitle className="text-base">{tier.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-semibold">{tier.price}</div>
                  <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-sm">
                    {tier.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    render={<Link to={model.primaryHref} />}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          title="FAQ"
          subtitle="자주 묻는 질문 5개"
        >
          <Accordion
            defaultValue={[]}
            className="w-full"
          >
            {[
              {
                q: "자료를 업로드하면 학습 계획이 자동으로 바뀌나요?",
                a: "아니요. 업로드는 저장/분석만 합니다. 학습 계획은 사용자가 명시적으로 생성합니다.",
              },
              {
                q: "복습은 어떻게 동작하나요?",
                a: "간격 반복 학습 기반으로 복습 필요도를 계산해 큐에 반영합니다.",
              },
              {
                q: "세션 상세 페이지가 있나요?",
                a: "별도의 세션 상세 페이지 대신, 세션 요약 카드와 개념 라이브러리로 복습합니다.",
              },
              {
                q: "데이터는 안전한가요?",
                a: "정책과 접근 제어를 기반으로 설계하며, 이 데모는 로컬 mock 데이터로 동작합니다.",
              },
              {
                q: "모바일도 지원하나요?",
                a: "모바일 우선으로 설계하며, 사이드바는 모바일에서 Sheet로 동작합니다.",
              },
            ].map((item) => (
              <AccordionItem
                key={item.q}
                value={item.q}
              >
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>

        <Section
          title="지금 시작하세요"
          subtitle="무료입니다."
        >
          <Card className="bg-card">
            <CardContent className="flex flex-col items-start justify-between gap-4 p-8 md:flex-row md:items-center">
              <div className="space-y-1">
                <div className="text-xl font-semibold">
                  오늘 할 일은 AI가 준비합니다
                </div>
                <div className="text-muted-foreground text-sm">
                  목표 말하기 → 자료 업로드 → 학습 계획 생성 → 매일 시작
                </div>
              </div>
              <Button
                size="lg"
                render={<Link to={model.primaryHref} />}
              >
                무료로 시작하기
              </Button>
            </CardContent>
          </Card>
        </Section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="font-semibold">Learning OS</div>
            <div className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} Learning OS.
            </div>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
            <a
              href="#"
              className="hover:text-foreground"
            >
              소개
            </a>
            <a
              href="#"
              className="hover:text-foreground"
            >
              이용약관
            </a>
            <a
              href="#"
              className="hover:text-foreground"
            >
              개인정보처리방침
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
