import type { ScriptPack } from "@/types";

export function scriptStats(script: Array<{ content: string }> | ScriptPack) {
  const blocks = Array.isArray(script) ? script : script.blocks;
  const text = blocks.map((block) => block.content).join(" ");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { words, chars: text.length, minutes: Math.round((words / 140) * 10) / 10 };
}
