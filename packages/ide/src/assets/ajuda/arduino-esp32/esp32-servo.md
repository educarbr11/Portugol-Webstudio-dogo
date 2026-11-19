# ESP32: controlar um servo motor

## Objetivo e materiais

Posicione um servo de rotação limitada em três ângulos. Use ESP32 Dev Module clássico, servo compatível com comando PWM, fonte externa regulada adequada ao servo (por exemplo, 5 V para um SG90 compatível), jumpers e cabo USB de dados. Um servo de rotação contínua controla velocidade/direção e não reproduz este exercício de posição.

## Ligações

Monte com as fontes desligadas. Confira as cores e a tensão permitida no manual do seu servo.

| Terminal | Ligação |
| --- | --- |
| Sinal do servo | GPIO 18 |
| Alimentação do servo | positivo da fonte externa adequada |
| GND do servo | negativo da fonte externa e GND do ESP32 |

O GPIO fornece apenas o sinal de controle. Não alimente o motor pelo GPIO nem pelo pino 3V3. Os terras precisam estar interligados; não conecte uma fonte externa ao pino 3V3 do ESP32. Confira se o servo reconhece sinal de 3,3 V.

## Programa completo

```portugol
programa
{
  inteiro pino_servo = 18
  logico servo_pronto = falso

  funcao inicio()
  {
    servo_pronto = iniciar_servo(pino_servo)
    se (nao servo_pronto)
    {
      escreva("Nao foi possivel iniciar o servo")
      escreva()
    }
  }

  funcao loop()
  {
    se (servo_pronto)
    {
      escrever_servo(pino_servo, 30)
      espere(1000)
      escrever_servo(pino_servo, 90)
      espere(1000)
      escrever_servo(pino_servo, 150)
      espere(1000)
    }
    senao
    {
      espere(1000)
    }
  }
}
```

## Entenda e observe

`iniciar_servo(pino)` reserva o controle do servo e retorna `verdadeiro` quando consegue iniciar. `escrever_servo(pino, angulo)` retorna o sucesso do comando e aceita posições entre 0 e 180 graus; a posição mecânica real depende do servo. Comece entre 30 e 150 para evitar forçar batentes. `parar_servo(pino)` encerra o comando PWM; isso não corta a alimentação do motor.

O preparo instala `ESP32Servo` para o ESP32. O gerador inclui o cabeçalho necessário; não escreva objetos C++ ou `inclua biblioteca Arduino`.

Selecione **ESP32 Dev Module**, envie o código e observe três posições alternando a cada segundo. O botão de execução no computador não movimenta o servo.

## Resolva dificuldades

Se o ESP32 reiniciar ou o servo tremer, confira a fonte, a corrente disponível e o terra comum. Não resolva falta de corrente alimentando o motor pelo GPIO. Falhas de inicialização também podem indicar pino inadequado ou falta de recursos PWM. Pare os testes se o servo atingir um batente, aquecer ou fizer esforço contínuo.

Referência: [biblioteca ESP32Servo](https://github.com/madhephaestus/ESP32Servo).
