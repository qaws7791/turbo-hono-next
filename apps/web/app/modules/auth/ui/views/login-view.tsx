import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Separator } from "@repo/ui/separator";
import { Spinner } from "@repo/ui/spinner";
import * as React from "react";
import { Form, Link } from "react-router";

import { formatSeconds } from "../../domain";

import type { LoginActionData } from "../../domain";

import { useCountdown } from "~/hooks/use-countdown";

export function LoginView({
  actionData,
  submittingIntent,
}: {
  actionData: LoginActionData | undefined;
  submittingIntent: string | null;
}) {
  const [forceIdle, setForceIdle] = React.useState(false);
  const view = forceIdle ? "idle" : (actionData?.status ?? "idle");

  const email =
    !forceIdle && view === "sent"
      ? (actionData as { email: string }).email
      : "";

  const errorMessage =
    !forceIdle && actionData?.status === "error" ? actionData.message : null;

  const secondsLeft = useCountdown(30, view === "sent");
  const canResend =
    view === "sent" && secondsLeft === 0 && submittingIntent === null;

  const resetToIdle = () => setForceIdle(true);

  return (
    <div className="bg-background text-foreground min-h-svh">
      <div className="mx-auto grid min-h-svh max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2">
        <Card className="w-full">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">로그인</CardTitle>
            <CardDescription>
              빠르게 시작하고, 학습을 시스템으로 만들어요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {view === "sent" ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-base font-medium">링크를 보냈습니다</div>
                  <div className="text-muted-foreground text-sm">
                    메일함에서 로그인 링크를 클릭하세요. 스팸함/프로모션함도
                    확인해보세요.
                  </div>
                </div>

                <div className="bg-muted rounded-xl p-4">
                  <div className="text-sm">
                    전송됨: <span className="font-medium">{email}</span>
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    다시 보내기까지 {formatSeconds(secondsLeft)}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Form
                    method="post"
                    className="w-full"
                  >
                    <input
                      type="hidden"
                      name="intent"
                      value="magiclink"
                    />
                    <input
                      type="hidden"
                      name="email"
                      value={email}
                    />
                    <Button
                      className="w-full"
                      disabled={!canResend}
                    >
                      {submittingIntent === "magiclink" ? (
                        <>
                          <Spinner className="mr-2" />
                          전송 중
                        </>
                      ) : (
                        "다시 보내기"
                      )}
                    </Button>
                  </Form>
                  <Button
                    className=""
                    variant="outline"
                    onClick={resetToIdle}
                  >
                    이메일 주소 변경
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Form
                  method="post"
                  className="space-y-3"
                >
                  <input
                    type="hidden"
                    name="intent"
                    value="google"
                  />
                  <Button
                    className="w-full"
                    disabled={submittingIntent !== null}
                    nativeButton
                    type="submit"
                  >
                    {submittingIntent === "google" ? (
                      <>
                        <Spinner className="mr-2" />
                        로그인 중
                      </>
                    ) : (
                      "Google로 계속하기"
                    )}
                  </Button>
                </Form>

                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-muted-foreground text-xs">또는</span>
                  <Separator className="flex-1" />
                </div>

                <Form
                  method="post"
                  className="space-y-3"
                >
                  <input
                    type="hidden"
                    name="intent"
                    value="magiclink"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                    {errorMessage ? (
                      <p className="text-destructive text-xs">{errorMessage}</p>
                    ) : null}
                  </div>
                  <Button
                    className="w-full"
                    disabled={submittingIntent !== null}
                    type="submit"
                  >
                    {submittingIntent === "magiclink" ? (
                      <>
                        <Spinner className="mr-2" />
                        전송 중
                      </>
                    ) : (
                      "매직링크 보내기"
                    )}
                  </Button>
                </Form>
              </>
            )}

            <div className="text-muted-foreground space-y-1 text-xs">
              <div>
                계속 진행하면{" "}
                <a
                  href="#"
                  className="hover:text-foreground underline underline-offset-4"
                >
                  이용약관
                </a>
                과{" "}
                <a
                  href="#"
                  className="hover:text-foreground underline underline-offset-4"
                >
                  개인정보처리방침
                </a>
                에 동의하게 됩니다.
              </div>
              <div>
                문의:{" "}
                <a
                  href="#"
                  className="hover:text-foreground underline underline-offset-4"
                >
                  고객지원
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="hidden md:block">
          <div className="bg-muted h-full rounded-2xl" />
        </div>
      </div>

      <div className="text-muted-foreground mx-auto max-w-6xl px-4 pb-10 text-xs">
        <Link
          to="/"
          className="hover:text-foreground underline underline-offset-4"
        >
          랜딩으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
