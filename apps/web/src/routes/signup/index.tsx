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
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import type React from "react";

export const Route = createFileRoute("/signup/")({
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
  component: SignupComponent,
});

function SignupComponent() {
  const { auth } = Route.useRouteContext();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await auth.signup(email, password, name);
      navigate({ to: search.redirect });
    } catch {
      setError("로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const validPassword = password === passwordConfirm;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <Form onSubmit={handleSubmit}>
          <Card className="mx-auto max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">회원가입</CardTitle>
              <CardDescription>
                아래에 이메일을 입력하여 가입을 진행해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <FormTextField
                  type="text"
                  label="이름"
                  description="이름을 입력하세요"
                  value={name}
                  onChange={setName}
                  isRequired
                />
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
                <FormTextField
                  type="password"
                  label="비밀번호 확인"
                  description="비밀번호를 다시 입력하세요"
                  value={passwordConfirm}
                  onChange={setPasswordConfirm}
                  isRequired
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isDisabled={isLoading || !validPassword}
                >
                  가입하기
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                이미 계정이 있으신가요?
                <Link
                  href="/login"
                  variant="link"
                >
                  로그인
                </Link>
              </div>
            </CardContent>
          </Card>
        </Form>
      </div>
    </div>
  );
}
