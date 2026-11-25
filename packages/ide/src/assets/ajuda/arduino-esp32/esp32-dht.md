# ESP32: temperatura e umidade com DHT

## Objetivo e materiais

Mostre temperatura em graus Celsius e umidade relativa do ar. Use ESP32 Dev Module clássico, sensor DHT22 compatível com alimentação de 3,3 V, resistor de pull-up de 4,7 kΩ a 10 kΩ quando necessário, protoboard e jumpers. O mesmo programa aceita DHT11: troque `DHT22` por `DHT11` e confira alimentação, pinagem e faixa de medição do seu componente.

## Ligações

Desligue a alimentação e consulte o pinout do sensor. Um DHT avulso pode ter quatro pinos; módulos prontos podem ter três e ordem diferente.

| Terminal | Ligação |
| --- | --- |
| VCC do DHT compatível | 3V3 |
| DATA | GPIO 23 |
| GND | GND |
| Resistor de pull-up, se ausente no módulo | entre DATA e 3V3 |

Não conecte DATA com pull-up a 5 V no ESP32. Se o seu módulo exigir outra alimentação, confira a adaptação dos níveis lógicos antes de montar.

## Programa completo

```portugol
programa
{
  inteiro pino_dht = 23
  logico dht_pronto = falso

  funcao inicio()
  {
    dht_pronto = iniciar_dht(pino_dht, DHT22)
    espere(2000)
  }

  funcao loop()
  {
    se (dht_pronto)
    {
      real temperatura = ler_temperatura(pino_dht)
      real umidade = ler_umidade(pino_dht)

      se (leitura_valida(temperatura) e leitura_valida(umidade))
      {
        escreva("Temperatura: ", temperatura, " C; umidade: ", umidade, " %")
        escreva()
      }
      senao
      {
        escreva("Falha ao ler o DHT: confira modelo e ligacoes")
        escreva()
      }
    }
    senao
    {
      escreva("DHT nao foi inicializado")
      escreva()
    }
    espere(2000)
  }
}
```

## Entenda e observe

`iniciar_dht(pino, tipo)` prepara o sensor; `verdadeiro` confirma a configuração, não uma medição válida. As leituras retornam `real`: temperatura em Celsius e umidade relativa em porcentagem. Em uma falha, retornam `NaN`, um resultado numérico inválido. Teste cada leitura com `leitura_valida(valor)` antes de decidir ou acionar saídas.

O intervalo de dois segundos evita pedir medições mais rápido que o DHT22. Não diminua esse intervalo para tentar corrigir falhas. O preparo automático instala **DHT sensor library** e **Adafruit Unified Sensor**; o gerador inclui os cabeçalhos necessários.

Envie para **ESP32 Dev Module** e abra **Monitor serial** a 9600 baud. O esperado é uma linha de temperatura e umidade aproximadamente a cada dois segundos.

## Resolva dificuldades

Se as leituras falharem, confira `DHT11` versus `DHT22`, a pinagem, o pull-up e a tensão do módulo. Mantenha os fios curtos e evite molhar o sensor. O DHT mede o ar; não é um sensor para mergulhar no solo ou em água.

Referências: [guia DHT da Adafruit](https://learn.adafruit.com/dht?view=all) e [biblioteca oficial DHT](https://github.com/adafruit/DHT-sensor-library).
