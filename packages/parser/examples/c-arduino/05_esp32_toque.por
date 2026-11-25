programa
{
  inclua biblioteca Arduino

  inteiro pino_toque = 4
  inteiro led = 18
  inteiro limiar = 30

  funcao inicio()
  {
    Arduino.modo_pino(led, SAIDA)
  }

  funcao loop()
  {
    inteiro leitura = Arduino.ler_toque(pino_toque)
    inteiro leitura_original = Arduino.touchRead(4)

    se (Arduino.ler_toque(4) < limiar)
    {
      Arduino.escrever_digital(led, ALTO)
    }
    senao
    {
      Arduino.escrever_digital(led, BAIXO)
    }

    escreva("Toque: ", leitura, " original: ", leitura_original)
    escreva()
    Arduino.aguarde(100)
  }
}
