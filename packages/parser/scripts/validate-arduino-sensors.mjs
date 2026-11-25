import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { PortugolCodeError } from "@portugol-webstudio/antlr";

import { PortugolCArduino, PortugolErrorChecker } from "../lib/index.js";
import { writeArduinoStubs } from "./arduino-test-support.mjs";

function transpile(source) {
  const checked = PortugolErrorChecker.checkCode(source);
  assert.deepEqual(
    [...checked.parseErrors, ...checked.errors].map(error => error.message),
    [],
    `O programa de teste precisa passar pelo checker:\n${source}`,
  );
  return PortugolCArduino.transpileTree(checked.tree);
}

const sensors = transpile(`programa
{
  funcao logico iniciar_motor(inteiro pino) { retorne iniciar_servo(pino) }
  funcao logico mover_motor(inteiro pino, real angulo) { retorne escrever_servo(pino, angulo) }
  funcao parar_motor(inteiro pino) { parar_servo(pino) }
  funcao logico iniciar_clima(inteiro pino, inteiro modelo) { retorne iniciar_dht(pino, modelo) }
  funcao real temperatura(inteiro pino) { real valor valor = ler_temperatura(pino) retorne valor }
  funcao real umidade(inteiro pino) { real valor valor = ler_umidade(pino) retorne valor }
  funcao logico valido(real valor) { retorne leitura_valida(valor) }
  funcao inteiro movimento(inteiro pino) { inteiro valor valor = ler_pir(pino) retorne valor }
  funcao inteiro entrada(inteiro pino) { inteiro valor valor = ler_entrada(pino) retorne valor }
  funcao inteiro solo(inteiro pino) { inteiro valor valor = ler_umidade_solo(pino) retorne valor }
  funcao real distancia(inteiro gatilho, inteiro eco) { retorne ler_distancia(gatilho, eco) }
  funcao real distancia_timeout(inteiro gatilho, inteiro eco, inteiro tempo) { retorne ler_distancia(gatilho, eco, tempo) }
  funcao real faixa(real valor, real origem_min, real origem_max, real destino_min, real destino_max)
  { retorne mapear(valor, origem_min, origem_max, destino_min, destino_max) }
  funcao real alias_map() { retorne map(1, 0, 4, 0, 10) }
  funcao real alias_MAP() { retorne MAP(1, 0, 4, 0, 10) }
  funcao ligar(inteiro pino) { escrever_digital(pino, LIGADO) }
  funcao desligar(inteiro pino) { escrever_digital(pino, DESLIGADO) }
  funcao inicio()
  {
    modo_pino(18, SAIDA)
    modo_pino(27, ENTRADA_BOTAO)
    espere(125)
    espere_microssegundo(10)
  }
}`);

