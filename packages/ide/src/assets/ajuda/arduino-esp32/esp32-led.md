# ESP32: piscar um LED externo

## Objetivo e materiais

Controle uma saída digital do ESP32 clássico sem depender do LED integrado, que varia entre placas. Você precisa de ESP32 Dev Module, cabo USB de dados, LED, resistor de 220 Ω a 330 Ω, protoboard e jumpers.

## Ligações

Desconecte o USB para montar.

| Componente | Ligação |
| --- | --- |
| GPIO 18 | resistor em série com o ânodo do LED |
| Cátodo do LED | GND |
| ESP32 Dev Module | USB após conferir a montagem |

O resistor limita a corrente e deve permanecer em série. O ânodo normalmente é a perna mais longa; o lado achatado do LED costuma indicar o cátodo. Confira a marcação do seu componente e o pinout da sua placa.

O ESP32 trabalha com lógica de **3,3 V**. Seus GPIOs não toleram 5 V. Os números do programa são os GPIOs, não a posição física dos terminais no conector.

## Programa completo

```portugol
programa
{
  inclua biblioteca Arduino

  inteiro led = 18

  funcao inicio()
  {
    Arduino.modo_pino(led, SAIDA)
  }

  funcao loop()
  {
    Arduino.escrever_digital(led, ALTO)
    Arduino.aguarde(500)
    Arduino.escrever_digital(led, BAIXO)
    Arduino.aguarde(500)
  }
}
```

## Entenda o código

`inicio()` configura o GPIO 18 como saída. `loop()` escreve `ALTO`, espera 500 milissegundos, escreve `BAIXO` e espera novamente. Ao terminar, o loop recomeça. As pausas fazem um ciclo completo de um segundo.

## Enviar para a placa

1. Clique em **Abrir no editor**, revise a montagem e conecte o ESP32 por USB.
2. Escolha **ESP32 Dev Module** em **Placa**.
3. Clique em **Atualizar portas** e selecione a placa em **Porta**.
4. Clique em **Enviar para placa** e acompanhe o preparo e a gravação. O primeiro uso exige internet.

## Resultado esperado

O LED externo fica meio segundo aceso e meio segundo apagado. O programa continua rodando na placa após o envio.

## Experimente e resolva dificuldades

Troque `500` por `200` nas duas pausas e compare a velocidade. Se não piscar, confira GPIO 18, GND, polaridade, resistor e a conclusão da gravação. O LED integrado da placa pode estar em outro pino e não faz parte deste circuito.

Se a gravação não iniciar, confira cabo e porta. Algumas placas exigem manter **BOOT** pressionado durante o início da conexão de gravação e soltá-lo quando a transferência começar. Os exemplos são para o ESP32 original, não para variantes C3, S2 ou S3.
