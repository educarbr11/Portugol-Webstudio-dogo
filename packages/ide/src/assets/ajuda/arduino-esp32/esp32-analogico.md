# ESP32: leitura analógica com potenciômetro

## Objetivo e materiais

Leia o ADC, use uma condição para controlar um LED e envie os valores pela Serial. Você precisa de ESP32 Dev Module clássico, cabo USB de dados, potenciômetro de aproximadamente 10 kΩ, LED, resistor de 220 Ω a 330 Ω, protoboard e jumpers.

## Ligações

Desconecte a alimentação antes de montar. Use **3V3**, nunca 5V, neste potenciômetro.

| Componente | Ligação |
| --- | --- |
| Extremidade do potenciômetro | 3V3 do ESP32 |
| Outra extremidade do potenciômetro | GND |
| Terminal central do potenciômetro | GPIO 34 |
| GPIO 18 | resistor em série com o ânodo do LED |
| Cátodo do LED | GND |

O GPIO 34 do ESP32 clássico é uma entrada ADC e não é saída. Não possui pull-up interno; o potenciômetro já fornece o nível de entrada neste circuito. Os GPIOs do ESP32 não são tolerantes a 5 V.

## Programa completo

```portugol
programa
{
  inclua biblioteca Arduino

  inteiro sensor = 34
  inteiro led = 18

  funcao inicio()
  {
    Arduino.modo_pino(sensor, ENTRADA)
    Arduino.modo_pino(led, SAIDA)
  }

  funcao loop()
  {
    inteiro leitura = Arduino.ler_analogico(sensor)

    se (leitura >= 2048)
    {
      Arduino.escrever_digital(led, ALTO)
    }
    senao
    {
      Arduino.escrever_digital(led, BAIXO)
    }

    escreva("ADC: ", leitura)
    escreva()
    Arduino.aguarde(250)
  }
}
```

## Entenda o código

Na configuração padrão comum, `ler_analogico` retorna de `0` a `4095`. A condição compara a leitura com `2048`, aproximadamente a metade da escala. A resposta do ADC depende também da configuração do core e das características elétricas do chip; esta é uma demonstração de leitura bruta, não um voltímetro calibrado.

`escreva("ADC: ", leitura)` envia a leitura pela Serial. `escreva()` sem argumentos encerra a linha. A pausa de 250 milissegundos limita a frequência de atualização.

## Enviar e observar

1. Clique em **Abrir no editor**, confira a montagem e conecte o USB.
2. Em **Placa**, escolha **ESP32 Dev Module**.
3. Clique em **Atualizar portas** e selecione a placa em **Porta**.
4. Clique em **Enviar para placa** e aguarde a conclusão.
5. Para observar os valores, abra um monitor serial externo na mesma porta a **9600 baud**. O Dogol ainda não possui monitor serial integrado. Feche o monitor antes do próximo upload.

## Resultado esperado

Ao girar o potenciômetro, a leitura muda. O LED acende quando o valor é maior ou igual a 2048 e apaga abaixo disso. O monitor externo mostra uma leitura por linha a cada 250 milissegundos.

## Experimente e resolva dificuldades

Altere o limiar para `1024` ou `3072` e observe a posição em que o LED muda de estado. Se a leitura fica sempre em zero ou no máximo, confira o terminal central e as extremidades do potenciômetro. Uma entrada sem conexão pode apresentar valores instáveis. Não use 5V para tentar ampliar a escala: isso pode danificar o ESP32.
