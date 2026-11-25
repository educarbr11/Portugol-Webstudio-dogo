import { TipoPrimitivo } from "./helpers/Tipo.js";

export type ArduinoFeature = "servo" | "dht" | "ultrasonic" | "map" | "valid";

export interface ArduinoFunction {
  name: string;
  aliases: string[];
  cppName: string;
  returnType: TipoPrimitivo;
  minArgs: number;
  maxArgs: number;
  feature?: ArduinoFeature;
}

function defineFunction(
  name: string,
  aliases: string[],
  cppName: string,
  returnType: TipoPrimitivo,
  minArgs: number,
  maxArgs = minArgs,
  feature?: ArduinoFeature,
): ArduinoFunction {
  return { name, aliases, cppName, returnType, minArgs, maxArgs, feature };
}

export const arduinoFunctions: ArduinoFunction[] = [
  defineFunction("modo_pino", ["pinMode"], "pinMode", TipoPrimitivo.VAZIO, 2),
  defineFunction("escrever_digital", ["digitalWrite"], "digitalWrite", TipoPrimitivo.VAZIO, 2),
  defineFunction("ler_entrada", ["ler_digital", "digitalRead"], "digitalRead", TipoPrimitivo.INTEIRO, 1),
  defineFunction("escrever_analogico", ["analogWrite"], "analogWrite", TipoPrimitivo.VAZIO, 2),
  defineFunction("ler_analogico", ["analogRead"], "analogRead", TipoPrimitivo.INTEIRO, 1),
  defineFunction("ler_toque", ["touchRead"], "touchRead", TipoPrimitivo.INTEIRO, 1),
  defineFunction("espere", ["aguarde", "delay", "delay_ms"], "delay", TipoPrimitivo.VAZIO, 1),
  defineFunction(
    "espere_microssegundo",
    ["aguarde_microssegundos", "delayMicroseconds", "delay_us"],
    "delayMicroseconds",
    TipoPrimitivo.VAZIO,
    1,
  ),
  defineFunction("milissegundos", ["millis"], "millis", TipoPrimitivo.INTEIRO, 0),
  defineFunction("microssegundos", ["micros"], "micros", TipoPrimitivo.INTEIRO, 0),
  defineFunction("tom", ["tone"], "tone", TipoPrimitivo.VAZIO, 2, 3),
  defineFunction("parar_tom", ["noTone"], "noTone", TipoPrimitivo.VAZIO, 1),
  defineFunction("pulseIn", [], "pulseIn", TipoPrimitivo.INTEIRO, 2, 3),
  defineFunction("shiftOut", [], "shiftOut", TipoPrimitivo.VAZIO, 4),
  defineFunction("shiftIn", [], "shiftIn", TipoPrimitivo.INTEIRO, 3),
  defineFunction("iniciar_servo", [], "dogol_hw_iniciar_servo", TipoPrimitivo.LÓGICO, 1, 1, "servo"),
  defineFunction("escrever_servo", [], "dogol_hw_escrever_servo", TipoPrimitivo.LÓGICO, 2, 2, "servo"),
  defineFunction("parar_servo", [], "dogol_hw_parar_servo", TipoPrimitivo.VAZIO, 1, 1, "servo"),
  defineFunction("iniciar_dht", [], "dogol_hw_iniciar_dht", TipoPrimitivo.LÓGICO, 2, 2, "dht"),
  defineFunction("ler_temperatura", [], "dogol_hw_ler_temperatura", TipoPrimitivo.REAL, 1, 1, "dht"),
  defineFunction("ler_umidade", [], "dogol_hw_ler_umidade", TipoPrimitivo.REAL, 1, 1, "dht"),
  defineFunction("leitura_valida", [], "dogol_hw_leitura_valida", TipoPrimitivo.LÓGICO, 1, 1, "valid"),
  defineFunction("ler_pir", [], "digitalRead", TipoPrimitivo.INTEIRO, 1),
  defineFunction("ler_umidade_solo", [], "analogRead", TipoPrimitivo.INTEIRO, 1),
  defineFunction("ler_distancia", [], "dogol_hw_ler_distancia", TipoPrimitivo.REAL, 2, 3, "ultrasonic"),
  defineFunction("mapear", ["map", "MAP"], "dogol_hw_mapear", TipoPrimitivo.REAL, 5, 5, "map"),
];

export const arduinoConstants: Record<string, string> = {
  LIGADO: "HIGH",
  DESLIGADO: "LOW",
  ENTRADA_BOTAO: "INPUT_PULLUP",
  DHT11: "DHT11",
  DHT22: "DHT22",
  ALTO: "HIGH",
  BAIXO: "LOW",
  SAIDA: "OUTPUT",
  ENTRADA: "INPUT",
  ENTRADA_PULLUP: "INPUT_PULLUP",
  alto: "HIGH",
  baixo: "LOW",
  saida: "OUTPUT",
  entrada: "INPUT",
  entrada_pullup: "INPUT_PULLUP",
  HIGH: "HIGH",
  LOW: "LOW",
  OUTPUT: "OUTPUT",
  INPUT: "INPUT",
  INPUT_PULLUP: "INPUT_PULLUP",
};
