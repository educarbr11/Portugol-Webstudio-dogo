# ESP32: umidade do solo e calibração

## Objetivo e materiais

Leia um sensor capacitivo de solo e converta a leitura em uma escala relativa de 0 a 100. Use ESP32 Dev Module clássico, sensor capacitivo analógico compatível com 3,3 V (por exemplo, SEN0193), jumpers e amostras de solo seco e úmido.

## Ligações

| Terminal | Ligação |
| --- | --- |
| VCC do sensor compatível | 3V3 |
| GND | GND |
| AO, sinal analógico | GPIO 34 |

O GPIO 34 é somente entrada e é adequado para ADC; não habilite `ENTRADA_BOTAO` nele. Confira se a saída analógica fica entre GND e 3,3 V. Use a saída AO, não uma saída digital DO. Mergulhe somente a região sensora permitida pelo fabricante: a eletrônica e os conectores geralmente não são impermeáveis.

## Programa completo

```portugol
programa
{
  inteiro pino_solo = 34
  inteiro valor_seco = 3000
  inteiro valor_molhado = 1500

  funcao inicio()
  {
    modo_pino(pino_solo, ENTRADA)
  }

  funcao loop()
  {
    inteiro leitura = ler_umidade_solo(pino_solo)
    real percentual = mapear(leitura, valor_seco, valor_molhado, 0, 100)

    se (leitura_valida(percentual))
    {
      se (percentual < 0)
      {
        percentual = 0
      }
      senao se (percentual > 100)
      {
        percentual = 100
      }
      escreva("Solo: ADC ", leitura, "; escala relativa ", percentual, " %")
    }
    senao
    {
      escreva("Calibracao invalida: seco e molhado devem ser diferentes")
    }
    escreva()
    espere(1000)
  }
}
```

## Calibre antes de usar

`ler_umidade_solo(pino)` retorna a leitura ADC bruta, não uma porcentagem. No ESP32 com configuração padrão ela normalmente fica entre 0 e 4095, mas o sensor usa apenas parte dessa faixa. Anote várias leituras na condição seca e na condição úmida escolhida para o seu projeto e substitua `valor_seco` e `valor_molhado`.

Os números 3000 e 1500 são exemplos, não uma calibração universal. `mapear` aceita faixa invertida; por isso, uma leitura que diminui ao molhar pode virar uma escala crescente de 0 a 100. O programa limita o resultado explicitamente porque `mapear` não faz isso sozinho. Essa escala relativa não é uma medição calibrada de teor volumétrico de água.

Envie o programa e acompanhe **Monitor serial** a 9600 baud. O resultado deve variar de modo coerente entre as duas condições de referência.

## Resolva dificuldades

Leitura fixa pode indicar AO desconectado, alimentação incorreta ou falta de terra comum. Se a porcentagem ficar sempre em 0 ou 100, confira as leituras brutas e refaça a calibração. Não conecte uma bomba ou motor diretamente ao GPIO; esse exemplo apenas mede e imprime valores.

Referência: [manual e calibração do sensor capacitivo SEN0193 da DFRobot](https://wiki.dfrobot.com/sen0193/).
