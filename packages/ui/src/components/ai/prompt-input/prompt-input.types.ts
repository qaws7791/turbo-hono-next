import type { ChatStatus, FileUIPart } from "ai";
import type {
  ComponentProps,
  FormEvent,
  PropsWithChildren,
  ReactNode,
  RefObject,
} from "react";
import type {
  Menu,
  MenuItem,
  MenuTrigger,
  Select,
  SelectValue,
} from "react-aria-components";
import type {
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "../../form/input-group";
import type {
  SelectItem,
  SelectListBox,
  SelectTrigger,
} from "../../form/select";
import type { PromptInputButton } from "./prompt-input";

export type AttachmentsContext = {
  files: Array<FileUIPart & { id: string }>;
  add: (files: Array<File> | FileList) => void;
  remove: (id: string) => void;
  clear: () => void;
  openFileDialog: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
};

export type TextInputContext = {
  value: string;
  setInput: (v: string) => void;
  clear: () => void;
};

export type PromptInputControllerProps = {
  textInput: TextInputContext;
  attachments: AttachmentsContext;
  /** INTERNAL: Allows PromptInput to register its file textInput + "open" callback */
  __registerFileInput: (
    ref: RefObject<HTMLInputElement | null>,
    open: () => void,
  ) => void;
};

export type PromptInputProviderProps = PropsWithChildren<{
  initialInput?: string;
}>;

export type PromptInputAttachmentProps = ComponentProps<"div"> & {
  data: FileUIPart & { id: string };
  className?: string;
};

export type PromptInputAttachmentsProps = Omit<
  ComponentProps<"div">,
  "children"
> & {
  children: (attachment: FileUIPart & { id: string }) => ReactNode;
};

export type PromptInputActionAddAttachmentsProps = ComponentProps<
  typeof MenuItem
> & {
  label?: string;
};

export type PromptInputMessage = {
  text: string;
  files: Array<FileUIPart>;
};

export type PromptInputProps = Omit<
  ComponentProps<"form">,
  "onSubmit" | "onError"
> & {
  accept?: string; // e.g., "image/*" or leave undefined for any
  multiple?: boolean;
  // When true, accepts drops anywhere on document. Default false (opt-in).
  globalDrop?: boolean;
  // Render a hidden input with given name and keep it in sync for native form posts. Default false.
  syncHiddenInput?: boolean;
  // Minimal constraints
  maxFiles?: number;
  maxFileSize?: number; // bytes
  onError?: (err: {
    code: "max_files" | "max_file_size" | "accept";
    message: string;
  }) => void;
  onSubmit: (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
};

export type PromptInputBodyProps = ComponentProps<"div">;

export type PromptInputTextareaProps = ComponentProps<
  typeof InputGroupTextarea
>;

export type PromptInputHeaderProps = Omit<
  ComponentProps<typeof InputGroupAddon>,
  "align"
>;

export type PromptInputFooterProps = Omit<
  ComponentProps<typeof InputGroupAddon>,
  "align"
>;

export type PromptInputToolsProps = ComponentProps<"div">;

export type PromptInputButtonProps = ComponentProps<typeof InputGroupButton>;

export type PromptInputActionMenuProps = ComponentProps<typeof MenuTrigger>;

export type PromptInputActionMenuButtonProps = PromptInputButtonProps;

export type PromptInputActionMenuContentProps = ComponentProps<typeof Menu>;

export type PromptInputActionMenuItemProps = ComponentProps<typeof MenuItem>;

export type PromptInputSubmitProps = ComponentProps<typeof InputGroupButton> & {
  status?: ChatStatus;
};

export type PromptInputSpeechButtonProps = ComponentProps<
  typeof PromptInputButton
> & {
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  onTranscriptionChange?: (text: string) => void;
};

export type PromptInputSelectProps = ComponentProps<typeof Select>;

export type PromptInputSelectTriggerProps = ComponentProps<
  typeof SelectTrigger
>;

export type PromptInputSelectContentProps = ComponentProps<
  typeof SelectListBox
>;

export type PromptInputSelectItemProps = ComponentProps<typeof SelectItem>;

export type PromptInputSelectValueProps = ComponentProps<typeof SelectValue>;
