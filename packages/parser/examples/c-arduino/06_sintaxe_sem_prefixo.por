programa
{
  inteiro led = 18
  inteiro botao = 27

  funcao inicio()
  {
    modo_pino(led, SAIDA)
    modo_pino(botao, ENTRADA_BOTAO)
  }

  funcao inteiro ler_botao()
  {
    retorne ler_entrada(botao)
  }

  funcao loop()
  {
    inteiro estado = LIGADO
    estado = ler_entrada(botao)
    se (estado == DESLIGADO)
    {
      escrever_digital(led, LIGADO)
    }
    senao
    {
      escrever_digital(led, DESLIGADO)
    }
    espere(100)
    espere_microssegundo(10)
  }
}
