import assert from "node:assert/strict";

import { PortugolCArduino, PortugolErrorChecker } from "../lib/index.js";

const programs = {
  canonical: `programa {
    incluir biblioteca Arduino

    funcao inteiro normalizar(inteiro valor) {
      escolher (valor) {
        caso 0:
          valor = 1
          parar
        caso contrario:
          valor = 2
      }

      retornar valor
    }

    funcao inicio() {
      inteiro valor = normalizar(0)

      fazer {
        valor--
      } enquanto (valor > 0)

      escrever("valor: ", valor)
      ler(valor)
      limpar()
    }
  }`,
  legacy: `programa {
    inclua biblioteca Arduino

    funcao inteiro normalizar(inteiro valor) {
      escolha (valor) {
        caso 0:
          valor = 1
          pare
        caso contrario:
          valor = 2
      }

      retorne valor
    }

    funcao inicio() {
      inteiro valor = normalizar(0)

      faca {
        valor--
      } enquanto (valor > 0)

      escreva("valor: ", valor)
      leia(valor)
      limpa()
    }
  }`,
  mixed: `programa {
    funcao inicio() {
      inteiro valor = 1

      fazer {
        valor--
      } enquanto (valor > 0)

      escreva("ok")
      limpar()
    }
  }`,
};

for (const [name, code] of Object.entries(programs)) {
  const result = PortugolErrorChecker.checkCode(code);

  assert.deepEqual(
    [...result.parseErrors, ...result.errors].map(error => error.message),
    [],
    `O programa ${name} deveria ser válido`,
  );
}

for (const outputFunction of ["escrever", "escreva"]) {
  const code = `programa {
    funcao inicio() {
      ${outputFunction}("ok")
    }
  }`;
  const result = PortugolErrorChecker.checkCode(code);
  const c = PortugolCArduino.transpileTree(result.tree);

  assert.match(c, /Serial\.print\("ok"\);/u, `${outputFunction} deveria gerar Serial.print`);
}

const reservedIdentifier = PortugolErrorChecker.checkCode(`programa {
  funcao fazer() {}
  funcao inicio() {}
}`);

assert.ok(reservedIdentifier.parseErrors.length > 0, "fazer deve ser uma palavra reservada");

console.log("ok comandos canônicos, aliases legados e sintaxe mista");
