# ESP32: sensor de toque capacitivo

## Objetivo e materiais

Detecte o toque de um dedo em uma superfície condutora e acenda um LED. Você precisa de ESP32 Dev Module clássico, cabo USB de dados, um pedaço de papel-alumínio ou outro eletrodo condutor, jumpers, LED, resistor de 220 Ω a 330 Ω e protoboard.

Este exemplo usa o sensor capacitivo interno do ESP32 clássico, sem um módulo de botão externo. Selecione **ESP32 Dev Module** no aplicativo. O Arduino Uno não possui essa API, e nem todas as variantes ESP32 oferecem sensores de toque. Os pinos e o comportamento abaixo são do ESP32 clássico.

## Ligações

Desconecte a alimentação antes de montar.

| Componente                 | Ligação                              |
| -------------------------- | ------------------------------------ |
| Eletrodo de papel-alumínio | fio conectado ao GPIO 4, canal T0    |
| GPIO 18                    | resistor em série com o ânodo do LED |
| Cátodo do LED              | GND                                  |

Prenda o eletrodo sobre uma base isolante. Não o conecte a 3V3, 5V ou GND: ele recebe somente o fio do GPIO de toque. Mantenha os fios curtos e confira o pinout da placa. `ler_toque` configura a leitura capacitiva; não é necessário chamar `modo_pino` nem habilitar `ENTRADA_PULLUP` para o eletrodo.

## Programa completo

```portugol
programa
{
  inclua biblioteca Arduino

  inteiro pino_toque = 4
  inteiro led = 18
  inteiro limiar = 30

  funcao inicio()
  {
    Arduino.modo_pino(led, SAIDA)
  }

  funcao loop()
  {
    inteiro leitura = Arduino.ler_toque(pino_toque)

    escreva("Toque: ", leitura)
    escreva()

    se (leitura < limiar)
    {
      Arduino.escrever_digital(led, ALTO)
    }
    senao
    {
      Arduino.escrever_digital(led, BAIXO)
    }

    Arduino.aguarde(100)
  }
}
```

## Entenda a tradução

`Arduino.ler_toque(pino_toque)` gera `touchRead(pino_toque)` no C/Arduino. O nome original `Arduino.touchRead(pino_toque)` também é aceito. O argumento é o **número do GPIO**, não o número do canal: para T0, passe `4`, não `0`.

A chamada retorna uma leitura capacitiva bruta, não `verdadeiro` ou `falso`. No ESP32 clássico ela normalmente diminui quando o dedo toca o eletrodo. A condição `leitura < limiar` transforma essa medição em uma decisão para o LED.

O valor `30` é apenas um ponto de partida. A leitura depende do eletrodo, fio, ambiente e montagem; esse número não é uma sensibilidade universal. No ESP32-S2/S3 o comportamento e a pinagem são diferentes, e a leitura pode aumentar ao tocar. Esses modelos ainda não são oferecidos pelo seletor de placas do Dogol.

## Enviar, observar e calibrar

1. Clique em **Abrir no editor**, conecte a montagem e escolha **ESP32 Dev Module**.
2. Atualize as portas, selecione a placa e clique em **Enviar para placa**.
3. Após o envio, abra a aba **Monitor serial**, ao lado de **Console**, e acompanhe **Toque: valor**. O monitor abre automaticamente a **9600 baud**. Use **Monitor serial** para abrir manualmente ou **Parar serial** para encerrar. Feche outros monitores que estejam usando a porta.
4. Anote várias leituras sem tocar no eletrodo e depois enquanto o toca. No ESP32 clássico, escolha um limiar entre os dois grupos.
5. Por exemplo, se a sua montagem apresentar aproximadamente `60` sem toque e `15` com toque, `30` pode servir como limiar. Esses números são ilustrativos.
6. Ajuste `limiar` e envie novamente. O monitor do Dogol pausa antes do envio e é retomado ao terminar.

O LED deve acender ao tocar e apagar ao soltar depois da calibração. O monitor recebe uma leitura a cada 100 milissegundos. A execução comum do Portugol no computador não simula o sensor; use **Enviar para placa**.

## Canais de toque do ESP32 clássico

| Canal | GPIO |
| ----- | ---- |
| T0    | 4    |
| T1    | 0    |
| T2    | 2    |
| T3    | 15   |
| T4    | 13   |
| T5    | 12   |
| T6    | 14   |
| T7    | 27   |
| T8    | 33   |
| T9    | 32   |

Os GPIOs 0, 2, 12 e 15 também participam da inicialização do chip. Para começar, mantenha o GPIO 4 deste exemplo. Verifique se o pino escolhido está exposto e livre na sua placa antes de trocar o eletrodo de posição.

## Experimente e resolva dificuldades

- Compare um eletrodo pequeno com um maior e refaça a calibração.
- Se o LED ficar sempre aceso ou apagado, observe os dois grupos de leitura e ajuste o limiar.
- Se a leitura oscilar, encurte o fio, afaste a montagem de fontes de ruído e confira o contato com o eletrodo.
- Uma leitura zero ou fixa também pode indicar pino inadequado ou falha de configuração; confira se é um GPIO de toque do ESP32 clássico.
- Se a compilação informar que `touchRead` não existe, confira a placa selecionada e a presença do periférico no chip. Trocar o nome para `ler_toque` não acrescenta hardware a uma placa sem sensor capacitivo.

Referências: [API TOUCH do Arduino-ESP32](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/touch.html) e [pinagem oficial do ESP32 clássico](https://github.com/espressif/arduino-esp32/blob/3.3.12/variants/esp32/pins_arduino.h).
