import { Extensions } from "@tiptap/core";
import { Blockquote } from "@tiptap/extension-blockquote";
import { Bold } from "@tiptap/extension-bold";
import { BulletList } from "@tiptap/extension-bullet-list";
import { Code } from "@tiptap/extension-code";
import { CodeBlock } from "@tiptap/extension-code-block";
import { Document } from "@tiptap/extension-document";
import { Dropcursor } from "@tiptap/extension-dropcursor";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { Heading } from "@tiptap/extension-heading";
import { History } from "@tiptap/extension-history";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Italic } from "@tiptap/extension-italic";
import { ListItem } from "@tiptap/extension-list-item";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Strike } from "@tiptap/extension-strike";
import { Text } from "@tiptap/extension-text";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";

export const defaultExtensions: Extensions = [
  Blockquote,
  Bold,
  BulletList,
  Code,
  CodeBlock,
  Document,
  Dropcursor,
  Gapcursor,
  Heading,
  History,
  HorizontalRule,
  Italic,
  ListItem,
  OrderedList,
  Paragraph,
  Strike,
  Text,
  TextStyle,
  Underline,
];
