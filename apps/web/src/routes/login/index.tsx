import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Form } from "@repo/ui/form";
import { Link } from "@repo/ui/link";
import { FormTextField } from "@repo/ui/text-field";
import type React from "react";
import { useState } from "react";

export const Route = createFileRoute("/login/")({
  validateSearch: z.object({
    redirect: z.string().default("/app"),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: search.redirect,
      });
    }
  },
  component: LoginComponent,
});

function LoginComponent() {
  const { auth } = Route.useRouteContext();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await auth.login(email, password);
      navigate({ to: search.redirect });
    } catch {
      setError("로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <Form onSubmit={handleSubmit}>
          <Card className="mx-auto max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">로그인</CardTitle>
              <CardDescription>
                아래에 이메일을 입력하여 로그인을 진행해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <FormTextField
                  type="email"
                  label="이메일"
                  description="이메일을 입력하세요"
                  value={email}
                  onChange={setEmail}
                  isRequired
                />
                <FormTextField
                  type="password"
                  label="비밀번호"
                  description="비밀번호를 입력하세요"
                  value={password}
                  onChange={setPassword}
                  isRequired
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isDisabled={isLoading}
                >
                  로그인
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                >
                  Google로 로그인
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                아직 계정이 없으신가요?
                <Link
                  href="/signup"
                  variant="link"
                >
                  회원가입
                </Link>
              </div>
            </CardContent>
          </Card>
        </Form>
      </div>
    </div>
  );
}
