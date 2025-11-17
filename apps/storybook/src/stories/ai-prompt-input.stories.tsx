import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuButton,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputProvider,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@repo/ui/ai";
import { Button } from "@repo/ui/button";
import { SearchIcon } from "lucide-react";
import { useRef, useState } from "react";

import type { PromptInputMessage } from "@repo/ui/ai";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { FormEvent } from "react";

/**
 * PromptInput components for building AI chat interfaces
 *
 * Features:
 * - File attachments with drag & drop support
 * - Image preview and file management
 * - Voice input with speech recognition
 * - Model selection dropdown
 * - Custom action menu
 * - Composable subcomponents for flexible layouts
 * - Optional global provider for state management
 *
 * Based on AI SDK PromptInput components:
 * @see https://ai-sdk.dev/elements/components/prompt-input
 */
const meta = {
  title: "AI/PromptInput",
  component: PromptInput,
  parameters: {
    layout: "centered",
  },
  args: {
    onSubmit: () => {},
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PromptInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic PromptInput with textarea and submit button
 */
export const Basic: Story = {
  render: () => (
    <div className="w-[600px]">
      <PromptInput
        onSubmit={(message) => {
          console.log("Submitted:", message);
          alert(`Message: "${message.text}"`);
        }}
      >
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>

        <PromptInputBody>
          <PromptInputTextarea placeholder="What would you like to know?" />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </div>
  ),
};

/**
 * PromptInput with file attachment support
 */
export const WithAttachments: Story = {
  render: () => (
    <div className="w-[600px]">
      <PromptInput
        accept="image/*,.pdf,.doc,.docx"
        multiple
        maxFiles={5}
        maxFileSize={5 * 1024 * 1024} // 5MB
        onError={(error) => {
          console.error("Upload error:", error);
          alert(`Error: ${error.message}`);
        }}
        onSubmit={(message) => {
          console.log("Submitted:", message);
          alert(
            `Message: "${message.text}"\n\nFiles: ${message.files.length} attachment(s)`,
          );
        }}
      >
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>

        <PromptInputBody>
          <PromptInputTextarea placeholder="Attach files and ask a question..." />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuButton />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments label="Add photos or files" />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </div>
  ),
};

/**
 * PromptInput with model selection dropdown
 */
export const WithModelSelection: Story = {
  render: () => {
    const [selectedModel, setSelectedModel] = useState("gpt-4o");

    return (
      <div className="w-[600px]">
        <PromptInput
          onSubmit={(message) => {
            console.log("Submitted:", message);
            alert(`Message: "${message.text}"\n\nModel: ${selectedModel}`);
          }}
        >
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>

          <PromptInputBody>
            <PromptInputTextarea placeholder="Ask anything..." />
          </PromptInputBody>

          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputSelect
                selectedKey={selectedModel}
                onSelectionChange={(key) => setSelectedModel(String(key))}
              >
                <PromptInputSelectTrigger>
                  <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  <PromptInputSelectItem id="gpt-4o">
                    GPT-4o
                  </PromptInputSelectItem>
                  <PromptInputSelectItem id="claude-opus">
                    Claude Opus
                  </PromptInputSelectItem>
                  <PromptInputSelectItem id="gemini-pro">
                    Gemini Pro
                  </PromptInputSelectItem>
                </PromptInputSelectContent>
              </PromptInputSelect>
            </PromptInputTools>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
    );
  },
};

/**
 * PromptInput with speech recognition button
 */
export const WithSpeechButton: Story = {
  render: () => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    return (
      <div className="w-[600px]">
        <PromptInput
          onSubmit={(message) => {
            console.log("Submitted:", message);
            alert(`Message: "${message.text}"`);
          }}
        >
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>

          <PromptInputBody>
            <PromptInputTextarea
              ref={textareaRef}
              placeholder="Type or use voice input..."
            />
          </PromptInputBody>

          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputSpeechButton textareaRef={textareaRef} />
            </PromptInputTools>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
    );
  },
};

/**
 * Complete PromptInput with all features
 */
export const Complete: Story = {
  render: () => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [selectedModel, setSelectedModel] = useState("gpt-4o");

    return (
      <div className="w-[700px] space-y-2">
        <div className="px-4 py-2 bg-muted rounded-t-lg border border-border">
          <p className="text-sm font-medium text-muted-foreground">
            AI Assistant - {selectedModel}
          </p>
        </div>

        <PromptInput
          accept="image/*,.pdf,.doc,.docx"
          multiple
          maxFiles={5}
          maxFileSize={5 * 1024 * 1024}
          onError={(error) => {
            console.error("Upload error:", error);
            alert(`Error: ${error.message}`);
          }}
          onSubmit={(message) => {
            console.log("Submitted:", message);
            alert(
              `Message: "${message.text}"\n\nModel: ${selectedModel}\nAttachments: ${message.files.length}`,
            );
          }}
          className="px-4"
        >
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>

          <PromptInputBody>
            <PromptInputTextarea
              ref={textareaRef}
              placeholder="Describe your question, request, or idea. You can also attach files or use voice input."
            />
          </PromptInputBody>

          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuButton />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>

              <PromptInputSpeechButton textareaRef={textareaRef} />

              <PromptInputSelect
                selectedKey={selectedModel}
                onSelectionChange={(key) => setSelectedModel(String(key))}
              >
                <PromptInputSelectTrigger>
                  <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  <PromptInputSelectItem id="gpt-4o">
                    GPT-4o
                  </PromptInputSelectItem>
                  <PromptInputSelectItem id="claude-opus">
                    Claude Opus
                  </PromptInputSelectItem>
                  <PromptInputSelectItem id="gemini-pro">
                    Gemini Pro
                  </PromptInputSelectItem>
                </PromptInputSelectContent>
              </PromptInputSelect>
            </PromptInputTools>

            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
    );
  },
};

