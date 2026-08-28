const canonicalCommands: Readonly<Record<string, string>> = {
  escreva: "escrever",
  leia: "ler",
  limpa: "limpar",
  faca: "fazer",
  escolha: "escolher",
  pare: "parar",
  retorne: "retornar",
  inclua: "incluir",
};

const legacyCommandPattern = new RegExp(`\\b(${Object.keys(canonicalCommands).join("|")})\\b`, "giu");

function preserveCase(source: string, target: string) {
  if (source === source.toUpperCase()) {
    return target.toUpperCase();
  }

  if (source[0] === source[0]?.toUpperCase() && source.slice(1) === source.slice(1).toLowerCase()) {
    return target[0]?.toUpperCase() + target.slice(1);
  }

  return target;
}

function isIdentifierStart(character: string) {
  return /[A-Za-z_]/u.test(character);
}

function isIdentifierPart(character: string) {
  return /[A-Za-z0-9_]/u.test(character);
}

export function canonicalizeVisibleText(value: string) {
  return value.replaceAll(legacyCommandPattern, legacyCommand => {
    const canonicalCommand = canonicalCommands[legacyCommand.toLowerCase()];

    return preserveCase(legacyCommand, canonicalCommand);
  });
}

export function canonicalizePortugolCode(source: string) {
  let output = "";
  let index = 0;

  while (index < source.length) {
    if (source.startsWith("//", index)) {
      const lineEnd = source.indexOf("\n", index + 2);
      const commentEnd = lineEnd === -1 ? source.length : lineEnd;

      output += source.slice(index, commentEnd);
      index = commentEnd;
      continue;
    }

    if (source.startsWith("/*", index)) {
      const blockEnd = source.indexOf("*/", index + 2);
      const commentEnd = blockEnd === -1 ? source.length : blockEnd + 2;

      output += source.slice(index, commentEnd);
      index = commentEnd;
      continue;
    }

    const character = source[index];

    if (character === '"' || character === "'") {
      const quote = character;
      const stringStart = index;

      index++;

      while (index < source.length) {
        if (source[index] === "\\") {
          index += 2;
          continue;
        }

        if (source[index] === quote) {
          index++;
          break;
        }

        index++;
      }

      output += source.slice(stringStart, index);
      continue;
    }

    if (isIdentifierStart(character)) {
      const identifierStart = index;

      index++;

      while (index < source.length && isIdentifierPart(source[index])) {
        index++;
      }

      const identifier = source.slice(identifierStart, index);

      output += canonicalCommands[identifier] ?? identifier;
      continue;
    }

    output += character;
    index++;
  }

  return output;
}
