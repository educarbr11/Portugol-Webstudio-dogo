import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { writeArduinoStubs } from "./arduino-test-support.mjs";

import { PortugolCArduino, PortugolErrorChecker } from "../lib/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parserDir = path.resolve(__dirname, "..");
const examplesDir = path.join(parserDir, "examples", "c-arduino");
const buildDir = path.join(parserDir, ".generated", "c-arduino");

const requiredSnippetsByFile = {
  "01_basico.por": ["int dobro(int valor)", "bool ligado = false;", "Serial.print(mensagem);"],
  "02_lacos_escolha.por": ["for (i = 0; i < 5; i++)", "soma += i;", "while ((soma < 20))", "switch (soma)"],
  "03_vetores_matrizes.por": ["int valores[3] = { 1, 2, 3 };", "matriz[0][1] = (matriz[0][0] << 1);"],
  "04_arduino_aliases.por": ["pinMode(led, OUTPUT);", "digitalWrite(led, HIGH);", "void loop()"],
  "05_esp32_toque.por": [
    "int leitura = touchRead(pino_toque);",
    "int leitura_original = touchRead(4);",
    "if ((touchRead(4) < limiar))",
  ],
  "06_sintaxe_sem_prefixo.por": [
    "pinMode(botao, INPUT_PULLUP);",
    "return digitalRead(botao);",
    "estado = digitalRead(botao);",
    "digitalWrite(led, HIGH);",
    "digitalWrite(led, LOW);",
    "delay(100);",
    "delayMicroseconds(10);",
  ],
};

fs.rmSync(buildDir, { recursive: true, force: true });
fs.mkdirSync(buildDir, { recursive: true });

const examples = fs
  .readdirSync(examplesDir)
  .filter(file => file.endsWith(".por"))
  .sort();

if (examples.length === 0) {
  throw new Error(`Nenhum exemplo .por encontrado em ${examplesDir}`);
}

const arduinoHeaderDir = fs.mkdtempSync(path.join(os.tmpdir(), "portugol-arduino-stub-"));
writeArduinoStubs(arduinoHeaderDir);

let hasGpp = true;

try {
  execFileSync("g++", ["--version"], { stdio: "ignore" });
} catch {
  hasGpp = false;
}

let failed = false;

for (const file of examples) {
  const code = fs.readFileSync(path.join(examplesDir, file), "utf8");
  const result = PortugolErrorChecker.checkCode(code);

  if (result.parseErrors.length > 0 || result.errors.length > 0) {
    failed = true;
    console.error(`\n${file}: falhou na analise Portugol`);
    for (const error of [...result.parseErrors, ...result.errors]) {
      console.error(`- ${error.message}`);
    }
    continue;
  }

  const c = PortugolCArduino.transpileTree(result.tree);
  const outputFile = path.join(buildDir, file.replace(/\.por$/u, ".cpp"));
  fs.writeFileSync(outputFile, c);

  if (c.includes("TODO")) {
    failed = true;
    console.error(`\n${file}: C gerado ainda contem TODO`);
  }

  for (const snippet of requiredSnippetsByFile[file] ?? []) {
    if (!c.includes(snippet)) {
      failed = true;
      console.error(`\n${file}: trecho esperado nao encontrado: ${snippet}`);
    }
  }

  if (hasGpp) {
    try {
      execFileSync("g++", ["-std=c++17", "-fsyntax-only", "-I", arduinoHeaderDir, outputFile], { stdio: "pipe" });
    } catch (error) {
      failed = true;
      console.error(`\n${file}: C++ gerado nao passou no g++ -fsyntax-only`);
      console.error(error.stderr?.toString() || error.message);
    }
  }

  console.log(`ok ${file} -> ${path.relative(parserDir, outputFile)}`);
}

fs.rmSync(arduinoHeaderDir, { recursive: true, force: true });

if (!hasGpp) {
  console.warn("Aviso: g++ nao encontrado; a validacao ficou restrita a parser, snippets e ausencia de TODO.");
}

if (failed) {
  process.exitCode = 1;
}
