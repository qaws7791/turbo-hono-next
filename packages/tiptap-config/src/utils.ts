import { getSchema, JSONContent } from "@tiptap/core";
import { defaultExtensions } from "./extensions";

/**
 * Validate the JSON content of the editor
 * @param content - The JSON content of the editor
 * @returns True if the JSON content is valid, false otherwise
 */
export const validateEditorJSONContent = (content: JSONContent): boolean => {
  const schema = getSchema([...defaultExtensions]);
  try {
    schema.nodeFromJSON(content);
    return true;
  } catch {
    return false;
  }
};
