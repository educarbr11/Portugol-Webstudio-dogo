# Funções e constantes Arduino

A partir da versão 0.1.5, escreva as funções de hardware diretamente, como `modo_pino(18, SAIDA)`. Não é necessário usar o prefixo `Arduino.` nem `inclua biblioteca Arduino`. Os comandos controlam a placa depois de compilar e enviar; a execução comum no computador não simula sensores.

Esta referência corresponde à **versão 0.1.5**. Os instaladores 0.1.4 e anteriores não incluem todos os novos comandos de sensores.

## Entradas e saídas

| Chamada em Portugol | Resultado ou efeito |
| --- | --- |
| `modo_pino(pino, modo)` | configura `SAIDA`, `ENTRADA` ou `ENTRADA_BOTAO` |
| `escrever_digital(pino, LIGADO)` | escreve HIGH; use `DESLIGADO` para LOW |
| `ler_entrada(pino)` | retorna o nível digital, `LIGADO` ou `DESLIGADO` |
| `ler_analogico(pino)` | retorna o valor ADC bruto |
| `escrever_analogico(pino, valor)` | gera PWM em pino compatível |
| `ler_toque(pino)` | retorna a leitura capacitiva de GPIO tátil do ESP32 clássico |
| `ler_pir(pino)` | lê o nível digital de um módulo PIR |
| `ler_umidade_solo(pino)` | lê o valor ADC bruto de um sensor analógico de solo |

O primeiro argumento de `escrever_digital` continua sendo o pino: `escrever_digital(18, LIGADO)`. As constantes descrevem o nível elétrico. Em módulos com acionamento invertido, HIGH não significa necessariamente carga acionada.

`ler_umidade_solo` não devolve uma porcentagem. Calibre referências seca e úmida e converta com `mapear`, conforme **ESP32: umidade do solo e calibração**. `ler_pir` não mede distância nem identifica pessoas.

`escrever_analogico` produz PWM, não uma tensão analógica contínua. No Uno, os pinos PWM usuais são 3, 5, 6, 9, 10 e 11. Os pinos e recursos disponíveis no ESP32 dependem do chip e da placa.

`ler_toque` recebe o **GPIO**, não o canal: T0 do ESP32 clássico corresponde ao GPIO 4. O valor normalmente cai ao tocar; use um limiar calibrado. O recurso não existe no Uno e o comportamento de outras variantes ESP32 é diferente.

## Tempo e som

| Chamada | Efeito |
| --- | --- |
| `espere(milissegundos)` | pausa a sequência em milissegundos |
| `espere_microssegundo(microssegundos)` | pausa em microssegundos |
| `milissegundos()` | tempo desde a inicialização, equivalente a `millis()` |
| `microssegundos()` | tempo desde a inicialização, equivalente a `micros()` |
| `tom(pino, frequencia)` | inicia um tom em hertz |
| `parar_tom(pino)` | encerra o tom |

As pausas são bloqueantes. Para deixar o loop livre entre eventos, consulte **ESP32: temporização sem bloquear** e os limites numéricos de `inteiro`.

## Servo motor

| Chamada | Resultado ou efeito |
| --- | --- |
| `iniciar_servo(pino)` | `logico`: prepara o servo e informa sucesso |
| `escrever_servo(pino, angulo)` | `logico`: envia posição entre 0 e 180 graus a um servo iniciado |
| `parar_servo(pino)` | encerra o PWM; não desliga a fonte do motor |

O gerador usa `ESP32Servo` no ESP32 e `Servo` no Uno. Alimente o servo por uma fonte adequada e mantenha terra comum; o GPIO conduz apenas o sinal. Verifique limites mecânicos e nível lógico do modelo. Veja o tutorial completo antes de montar.

## Temperatura e umidade do ar: DHT

| Chamada | Resultado ou efeito |
| --- | --- |
| `iniciar_dht(pino, DHT11)` ou `iniciar_dht(pino, DHT22)` | `logico`: configura pino e tipo do sensor |
| `ler_temperatura(pino)` | `real`: graus Celsius; `NaN` se a leitura falhar |
| `ler_umidade(pino)` | `real`: umidade relativa em porcentagem; `NaN` se falhar |
| `leitura_valida(valor)` | `logico`: confirma que o número é finito e utilizável |

Inicialize o sensor antes de ler e use o tipo correspondente ao componente real. Uma inicialização bem-sucedida não garante que a comunicação elétrica esteja correta. Confira cada leitura com `leitura_valida`; falha não deve ser confundida com temperatura ou umidade zero. Aguarde pelo menos dois segundos entre ciclos de leitura do exemplo DHT22.

