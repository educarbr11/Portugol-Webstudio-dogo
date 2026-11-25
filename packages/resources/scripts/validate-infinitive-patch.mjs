import assert from "node:assert/strict";

import { canonicalizePortugolCode, canonicalizeVisibleText } from "../src/helpers/infinitive.ts";

const source = `programa {
  // escreva, leia e limpa continuam intactos em comentários
  funcao inicio() {
    cadeia texto = "escreva leia limpa"
    inteiro escreva_algo = 1

    faca {
      escreva(texto)
    } enquanto (escreva_algo > 0)
  }
}`;

const canonical = canonicalizePortugolCode(source);

assert.match(canonical, /\/\/ escreva, leia e limpa continuam intactos em comentários/u);
assert.match(canonical, /"escreva leia limpa"/u);
assert.match(canonical, /inteiro escreva_algo = 1/u);
assert.match(canonical, /fazer \{/u);
assert.match(canonical, /escrever\(texto\)/u);

assert.equal(
  canonicalizeVisibleText("Escreva, leia, LIMPA, faca, escolha, pare, retorne e inclua"),
  "Escrever, ler, LIMPAR, fazer, escolher, parar, retornar e incluir",
);

console.log("ok conversão segura dos recursos para o infinitivo");
