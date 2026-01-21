import * as React from "react";
// Components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Checkbox } from "@repo/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/empty";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui/hover-card";
import { Input } from "@repo/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from "@repo/ui/input-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@repo/ui/item";
import { Kbd } from "@repo/ui/kbd";
import { Label } from "@repo/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { Progress } from "@repo/ui/progress";
import { RadioGroup, RadioGroupItem } from "@repo/ui/radio-group";
import { ScrollArea } from "@repo/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Separator } from "@repo/ui/separator";
import { Skeleton } from "@repo/ui/skeleton";
import { Spinner } from "@repo/ui/spinner";
import { Switch } from "@repo/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Textarea } from "@repo/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/tooltip";
// Icons
import {
  AlertCircle,
  ChevronRight,
  FileText,
  Home,
  Inbox,
  Mail,
  MoreHorizontal,
  Settings,
  User,
} from "lucide-react";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * # Components Overview
 *
 * 이 페이지는 @repo/ui 패키지의 모든 UI 컴포넌트를 한눈에 볼 수 있는 갤러리입니다.
 * AI 컴포넌트는 제외되어 있습니다.
 *
 * 각 컴포넌트의 상세 문서와 변형은 개별 스토리에서 확인할 수 있습니다.
 */
const meta = {
  title: "Overview/Components Overview",
  parameters: {
    layout: "fullscreen",
    docs: {
      toc: true,
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Section Component
const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-4">
    <div className="space-y-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
    <div className="rounded-xl border bg-card p-6">{children}</div>
  </section>
);

// Component Card
const ComponentCard = ({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
      {name}
    </span>
    <div className="flex items-center justify-center min-h-[80px]">
      {children}
    </div>
  </div>
);

export const AllComponents: Story = {
  render: () => (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Header */}
          <header className="space-y-2 border-b pb-8">
            <h1 className="text-4xl font-bold tracking-tight">
              Components Overview
            </h1>
            <p className="text-muted-foreground text-lg">
              @repo/ui 패키지의 모든 UI 컴포넌트를 한눈에 확인하세요.
            </p>
            <div className="flex gap-2 pt-2">
              <Badge>41 Components</Badge>
              <Badge variant="outline">AI 컴포넌트 제외</Badge>
            </div>
          </header>

          {/* Buttons & Actions */}
          <Section
            title="Buttons & Actions"
            description="버튼 관련 컴포넌트"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <ComponentCard name="Button">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Primary</Button>
                  <Button
                    size="sm"
                    variant="secondary"
                  >
                    Secondary
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    Outline
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                  >
                    Ghost
                  </Button>
                </div>
              </ComponentCard>
            </div>
          </Section>

          {/* Form Controls */}
          <Section
            title="Form Controls"
            description="입력 필드, 체크박스, 라디오 등 폼 컨트롤"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <ComponentCard name="Input">
                <Input
                  placeholder="Enter text..."
                  className="w-full max-w-[200px]"
                />
              </ComponentCard>

              <ComponentCard name="Input Group">
                <InputGroup className="w-full">
                  <InputGroupText>
                    <Mail />
                  </InputGroupText>
                  <InputGroupInput placeholder="Email" />
                </InputGroup>
              </ComponentCard>

              <ComponentCard name="Textarea">
                <Textarea
                  placeholder="Type your message..."
                  className="w-full max-w-[200px] min-h-[60px]"
                />
              </ComponentCard>

              <ComponentCard name="Checkbox">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="check-demo"
                    defaultChecked
                  />
                  <Label htmlFor="check-demo">Accept terms</Label>
                </div>
              </ComponentCard>

              <ComponentCard name="Radio Group">
                <RadioGroup
                  defaultValue="option-1"
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="option-1"
                      id="r1"
                    />
                    <Label htmlFor="r1">A</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="option-2"
                      id="r2"
                    />
                    <Label htmlFor="r2">B</Label>
                  </div>
                </RadioGroup>
              </ComponentCard>

              <ComponentCard name="Switch">
                <div className="flex items-center gap-2">
                  <Switch id="switch-demo" />
                  <Label htmlFor="switch-demo">Enabled</Label>
                </div>
              </ComponentCard>

              <ComponentCard name="Select">
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>Select option</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="1">Option 1</SelectItem>
                      <SelectItem value="2">Option 2</SelectItem>
                      <SelectItem value="3">Option 3</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </ComponentCard>

              <ComponentCard name="Label">
                <Label>Form Label</Label>
              </ComponentCard>
            </div>
          </Section>

          {/* Display & Typography */}
          <Section
            title="Display & Typography"
            description="배지, 알림, 텍스트 관련 컴포넌트"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <ComponentCard name="Badge">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </ComponentCard>

              <ComponentCard name="Alert">
                <Alert className="w-full max-w-[280px]">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Heads up!</AlertTitle>
                  <AlertDescription>Important message here.</AlertDescription>
                </Alert>
              </ComponentCard>

              <ComponentCard name="Kbd">
                <div className="flex gap-1">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </div>
              </ComponentCard>

              <ComponentCard name="Separator">
                <div className="flex items-center gap-4 h-6">
                  <span className="text-sm">Left</span>
                  <Separator orientation="vertical" />
                  <span className="text-sm">Right</span>
                </div>
              </ComponentCard>
            </div>
          </Section>

          {/* Data Display */}
          <Section
            title="Data Display"
            description="테이블, 리스트, 카드 등 데이터 표시 컴포넌트"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ComponentCard name="Card">
                <Card className="w-full max-w-[280px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Card Title</CardTitle>
                    <CardDescription>Card description text</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Card content goes here.
                    </p>
                  </CardContent>
                </Card>
              </ComponentCard>

              <ComponentCard name="Table">
                <Table className="w-full max-w-[320px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>John</TableCell>
                      <TableCell>
                        <Badge variant="outline">Active</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Jane</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Pending</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ComponentCard>

              <ComponentCard name="Item">
                <Item className="w-full max-w-[280px]">
                  <ItemMedia>
                    <FileText className="h-4 w-4" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Item Title</ItemTitle>
                    <ItemDescription>Item description</ItemDescription>
                  </ItemContent>
                </Item>
              </ComponentCard>

              <ComponentCard name="Empty">
                <Empty className="w-full max-w-[280px]">
                  <EmptyMedia>
                    <Inbox className="h-10 w-10" />
                  </EmptyMedia>
                  <EmptyTitle>No items</EmptyTitle>
                  <EmptyDescription>No data available.</EmptyDescription>
                </Empty>
              </ComponentCard>
            </div>
          </Section>

          {/* Navigation */}
          <Section
            title="Navigation"
            description="탭, 브레드크럼, 메뉴 등 네비게이션 컴포넌트"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ComponentCard name="Tabs">
                <Tabs
                  defaultValue="tab1"
                  className="w-full max-w-[280px]"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="tab1"
                    className="text-sm text-muted-foreground p-2"
                  >
                    Content 1
                  </TabsContent>
                </Tabs>
              </ComponentCard>

              <ComponentCard name="Breadcrumb">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">
                        <Home className="h-4 w-4" />
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Docs</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Current</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </ComponentCard>

              <ComponentCard name="Accordion">
                <Accordion className="w-full max-w-[280px]">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is it accessible?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It follows WAI-ARIA design pattern.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ComponentCard>

              <ComponentCard name="Collapsible">
                <Collapsible className="w-full max-w-[280px]">
                  <CollapsibleTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                      />
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                    Click to expand
                  </CollapsibleTrigger>
                  <CollapsibleContent className="text-sm text-muted-foreground p-2">
                    Hidden content revealed!
                  </CollapsibleContent>
                </Collapsible>
              </ComponentCard>
            </div>
          </Section>

          {/* Overlays & Dialogs */}
          <Section
            title="Overlays & Dialogs"
            description="다이얼로그, 팝오버, 드롭다운 등 오버레이 컴포넌트"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <ComponentCard name="Dialog">
                <Dialog>
                  <DialogTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                      />
                    }
                  >
                    Open Dialog
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog Title</DialogTitle>
                      <DialogDescription>
                        Dialog description text.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </ComponentCard>

              <ComponentCard name="Alert Dialog">
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="destructive"
                        size="sm"
                      />
                    }
                  >
                    Delete
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </ComponentCard>

              <ComponentCard name="Dropdown Menu">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                      />
                    }
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ComponentCard>

              <ComponentCard name="Popover">
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                      />
                    }
                  >
                    Popover
                  </PopoverTrigger>
                  <PopoverContent className="w-48">
                    <p className="text-sm">Popover content</p>
                  </PopoverContent>
                </Popover>
              </ComponentCard>

              <ComponentCard name="Tooltip">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                      />
                    }
                  >
                    Hover me
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tooltip text</p>
                  </TooltipContent>
                </Tooltip>
              </ComponentCard>

              <ComponentCard name="Hover Card">
                <HoverCard>
                  <HoverCardTrigger render={<Button variant="link" />}>
                    @username
                  </HoverCardTrigger>
                  <HoverCardContent className="w-48">
                    <p className="text-sm">User profile card</p>
                  </HoverCardContent>
                </HoverCard>
              </ComponentCard>
            </div>
          </Section>

          {/* Feedback & Progress */}
          <Section
            title="Feedback & Progress"
            description="진행 상태, 로딩, 스켈레톤 등 피드백 컴포넌트"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <ComponentCard name="Progress">
                <Progress
                  value={66}
                  className="w-[150px]"
                />
              </ComponentCard>

              <ComponentCard name="Spinner">
                <Spinner />
              </ComponentCard>

              <ComponentCard name="Skeleton">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-3 w-[60px]" />
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard name="Avatar">
                <div className="flex gap-2">
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>
              </ComponentCard>
            </div>
          </Section>

          {/* Layout */}
          <Section
            title="Layout"
            description="스크롤 영역 등 레이아웃 컴포넌트"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ComponentCard name="Scroll Area">
                <ScrollArea className="h-[100px] w-[200px] rounded border p-2">
                  <div className="space-y-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <p
                        key={i}
                        className="text-sm"
                      >
                        Scrollable item {i + 1}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              </ComponentCard>
            </div>
          </Section>

          {/* Footer */}
          <footer className="border-t pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              각 컴포넌트의 상세 문서와 변형은 사이드바의 개별 스토리에서 확인할
              수 있습니다.
            </p>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  ),
};
