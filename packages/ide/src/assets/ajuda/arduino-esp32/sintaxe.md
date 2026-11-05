# Sintaxe de Portugol para microcontroladores

Os mesmos comandos de Portugol são usados no Arduino Uno e no ESP32. A opção **Placa** define o core que compila o C/C++ gerado. Os exemplos desta página não precisam de circuito: a saída é enviada pela Serial da placa em 9600 baud.

## Estrutura e tipos

O corpo fica dentro de `programa { ... }`. `inicio()` é obrigatório. Para repetir tarefas, adicione `loop()`. Não coloque `enquanto (verdadeiro)` dentro de `inicio()` quando você quiser usar também a função `loop()`.

| Tipo | Uso | C/C++ gerado |
| --- | --- | --- |
| `inteiro` | contagens, pinos, leituras | `int` |
| `real` | valores com parte decimal | `float` |
| `logico` | `verdadeiro` ou `falso` | `bool` |
| `caracter` | um caractere entre aspas simples | `char` |
| `cadeia` | texto entre aspas duplas | `String` |

Variáveis declaradas fora das funções são globais. Variáveis locais existem apenas dentro de sua função. No Uno, `int` normalmente usa 16 bits; no ESP32, 32 bits. Evite números maiores que o tipo comporta e prefira textos curtos no Uno para economizar RAM.

## Função, retorno, vetor e decisão

Este programa soma um vetor, altera seus elementos em um laço e verifica o resultado com `se` e `escolha`. Os índices começam em zero. A soma ocorre antes da alteração do vetor e vale `12`.

```portugol
programa
{
  inteiro valores[3] = { 2, 4, 6 }

  funcao inteiro somar_vetor(inteiro itens[])
  {
    retorne itens[0] + itens[1] + itens[2]
  }

  funcao inicio()
  {
    inteiro total = somar_vetor(valores)
    inteiro i = 0
    real tensao = 3.3
    caracter marcador = 'A'
    cadeia mensagem = "soma valida: "
    logico valido = total >= 12 e total != 0

    para (i = 0; i < 3; i++)
    {
      valores[i] += 1
    }

    se (valido)
    {
      escreva(mensagem, total)
    }
    senao
    {
      escreva("soma invalida")
    }

    escolha (total)
    {
      caso 12:
        escreva(" resultado esperado")
        pare

      caso contrario:
        escreva(" outro resultado")
    }

    escreva()
    escreva("Marcador: ", marcador, " Tensao: ", tensao)
    escreva()
  }
}
```

Resultado esperado: a Serial mostra `soma valida: 12 resultado esperado` e uma segunda linha com o marcador e a tensão. Para conferir, abra um monitor serial externo na mesma porta, configurado em 9600 baud, e reinicie a placa. Feche o monitor antes de outro upload.

## Laços e escolha

`para` é útil quando a quantidade de repetições é conhecida. `enquanto` testa a condição antes do corpo. `faca ... enquanto` executa o corpo pelo menos uma vez. `pare` encerra o caso de uma escolha ou um laço.

```portugol
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

    faca
    {
      soma--
    }
    enquanto (soma > 10)

    escolha (soma)
    {
      caso 10:
        escreva("dez")
        pare

      caso contrario:
        escreva("outro")
    }
    escreva()
  }
}
```

Resultado esperado: a saída é `dez`. Faça condições que possam se tornar falsas para não prender a placa em um laço infinito.

## Operadores

| Grupo | Operadores |
| --- | --- |
| Aritmética | `+`, `-`, `*`, `/`, `%` |
| Comparação | `==`, `!=`, `>`, `>=`, `<`, `<=` |
| Lógica | `e`, `ou`, `nao` |
| Atribuição | `=`, `+=`, `-=`, `*=`, `/=` |
| Incremento e decremento | `++`, `--` |
| Bits | `&`, `|`, `^`, `~`, `<<`, `>>` |

Use `=` para atribuir e `==` para comparar. Uma divisão de valores inteiros descarta a parte fracionária no código gerado; para cálculos fracionários, use valores `real`.

## Matrizes simples

É possível declarar dimensões fixas e preencher cada posição. Não use índices fora do tamanho declarado.

```portugol
programa
{
  inteiro valores[3] = { 1, 2, 3 }
  inteiro matriz[2][2]

  funcao inteiro somar(inteiro itens[])
  {
    retorne itens[0] + itens[1] + itens[2]
  }

  funcao inicio()
  {
    matriz[0][0] = somar(valores)
    matriz[0][1] = matriz[0][0] << 1
    matriz[1][0] = matriz[0][1] | 1
    matriz[1][1] = matriz[1][0] & 7
    escreva(matriz[1][1])
    escreva()
  }
}
```

Resultado esperado: a saída é `5`. Matrizes inicializadas diretamente e parâmetros de matriz ainda têm limitações de dimensões no gerador; use declarações simples como esta.

## Enviar e observar

1. Abra um programa no editor.
2. Escolha sua placa em **Placa**.
3. Clique em **Atualizar portas** e selecione **Porta**.
4. Use **Gerar código C/Arduino** para conferir a tradução, se desejar.
5. Clique em **Enviar para placa**.
6. Abra um monitor serial externo em 9600 baud e reinicie a placa para observar a saída de `inicio()`.

`escreva()` com argumentos imprime em sequência, sem espaços ou quebra de linha automáticos. `escreva()` sem argumentos encerra a linha. O Dogol ainda não possui monitor serial integrado nem implementação de `leia()` na placa.
