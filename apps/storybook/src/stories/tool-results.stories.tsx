import {
  CompleteTasksResult,
  CreateModuleResult,
  CreateTaskResult,
  DeleteModuleResult,
  GetPlanDetailsResult,
  GetProgressResult,
  ListModulesResult,
  ListTasksResult,
} from "@repo/ui/ai";

import type {
  CompleteTasksOutput,
  CreateModuleOutput,
  CreateTaskOutput,
  DeleteModuleOutput,
  GetPlanDetailsOutput,
  GetProgressOutput,
  ListModulesOutput,
  ListTasksOutput,
} from "@repo/ai-types";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * CreateModuleResult 스토리
 */
const createModuleMeta = {
  title: "AI/ToolResults/CreateModuleResult",
  component: CreateModuleResult,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof CreateModuleResult>;

export default createModuleMeta;

type CreateModuleStory = StoryObj<typeof createModuleMeta>;

export const CreateModuleSuccess: CreateModuleStory = {
  args: {
    result: {
      success: true,
      data: {
        id: "mod_123",
        title: "React Hooks 기초",
        description: "useState, useEffect, useContext 학습",
        order: 1,
        isExpanded: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    } satisfies CreateModuleOutput,
  },
};

export const CreateModuleError: CreateModuleStory = {
  args: {
    result: {
      success: false,
      error: "모듈 생성에 실패했습니다. 제목은 필수 항목입니다.",
    } satisfies CreateModuleOutput,
  },
};

/**
 * CreateTaskResult 스토리
 */
export const CreateTaskSuccess = {
  render: () => (
    <CreateTaskResult
      result={
        {
          success: true,
          data: {
            id: "task_123",
            title: "useState 공식 문서 읽기",
            description: "기본 사용법과 주의사항 파악",
            isCompleted: false,
            completedAt: null,
            dueDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            memo: null,
            order: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        } satisfies CreateTaskOutput
      }
    />
  ),
};

/**
 * GetProgressResult 스토리
 */
export const GetProgressSuccess = {
  render: () => (
    <GetProgressResult
      result={
        {
          success: true,
          data: {
            totalTasks: 20,
            completedTasks: 15,
            progressPercentage: 75,
            totalModules: 4,
          },
        } satisfies GetProgressOutput
      }
    />
  ),
};

/**
 * ListModulesResult 스토리
 */
export const ListModulesSuccess = {
  render: () => (
    <ListModulesResult
      result={
        {
          success: true,
          data: [
            {
              id: "mod_1",
              title: "React 기초",
              description: "컴포넌트, Props, State",
              order: 1,
              isExpanded: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "mod_2",
              title: "React Hooks",
              description: "useState, useEffect, Custom Hooks",
              order: 2,
              isExpanded: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "mod_3",
              title: "상태 관리",
              description: "Context API, Zustand",
              order: 3,
              isExpanded: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        } satisfies ListModulesOutput
      }
    />
  ),
};

/**
 * ListTasksResult 스토리
 */
export const ListTasksSuccess = {
  render: () => (
    <ListTasksResult
      result={
        {
          success: true,
          data: [
            {
              id: "task_1",
              title: "공식 문서 읽기",
              description: "React 공식 문서의 Hooks 섹션 읽기",
              isCompleted: true,
              completedAt: new Date().toISOString(),
              dueDate: null,
              memo: null,
              order: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "task_2",
              title: "useState 실습",
              description: "카운터 컴포넌트 만들기",
              isCompleted: false,
              completedAt: null,
              dueDate: new Date(
                Date.now() + 3 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              memo: null,
              order: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        } satisfies ListTasksOutput
      }
    />
  ),
};

/**
 * CompleteTasksResult 스토리
 */
export const CompleteTasksSuccess = {
  render: () => (
    <CompleteTasksResult
      result={
        {
          success: true,
          data: {
            completedCount: 3,
            totalCount: 3,
            results: [
              {
                id: "task_1",
                title: "공식 문서 읽기",
                description: null,
                isCompleted: true,
                completedAt: new Date().toISOString(),
                dueDate: null,
                memo: null,
                order: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: "task_2",
                title: "useState 실습",
                description: null,
                isCompleted: true,
                completedAt: new Date().toISOString(),
                dueDate: null,
                memo: null,
                order: 2,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          },
        } satisfies CompleteTasksOutput
      }
    />
  ),
};

/**
 * DeleteModuleResult 스토리
 */
export const DeleteModuleSuccess = {
  render: () => (
    <DeleteModuleResult
      result={
        {
          success: true,
          data: {
            deletedId: "mod_123",
            message: "모듈이 삭제되었습니다",
          },
        } satisfies DeleteModuleOutput
      }
    />
  ),
};

/**
 * GetPlanDetailsResult 스토리
 */
export const GetPlanDetailsSuccess = {
  render: () => (
    <GetPlanDetailsResult
      result={
        {
          success: true,
          data: {
            id: "plan_123",
            title: "React 마스터하기",
            description: "React 기초부터 고급까지",
            emoji: "⚛️",
            learningTopic: "React",
            userLevel: "중급",
            targetWeeks: 12,
            weeklyHours: 10,
            learningStyle: "프로젝트 기반",
            preferredResources: "공식 문서, 동영상 강의",
            mainGoal: "실무에서 사용할 수 있는 React 개발 능력 습득",
            modules: [
              {
                id: "mod_1",
                title: "React 기초",
                description: "컴포넌트, Props, State",
                order: 1,
                isExpanded: true,
                tasks: [
                  {
                    id: "task_1",
                    title: "공식 문서 읽기",
                    description: null,
                    order: 1,
                    isCompleted: true,
                    completedAt: new Date().toISOString(),
                    dueDate: null,
                    memo: null,
                  },
                ],
              },
              {
                id: "mod_2",
                title: "React Hooks",
                description: "useState, useEffect",
                order: 2,
                isExpanded: false,
                tasks: [],
              },
            ],
          },
        } satisfies GetPlanDetailsOutput
      }
    />
  ),
};
