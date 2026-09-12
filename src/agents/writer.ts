export interface ScriptBlockLike {
  id?: string;
  label: string;
  content: string;
}

export function scriptStats(blocks: ScriptBlockLike[]) {
  const text = blocks
    .map((block) => block.content)
    .join(" ")
    .trim();
  const words = text ? text.split(/\s+/).length : 0;
  return { words, chars: text.length, minutes: Math.max(1, Math.ceil(words / 145)) };
}
