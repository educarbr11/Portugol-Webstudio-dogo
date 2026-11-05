import { TreeItem } from "./types";

function tutorial(id: string, text: string): TreeItem {
  return {
    id: `arduino-esp32-${id}`,
    text,
    kind: "markdown",
    markdownPath: `assets/ajuda/arduino-esp32/${id}.md`,
  };
}

export const arduinoTutorialsTree: TreeItem = {
  id: "arduino-esp32",
  text: "Arduino e ESP32",
  kind: "markdown",
  source: `# Arduino e ESP32

Aprenda a programar sua placa em Portugol com tutoriais completos, ligações e exemplos prontos para abrir no editor.

## Por onde começar

1. Leia **Primeiros passos e envio para a placa** para conectar e preparar seu Arduino Uno ou ESP32 Dev Module.
2. Consulte **Sintaxe do Portugol para placas** e **Funções e constantes Arduino**.
3. Escolha um circuito na pasta da sua placa e siga as ligações antes de enviar o programa.

Cada programa completo tem um botão **Abrir no editor**. O exemplo abre em uma nova aba para você estudar, alterar e enviar para a placa.

Os tutoriais ficam disponíveis no aplicativo sem internet. O primeiro preparo de cada placa precisa de conexão para baixar o core e as bibliotecas.

Se encontrar dificuldades, consulte **Limitações e compatibilidade** e **Solução de problemas**.`,
  children: [
    tutorial("primeiros-passos", "Primeiros passos e envio para a placa"),
    tutorial("sintaxe", "Sintaxe do Portugol para placas"),
    tutorial("funcoes-arduino", "Funções e constantes Arduino"),
    {
      id: "arduino-uno-tutoriais",
      text: "Arduino Uno",
      kind: "markdown",
      source: `# Tutoriais para Arduino Uno

Comece pelo LED integrado e avance para entradas digitais, leitura analógica, PWM e som.

Selecione um tutorial abaixo. Cada um inclui os materiais, as ligações, o código completo e o resultado esperado.

O Arduino Uno usa lógica de **5 V**. Ao usar um LED externo, coloque um resistor em série.`,
      children: [
        tutorial("uno-led", "Uno: piscar o LED integrado"),
        tutorial("uno-botao", "Uno: botão com resistor interno"),
        tutorial("uno-potenciometro", "Uno: potenciômetro e brilho por PWM"),
        tutorial("uno-buzzer", "Uno: som com piezo passivo"),
      ],
    },
    {
      id: "esp32-tutoriais",
      text: "ESP32 Dev Module",
      kind: "markdown",
      source: `# Tutoriais para ESP32 Dev Module

Pratique saídas digitais, botão, ADC, PWM e temporização com o ESP32 clássico.

Os exemplos usam um LED externo no **GPIO 18**, pois o LED integrado varia conforme a placa. Confira o pinout do seu modelo antes de montar.

O ESP32 usa lógica de **3,3 V**. Nunca aplique 5 V diretamente nos GPIOs.`,
      children: [
        tutorial("esp32-led", "ESP32: piscar um LED externo"),
        tutorial("esp32-botao", "ESP32: ler um botão"),
        tutorial("esp32-analogico", "ESP32: leitura analógica de sensor"),
        tutorial("esp32-pwm", "ESP32: controlar brilho por PWM"),
        tutorial("esp32-temporizacao", "ESP32: temporização sem bloquear"),
      ],
    },
    tutorial("limitacoes", "Limitações e compatibilidade"),
    tutorial("solucao-problemas", "Solução de problemas"),
  ],
};