O preparo instala **DHT sensor library** e **Adafruit Unified Sensor**. O gerador inclui os cabeçalhos necessários automaticamente. DHT mede o ar; umidade de solo usa outro tipo de sensor.

## Distância ultrassônica

`ler_distancia(gatilho, eco)` retorna centímetros como `real`, com tempo limite padrão de **30000 microssegundos**. `ler_distancia(gatilho, eco, limite)` aceita de 1 a 1000000 microssegundos. O resultado é `-1` quando não há eco completo dentro do limite, quando os pinos são inválidos ou iguais, ou quando o prazo está fora dessa faixa.

Configure TRIG como `SAIDA` e ECHO como `ENTRADA`. A medição espera o eco e é bloqueante durante esse período. HC-SR04 comum tem ECHO de **5 V**: adapte o nível antes do GPIO do ESP32. Consulte o tutorial com divisor de tensão.

## Mapear e converter uma faixa

`mapear(valor, entrada_min, entrada_max, saida_min, saida_max)` retorna `real`, preserva casas decimais e aceita limites invertidos. Os nomes `map` e `MAP` são aliases da mesma função do Dogol.

- `mapear(5, 0, 10, 0, 100)` retorna 50.
- `mapear(2.5, 0, 10, 0, 1)` retorna 0,25.
- `mapear(15, 0, 10, 0, 100)` retorna 150: a saída não é limitada.
- Limites de entrada iguais produzem `NaN`; teste o resultado com `leitura_valida`.

A implementação do Dogol trabalha com reais. O `map()` original do Arduino C++ normalmente usa aritmética inteira; considere essa diferença ao adaptar código externo. Abra **Mapear valores entre faixas** para o programa completo.

## Constantes e pinagem

| Portugol | Core Arduino | Significado |
| --- | --- | --- |
| `LIGADO` | `HIGH` | nível lógico alto |
| `DESLIGADO` | `LOW` | nível lógico baixo |
| `SAIDA` | `OUTPUT` | pino de saída |
| `ENTRADA` | `INPUT` | pino de entrada |
| `ENTRADA_BOTAO` | `INPUT_PULLUP` | entrada com resistor interno de elevação |
| `DHT11` / `DHT22` | tipo do DHT | modelo configurado do sensor |

Com `ENTRADA_BOTAO`, um botão entre GPIO e GND retorna `DESLIGADO` quando pressionado e `LIGADO` quando solto. O nome não inverte a leitura. Nem todo GPIO oferece pull-up: os GPIOs 34–39 do ESP32 clássico são somente entrada e não têm esse resistor interno.

O analisador reconhece A0 até A15, mas só use um pino que exista na placa selecionada. Os tutoriais ESP32 usam números de GPIO. Não aplique 5 V diretamente aos GPIOs do ESP32.

## Migração de programas anteriores

| Escrita anterior | Escrita recomendada |
| --- | --- |
| `Arduino.ler_digital(pino)` | `ler_entrada(pino)` |
| `Arduino.escrever_digital(pino, ALTO)` | `escrever_digital(pino, LIGADO)` |
| `BAIXO` | `DESLIGADO` |
| `delay(ms)` / `aguarde(ms)` | `espere(ms)` |
| `aguarde_microssegundos(us)` | `espere_microssegundo(us)` |
| `ENTRADA_PULLUP` | `ENTRADA_BOTAO` |

O prefixo e os nomes antigos continuam aceitos para compatibilidade. Os novos exemplos ensinam a escrita direta. Os nomes C++ básicos, como `pinMode`, `digitalRead`, `pulseIn`, `shiftOut` e `shiftIn`, também podem ser reconhecidos, mas a pinagem e as assinaturas precisam ser compatíveis com a placa.

## Serial e recursos fora do escopo

O gerador inicia `Serial.begin(9600)`. `escreva("Valor: ", valor)` imprime argumentos em sequência; use `escreva()` para encerrar a linha. Envie para a placa e abra **Monitor serial** a 9600 baud. O monitor pausa para um novo upload e retoma depois.

`leia()` pela Serial, Wi-Fi, Bluetooth e métodos arbitrários de objetos C++ ainda não têm mapeamento geral. Os novos comandos de servo e DHT são operações explicitamente suportadas; instalar uma biblioteca não torna todos os seus métodos disponíveis em Portugol.
