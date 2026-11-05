# Funções Arduino

Nos programas de hardware, use `inclua biblioteca Arduino` e chamadas com o prefixo `Arduino.`. O gerador reconhece o nome original ou o alias em português. Essas chamadas controlam a placa depois da compilação e do envio; não simulam os pinos na execução comum do Portugol.

## Entradas e saídas

| Nome original | Alias | Parâmetros e resultado |
| --- | --- | --- |
| `pinMode` | `modo_pino` | pino, modo; configura entrada ou saída |
| `digitalWrite` | `escrever_digital` | pino, nível; define `ALTO` ou `BAIXO` |
| `digitalRead` | `ler_digital` | pino; retorna o nível digital |
| `analogRead` | `ler_analogico` | pino ADC; retorna uma leitura inteira |
| `analogWrite` | `escrever_analogico` | pino PWM, valor; controla a razão cíclica |

Exemplos de chamadas isoladas, para consultar a sintaxe:

```text
Arduino.modo_pino(13, SAIDA)
Arduino.escrever_digital(13, ALTO)
inteiro estado = Arduino.ler_digital(2)
inteiro leitura = Arduino.ler_analogico(A0)
Arduino.escrever_analogico(9, 128)
```

`analogWrite` gera PWM nos exemplos deste guia, não uma tensão analógica contínua. O pino precisa oferecer a função na placa escolhida. No Uno, use um dos pinos `3`, `5`, `6`, `9`, `10` ou `11` para PWM.

## Tempo e som

| Nome original | Alias | Uso |
| --- | --- | --- |
| `delay` | `aguarde` | pausa por uma quantidade de milissegundos |
| `delayMicroseconds` | `aguarde_microssegundos` | pausa em microssegundos |
| `millis` | `milissegundos` | tempo desde a inicialização em milissegundos |
| `micros` | `microssegundos` | tempo desde a inicialização em microssegundos |
| `tone` | `tom` | pino, frequência em hertz; inicia um tom |
| `noTone` | `parar_tom` | pino; interrompe o tom |

Também são reconhecidos `delay_ms` para `delay` e `delay_us` para `delayMicroseconds`.

```text
Arduino.aguarde(1000)
Arduino.aguarde_microssegundos(10)
Arduino.tom(8, 440)
Arduino.parar_tom(8)
```

`aguarde()` bloqueia a sequência de instruções durante a pausa. Para entender uma alternativa, abra **Arduino e ESP32 > ESP32 Dev Module > ESP32: temporização sem bloquear**. Esse tutorial explica o limite do tipo `inteiro` ao armazenar o retorno de `millis()`.

## Operações adicionais reconhecidas

| Função | Uso e observação |
| --- | --- |
| `pulseIn(pino, nivel)` | mede um pulso; o retorno original é `unsigned long` |
| `shiftOut(dados, clock, ordem, valor)` | envia um byte por dois pinos digitais |
| `shiftIn(dados, clock, ordem)` | lê um byte por dois pinos digitais |

Esses nomes são encaminhados ao core Arduino. O reconhecimento de uma chamada não garante que o circuito, os valores ou constantes específicas do core sejam válidos no Portugol. O gerador ainda não oferece todos os tipos e constantes da API Arduino. Comece pelos exemplos completos de GPIO, ADC, PWM e som desta ajuda.

## Constantes e pinagem

| Portugol | Arduino | Significado |
| --- | --- | --- |
| `ALTO` | `HIGH` | nível lógico alto |
| `BAIXO` | `LOW` | nível lógico baixo |
| `SAIDA` | `OUTPUT` | pino de saída |
| `ENTRADA` | `INPUT` | pino de entrada |
| `ENTRADA_PULLUP` | `INPUT_PULLUP` | entrada com resistor interno de elevação |

Os aliases também aceitam letras minúsculas. O analisador reconhece `A0` até `A15`, mas cada placa só possui parte desses pinos. Para o ESP32 clássico, os tutoriais usam números de GPIO, como `18`, `27` e `34`.

Com `ENTRADA_PULLUP`, o botão ligado ao GND retorna `BAIXO` quando pressionado e `ALTO` quando solto. Isso evita uma entrada flutuante sem exigir um resistor externo de pull-up.

## Serial

O gerador prepara `Serial.begin(9600)` automaticamente. `escreva("Valor: ", valor)` envia os argumentos para `Serial.print`. Chame `escreva()` sem argumentos para encerrar a linha. Para ler a saída, use um monitor serial externo a 9600 baud; feche-o antes de enviar outro programa.

`leia()` por Serial, Wi-Fi, Bluetooth e métodos de objetos de bibliotecas externas ainda não têm suporte nesta conversão. Consulte **Arduino e ESP32 > Limitações e compatibilidade** antes de adaptar um exemplo de Arduino C/C++ encontrado em outra fonte.
