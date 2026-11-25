import type { ArduinoFeature } from "./arduino-language.js";

export function arduinoRuntime(features: Set<ArduinoFeature>): string[] {
  const sections: string[] = [];
  if (features.has("servo")) {
    sections.push(`#if defined(ARDUINO_ARCH_ESP32)
#include <ESP32Servo.h>
#else
#include <Servo.h>
#endif`);
  }
  if (features.has("dht")) sections.push("#include <DHT.h>");
  if (features.has("servo") || features.has("dht")) sections.push("#include <new>");
  if (features.has("dht") || features.has("map") || features.has("valid")) sections.push("#include <math.h>");

  if (features.has("servo") || features.has("dht") || features.has("ultrasonic")) {
    sections.push(`static const int dogol_hw_total_pinos = NUM_DIGITAL_PINS;

static bool dogol_hw_pino_valido(int pino, bool saida = false) {
  if (pino < 0 || pino >= dogol_hw_total_pinos) return false;
#if defined(ARDUINO_ARCH_ESP32)
  return digitalPinIsValid(pino) && (!saida || digitalPinCanOutput(pino));
#else
  return true;
#endif
}`);
  }

  if (features.has("servo")) {
    sections.push(`static Servo* dogol_hw_servos[dogol_hw_total_pinos] = {};

static bool dogol_hw_iniciar_servo(int pino) {
  if (!dogol_hw_pino_valido(pino, true)) return false;
  if (!dogol_hw_servos[pino]) dogol_hw_servos[pino] = new (std::nothrow) Servo();
  Servo* servo = dogol_hw_servos[pino];
  if (!servo) return false;
  if (!servo->attached()) servo->attach(pino);
  return servo->attached();
}

static bool dogol_hw_escrever_servo(int pino, double angulo) {
  if (!dogol_hw_pino_valido(pino, true) || !(angulo >= 0 && angulo <= 180)) return false;
  Servo* servo = dogol_hw_servos[pino];
  if (!servo || !servo->attached()) return false;
  servo->write(static_cast<int>(angulo));
  return true;
}

static void dogol_hw_parar_servo(int pino) {
  if (dogol_hw_pino_valido(pino) && dogol_hw_servos[pino]) dogol_hw_servos[pino]->detach();
}`);
  }

  if (features.has("dht")) {
    sections.push(`static DHT* dogol_hw_sensores_dht[dogol_hw_total_pinos] = {};
static int dogol_hw_tipos_dht[dogol_hw_total_pinos] = {};

static bool dogol_hw_iniciar_dht(int pino, int tipo) {
  if (!dogol_hw_pino_valido(pino, true) || (tipo != DHT11 && tipo != DHT22)) return false;
  if (dogol_hw_sensores_dht[pino] && dogol_hw_tipos_dht[pino] == tipo) return true;
  DHT* sensor = new (std::nothrow) DHT(pino, tipo);
  if (!sensor) return false;
  delete dogol_hw_sensores_dht[pino];
  dogol_hw_sensores_dht[pino] = sensor;
  dogol_hw_tipos_dht[pino] = tipo;
  sensor->begin();
  return true;
}

static float dogol_hw_ler_temperatura(int pino) {
  if (!dogol_hw_pino_valido(pino) || !dogol_hw_sensores_dht[pino]) return NAN;
  return dogol_hw_sensores_dht[pino]->readTemperature();
}

static float dogol_hw_ler_umidade(int pino) {
  if (!dogol_hw_pino_valido(pino) || !dogol_hw_sensores_dht[pino]) return NAN;
  return dogol_hw_sensores_dht[pino]->readHumidity();
}`);
  }

  if (features.has("ultrasonic")) {
    sections.push(`static float dogol_hw_ler_distancia(int gatilho, int eco, long tempo_limite = 30000) {
  if (!dogol_hw_pino_valido(gatilho, true) || !dogol_hw_pino_valido(eco) || gatilho == eco || tempo_limite <= 0 || tempo_limite > 1000000) return -1;
  pinMode(gatilho, OUTPUT);
  pinMode(eco, INPUT);
  digitalWrite(gatilho, LOW);
  delayMicroseconds(2);
  digitalWrite(gatilho, HIGH);
  delayMicroseconds(10);
  digitalWrite(gatilho, LOW);
  unsigned long duracao = pulseIn(eco, HIGH, static_cast<unsigned long>(tempo_limite));
  return duracao == 0 ? -1.0f : duracao * 0.0343f / 2.0f;
}`);
  }

  if (features.has("valid") || features.has("map")) {
    sections.push(`static bool dogol_hw_leitura_valida(double valor) {
  return !isnan(valor) && !isinf(valor);
}`);
  }

  if (features.has("map")) {
    sections.push(`static double dogol_hw_mapear(double valor, double entrada_min, double entrada_max, double saida_min, double saida_max) {
  if (entrada_min == entrada_max || !dogol_hw_leitura_valida(valor) || !dogol_hw_leitura_valida(entrada_min) || !dogol_hw_leitura_valida(entrada_max) || !dogol_hw_leitura_valida(saida_min) || !dogol_hw_leitura_valida(saida_max)) return NAN;
  return (valor - entrada_min) * (saida_max - saida_min) / (entrada_max - entrada_min) + saida_min;
}`);
  }

  return sections.length > 0 ? `${sections.join("\n\n")}\n`.split("\n") : [];
}
