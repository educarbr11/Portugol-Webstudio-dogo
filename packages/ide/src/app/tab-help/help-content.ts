export interface HelpExample {
  name: string;
  contents: string;
}

export interface HelpContentBlock {
  source: string;
  example?: HelpExample;
}

export function getHelpContentBlocks(source: string, title: string): HelpContentBlock[] {
  const blocks: HelpContentBlock[] = [];
  const fileName = title.replaceAll(/[<>:"/\\|?*]/gu, "-");
  const examples = source.matchAll(/^```portugol[^\S\r\n]*\r?\n([\s\S]*?)^```[^\S\r\n]*$/gmu);
  let offset = 0;
  let exampleIndex = 0;

  for (const match of examples) {
    const before = source.slice(offset, match.index).trim();

    if (before) {
      blocks.push({ source: before });
    }

    exampleIndex++;
    blocks.push({
      source: match[0],
      example: {
        name: `${fileName}${exampleIndex > 1 ? ` (${exampleIndex})` : ""}.por`,
        contents: `${match[1].trimEnd()}\n`,
      },
    });
    offset = match.index + match[0].length;
  }

  const remaining = source.slice(offset).trim();

  if (remaining) {
    blocks.push({ source: remaining });
  }

  return blocks;
}
