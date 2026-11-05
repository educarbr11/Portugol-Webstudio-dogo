# Arduino Uno: piscar o LED integrado

## Objetivo e materiais

Controle uma saída digital e aprenda a diferença entre `inicio()` e `loop()`. Você precisa de um Arduino Uno e um cabo USB de dados. O LED integrado da placa usa o pino `13`, portanto não é necessário montar um LED externo.

## Ligações

| Componente | Ligação |
| --- | --- |
| Arduino Uno | computador pelo cabo USB |
| LED integrado | já conectado ao pino 13 na placa |

## Programa completo

```portugol
programa
{
  inclua biblioteca Arduino

  inteiro led = 13

  funcao inicio()
  {
    Arduino.modo_pino(led, SAIDA)
  }

  funcao loop()
  {
    Arduino.escrever_digital(led, ALTO)
    Arduino.aguarde(1000)
    Arduino.escrever_digital(led, BAIXO)
    Arduino.aguarde(1000)
  }
}
```

## Entenda o código

`inteiro led = 13` guarda o número do pino. `inicio()` configura esse pino como `SAIDA` uma única vez. Em `loop()`, `escrever_digital` alterna entre `ALTO` e `BAIXO`. `aguarde(1000)` pausa por 1000 milissegundos, ou um segundo. O loop começa novamente depois da segunda pausa.

## Enviar para a placa

1. Clique em **Abrir no editor** e conecte o Uno por USB.
2. Em **Placa**, escolha **Arduino Uno**.
3. Clique em **Atualizar portas** e selecione a placa em **Porta**.
4. Clique em **Enviar para placa** e aguarde a conclusão. No primeiro uso, mantenha a internet conectada para o preparo.

## Resultado esperado

O LED integrado acende por um segundo e apaga por um segundo. Um ciclo completo dura dois segundos. O programa continua após o upload e volta a começar se você reiniciar a placa.

## Experimente e resolva dificuldades

Troque as duas pausas por `250` para fazer um ciclo de meio segundo. Use tempos diferentes para comparar quanto o LED permanece aceso e apagado.

Se nada piscar, confirme a placa e a porta escolhidas. Observe o LED marcado **L**, não apenas os LEDs de alimentação ou transmissão. Confira se o envio terminou com sucesso. Para um LED externo, será necessário um resistor em série e revisar a polaridade; veja o tutorial de potenciômetro e PWM para um exemplo de ligação externa.
