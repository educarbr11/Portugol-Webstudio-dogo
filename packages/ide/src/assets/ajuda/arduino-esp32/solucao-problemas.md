# Solução de problemas

Use a mensagem exibida pelo Dogol para identificar a etapa: geração, preparo, compilação ou gravação. Teste primeiro o pisca-LED da sua placa antes de investigar um circuito maior.

## A porta não aparece

1. Confirme que a placa está conectada e alimentada.
2. Clique em **Atualizar portas** e confira o seletor **Porta**.
3. Troque o cabo USB: alguns cabos servem apenas para carregar.
4. Experimente outra entrada USB e evite hubs sem alimentação durante o teste.
5. No Windows, instale o driver USB/serial indicado pelo fabricante da placa.
6. No Linux, confira o acesso à porta serial.

No Linux, quando a distribuição usa o grupo `dialout`, adicione seu usuário pelo terminal:

```bash
sudo usermod -aG dialout "$USER"
```

Encerre a sessão e entre novamente para aplicar a alteração. Algumas placas também precisam de uma regra `udev` do fabricante. Os nomes dos grupos e permissões podem variar entre distribuições.

## O programa não gera C/Arduino

- Confirme a presença de `programa`, chaves e `funcao inicio()`.
- Confira se todas as variáveis foram declaradas e se os nomes estão escritos da mesma forma.
- Use as chamadas diretas documentadas, como `modo_pino(18, SAIDA)`.
- Substitua `leia()` por uma leitura de pino compatível quando o objetivo for entrada de um sensor.
- Remova bibliotecas e chamadas não documentadas em **Arduino e ESP32 > Funções e constantes Arduino**.
- Abra um exemplo completo desta ajuda e compare uma alteração por vez.

**Gerar código C/Arduino** permite inspecionar a tradução. Trechos `TODO` indicam uma operação ainda não convertida, mesmo que o código Portugol seja aceito pelo analisador.

## O preparo falha

O primeiro envio baixa índices, core e bibliotecas. Confira a conexão com a internet e as mensagens de download. Restabeleça a conexão e tente novamente. Verifique também o espaço livre em disco e se o aplicativo pode gravar no seu diretório de dados.

## A compilação falha

1. Escolha a placa correspondente ao circuito em **Placa**.
2. Teste o pisca-LED da mesma placa.
3. Confira pinos e funções disponíveis: um pino ou uma API de outra placa pode não existir nesse core.
4. Procure a primeira mensagem de erro da compilação; mensagens posteriores podem ser consequência dela.
5. Evite copiar chamadas de bibliotecas C/C++ que ainda não possuem conversão em Portugol.

## A gravação falha

- Selecione **Placa** e **Porta** corretas. Se mudou de USB, clique em **Atualizar portas**.
- Feche monitores seriais e outros aplicativos que estejam usando a porta.
- Confirme que o cabo permite dados e que a placa continua conectada.
- Desconecte a alimentação antes de revisar a montagem e remova circuitos que interfiram na inicialização.
- Em algumas placas ESP32, mantenha **BOOT** pressionado durante o início da conexão de gravação e solte quando a transferência começar.

## O programa grava, mas o circuito não responde

Confira o GND comum, a polaridade do LED e o resistor em série. Use os números dos pinos da placa, sem confundir a posição física do conector com o número do GPIO. No ESP32 clássico, os GPIOs 34 a 39 são somente entrada e não oferecem pull-up interno.

Para botão com `ENTRADA_BOTAO`, pressionado significa `DESLIGADO`. Para PWM no Uno, use um pino compatível, como o `9`. Em um potenciômetro, o terminal central deve ir à entrada analógica.

Nunca aplique 5 V aos GPIOs do ESP32. Use 3V3 nos circuitos analógicos do ESP32 e não conecte motores, relés ou cargas de alta corrente diretamente a um GPIO.

## Não vejo o texto de `escreva()`

Após a gravação, o monitor serial do Dogol conecta à placa e mostra os dados na aba **Monitor serial**, ao lado de **Console**, a **9600 baud**. Você também pode usar **Monitor serial** para iniciar e **Parar serial** para encerrar. Se o texto é escrito apenas em `inicio()`, reinicie a placa com o monitor aberto. O app pausa a leitura antes do próximo upload; feche outros monitores que estejam usando a mesma porta.

Os argumentos de `escreva()` não recebem espaços ou quebras de linha automáticos. Insira espaços nas cadeias e use `escreva()` sem argumentos para encerrar a linha. `leia()` pela Serial ainda não é implementado no código gerado.

## O editor parece travar ou os caracteres ficam ilegíveis

As leituras da placa ficam na aba **Monitor serial**; os logs de compilação e gravação ficam em **Console**. A recepção não deve mudar o foco do editor. O painel agrupa as atualizações, conserva os 32 mil caracteres mais recentes e informa quando descarta dados em excesso. Use **Limpar**, **Desconectar** ou desative **Rolagem automática** para consultar o histórico.

O código gerado inicia a Serial a **9600 baud**. O boot do ESP32 usa **115200 baud** e pode aparecer ilegível em 9600; [a documentação da Espressif explica essa diferença](https://docs.espressif.com/projects/esptool/en/latest/esp32/advanced-topics/boot-mode-selection.html). Para diagnosticar o boot, desconecte o monitor, selecione 115200 e conecte novamente. Após enviar outro programa pelo Dogol, o monitor volta a 9600 automaticamente.

Confira se o programa enviado contém `escreva()` dentro de `funcao loop()`. Um programa vazio pode ser enviado com sucesso, mas não produz leituras do sensor. Para acompanhar valores continuamente, use `escreva("Toque: ", leitura)`, depois `escreva()` para encerrar a linha e `espere(100)` para espaçar as leituras.

## Novos sensores: leitura inválida ou componente sem resposta

- **Servo:** teste `iniciar_servo`, confira faixa de 0–180, fonte adequada e terra comum. O GPIO fornece sinal, não alimentação do motor.
- **DHT:** confirme DHT11/DHT22, pinagem e pull-up a 3,3 V; espere pelo menos dois segundos entre ciclos e teste `leitura_valida` em temperatura e umidade.
- **PIR:** confira o nível da saída e aguarde a estabilização inicial; ajuste tempo e redisparo no módulo quando necessário.
- **Solo:** confira AO e calibre os valores seco/molhado. O retorno bruto não é uma porcentagem universal.
- **Ultrassônico:** `-1` indica ausência de eco no prazo. Confira TRIG, ECHO, divisor de tensão e objeto; não conecte ECHO de 5 V diretamente ao ESP32.
- **Mapeamento:** limites de entrada iguais geram `NaN`. A saída não é limitada automaticamente, e faixas invertidas são permitidas.
