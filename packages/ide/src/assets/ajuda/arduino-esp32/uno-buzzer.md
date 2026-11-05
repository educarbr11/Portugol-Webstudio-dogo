# Arduino Uno: som com piezo passivo

## Objetivo e materiais

Produza um tom de 440 Hz em intervalos. Você precisa de Arduino Uno, cabo USB de dados, piezo passivo de baixa corrente, protoboard e jumpers.

Escolha um piezo que possa ser acionado pela saída da placa conforme suas especificações. Buzzers magnéticos, módulos ou cargas que excedam a corrente permitida do GPIO precisam de transistor ou driver apropriado.

## Ligações

Desconecte a alimentação antes de ligar os componentes.

| Componente | Ligação |
| --- | --- |
| Terminal positivo do piezo passivo | pino digital 8 |
| Terminal negativo do piezo passivo | GND |
| Arduino Uno | USB após revisar as conexões |

## Programa completo

```portugol
programa
{
  inclua biblioteca Arduino

  inteiro buzzer = 8

  funcao inicio()
  {
    Arduino.modo_pino(buzzer, SAIDA)
  }

  funcao loop()
  {
    Arduino.tom(buzzer, 440)
    Arduino.aguarde(500)
    Arduino.parar_tom(buzzer)
    Arduino.aguarde(500)
  }
}
```

## Entenda o código

`tom(buzzer, 440)` inicia uma onda no pino 8 com frequência de 440 Hz, correspondente à nota Lá. A pausa mantém o tom durante meio segundo. `parar_tom` interrompe a geração; a segunda pausa mantém silêncio antes de repetir.

## Enviar para a placa

1. Clique em **Abrir no editor**, revise a montagem e conecte o USB.
2. Selecione **Arduino Uno** em **Placa**.
3. Clique em **Atualizar portas** e selecione **Porta**.
4. Clique em **Enviar para placa** e aguarde a gravação.

## Resultado esperado

O piezo toca durante meio segundo e fica silencioso por meio segundo. Um ciclo completo dura um segundo.

## Experimente e resolva dificuldades

Troque `440` por `880` para comparar as alturas dos sons. Reduza o tempo de emissão se o som estiver desconfortável e mantenha o componente afastado do ouvido.

Um buzzer ativo possui oscilador próprio e pode não responder à frequência como um piezo passivo. Se não ouvir som, confira o tipo do componente, a polaridade e o GND. Não substitua por alto-falante ou buzzer de maior corrente ligado diretamente ao pino.
