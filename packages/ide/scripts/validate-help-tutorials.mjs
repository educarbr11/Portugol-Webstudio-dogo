import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

import { PortugolCArduino, PortugolErrorChecker } from "../../parser/lib/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const helpDir = path.join(root, "packages/ide/src/app/tab-help");
const assetsDir = path.join(root, "packages/ide/src/assets");
const tutorialsDir = path.join(assetsDir, "ajuda/arduino-esp32");

async function importTypescript(file) {
  const source = fs.readFileSync(file, "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: file,
  });

  return import(`data:text/javascript;base64,${Buffer.from(result.outputText).toString("base64")}`);
}

const { getHelpContentBlocks } = await importTypescript(path.join(helpDir, "help-content.ts"));
const { arduinoTutorialsTree } = await importTypescript(path.join(helpDir, "tutoriais-arduino.ts"));

function validateExtraction() {
  const code =
    'programa\n{\n  // Comentário e indentação preservados\n  funcao inicio()\n  {\n    escreva("Olá!", 42)\n  }\n}\n';
  const markdown = `# Tutorial\n\nAntes do programa.\n\n\`\`\`portugol\n${code}\`\`\`\n\nDepois do programa.`;
  const blocks = getHelpContentBlocks(markdown, "Piscar LED");

  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].source, "# Tutorial\n\nAntes do programa.");
  assert.deepEqual(blocks[1].example, { name: "Piscar LED.por", contents: code });
  assert.equal(blocks[1].source, `\`\`\`portugol\n${code}\`\`\``);
  assert.equal(blocks[2].source, "Depois do programa.");

  const repeated = getHelpContentBlocks(`${markdown}\n\n${markdown}`, "Sintaxe");
  const examples = repeated.filter(block => block.example).map(block => block.example);

  assert.deepEqual(
    examples.map(example => example.name),
    ["Sintaxe.por", "Sintaxe (2).por"],
  );
  assert.ok(examples.every(example => example.contents === code));

  const windowsExamples = getHelpContentBlocks(`${markdown}\n\n${markdown}`, "Uno: piscar")
    .filter(block => block.example)
    .map(block => block.example);

  assert.deepEqual(
    windowsExamples.map(example => example.name),
    ["Uno- piscar.por", "Uno- piscar (2).por"],
  );
  assert.ok(windowsExamples.every(example => example.contents === code));

  for (const character of ["<", ">", ":", '"', "/", "\\", "|", "?", "*"]) {
    const example = getHelpContentBlocks(markdown, `Exemplo${character}Windows`)[1].example;
    assert.equal(example.name, "Exemplo-Windows.por");
    assert.equal(example.contents, code);
  }

  const crlfCode = code.replaceAll("\n", "\r\n");
  const crlfMarkdown = `\`\`\`portugol\r\n${crlfCode}\`\`\`\r\n`;
  const crlfExample = getHelpContentBlocks(crlfMarkdown, "Windows")[0].example;

  assert.equal(crlfExample.contents, `${crlfCode.trimEnd()}\n`);
  assert.deepEqual(getHelpContentBlocks("", "Vazio"), []);
  assert.deepEqual(getHelpContentBlocks("  Só texto.\n", "Texto"), [{ source: "Só texto." }]);

  for (const fragment of [
    "```text\ninteiro led = 13\n```",
    "```cpp\ndigitalWrite(13, HIGH);\n```",
    "```portugol\nprograma {",
    "Exemplo inline: `inteiro led = 13`.",
  ]) {
    assert.ok(getHelpContentBlocks(fragment, "Fragmento").every(block => !block.example));
  }

  console.log("ok extração de exemplos: texto, código, nomes compatíveis com Windows, CRLF e fragmentos");
}

