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
  inteiro sensor = 34
  inteiro led = 18

  funcao inicio()
  {
    modo_pino(sensor, ENTRADA)
    modo_pino(led, SAIDA)
  }

  funcao loop()
  {
    inteiro leitura = ler_analogico(sensor)

    se (leitura >= 2048)
    {
      escrever_digital(led, LIGADO)
    }
    senao
    {
      escrever_digital(led, DESLIGADO)
    }

    escreva("ADC: ", leitura)
    escreva()
    espere(250)
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
5. Observe os valores na aba **Monitor serial** do Dogol: o monitor abre após o envio a **9600 baud**. Use **Monitor serial** para abrir manualmente. Feche monitores externos que estejam usando a porta.

## Resultado esperado

Ao girar o potenciômetro, a leitura muda. O LED acende quando o valor é maior ou igual a 2048 e apaga abaixo disso. O monitor mostra uma leitura por linha a cada 250 milissegundos.

## Experimente e resolva dificuldades

Altere o limiar para `1024` ou `3072` e observe a posição em que o LED muda de estado. Se a leitura fica sempre em zero ou no máximo, confira o terminal central e as extremidades do potenciômetro. Uma entrada sem conexão pode apresentar valores instáveis. Não use 5V para tentar ampliar a escala: isso pode danificar o ESP32.
