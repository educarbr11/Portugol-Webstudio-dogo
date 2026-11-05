# Primeiros passos com Arduino e ESP32

Aprenda a escrever Portugol, gerar C/C++ e gravar um programa na sua placa pelo Dogol Desktop. Estes tutoriais ficam disponíveis no aplicativo mesmo sem internet.

## O que você precisa

- Dogol Desktop instalado no Windows ou Linux.
- Arduino Uno ou ESP32 Dev Module clássico, baseado no ESP32 original.
- Cabo USB com transferência de dados.
- Acesso à internet no primeiro preparo de cada tipo de placa.
- Componentes indicados no tutorial escolhido.

O primeiro envio baixa o core e as bibliotecas da placa. O aplicativo guarda esses componentes para os próximos envios. O ESP32-C3, ESP32-S2 e ESP32-S3 não são o alvo dos exemplos desta seção.

## Escolha seu percurso

| Se você quer… | Abra na árvore de ajuda |
| --- | --- |
| Entender a linguagem | Arduino e ESP32 > Sintaxe do Portugol para placas |
| Conhecer comandos de hardware | Arduino e ESP32 > Funções e constantes Arduino |
| Fazer sua primeira montagem | Arduino e ESP32 > Arduino Uno > Uno: piscar o LED integrado |
| Começar com ESP32 | Arduino e ESP32 > ESP32 Dev Module > ESP32: piscar um LED externo |
| Resolver um erro | Arduino e ESP32 > Solução de problemas |

## Abrir um programa e enviar

1. Leia as ligações e o resultado esperado antes de montar o circuito.
2. Desconecte o USB enquanto faz as ligações. Confira a polaridade dos componentes.
3. Clique em **Abrir no editor** acima de um programa completo. O Dogol cria uma nova aba com o exemplo.
4. Conecte a placa por USB.
5. No editor, escolha a opção correta em **Placa**: **Arduino Uno** ou **ESP32 Dev Module**.
6. Clique em **Atualizar portas** e selecione a porta da placa em **Porta**.
7. Se quiser conferir a tradução, use **Gerar código C/Arduino**.
8. Clique em **Enviar para placa** e acompanhe as mensagens de preparo, compilação e gravação.
9. Aguarde a conclusão. A placa começa a executar o programa gravado.

**Iniciar execução** executa o Portugol no computador. Para testar os pinos físicos e estes circuitos, use **Enviar para placa**. A execução no computador não simula a montagem elétrica.

## Como o programa funciona na placa

| Parte do programa | Quando é executada |
| --- | --- |
| Variáveis dentro de `programa`, fora das funções | mantêm os dados compartilhados pelas funções |
| `funcao inicio()` | uma vez após ligar ou reiniciar a placa; vira `setup()` |
| `funcao loop()` | repetidamente enquanto a placa está ligada; vira `loop()` |

O programa precisa de `inicio()`. `loop()` é opcional: sem ele, a placa executa a inicialização e depois permanece sem novas instruções.

## Diferenças das placas

| Característica | Arduino Uno | ESP32 Dev Module |
| --- | --- | --- |
| Tensão lógica | 5 V | 3,3 V |
| LED usado nos tutoriais | integrado, pino 13 | externo, GPIO 18 |
| Botão usado nos tutoriais | pino 2 | GPIO 27 |
| Entrada analógica usada | A0 | GPIO 34 |
| Leitura analógica padrão comum | 0 a 1023 | 0 a 4095 |

Os GPIOs do ESP32 não toleram 5 V. Nos exemplos com potenciômetro, use a alimentação indicada para cada placa. Coloque resistor em série com LEDs externos e mantenha os GNDs conectados. Motores, relés e outras cargas de alta corrente precisam de circuito de acionamento apropriado.

## Antes de avançar

Comece por um pisca-LED. Depois experimente botão, leitura analógica e PWM. Salve suas alterações em `.por` para repetir as experiências. Confira também **Arduino e ESP32 > Limitações e compatibilidade** para conhecer os recursos que ainda não são convertidos nesta versão.
