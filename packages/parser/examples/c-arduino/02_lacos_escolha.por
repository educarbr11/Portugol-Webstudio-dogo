programa
{
  funcao inicio()
  {
    inteiro soma = 0
    inteiro i = 0

    para (i = 0; i < 5; i++)
    {
      soma += i
    }

    enquanto (soma < 20)
    {
      soma += 2
    }

    fazer
    {
      soma--
    }
    enquanto (soma > 10)

    escolher (soma)
    {
      caso 10:
        escrever("dez")
        parar

      caso contrario:
        escrever("outro")
    }
  }
}
