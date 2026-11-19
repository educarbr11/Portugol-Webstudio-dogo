# ESP32: detectar movimento com PIR

## Objetivo e materiais

Leia a saída de um módulo PIR e mostre a detecção no monitor serial. Use ESP32 Dev Module clássico, módulo PIR com saída lógica de 3,3 V compatível (como um HC-SR501 cuja especificação confirme esse nível), jumpers e fonte adequada ao módulo.

## Ligações

Confira o pinout: não deduza a ordem dos terminais apenas pela aparência do módulo.

| Terminal do PIR | Ligação |
| --- | --- |
| VCC | alimentação especificada pelo fabricante, frequentemente 5 V em módulos HC-SR501 |
| OUT | GPIO 27, somente se a saída não ultrapassar 3,3 V |
| GND | GND comum ao ESP32 e à alimentação |

Alimentação e nível da saída são coisas diferentes. Um módulo alimentado a 5 V só pode ligar OUT diretamente ao ESP32 quando a especificação garantir saída compatível com 3,3 V; caso contrário, use adaptação de nível.

## Programa completo

```portugol
programa
{
  inteiro pino_pir = 27

  funcao inicio()
  {
    modo_pino(pino_pir, ENTRADA)
    escreva("Espere a estabilizacao do PIR antes de testar")
    escreva()
    espere(60000)
  }

  funcao loop()
  {
    inteiro movimento = ler_pir(pino_pir)
    se (movimento == LIGADO)
    {
      escreva("Movimento detectado")
    }
    senao
    {
      escreva("Sem deteccao")
    }
    escreva()
    espere(500)
  }
}
```

## Entenda e observe

`ler_pir(pino)` faz a leitura digital da saída do módulo: `LIGADO` corresponde a HIGH e `DESLIGADO` a LOW. Também é possível usar `ler_entrada(pino)`. O PIR detecta variações de infravermelho; ele não mede distância nem identifica uma pessoa.

Envie o programa, abra **Monitor serial** a 9600 baud e aguarde a estabilização inicial. Em módulos comuns, esse processo pode levar de 30 a 60 segundos. Depois, mova uma mão ou caminhe diante do sensor e observe a mudança da mensagem.

## Resolva dificuldades

Se a saída permanecer ativa por vários segundos, confira o ajuste de tempo e o jumper de redisparo do módulo. Evite sol direto e fontes de calor em movimento. Uma pessoa parada pode deixar de gerar detecção; isso não significa necessariamente defeito. Confira a alimentação e o terra comum se a leitura ficar instável.

Referência: [guia de sensor PIR da Adafruit](https://learn.adafruit.com/pir-passive-infrared-proximity-motion-sensor?view=all).
