# ESP32: brilho gradual por PWM

## Objetivo e materiais

Faça um LED aumentar e diminuir de brilho usando variáveis, soma e condições. Você precisa de ESP32 Dev Module clássico, cabo USB de dados, LED, resistor de 220 Ω a 330 Ω, protoboard e jumpers.

## Ligações

Desligue a placa antes de montar.

| Componente | Ligação |
| --- | --- |
| GPIO 18 | resistor em série com o ânodo do LED |
| Cátodo do LED | GND |
| ESP32 | USB após revisar as conexões |

O LED deve ter resistor em série. O ESP32 trabalha com lógica de 3,3 V; não conecte 5 V aos GPIOs.

## Programa completo

```portugol
programa
{
  inclua biblioteca Arduino

  inteiro led_pwm = 18
  inteiro brilho = 0
  inteiro passo = 5

  funcao inicio()
  {
    Arduino.modo_pino(led_pwm, SAIDA)
  }

  funcao loop()
  {
    Arduino.escrever_analogico(led_pwm, brilho)
    brilho += passo

    se (brilho >= 255)
    {
      brilho = 255
      passo = -5
    }
    senao se (brilho <= 0)
    {
      brilho = 0
      passo = 5
    }

    Arduino.aguarde(20)
  }
}
```

## Entenda o código

`escrever_analogico` é convertido em `analogWrite`, disponível no core ESP32 utilizado pelo Dogol. Nos valores padrão deste exemplo, `0` mantém o LED apagado e `255` mantém o brilho máximo.

`brilho += passo` aumenta ou diminui o valor. Ao atingir um limite, `se` e `senao se` prendem o valor entre `0` e `255` e invertem o sinal de `passo`. A pausa de 20 milissegundos permite perceber a transição.

PWM alterna rapidamente a saída; não é uma tensão analógica contínua. Sua implementação e frequência diferem do Uno, mesmo quando a chamada de Portugol é a mesma.

## Enviar para a placa

1. Clique em **Abrir no editor**, confira o circuito e conecte o USB.
2. Em **Placa**, escolha **ESP32 Dev Module**.
3. Clique em **Atualizar portas** e selecione **Porta**.
4. Clique em **Enviar para placa** e aguarde o fim da gravação.

## Resultado esperado

O LED aumenta e diminui de brilho continuamente. Não é necessário tocar em um sensor para alterar a intensidade.

## Experimente e resolva dificuldades

Troque a pausa por `40` para tornar a transição mais lenta. Use um `passo` de menor magnitude para diminuir os saltos de intensidade, mantendo a lógica dos dois limites.

Se o LED não acende, confira GPIO 18, polaridade e resistor. Se a compilação rejeitar `analogWrite`, confirme a placa selecionada e as mensagens de preparo do core. APIs LEDC específicas e configurações avançadas de PWM não possuem mapeamento explícito nesta versão do gerador.