function getTutorials() {
  const ids = new Set();
  const files = new Set();
  const tutorials = [];

  function visit(item) {
    assert.ok(item.id && item.text, "Todo tópico precisa de ID e título.");
    assert.ok(!ids.has(item.id), `ID de tópico duplicado: ${item.id}`);
    ids.add(item.id);
    assert.equal(item.kind, "markdown", `${item.id}: tutorial deve usar Markdown.`);

    if (item.markdownPath) {
      assert.ok(item.markdownPath.startsWith("assets/ajuda/arduino-esp32/"));
      const file = path.resolve(assetsDir, item.markdownPath.slice("assets/".length));
      assert.ok(file.startsWith(`${tutorialsDir}${path.sep}`), `Caminho inválido: ${item.markdownPath}`);
      assert.ok(!files.has(file), `Tutorial registrado mais de uma vez: ${item.markdownPath}`);
      assert.ok(fs.existsSync(file), `Tutorial ausente: ${item.markdownPath}`);
      files.add(file);
      const source = fs.readFileSync(file, "utf8");
      assert.match(source, /^# .+/u, `${item.id}: o documento precisa começar com um título.`);
      tutorials.push({ item, source, file });
    } else {
      assert.ok(item.source?.startsWith("# "), `${item.id}: seção sem conteúdo introdutório.`);
    }

    for (const child of item.children ?? []) visit(child);
  }

  visit(arduinoTutorialsTree);

  const assets = fs
    .readdirSync(tutorialsDir)
    .filter(file => file.endsWith(".md"))
    .sort();
  const registered = [...files].map(file => path.basename(file)).sort();
  assert.deepEqual(registered, assets, "Todos os tutoriais locais devem aparecer na árvore da Ajuda.");
  assert.ok(tutorials.length > 0, "A árvore precisa incluir tutoriais locais.");

  console.log(`ok navegação: ${ids.size} tópicos, ${tutorials.length} tutoriais locais`);
  return tutorials;
}

const arduinoHeader = `#pragma once
#include <stdint.h>
class String { public: String(const char* = "") {} };
class SerialClass { public: void begin(int) {} template <typename T> void print(T) {} void println() {} };
extern SerialClass Serial;
#define HIGH 1
#define LOW 0
#define OUTPUT 1
#define INPUT 0
#define INPUT_PULLUP 2
#define A0 14
void pinMode(int, int);
void digitalWrite(int, int);
int digitalRead(int);
void analogWrite(int, int);
int analogRead(int);
void delay(unsigned long);
void delayMicroseconds(unsigned long);
unsigned long millis();
unsigned long micros();
void tone(int, unsigned int);
void noTone(int);
unsigned long pulseIn(int, int, unsigned long = 1000000);
void shiftOut(int, int, int, uint8_t);
uint8_t shiftIn(int, int, int);
`;

function validatePrograms(tutorials) {
  let hasGpp = true;
  try {
    execFileSync("g++", ["--version"], { stdio: "ignore" });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    hasGpp = false;
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dogol-help-validation-"));
  let count = 0;

  try {
    fs.writeFileSync(path.join(tempDir, "Arduino.h"), arduinoHeader);

    for (const { item, source, file } of tutorials) {
      const examples = getHelpContentBlocks(source, item.text).filter(block => block.example);

      for (const block of examples) {
        count++;
        const { name, contents } = block.example;
        const result = PortugolErrorChecker.checkCode(contents);
        const errors = [...result.parseErrors, ...result.errors];
        assert.equal(
          errors.length,
          0,
          `${path.basename(file)}: ${name}\n${errors.map(error => error.message).join("\n")}`,
        );

        const cpp = PortugolCArduino.transpileTree(result.tree);
        assert.ok(!cpp.includes("TODO"), `${name}: o código C++ gerado contém um trecho não implementado.`);
        assert.match(cpp, /void setup\(\)/u, `${name}: setup ausente.`);
        assert.match(cpp, /void loop\(\)/u, `${name}: loop ausente.`);

        if (hasGpp) {
          const output = path.join(tempDir, `example-${count}.cpp`);
          fs.writeFileSync(output, cpp);
          try {
            execFileSync("g++", ["-std=c++17", "-fsyntax-only", "-I", tempDir, output], { stdio: "pipe" });
          } catch (error) {
            throw new Error(
              `${name}: C++ gerado não passou na validação sintática.\n${error.stderr?.toString() || error.message}`,
            );
          }
        }

        console.log(`ok ${path.basename(file)} → ${name}`);
      }
    }

    assert.ok(count > 0, "Os tutoriais precisam incluir programas abríveis no editor.");
    console.log(`ok ${count} programas: parser Portugol, geração Arduino${hasGpp ? " e sintaxe C++ com stub" : ""}`);
    if (!hasGpp) console.warn("g++ ausente: a validação sintática C++ foi ignorada.");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

validateExtraction();
validatePrograms(getTutorials());
