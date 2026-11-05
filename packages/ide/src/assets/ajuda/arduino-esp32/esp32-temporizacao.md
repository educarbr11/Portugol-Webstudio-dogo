# ESP32: temporização sem bloquear

## Objetivo e materiais

Alterne um LED a cada segundo sem usar `aguarde()`. Você precisa de ESP32 Dev Module clássico, cabo USB de dados, LED, resistor de 220 Ω a 330 Ω, protoboard e jumpers.

Este é um exemplo didático para **ESP32** e sessões curtas. `inteiro` vira `int` de 32 bits com sinal nessa placa, enquanto `millis()` retorna originalmente um valor sem sinal. O programa não trata o limite de aproximadamente **24,8 dias** em que o tempo deixa de caber no `int`. Não use esta versão para aplicações contínuas de longa duração. No Uno, o `int` normalmente tem apenas 16 bits e o limite aparece muito antes; não adapte este exemplo apenas trocando os pinos.

## Ligações

Desconecte a alimentação durante a montagem.

| Componente | Ligação |
| --- | --- |
| GPIO 18 | resistor em série com o ânodo do LED |
| Cátodo do LED | GND |
| ESP32 | USB após revisar as conexões |

O ESP32 usa lógica de 3,3 V e seus GPIOs não toleram 5 V.

## Programa completo

```portugol
programa
{
  inclua biblioteca Arduino

  inteiro led = 18
  inteiro instante_anterior = 0
  inteiro intervalo = 1000
  logico ligado = falso

  funcao inicio()
  {
    Arduino.modo_pino(led, SAIDA)
  }

  funcao loop()
  {
    inteiro agora = Arduino.milissegundos()

    se (agora - instante_anterior >= intervalo)
    {
      instante_anterior = agora
      ligado = nao ligado

      se (ligado)
      {
        Arduino.escrever_digital(led, ALTO)
      }
      senao
      {
        Arduino.escrever_digital(led, BAIXO)
      }
    }
  }
}
```

## Entenda o código

`milissegundos()` informa o tempo desde a inicialização. A subtração compara o tempo atual com o último instante de mudança. Quando passou um intervalo, o programa salva `agora` e inverte a variável lógica com `nao`.

O `loop()` continua passando pela condição enquanto o intervalo ainda não chegou. Isso permite adicionar leituras de botão e outras tarefas no mesmo loop sem uma pausa de um segundo. A alternância é feita apenas quando a condição é verdadeira.

## Enviar para a placa

1. Clique em **Abrir no editor**, revise o circuito e conecte o USB.
2. Escolha **ESP32 Dev Module** em **Placa**.
3. Clique em **Atualizar portas** e selecione a placa em **Porta**.
4. Clique em **Enviar para placa** e aguarde a confirmação.

## Resultado esperado

O LED começa apagado e muda de estado aproximadamente a cada segundo. Fica um segundo ligado e um segundo desligado, com ciclo completo de dois segundos. O processador não fica preso em uma chamada de espera entre as mudanças.

## Experimente e resolva dificuldades

Troque `intervalo` para `250` e compare o ritmo. Use um valor positivo: zero ou um valor negativo faz a condição permanecer verdadeira a cada passagem.

Se o LED não alternar, confira os pinos, a polaridade e o resistor. Não mova `instante_anterior` para dentro de `loop()`: ele precisa preservar o valor entre as passagens. Para temporização contínua de longa duração, o gerador precisa preservar o tipo adequado e tratar o estouro do contador; essa melhoria ainda não está disponível nesta versão.