const sensorAssertions = `
#include <cassert>
#include <cmath>

static bool close_to(double actual, double expected) { return std::abs(actual - expected) < 0.0001; }

int main() {
  setup();
  assert(mock_modes[18] == OUTPUT && mock_modes[27] == INPUT_PULLUP);
  assert(mock_delay == 125);
  mock_analog[34] = 2048;
  assert(solo(34) == 2048);
  mock_digital[27] = LOW;
  assert(movimento(27) == LOW && entrada(27) == LOW);
  mock_digital[27] = HIGH;
  assert(movimento(27) == HIGH && entrada(27) == HIGH);
  ligar(18);
  assert(mock_digital[18] == HIGH);
  desligar(18);
  assert(mock_digital[18] == LOW);

  assert(!mover_motor(18, 90));
  assert(!iniciar_motor(-1) && !iniciar_motor(40));
  assert(!mover_motor(-1, 90) && !mover_motor(40, 90));
  assert(mock_servo_constructions == 0);
#if defined(ARDUINO_ARCH_ESP32)
  assert(!iniciar_motor(20) && !iniciar_motor(34));
#endif
  assert(iniciar_motor(18));
  assert(mock_servo_constructions == 1);
  assert(iniciar_motor(18) && mock_servo_constructions == 1);
  assert(mover_motor(18, 0) && mock_servo_angle == 0);
  assert(mover_motor(18, 180) && mock_servo_angle == 180);
  assert(!mover_motor(18, 181) && !mover_motor(18, -1));
  assert(!mover_motor(18, NAN) && !mover_motor(18, INFINITY));
  assert(mock_servo_angle == 180);
  parar_motor(18);
  assert(!mover_motor(18, 90));
  parar_motor(-1);
  parar_motor(40);
  assert(iniciar_motor(18) && mock_servo_constructions == 1);
  assert(mover_motor(18, 90) && mock_servo_angle == 90);

  assert(std::isnan(temperatura(23)) && std::isnan(umidade(23)));
  assert(std::isnan(temperatura(-1)) && std::isnan(umidade(40)));
  assert(!iniciar_clima(-1, DHT22) && !iniciar_clima(40, DHT11));
  assert(!iniciar_clima(23, 99) && mock_dht_constructions == 0);
#if defined(ARDUINO_ARCH_ESP32)
  assert(!iniciar_clima(34, DHT22));
#endif
  assert(iniciar_clima(23, DHT22));
  assert(mock_dht_constructions == 1 && mock_dht_begins == 1);
  assert(iniciar_clima(23, DHT22));
  assert(mock_dht_constructions == 1 && mock_dht_begins == 1 && mock_dht_destructions == 0);
  mock_temperature = 23.75f;
  mock_humidity = 65.5f;
  assert(close_to(temperatura(23), 23.75) && close_to(umidade(23), 65.5));
  assert(valido(temperatura(23)) && valido(umidade(23)));
  assert(iniciar_clima(23, DHT11));
  assert(mock_dht_constructions == 2 && mock_dht_begins == 2 && mock_dht_destructions == 1);
  assert(close_to(temperatura(23), 23.75) && close_to(umidade(23), 65.5));
  assert(!iniciar_clima(23, 99) && mock_dht_destructions == 1);
  assert(iniciar_clima(22, DHT22) && mock_dht_constructions == 3);
  mock_temperature = NAN;
  mock_humidity = NAN;
  assert(std::isnan(temperatura(23)) && std::isnan(umidade(23)));
  assert(!valido(temperatura(23)) && !valido(umidade(23)));

  mock_pulse = 0;
  assert(distancia(25, 26) == -1 && mock_timeout == 30000);
  mock_pulse = 1000;
  mock_writes.clear();
  assert(close_to(distancia(25, 26), 17.15));
  assert(mock_modes[25] == OUTPUT && mock_modes[26] == INPUT);
  const std::vector<std::pair<int, int>> expected_writes = {{25, LOW}, {25, HIGH}, {25, LOW}};
  assert(mock_writes == expected_writes);
  assert(close_to(distancia_timeout(25, 26, 300000), 17.15) && mock_timeout == 300000);
  mock_writes.clear();
  assert(distancia_timeout(25, 26, 0) == -1);
  assert(distancia_timeout(25, 26, -1) == -1);
  assert(distancia_timeout(25, 26, 1000001) == -1);
  assert(distancia(-1, 26) == -1 && distancia(25, 40) == -1 && distancia(25, 25) == -1);
#if defined(ARDUINO_ARCH_ESP32)
  assert(distancia(34, 26) == -1);
#endif
  assert(mock_writes.empty());

  assert(close_to(faixa(1, 0, 4, 0, 10), 2.5));
  assert(close_to(alias_map(), 2.5) && close_to(alias_MAP(), 2.5));
  assert(close_to(faixa(75, 100, 0, 0, 10), 2.5));
  assert(close_to(faixa(20, 0, 10, 0, 100), 200));
  assert(close_to(faixa(25, 0, 100, 100, 0), 75));
  assert(std::isnan(faixa(1, 5, 5, 0, 10)));
  assert(std::isnan(faixa(NAN, 0, 10, 0, 100)));
  assert(std::isnan(faixa(1, INFINITY, 10, 0, 100)));
  assert(std::isnan(faixa(1, 0, 10, NAN, 100)));
  assert(!valido(NAN) && !valido(INFINITY) && !valido(-INFINITY));
  assert(valido(0) && valido(-12.5));
}
`;

const compatibility = transpile(`programa
{
  inclua biblioteca Arduino
  funcao inicio()
  {
    Arduino.modo_pino(18, SAIDA)
    Arduino.escrever_digital(18, ALTO)
    Arduino.aguarde(10)
    Arduino.aguarde_microssegundos(2)
    Arduino.delay(20)
    Arduino.delayMicroseconds(3)
    Arduino.pinMode(27, ENTRADA_PULLUP)
  }
  funcao inteiro ler_legado() { retorne Arduino.ler_digital(27) }
  funcao real mapear_legado() { retorne Arduino.mapear(1, 0, 4, 0, 10) }
}`);

const compatibilityAssertions = `
#include <cassert>
int main() {
  setup();
  assert(mock_modes[18] == OUTPUT && mock_digital[18] == HIGH);
  assert(mock_modes[27] == INPUT_PULLUP && mock_delay == 20);
  mock_digital[27] = LOW;
  assert(ler_legado() == LOW);
  assert(mapear_legado() == 2.5f);
}
`;

