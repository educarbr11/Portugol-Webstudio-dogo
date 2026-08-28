programa
{
  inteiro valores[3] = { 1, 2, 3 }
  inteiro matriz[2][2]

  funcao inteiro soma_vetor(inteiro itens[])
  {
    retorne itens[0] + itens[1] + itens[2]
  }

  funcao inicio()
  {
    matriz[0][0] = soma_vetor(valores)
    matriz[0][1] = matriz[0][0] << 1
    matriz[1][0] = matriz[0][1] | 1
    matriz[1][1] = matriz[1][0] & 7

    escreva(matriz[1][1])
  }
}
