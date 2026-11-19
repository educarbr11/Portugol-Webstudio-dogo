# Mapear valores entre faixas

## Objetivo e materiais

Converta uma medida de uma escala para outra sem escrever a fórmula em cada programa. Este exemplo usa ESP32 Dev Module clássico, potenciômetro de 10 kΩ, protoboard e jumpers. A função também pode ser usada em cálculos sem sensor e em programas para Uno.

## Ligações

Ligue as extremidades do potenciômetro em **3V3** e **GND**, e o terminal central ao **GPIO 34**. Não use 5 V nesse circuito do ESP32. O GPIO 34 oferece entrada analógica, mas não saída ou pull-up interno.

## Programa completo

```portugol
programa
{
  inteiro pino_sensor = 34

  funcao inicio()
  {
    modo_pino(pino_sensor, ENTRADA)
  }

  funcao loop()
  {
    inteiro leitura = ler_analogico(pino_sensor)
    real tensao_aproximada = mapear(leitura, 0, 4095, 0, 3.3)
    real percentual = mapear(leitura, 0, 4095, 0, 100)

    se (leitura_valida(tensao_aproximada) e leitura_valida(percentual))
    {
      escreva("ADC: ", leitura, "; escala: ", percentual, " %; aproximacao: ", tensao_aproximada, " V")
      escreva()
    }
    espere(250)
  }
}
```

## Parâmetros e resultado

A chamada é `mapear(valor, entrada_min, entrada_max, saida_min, saida_max)`. Ela retorna `real` e preserva casas decimais. Por exemplo, `mapear(5, 0, 10, 0, 100)` resulta em 50; `mapear(2.5, 0, 10, 0, 1)` resulta em 0,25. As chamadas diretas `map(...)` e `MAP(...)` são aliases da mesma função no Dogol.

A faixa pode ser invertida: `mapear(3000, 3000, 1500, 0, 100)` resulta em 0, e usar 1500 como primeiro argumento resulta em 100. Isso é útil para sensores cujo valor cai quando a grandeza aumenta.

A função **não limita a saída**. `mapear(15, 0, 10, 0, 100)` retorna 150. Se precisar restringir a 0–100, faça comparações e atribuições depois do mapeamento, como no tutorial de umidade do solo.

Se `entrada_min` e `entrada_max` forem iguais, não existe uma escala válida e o resultado é `NaN`. Teste `leitura_valida(resultado)` antes de usar esse valor para controlar componentes.

## Resultado e dificuldades

Envie para a placa e abra **Monitor serial** a 9600 baud. Ao girar o potenciômetro, a escala deve variar aproximadamente de 0 a 100. A tensão calculada é apenas uma conversão linear didática: não substitui a caracterização ou calibração do ADC do ESP32.

No Uno, adapte a montagem para A0, alimentação e faixa ADC de 0–1023. A função do Dogol trabalha com resultado real; a função C++ original `map()` do Arduino normalmente faz aritmética inteira e não é uma substituição idêntica para cálculos com decimais.

Se os números não variarem, confira o terminal central e o terra comum. Resultado inválido indica, entre outras possibilidades, limites de entrada iguais; revise a calibração.

Referência para comparação: [função map original do Arduino](https://docs.arduino.cc/language-reference/en/functions/math/map/).
