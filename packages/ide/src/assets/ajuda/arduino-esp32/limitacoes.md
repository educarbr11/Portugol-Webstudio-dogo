# Limitações da conversão para Arduino

A conversão de Portugol para C/C++ é experimental. Esta página ajuda a escolher programas compatíveis com o gerador atual.

## Placas disponíveis

- **Arduino Uno**: core `arduino:avr`, alvo `arduino:avr:uno`.
- **ESP32 Dev Module**: core `esp32:esp32`, alvo `esp32:esp32:esp32`, correspondente ao ESP32 clássico.

O seletor da interface ainda não oferece outros modelos de Arduino ou variantes ESP32-C3, ESP32-S2 e ESP32-S3. O LED integrado e o pinout de placas de fabricantes diferentes podem variar.

## Linguagem e bibliotecas

| Recurso | Situação |
| --- | --- |
| Variáveis, funções, condições, laços e vetores | convertidos pelas operações documentadas em Arduino e ESP32 > Sintaxe do Portugol para placas |
| Matrizes simples com dimensões fixas | convertidas; matrizes inicializadas e parâmetros de matriz possuem limitações |
| Funções básicas de GPIO, ADC, PWM e tempo | reconhecidas pelos nomes e aliases da referência |
| `escreva()` | usa Serial a 9600 baud |
| `leia()` pela Serial | ainda não implementado no gerador |
| Monitor serial dentro do aplicativo | ainda não disponível; use um monitor externo |
| `Graficos`, arquivos e recursos do computador | não são convertidos para o microcontrolador |
| Wi-Fi, Bluetooth e APIs específicas de ESP32 | sem mapeamento explícito |
| Objetos de Servo, ESP32Servo e LedControl | sem mapeamento geral de objetos e métodos |

O preparo instala `Servo` e `LedControl` para Uno, e `ESP32Servo` e `LedControl` para ESP32. A instalação não significa que comandos de objetos dessas bibliotecas já possam ser escritos e convertidos em Portugol.

`inclua biblioteca ...` é registrado como comentário no C/C++ gerado. Não há uma tradução geral de bibliotecas Portugol para cabeçalhos Arduino. Não basta incluir uma biblioteca para tornar suas funções compatíveis.

## Tipos numéricos e memória

`inteiro` vira `int`: normalmente 16 bits no Uno e 32 bits no ESP32. O gerador ainda não oferece um tipo Portugol equivalente a `unsigned long`. O retorno de `millis()`, `micros()` e `pulseIn()` pode perder informação quando armazenado em `inteiro`.

O exemplo de temporização com `millis()` desta ajuda é apenas para ESP32 e para sessões curtas. Ao se aproximar de 24,8 dias de execução contínua, o contador deixa de caber em um `int` com sinal. Para uso contínuo de longa duração, é necessário um gerador que preserve o tipo adequado e trate o estouro do contador.

No Uno, textos longos, muitas variáveis e vetores grandes podem esgotar a memória RAM. Comece com programas pequenos, confira as mensagens de memória na compilação e reduza o tamanho dos dados quando necessário.

## Compilação, execução e ligação elétrica

O analisador aceitar um número de pino não significa que esse pino exista ou suporte ADC/PWM na placa. Confira a tabela de ligações do tutorial e o pinout do seu modelo.

A execução comum do Portugol usa o computador; ela não simula os circuitos destes tutoriais. Use **Enviar para placa** para executar o programa no microcontrolador.

O primeiro preparo de cada placa requer internet. Depois do preparo, os componentes ficam no diretório de dados do aplicativo. Um download interrompido pode exigir repetir o preparo com a conexão restabelecida.

Se a tradução gerar trechos marcados como `TODO`, a operação correspondente não está mapeada. Reduza o programa até um exemplo conhecido desta ajuda e consulte **Arduino e ESP32 > Solução de problemas**.
