import {
  History,
  HistoryContent,
  HistoryGroup,
  HistoryItem,
  HistoryItemMenuTrigger,
} from "@repo/ui/ai";
import { Menu, MenuItem, MenuPopover } from "@repo/ui/menu";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * History components for displaying chat history list
 *
 * Features:
 * - Composition-based design for flexibility
 * - Date-based grouping (Today, Yesterday, Last 7 days, etc.)
 * - Selected state support
 * - Menu action with hover reveal (three-dot button)
 * - Accessible by default
 *
 * The History component follows the same composition pattern as other AI components,
 * allowing you to compose different parts to build your chat history list UI.
 */
const meta = {
  title: "AI/History",
  component: History,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof History>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic chat history list
 */
export const Basic: Story = {
  render: () => (
    <div className="h-[500px] w-[320px] rounded-lg border border-border">
      <History>
        <HistoryContent>
          <HistoryGroup label="오늘">
            <HistoryItem onClick={() => alert("채팅 1 클릭")}>
              인공지능과의 첫 인사
            </HistoryItem>
            <HistoryItem onClick={() => alert("채팅 2 클릭")}>
              React Hooks 학습하기
            </HistoryItem>
            <HistoryItem onClick={() => alert("채팅 3 클릭")}>
              TypeScript 베스트 프랙티스
            </HistoryItem>
          </HistoryGroup>
        </HistoryContent>
      </History>
    </div>
  ),
};

/**
 * History with menu action (hover to see three-dot button)
 */
export const WithMenuAction: Story = {
  render: () => (
    <div className="h-[500px] w-[320px] rounded-lg border border-border">
      <History>
        <HistoryContent>
          <HistoryGroup label="오늘">
            <HistoryItem
              onClick={() => alert("채팅 클릭")}
              menu={
                <HistoryItemMenuTrigger>
                  <MenuPopover>
                    <Menu>
                      <MenuItem onAction={() => alert("이름 바꾸기")}>
                        <PencilIcon className="size-4" />
                        이름 바꾸기
                      </MenuItem>

                      <MenuItem
                        onAction={() => alert("삭제")}
                        className="text-destructive data-[focused]:text-destructive"
                      >
                        <Trash2Icon className="size-4" />
                        삭제
                      </MenuItem>
                    </Menu>
                  </MenuPopover>
                </HistoryItemMenuTrigger>
              }
            >
              인공지능과의 첫 인사
            </HistoryItem>
            <HistoryItem
              onClick={() => alert("채팅 클릭")}
              menu={
                <HistoryItemMenuTrigger>
                  <MenuPopover>
                    <Menu>
                      <MenuItem onAction={() => alert("이름 바꾸기")}>
                        <PencilIcon className="size-4" />
                        이름 바꾸기
                      </MenuItem>

                      <MenuItem
                        onAction={() => alert("삭제")}
                        className="text-destructive data-[focused]:text-destructive"
                      >
                        <Trash2Icon className="size-4" />
                        삭제
                      </MenuItem>
                    </Menu>
                  </MenuPopover>
                </HistoryItemMenuTrigger>
              }
            >
              React Hooks 학습하기
            </HistoryItem>
            <HistoryItem
              onClick={() => alert("채팅 클릭")}
              menu={
                <HistoryItemMenuTrigger>
                  <MenuPopover>
                    <Menu>
                      <MenuItem onAction={() => alert("이름 바꾸기")}>
                        <PencilIcon className="size-4" />
                        이름 바꾸기
                      </MenuItem>

                      <MenuItem
                        onAction={() => alert("삭제")}
                        className="text-destructive data-[focused]:text-destructive"
                      >
                        <Trash2Icon className="size-4" />
                        삭제
                      </MenuItem>
                    </Menu>
                  </MenuPopover>
                </HistoryItemMenuTrigger>
              }
            >
              TypeScript 베스트 프랙티스
            </HistoryItem>
          </HistoryGroup>
        </HistoryContent>
      </History>
    </div>
  ),
};

/**
 * History with multiple date groups
 */
export const WithGroups: Story = {
  render: () => (
    <div className="h-[500px] w-[320px] rounded-lg border border-border">
      <History>
        <HistoryContent>
          <HistoryGroup label="오늘">
            <HistoryItem onClick={() => alert("채팅 클릭")}>
              인공지능과의 첫 인사
            </HistoryItem>
            <HistoryItem onClick={() => alert("채팅 클릭")}>
              React Hooks 학습하기
            </HistoryItem>
          </HistoryGroup>

          <HistoryGroup label="어제">
            <HistoryItem onClick={() => alert("채팅 클릭")}>
              Next.js 프로젝트 설정
            </HistoryItem>
            <HistoryItem onClick={() => alert("채팅 클릭")}>
              Tailwind CSS 커스터마이징
            </HistoryItem>
            <HistoryItem onClick={() => alert("채팅 클릭")}>
              API 라우트 설계하기
            </HistoryItem>
          </HistoryGroup>

          <HistoryGroup label="지난 7일">
            <HistoryItem onClick={() => alert("채팅 클릭")}>
              데이터베이스 스키마 설계
            </HistoryItem>
            <HistoryItem onClick={() => alert("채팅 클릭")}>
              인증 시스템 구현하기
            </HistoryItem>
            <HistoryItem onClick={() => alert("채팅 클릭")}>
              성능 최적화 팁
            </HistoryItem>
            <HistoryItem onClick={() => alert("채팅 클릭")}>
              Git 워크플로우 설정
            </HistoryItem>
          </HistoryGroup>
        </HistoryContent>
      </History>
    </div>
  ),
};

/**
 * History with selected item
 */
export const WithSelectedItem: Story = {
  render: () => (
    <div className="h-[500px] w-[320px] rounded-lg border border-border">
      <History>
        <HistoryContent>
          <HistoryGroup label="오늘">
            <HistoryItem onClick={() => alert("채팅 클릭")}>
              인공지능과의 첫 인사
            </HistoryItem>
            <HistoryItem
              selected
              onClick={() => alert("채팅 클릭")}
            >
              React Hooks 학습하기
            </HistoryItem>
            <HistoryItem onClick={() => alert("채팅 클릭")}>
              TypeScript 베스트 프랙티스
            </HistoryItem>
          </HistoryGroup>
        </HistoryContent>
      </History>
    </div>
  ),
};

/**
 * Interactive example with state management
 */
export const Interactive: Story = {
  render: function InteractiveHistory() {
    const [selectedId, setSelectedId] = useState<string | null>("2");
    const [chats, setChats] = useState([
      { id: "1", group: "오늘", title: "인공지능과의 첫 인사" },
      { id: "2", group: "오늘", title: "React Hooks 학습하기" },
      { id: "3", group: "오늘", title: "TypeScript 베스트 프랙티스" },
      { id: "4", group: "어제", title: "Next.js 프로젝트 설정" },
      { id: "5", group: "어제", title: "Tailwind CSS 커스터마이징" },
      { id: "6", group: "지난 7일", title: "데이터베이스 스키마 설계" },
      { id: "7", group: "지난 7일", title: "인증 시스템 구현하기" },
    ]);

    const groupedChats = chats.reduce(
      (acc, chat) => {
        if (!acc[chat.group]) {
          acc[chat.group] = [];
        }
        acc[chat.group]!.push(chat);
        return acc;
      },
      {} as Record<string, typeof chats>,
    );

    const handleDelete = (id: string) => {
      setChats(chats.filter((chat) => chat.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
    };

    const handleRename = (id: string) => {
      const newTitle = prompt("새 이름을 입력하세요:");
      if (newTitle) {
        setChats(
          chats.map((chat) =>
            chat.id === id ? { ...chat, title: newTitle } : chat,
          ),
        );
      }
    };

    return (
      <div className="h-[500px] w-[320px] rounded-lg border border-border">
        <History>
          <HistoryContent>
            {Object.entries(groupedChats).map(([group, groupChats]) => (
              <HistoryGroup
                key={group}
                label={group}
              >
                {groupChats.map((chat) => (
                  <HistoryItem
                    key={chat.id}
                    selected={selectedId === chat.id}
                    onClick={() => setSelectedId(chat.id)}
                    menu={
                      <HistoryItemMenuTrigger>
                        <MenuPopover>
                          <Menu>
                            <MenuItem onAction={() => handleRename(chat.id)}>
                              <PencilIcon className="size-4" />
                              이름 바꾸기
                            </MenuItem>

                            <MenuItem
                              onAction={() => handleDelete(chat.id)}
                              className="text-destructive data-[focused]:text-destructive"
                            >
                              <Trash2Icon className="size-4" />
                              삭제
                            </MenuItem>
                          </Menu>
                        </MenuPopover>
                      </HistoryItemMenuTrigger>
                    }
                  >
                    {chat.title}
                  </HistoryItem>
                ))}
              </HistoryGroup>
            ))}
          </HistoryContent>
        </History>
      </div>
    );
  },
};

/**
 * Empty state example
 */
export const Empty: Story = {
  render: () => (
    <div className="h-[500px] w-[320px] rounded-lg border border-border">
      <History>
        <HistoryContent>
          <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            아직 채팅 기록이 없습니다
          </div>
        </HistoryContent>
      </History>
    </div>
  ),
};
