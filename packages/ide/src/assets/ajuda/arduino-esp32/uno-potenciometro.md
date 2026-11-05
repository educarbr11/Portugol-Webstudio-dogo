# Arduino Uno: potenciômetro e brilho por PWM

## Objetivo e materiais

Transforme uma entrada analógica em controle de brilho. Você precisa de Arduino Uno, cabo USB de dados, potenciômetro de aproximadamente 10 kΩ, LED, resistor de 220 Ω a 330 Ω, protoboard e jumpers.

## Ligações

Desconecte o USB durante a montagem.

| Componente | Ligação |
| --- | --- |
| Extremidade do potenciômetro | 5V do Uno |
| Outra extremidade do potenciômetro | GND |
| Terminal central do potenciômetro | A0 |
| Pino digital 9 | resistor em série com o ânodo do LED |
| Cátodo do LED | GND |

O ânodo normalmente é a perna mais longa; o lado achatado do encapsulamento costuma indicar o cátodo. Confira seu componente. O resistor pode ficar antes ou depois do LED, desde que esteja em série.

## Programa completo

```portugol
programa
{
  inclua biblioteca Arduino

  inteiro sensor = A0
  inteiro led_pwm = 9

  funcao inicio()
  {
    Arduino.modo_pino(led_pwm, SAIDA)
  }

  funcao loop()
  {
    inteiro leitura = Arduino.ler_analogico(sensor)
    inteiro brilho = leitura / 4

    Arduino.escrever_analogico(led_pwm, brilho)
    Arduino.aguarde(10)
  }
}
```

## Entenda o código

`ler_analogico(A0)` normalmente retorna de `0` a `1023` no Uno. A divisão inteira por quatro converte a leitura para a escala de `0` a `255` esperada por `escrever_analogico`.

O pino 9 oferece PWM: a saída alterna rapidamente entre ligada e desligada, e o valor controla a proporção de tempo ligada. A iluminação parece contínua, com brilho variável. Não se trata de uma tensão analógica contínua.

## Enviar para a placa

1. Clique em **Abrir no editor**. Confira a montagem e conecte o USB.
2. Em **Placa**, selecione **Arduino Uno**.
3. Clique em **Atualizar portas** e escolha a placa em **Porta**.
4. Clique em **Enviar para placa** e aguarde a confirmação.

## Resultado esperado

Girar o potenciômetro altera gradualmente o brilho do LED, entre apagado e brilho máximo. Se o sentido parecer invertido, troque as duas extremidades do potenciômetro com a placa desligada.

## Experimente e resolva dificuldades

Para conferir os valores, adicione `escreva(leitura)` seguido de `escreva()` e observe a Serial com um monitor externo em 9600 baud. Feche o monitor antes de outro envio.

Se o LED só liga ou desliga, confirme que está no pino PWM 9. Se a leitura varia sem tocar no potenciômetro, confira a alimentação, o GND e o terminal central. Se o LED não acende, confira polaridade e resistor. Não remova o resistor para tentar aumentar o brilho.
