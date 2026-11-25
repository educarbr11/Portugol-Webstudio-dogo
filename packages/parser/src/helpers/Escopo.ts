import { arduinoConstants, arduinoFunctions } from "../arduino-language.js";
import { Tipo, TipoPrimitivo } from "./Tipo.js";

interface IEscopo {
  variáveis: Map<string, Tipo>;
  funções: Map<string, Tipo>;
  função?: Tipo;
}

export class Escopo {
  private pilha: IEscopo[] = [];

  constructor(inicial: IEscopo = { variáveis: new Map(), funções: new Map() }) {
    const variáveisBase = new Map<string, Tipo>([
      // Pinos analógicos mais comuns
      ["A0", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A1", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A2", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A3", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A4", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A5", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A6", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A7", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A8", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A9", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A10", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A11", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A12", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A13", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A14", { primitivo: TipoPrimitivo.INTEIRO }],
      ["A15", { primitivo: TipoPrimitivo.INTEIRO }],
    ]);

    for (const name of Object.keys(arduinoConstants)) {
      variáveisBase.set(name, { primitivo: TipoPrimitivo.INTEIRO });
    }

    const funçõesBase = new Map<string, Tipo>([
      ["escrever", { primitivo: TipoPrimitivo.VAZIO }],
      ["escreva", { primitivo: TipoPrimitivo.VAZIO }],
      ["ler", { primitivo: TipoPrimitivo.CADEIA }],
      ["leia", { primitivo: TipoPrimitivo.CADEIA }],
      ["limpar", { primitivo: TipoPrimitivo.VAZIO }],
      ["limpa", { primitivo: TipoPrimitivo.VAZIO }],
    ]);

    for (const definition of arduinoFunctions) {
      for (const name of [definition.name, ...definition.aliases]) {
        funçõesBase.set(name, { primitivo: definition.returnType });
      }
    }

    this.pilha.push({
      variáveis: new Map([...variáveisBase, ...inicial.variáveis]),
      funções: new Map([...funçõesBase, ...inicial.funções]),
      função: inicial.função,
    });
  }

  push() {
    this.pilha.push({
      variáveis: new Map(),
      funções: new Map(),
      função: this.atual.função,
    });
  }

  pop() {
    if (this.pilha.length === 1) {
      throw new Error("Não é possível remover o escopo global");
    }

    this.pilha.pop();
  }

  get atual(): IEscopo {
    return this.pilha.at(-1)!;
  }

  get global(): IEscopo {
    return this.pilha[0];
  }

  get variáveis() {
    return this.atual.variáveis;
  }

  get funções() {
    return this.atual.funções;
  }

  get função(): Tipo | undefined {
    return this.atual.função;
  }

  set função(tipo: Tipo | undefined) {
    this.atual.função = tipo;
  }

  hasVariável(nome: string) {
    for (const escopo of this.pilha) {
      if (escopo.variáveis.has(nome)) {
        return true;
      }
    }

    return false;
  }

  hasFunção(nome: string) {
    for (const escopo of this.pilha) {
      if (escopo.funções.has(nome)) {
        return true;
      }
    }

    return false;
  }

  getVariável(nome: string) {
    for (let index = this.pilha.length - 1; index >= 0; index--) {
      const escopo = this.pilha[index];
      if (escopo.variáveis.has(nome)) {
        return escopo.variáveis.get(nome);
      }
    }

    return this.variáveis.get(nome);
  }

  getFunção(nome: string) {
    for (let index = this.pilha.length - 1; index >= 0; index--) {
      const escopo = this.pilha[index];
      if (escopo.funções.has(nome)) {
        return escopo.funções.get(nome);
      }
    }

    return this.funções.get(nome);
  }
}
