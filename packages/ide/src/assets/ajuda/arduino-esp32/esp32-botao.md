# ESP32: botão e entrada digital

## Objetivo e materiais

Use um botão para acender um LED externo. Você precisa de ESP32 Dev Module clássico, cabo USB de dados, botão momentâneo, LED, resistor de 220 Ω a 330 Ω, protoboard e jumpers.

## Ligações

Monte com a placa desconectada da alimentação.

| Componente | Ligação |
| --- | --- |
| Um contato do botão | GPIO 27 |
| Contato oposto do botão | GND |
| GPIO 18 | resistor em série com o ânodo do LED |
| Cátodo do LED | GND |

Use os contatos do botão que só se conectam quando ele é pressionado. O pull-up será interno, portanto não ligue o botão ao 5V. No ESP32, nunca aplique 5 V a um GPIO.

## Programa completo

```portugol
programa
{
  inclua biblioteca Arduino

  inteiro botao = 27
  inteiro led = 18

  funcao inicio()
  {
    Arduino.modo_pino(botao, ENTRADA_PULLUP)
    Arduino.modo_pino(led, SAIDA)
  }

  funcao loop()
  {
    inteiro estado = Arduino.ler_digital(botao)

    se (estado == BAIXO)
    {
      Arduino.escrever_digital(led, ALTO)
    }
    senao
    {
      Arduino.escrever_digital(led, BAIXO)
    }
  }
}
```

## Entenda o código

`modo_pino(botao, ENTRADA_PULLUP)` habilita o resistor interno de elevação no GPIO 27. Solto, o botão resulta em `ALTO`; pressionado, conecta a entrada ao GND e resulta em `BAIXO`. `se` e `senao` escolhem o estado da saída do LED.

## Enviar para a placa

1. Clique em **Abrir no editor** e conecte o circuito revisado por USB.
2. Em **Placa**, selecione **ESP32 Dev Module**.
3. Clique em **Atualizar portas** e escolha a placa em **Porta**.
4. Clique em **Enviar para placa** e espere a confirmação da gravação.

## Resultado esperado

O LED do GPIO 18 acende enquanto o botão está pressionado e apaga ao soltá-lo.

## Experimente e resolva dificuldades

Troque a condição para `estado == ALTO` para inverter o comportamento. Se o LED permanece sempre aceso, confira os contatos do botão e se o GPIO 27 está permanentemente conectado ao GND.

Não troque a entrada deste exemplo pelo GPIO 34: no ESP32 clássico, GPIOs 34 a 39 são somente entrada e não oferecem pull-up interno. O programa lê o estado atual; contar cliques exigiria tratar os múltiplos pulsos de contato mecânico, ou debounce.
