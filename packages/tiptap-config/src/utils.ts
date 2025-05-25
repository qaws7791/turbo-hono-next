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

export function isListType(type: string | undefined): boolean {
  return type ? ["bulletList", "orderedList", "doc"].includes(type) : false;
}

/**
 *  Extract text from the JSON content of the editor
 * @param json - The JSON content of the editor
 * @description Extracts text from the JSON content of the editor.
 * @returns The extracted text from the JSON content.
 */
export function extractTextFromJSONContent(json: JSONContent): string {
  // 1. 현재 노드의 텍스트 콘텐츠를 가져옵니다.
  const currentText = json.text || null;

  // 2. 자식 노드를 재귀적으로 처리하고 결과를 조합합니다.
  // content가 없거나 배열이 아니면 빈 배열로 처리하여 map 에러를 방지합니다.
  const childrenText = (json.content || [])
    .map((childNode) => {
      // 자식 노드와 그 자손들로부터 텍스트를 재귀적으로 추출합니다.
      const textFromChild = extractTextFromJSONContent(childNode);

      // 자식 노드의 타입이 블록 요소인 경우 뒤에 줄바꿈을 추가합니다.
      // 기존 로직과 동일하게 자식 노드 자체의 타입에 따라 줄바꿈을 결정합니다.

      return textFromChild;
    })
    .join(isListType(json.type) ? " " : ""); // 처리된 자식 노드들의 텍스트를 하나의 문자열로 합칩니다.

  // 3. 현재 노드의 텍스트와 자식 노드들로부터 얻은 텍스트를 합칩니다.
  // 기존 로직은 현재 노드의 text를 먼저 추가하고 content를 처리했으므로,
  // currentText 뒤에 childrenText를 붙이는 것이 맞습니다.
  const combinedText = currentText ? currentText + childrenText : childrenText;

  // 4. 마지막에 trim()을 적용합니다. (이는 문자열 처리이므로 함수형 원칙에 위배되지 않습니다.)
  return combinedText;
}
