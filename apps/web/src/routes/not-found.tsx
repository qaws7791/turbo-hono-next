import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Link } from "react-router";

export function meta() {
  return [{ title: "페이지를 찾을 수 없습니다" }];
}

export default function NotFoundRoute() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>404</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            요청하신 페이지를 찾을 수 없습니다.
          </p>
          <div className="flex gap-2">
            <Button render={<Link to="/" />}>랜딩으로</Button>
            <Button
              variant="outline"
              render={<Link to="/home" />}
            >
              홈으로
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
