export function sanitizeGuideMarkdown(markdown: string): string {
  return markdown
    .replace(/^\s*#\s+[^\r\n]+\r?\n+/, '')
    .replace(/^\s*\*\*Meta description:\*\*.*(?:\r?\n|$)/gim, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
