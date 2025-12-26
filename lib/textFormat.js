// lib/textFormat.js
import React from "react";

export function renderTaggedText(text) {
  if (!text) return null;

  // escape hatch: keep line breaks
  const lines = text.split("\n");

  return lines.map((line, lineIdx) => (
    <p key={lineIdx} className="leading-relaxed mb-2 last:mb-0">
      {renderInlineTags(line)}
    </p>
  ));
}

function renderInlineTags(line) {
  // Supports [bold]...[/bold], [cyan]...[/cyan], [purple]...[/purple]
  const tagRegex = /\[(bold|cyan|purple)\]([\s\S]*?)\[\/\1\]/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(line)) !== null) {
    const [full, tag, content] = match;
    const start = match.index;

    if (start > lastIndex) {
      parts.push(line.slice(lastIndex, start));
    }

    const className =
      tag === "bold"
        ? "font-semibold"
        : tag === "cyan"
          ? "text-cyan-300 font-semibold"
          : "text-purple-300 font-semibold";

    parts.push(
      <span key={`${start}-${tag}`} className={className}>
        {content}
      </span>
    );

    lastIndex = start + full.length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts;
}
