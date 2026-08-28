programa
{
  inteiro led = 13
  logico ligado = falso

  funcao inteiro dobro(inteiro valor)
  {
    retornar valor * 2
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
      escrever(mensagem, " ", marcador, " ", tensao)
    }
    senao
    {
      escrever("desligado")
    }
  }
}
