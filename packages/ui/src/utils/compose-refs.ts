import { useCallback } from "react";

import type { Ref } from "react";

/**
 * Composes multiple refs into a single ref callback
 * Useful for forwarding refs to multiple elements
 *
 * @param refs - Array of refs to compose
 * @returns A single ref callback that updates all provided refs
 */
export function useComposeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return useCallback((node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  }, refs);
}
