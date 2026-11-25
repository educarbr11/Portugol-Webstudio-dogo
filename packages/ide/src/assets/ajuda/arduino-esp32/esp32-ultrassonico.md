# ESP32: distância com sensor ultrassônico

## Objetivo e materiais

Meça aproximadamente a distância de um objeto com HC-SR04. Use ESP32 Dev Module clássico, HC-SR04 de 5 V, fonte adequada, jumpers e dois resistores para adaptar ECHO: 1 kΩ e 2 kΩ, por exemplo.

## Ligações

Desligue a alimentação para montar. O HC-SR04 comum usa ECHO de 5 V: não o ligue diretamente ao ESP32.

| Terminal | Ligação |
| --- | --- |
| VCC do HC-SR04 | 5 V compatível com o módulo |
| GND | terra comum ao ESP32 e à fonte |
| TRIG | GPIO 25 |
| ECHO | resistor de 1 kΩ até o nó de leitura |
| Nó de leitura | GPIO 26 e resistor de 2 kΩ até GND |

O divisor fica assim: **ECHO → 1 kΩ → nó/GPIO 26 → 2 kΩ → GND**. Idealmente, 5 V na entrada viram cerca de 3,3 V no nó. Confira os valores dos resistores e a tensão real da saída; um conversor de nível adequado também pode ser usado. Variantes de 3,3 V têm outras exigências: consulte o manual do modelo.

## Programa completo

```portugol
programa
{
  inteiro gatilho = 25
  inteiro eco = 26

  funcao inicio()
  {
    modo_pino(gatilho, SAIDA)
    modo_pino(eco, ENTRADA)
    escrever_digital(gatilho, DESLIGADO)
  }

  funcao loop()
  {
    real distancia = ler_distancia(gatilho, eco, 30000)
    se (distancia >= 0)
    {
      escreva("Distancia: ", distancia, " cm")
    }
    senao
    {
      escreva("Sem eco dentro do tempo limite")
    }
    escreva()
    espere(100)
  }
}
```

## Entenda e observe

`ler_distancia(gatilho, eco)` gera o pulso de disparo e mede o eco, com limite padrão de 30000 microssegundos. O terceiro argumento opcional define esse limite; use entre 1 e 1000000 microssegundos (até um segundo). Pinos inválidos, TRIG igual a ECHO ou timeout fora dessa faixa também retornam `-1`. A função devolve distância em centímetros ou `-1` quando não há eco completo dentro do prazo. Nunca interprete `-1` como um objeto encostado no sensor.

A leitura é bloqueante enquanto espera o pulso. O limite evita aguardar indefinidamente; uma pausa entre medições também reduz interferências entre disparos. A conversão usa uma aproximação da velocidade do som, portanto temperatura, ângulo e material do objeto afetam o resultado.

Envie o programa e abra **Monitor serial** a 9600 baud. Mova uma superfície plana diante do sensor: a distância deve mudar. Fora da faixa útil ou sem reflexão adequada, espere a mensagem de ausência de eco.

## Resolva dificuldades

Se houver somente `Sem eco`, confira TRIG/ECHO, terra comum, alimentação e divisor. Não elimine o divisor para tentar melhorar a leitura. Objetos muito próximos, estreitos ou inclinados podem não produzir um eco utilizável.

Referências: [HC-SR04 e adaptação de nível lógico na Adafruit](https://learn.adafruit.com/ultrasonic-sonar-distance-sensors?view=all) e [tempo limite de pulseIn no Arduino](https://docs.arduino.cc/language-reference/en/functions/advanced-io/pulseIn/).