/**
 * PromptInput with custom actions menu items
 */
export const WithCustomActions: Story = {
  render: () => (
    <div className="w-[600px]">
      <PromptInput
        onSubmit={(message) => {
          console.log("Submitted:", message);
          alert(`Message: "${message.text}"`);
        }}
      >
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>

        <PromptInputBody>
          <PromptInputTextarea placeholder="What would you like to know?" />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuButton />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments label="Add photos or files" />
                <PromptInputActionMenuItem
                  onAction={() => alert("Web search enabled!")}
                >
                  <SearchIcon className="mr-2 size-4" />
                  Search the web
                </PromptInputActionMenuItem>
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </div>
  ),
};

/**
 * PromptInput with Provider context
 *
 * Use PromptInputProvider to manage state globally across multiple components.
 * This is useful when you need to control input from external components.
 */
export const WithProvider: Story = {
  render: () => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    return (
      <PromptInputProvider initialInput="">
        <div className="w-[700px] space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">External Controls</label>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  alert("External button action");
                }}
              >
                Custom Action
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
              >
                Focus Input
              </Button>
            </div>
          </div>

          <PromptInput
            onSubmit={(message) => {
              console.log("Submitted:", message);
              alert(
                `Message: "${message.text}"\n\nAttachments: ${message.files.length}`,
              );
            }}
            className="border border-border rounded-lg"
          >
            <PromptInputHeader>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
            </PromptInputHeader>

            <PromptInputBody>
              <PromptInputTextarea
                ref={textareaRef}
                placeholder="Your message is managed by the global provider..."
              />
            </PromptInputBody>

            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuButton />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
              </PromptInputTools>
              <PromptInputSubmit />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </PromptInputProvider>
    );
  },
};

/**
 * Minimal PromptInput - just the essentials
 */
export const Minimal: Story = {
  render: () => (
    <div className="w-[600px]">
      <PromptInput
        onSubmit={(message) => {
          console.log("Submitted:", message);
        }}
      >
        <PromptInputBody>
          <PromptInputTextarea placeholder="Send a message..." />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </div>
  ),
};

/**
 * PromptInput with disabled state
 */
export const Disabled: Story = {
  render: () => (
    <div className="w-[600px]">
      <PromptInput
        onSubmit={(message) => {
          console.log("Submitted:", message);
        }}
      >
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>

        <PromptInputBody>
          <PromptInputTextarea
            placeholder="Loading response..."
            disabled
          />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuButton isDisabled />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
          <PromptInputSubmit
            isDisabled
            status="submitted"
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  ),
};

/**
 * PromptInput with streaming status
 */
export const WithStreamingStatus: Story = {
  render: () => {
    const [status, setStatus] = useState<
      "idle" | "submitted" | "streaming" | "error"
    >("idle");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async () => {
      setStatus("submitted");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus("streaming");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatus("idle");
      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
    };

    return (
      <div className="w-[600px] space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSubmit}
            disabled={status !== "idle"}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:opacity-50"
          >
            Simulate Message
          </button>
          <span className="text-sm text-muted-foreground">
            Status:{" "}
            <span className="font-medium">
              {status === "idle"
                ? "Ready"
                : status === "submitted"
                  ? "Processing"
                  : "Streaming"}
            </span>
          </span>
        </div>

        <PromptInput
          onSubmit={(message) => {
            console.log("Submitted:", message);
          }}
        >
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>

          <PromptInputBody>
            <PromptInputTextarea
              ref={textareaRef}
              disabled={status !== "idle"}
              placeholder={
                status === "idle" ? "Send a message..." : "AI is thinking..."
              }
            />
          </PromptInputBody>

          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit
              isDisabled={status !== "idle"}
              status={status === "idle" ? undefined : status}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    );
  },
};

/**
 * Interactive example simulating a chat interface
 */
export const Interactive: Story = {
  render: () => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [messages, setMessages] = useState<
      Array<{ role: "user" | "assistant"; text: string }>
    >([
      {
        role: "assistant",
        text: "안녕하세요! 무엇을 도와드릴까요?",
      },
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit: (
      message: PromptInputMessage,
      event: FormEvent<HTMLFormElement>,
    ) => void = (message) => {
      if (!message.text.trim()) return;

      setMessages((prev) => [...prev, { role: "user", text: message.text }]);
      setIsLoading(true);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `"${message.text}"에 대한 응답입니다.`,
          },
        ]);
        setIsLoading(false);
      }, 1000);
    };

    return (
      <div className="w-[600px] h-[600px] border border-border rounded-lg flex flex-col">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 px-4 py-2 rounded-lg">
                <span className="animate-pulse">응답하는 중...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                ref={textareaRef}
                disabled={isLoading}
                placeholder="메시지를 입력하세요..."
              />
            </PromptInputBody>

            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit isDisabled={isLoading} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    );
  },
};
