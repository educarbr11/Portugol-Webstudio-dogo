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
- Use `Arduino.` nas funções de hardware, como `Arduino.modo_pino`.
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

Para botão com `ENTRADA_PULLUP`, pressionado significa `BAIXO`. Para PWM no Uno, use um pino compatível, como o `9`. Em um potenciômetro, o terminal central deve ir à entrada analógica.

Nunca aplique 5 V aos GPIOs do ESP32. Use 3V3 nos circuitos analógicos do ESP32 e não conecte motores, relés ou cargas de alta corrente diretamente a um GPIO.

## Não vejo o texto de `escreva()`

O Dogol ainda não possui monitor serial integrado. Após a gravação, abra um monitor externo na mesma porta, com **9600 baud**. Se o texto é escrito apenas em `inicio()`, reinicie a placa com o monitor aberto. Feche o monitor antes de fazer outro upload.

Os argumentos de `escreva()` não recebem espaços ou quebras de linha automáticos. Insira espaços nas cadeias e use `escreva()` sem argumentos para encerrar a linha. `leia()` pela Serial ainda não é implementado no código gerado.
