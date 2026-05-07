programa
{
  inclua biblioteca Arduino

  inteiro led = 13

  funcao inicio()
  {
    Arduino.modo_pino(led, SAIDA)
    Arduino.escrever_digital(led, ALTO)
    Arduino.aguarde(1000)
    Arduino.escrever_digital(led, BAIXO)
  }

  funcao loop()
  {
    Arduino.escrever_digital(led, ALTO)
    Arduino.aguarde(250)
    Arduino.escrever_digital(led, BAIXO)
    Arduino.aguarde(250)
  }
}
