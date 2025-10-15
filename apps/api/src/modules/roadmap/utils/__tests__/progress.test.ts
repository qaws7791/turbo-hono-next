import { describe, expect, it } from "vitest";
import { calculateCompletionPercent } from "../progress";

describe("calculateCompletionPercent", () => {
  it("returns 0 when there are no sub-goals", () => {
    expect(calculateCompletionPercent(0, 0)).toBe(0);
    expect(calculateCompletionPercent(0, 3)).toBe(0);
  });

  it("returns a rounded percentage for partial completion", () => {
    expect(calculateCompletionPercent(4, 2)).toBe(50);
    expect(calculateCompletionPercent(3, 2)).toBe(67);
  });

  it("never exceeds 100%", () => {
    expect(calculateCompletionPercent(5, 7)).toBe(100);
  });

  it("ignores negative numbers", () => {
    expect(calculateCompletionPercent(-5, -3)).toBe(0);
    expect(calculateCompletionPercent(5, -2)).toBe(0);
  });
});
