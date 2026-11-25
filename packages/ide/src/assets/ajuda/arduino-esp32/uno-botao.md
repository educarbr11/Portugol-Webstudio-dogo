# Arduino Uno: botão com pull-up interno

## Objetivo e materiais

Acenda o LED integrado enquanto um botão estiver pressionado. Você precisa de Arduino Uno, cabo USB de dados, botão momentâneo, protoboard e jumpers.

## Ligações

Desconecte o USB antes de montar.

| Componente | Ligação |
| --- | --- |
| Um contato do botão | pino digital 2 |
| Contato oposto do botão | GND |
| LED integrado | já conectado ao pino 13 |
| Arduino Uno | USB após conferir o circuito |

Em botões de quatro terminais, dois terminais do mesmo lado podem já estar conectados internamente. Escolha os contatos que só se conectam ao pressionar. Não ligue o botão ao 5V neste circuito: o resistor de pull-up é interno.

## Programa completo

```portugol
programa
{
  inteiro botao = 2
  inteiro led = 13

  funcao inicio()
  {
    modo_pino(botao, ENTRADA_BOTAO)
    modo_pino(led, SAIDA)
  }

  funcao loop()
  {
    inteiro estado = ler_entrada(botao)

    se (estado == DESLIGADO)
    {
      escrever_digital(led, LIGADO)
    }
    senao
    {
      escrever_digital(led, DESLIGADO)
    }
  }
}
```

## Entenda o código

`ENTRADA_BOTAO` mantém a leitura em `LIGADO` quando o botão está solto. Ao pressionar, o botão conecta o pino ao GND e a leitura vira `DESLIGADO`. A comparação `estado == DESLIGADO` verifica essa condição. O bloco `se` acende o LED; `senao` o apaga.

## Enviar para a placa

1. Clique em **Abrir no editor** e conecte a montagem por USB.
2. Em **Placa**, escolha **Arduino Uno**.
3. Clique em **Atualizar portas** e selecione a placa em **Porta**.
4. Clique em **Enviar para placa** e espere o preparo, a compilação e a gravação.

## Resultado esperado

O LED integrado fica aceso enquanto o botão é pressionado e apaga ao soltá-lo.

## Experimente e resolva dificuldades

Inverta a condição para `estado == LIGADO` e observe a mudança. Se o LED fica sempre aceso, confira os contatos escolhidos no botão e se o pino 2 está em curto permanente com GND. Se o estado parece instável, confirme `ENTRADA_BOTAO` e as conexões.

Este programa lê o estado atual; não conta cliques. Botões mecânicos podem produzir vários pulsos rápidos por pressão. Para contar cliques, será necessário tratar esse efeito de contato, chamado debounce.