const shadowing = transpile(`programa
{
  inteiro LIGADO = 17
  funcao inteiro espere(inteiro a, inteiro b) { retorne a + b }
  funcao real mapear(real valor) { retorne valor + 2.5 }
  funcao real builtin_explicito() { retorne Arduino.mapear(1, 0, 4, 0, 10) }
  funcao inteiro parametro(inteiro LIGADO) { retorne LIGADO }
  funcao inteiro local() { inteiro LIGADO = 9 retorne LIGADO }
  funcao inteiro blocos()
  {
    inteiro soma = 0
    se (verdadeiro) { inteiro LIGADO = 7 soma = soma + LIGADO }
    senao { inteiro LIGADO = 8 soma = soma + LIGADO }
    soma = soma + LIGADO
    para (inteiro LIGADO = 0; LIGADO < 3; LIGADO++) { soma = soma + LIGADO }
    soma = soma + LIGADO
    retorne soma
  }
  funcao inicio() {}
}`);

const shadowingAssertions = `
#include <cassert>
int main() {
  assert(LIGADO == 17);
  assert(espere(2, 5) == 7);
  assert(mapear(1) == 3.5f);
  assert(builtin_explicito() == 2.5f);
  assert(parametro(11) == 11 && local() == 9);
  assert(blocos() == 44);
}
`;

for (const call of [
  "iniciar_servo()",
  "escrever_servo(18)",
  "iniciar_dht(23)",
  "ler_distancia(25)",
  "ler_distancia(25, 26, 30000, 0)",
  "mapear(1, 2, 3)",
  "Arduino.aguarde(1, 2)",
  "espere_microssegundo()",
]) {
  const checked = PortugolErrorChecker.checkCode(`programa\n{\n  funcao inicio() {\n    ${call}\n  }\n}`);
  assert.deepEqual(
    [...checked.parseErrors, ...checked.errors].map(error => error.message),
    [],
  );
  assert.throws(
    () => PortugolCArduino.transpileTree(checked.tree),
    error => {
      assert.ok(error instanceof PortugolCodeError, `${call}: erro precisa conter localização Portugol.`);
      assert.match(error.message, /argumento\(s\)/u);
      assert.equal(error.startLine, 4);
      assert.equal(error.endLine, 4);
      assert.ok(error.startCol >= 4 && error.endCol > error.startCol);
      return true;
    },
  );
}
console.log("ok sensores: novas funções em atribuições/retornos, aliases legados e aridade com linha/coluna");

const basic = transpile(
  "programa { funcao inicio() { modo_pino(18, SAIDA) escrever_digital(18, LIGADO) espere(10) } }",
);
for (const forbidden of [
  "#include <DHT.h>",
  "#include <Servo.h>",
  "#include <ESP32Servo.h>",
  "dogol_hw_mapear",
  "dogol_hw_servos",
]) {
  assert.ok(!basic.includes(forbidden), `Programa básico não deve carregar recursos opcionais: ${forbidden}`);
}
const mapOnly = transpile("programa { funcao inicio() { real valor = mapear(1, 0, 4, 0, 10) } }");
assert.ok(mapOnly.includes("dogol_hw_mapear"));
assert.ok(!mapOnly.includes("#include <DHT.h>") && !mapOnly.includes("#include <Servo.h>"));
console.log("ok recursos opcionais: programa básico não inclui Servo, DHT ou MAP sem utilização");

let hasGpp = true;
try {
  execFileSync("g++", ["--version"], { stdio: "ignore" });
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  hasGpp = false;
}

if (hasGpp) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dogol-sensor-tests-"));
  try {
    writeArduinoStubs(tempDir);
    for (const [name, cpp, assertions] of [
      ["sensores", sensors, sensorAssertions],
      ["compatibilidade", compatibility, compatibilityAssertions],
      ["sombreamento", shadowing, shadowingAssertions],
    ]) {
      const source = path.join(tempDir, `${name}.cpp`);
      fs.writeFileSync(source, cpp + assertions);
      for (const board of ["ESP32", "Uno"]) {
        const executable = path.join(tempDir, `${name}-${board}${process.platform === "win32" ? ".exe" : ""}`);
        try {
          execFileSync(
            "g++",
            [
              "-std=c++17",
              "-I",
              tempDir,
              ...(board === "ESP32" ? ["-DARDUINO_ARCH_ESP32"] : []),
              source,
              "-o",
              executable,
            ],
            { stdio: "pipe" },
          );
          execFileSync(executable, [], { stdio: "pipe", timeout: 10_000 });
        } catch (error) {
          throw new Error(
            `${name}/${board}: compilação ou comportamento inesperado.\n${error.stderr?.toString() || error.message}`,
          );
        }
        console.log(`ok ${name}/${board}: código gerado compilado e executado com asserts`);
      }
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
} else {
  console.warn("Aviso: g++ ausente; testes executáveis dos sensores ignorados. O CI deve disponibilizar g++.");
}
