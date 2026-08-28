programa
{
  inteiro led = 13
  logico ligado = falso

  funcao inteiro dobro(inteiro valor)
  {
    retorne valor * 2
  }

  funcao inicio()
  {
    inteiro leitura = dobro(21)
    real tensao = 3.3
    cadeia mensagem = "inicio"
    caracter marcador = 'A'

    ligado = leitura == 42 e nao ligado

    se (ligado)
    {
      escreva(mensagem, " ", marcador, " ", tensao)
    }
    senao
    {
      escreva("desligado")
    }
  }
}
