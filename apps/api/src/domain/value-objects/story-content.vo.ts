export class StoryContent {
  constructor(
    public readonly jsonContent: Record<string, any>,
    public readonly textContent: string,
  ) {}

  getWordCount(): number {
    return this.textContent.split(/\s+/).length;
  }

  getPreview(maxLength: number = 200): string {
    return this.textContent.length > maxLength
      ? this.textContent.substring(0, maxLength) + "..."
      : this.textContent;
  }
}
