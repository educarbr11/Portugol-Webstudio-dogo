import { ArquivoContext } from "@portugol-webstudio/antlr";

import { Tipo } from "./helpers/Tipo.js";
import {
  Arquivo,
  AtribuiçãoCmd as AtribuicaoCmd,
  AtribuiçãoCompostaDivisãoCmd as AtribuicaoCompostaDivisaoCmd,
  AtribuiçãoCompostaMultiplicaçãoCmd as AtribuicaoCompostaMultiplicacaoCmd,
  AtribuiçãoCompostaSomaCmd as AtribuicaoCompostaSomaCmd,
  AtribuiçãoCompostaSubtraçãoCmd as AtribuicaoCompostaSubtracaoCmd,
  CadeiaExpr,
  CaractereExpr,
  CasoCmd,
  CasoContrárioExpr as CasoContrarioExpr,
  ChamadaFunçãoExpr as ChamadaFuncaoExpr,
  Comando,
  DeclaraçãoCmd as DeclaracaoCmd,
  DeclaraçãoMatrizExpr as DeclaracaoMatrizExpr,
  DeclaraçãoVariávelExpr as DeclaracaoVariavelExpr,
  DeclaraçãoVetorExpr as DeclaracaoVetorExpr,
  DecrementoUnárioPósfixadoExpr as DecrementoUnarioPosfixadoExpr,
  DecrementoUnárioPrefixadoExpr as DecrementoUnarioPrefixadoExpr,
  DivisãoExpr as DivisaoExpr,
  EnquantoCmd,
  EscolhaCmd,
  Expressão as Expressao,
  ExpressãoEntreParênteses as ExpressaoEntreParenteses,
  ExpressãoMatemática as ExpressaoMatematica,
  FaçaEnquantoCmd as FacaEnquantoCmd,
  Função as Funcao,
  IncrementoUnárioPósfixadoExpr as IncrementoUnarioPosfixadoExpr,
  IncrementoUnárioPrefixadoExpr as IncrementoUnarioPrefixadoExpr,
  InicializaçãoMatrizExpr as InicializacaoMatrizExpr,
  InicializaçãoVetorExpr as InicializacaoVetorExpr,
  InteiroExpr,
  LógicoExpr as LogicoExpr,
  MaisUnárioExpr as MaisUnarioExpr,
  MenosUnárioExpr as MenosUnarioExpr,
  MóduloExpr as ModuloExpr,
  MultiplicaçãoExpr as MultiplicacaoExpr,
  NegaçãoBitwiseExpr as NegacaoBitwiseExpr,
  NegaçãoExpr as NegacaoExpr,
  OperaçãoAndBitwiseExpr as OperacaoAndBitwiseExpr,
  OperaçãoAndLógicoExpr as OperacaoAndLogicoExpr,
  OperaçãoDiferençaExpr as OperacaoDiferencaExpr,
  OperaçãoIgualdadeExpr as OperacaoIgualdadeExpr,
  OperaçãoMaiorOuIgualQueExpr as OperacaoMaiorOuIgualQueExpr,
  OperaçãoMaiorQueExpr as OperacaoMaiorQueExpr,
  OperaçãoMenorOuIgualQueExpr as OperacaoMenorOuIgualQueExpr,
  OperaçãoMenorQueExpr as OperacaoMenorQueExpr,
  OperaçãoOrBitwiseExpr as OperacaoOrBitwiseExpr,
  OperaçãoOrLógicoExpr as OperacaoOrLogicoExpr,
  OperaçãoShiftLeftExpr as OperacaoShiftLeftExpr,
  OperaçãoShiftRightExpr as OperacaoShiftRightExpr,
  OperaçãoXorExpr as OperacaoXorExpr,
  ParaCmd,
  Parâmetro as Parametro,
  PareCmd,
  RealExpr,
  ReferênciaArrayExpr as ReferenciaArrayExpr,
  ReferênciaMatrizExpr as ReferenciaMatrizExpr,
  ReferênciaVarExpr as ReferenciaVarExpr,
  RetorneCmd,
  SeCmd,
  SenãoCmd as SenaoCmd,
  SomaExpr,
  SubtraçãoExpr as SubtracaoExpr,
} from "./nodes/index.js";
import { PortugolNode } from "./PortugolNode.js";

export class PortugolCArduino {
  private static arduinoFunctions = new Set([
    "pinMode",
    "digitalWrite",
    "digitalRead",
    "analogWrite",
    "analogRead",
    "delay",
    "delayMicroseconds",
    "millis",
    "micros",
    "tone",
    "noTone",
    "pulseIn",
    "shiftOut",
    "shiftIn",
  ]);

  private static arduinoFunctionAliases: Record<string, string> = {
    // Português
    modo_pino: "pinMode",
    escrever_digital: "digitalWrite",
    ler_digital: "digitalRead",
    escrever_analogico: "analogWrite",
    ler_analogico: "analogRead",
    aguarde: "delay",
    aguarde_microssegundos: "delayMicroseconds",
    milissegundos: "millis",
    microssegundos: "micros",
    tom: "tone",
    parar_tom: "noTone",

    // Variações comuns
    delay_ms: "delay",
    delay_us: "delayMicroseconds",
  };

  private static arduinoConstantAliases: Record<string, string> = {
    ALTO: "HIGH",
    BAIXO: "LOW",
    SAIDA: "OUTPUT",
    ENTRADA: "INPUT",
    ENTRADA_PULLUP: "INPUT_PULLUP",
    alto: "HIGH",
    baixo: "LOW",
    saida: "OUTPUT",
    entrada: "INPUT",
    entrada_pullup: "INPUT_PULLUP",
    HIGH: "HIGH",
    LOW: "LOW",
    OUTPUT: "OUTPUT",
    INPUT: "INPUT",
    INPUT_PULLUP: "INPUT_PULLUP",
  };

  private lines: string[] = [];
  private indent = 0;

  private static node = new PortugolNode();

  public static transpileTree(tree: ArquivoContext): string {
    const arquivo = this.node.visit(tree);

    return new PortugolCArduino().emitArquivo(arquivo);
  }

  private emitArquivo(arquivo: Arquivo): string {
    const isLoopFunction = (nome: string) => nome.trim().toLowerCase() === "loop";
    const isInicioFunction = (nome: string) => nome.trim().toLowerCase() === "inicio";

    this.push("// Código gerado automaticamente pelo Portugol Webstudio");
    this.push("#include <Arduino.h>");
    this.push("");

    if (arquivo.bibliotecas.length > 0) {
      this.push("// Bibliotecas Portugol detectadas:");

      for (const biblioteca of arquivo.bibliotecas) {
        this.push(`// - ${biblioteca.nome}${biblioteca.alias ? ` como ${biblioteca.alias}` : ""}`);
      }

      this.push("");
    }

    for (const declaracao of arquivo.declarações) {
      this.push(this.emitDeclaracao(declaracao));
    }

    if (arquivo.declarações.length > 0) {
      this.push("");
    }

    const funcoesComuns = arquivo.funções.filter(
      funcao => !isInicioFunction(funcao.nome) && !isLoopFunction(funcao.nome),
    );

    for (const funcao of funcoesComuns) {
      this.push(`${this.emitFuncaoAssinatura(funcao)};`);
    }

    if (funcoesComuns.length > 0) {
      this.push("");
    }

    for (const funcao of funcoesComuns) {
      this.emitFuncao(funcao);
      this.push("");
    }

    const inicio = arquivo.funções.find(funcao => isInicioFunction(funcao.nome));
    const loopUsuario = arquivo.funções.find(funcao => isLoopFunction(funcao.nome));

    this.push("void setup() {");
    this.indent++;
    this.push("Serial.begin(9600);");

    if (inicio) {
      for (const instrucao of inicio.instruções) {
        this.emitInstrucao(instrucao);
      }
    }

    this.indent--;
    this.push("}");
    this.push("");
    this.push("void loop() {");

    if (loopUsuario) {
      this.indent++;

      for (const instrucao of loopUsuario.instruções) {
        this.emitInstrucao(instrucao);
      }

      this.indent--;
    }

    this.push("}");

    return `${this.lines.join("\n")}\n`;
  }

  private emitFuncao(funcao: Funcao) {
    this.push(`${this.emitFuncaoAssinatura(funcao)} {`);
    this.indent++;

    for (const instrucao of funcao.instruções) {
      this.emitInstrucao(instrucao);
    }

    this.indent--;
    this.push("}");
  }

  private emitFuncaoAssinatura(funcao: Funcao): string {
    const retorno = this.emitTipo(funcao.retorno);
    const parametros = funcao.parâmetros.map(parametro => this.emitParametro(parametro)).join(", ");

    return `${retorno} ${funcao.nome}(${parametros})`;
  }

  private emitParametro(parametro: Parametro): string {
    const tipoBase = this.emitTipo(parametro.tipo);

    if ("dimensão" in parametro.tipo && parametro.tipo.dimensão === "vetor") {
      return `${tipoBase} ${parametro.nome}[]`;
    }

    if ("dimensão" in parametro.tipo && parametro.tipo.dimensão === "matriz") {
      return `${tipoBase} ${parametro.nome}[][10]`;
    }

    return `${tipoBase} ${parametro.nome}`;
  }

  private emitTipo(tipo: Tipo): string {
    switch (tipo.primitivo) {
      case "inteiro":
        return "int";

      case "real":
        return "float";

      case "logico":
        return "bool";

      case "caracter":
        return "char";

      case "cadeia":
        return "String";

      case "vazio":
        return "void";

      default:
        return "auto";
    }
  }

  private emitInstrucao(instrucao: Expressao | Comando) {
    if (instrucao instanceof DeclaracaoCmd) {
      this.push(this.emitDeclaracao(instrucao));
      return;
    }

    if (instrucao instanceof AtribuicaoCmd) {
      this.push(`${this.emitReferencia(instrucao.variável)} = ${this.emitExpressao(instrucao.expressão)};`);
      return;
    }

    if (instrucao instanceof AtribuicaoCompostaSomaCmd) {
      this.push(this.emitAtribuicaoComposta(instrucao, "+"));
      return;
    }

    if (instrucao instanceof AtribuicaoCompostaSubtracaoCmd) {
      this.push(this.emitAtribuicaoComposta(instrucao, "-"));
      return;
    }

    if (instrucao instanceof AtribuicaoCompostaMultiplicacaoCmd) {
      this.push(this.emitAtribuicaoComposta(instrucao, "*"));
      return;
    }

    if (instrucao instanceof AtribuicaoCompostaDivisaoCmd) {
      this.push(this.emitAtribuicaoComposta(instrucao, "/"));
      return;
    }

    if (instrucao instanceof ChamadaFuncaoExpr) {
      this.emitChamadaFuncaoComando(instrucao);
      return;
    }

    if (
      instrucao instanceof IncrementoUnarioPrefixadoExpr ||
      instrucao instanceof IncrementoUnarioPosfixadoExpr ||
      instrucao instanceof DecrementoUnarioPrefixadoExpr ||
      instrucao instanceof DecrementoUnarioPosfixadoExpr
    ) {
      this.push(`${this.emitExpressao(instrucao)};`);
      return;
    }

    if (instrucao instanceof SeCmd) {
      this.push(`if (${this.emitExpressao(instrucao.condição)}) {`);
      this.indent++;

      for (const item of instrucao.instruções) {
        this.emitInstrucao(item);
      }

      this.indent--;

      if (instrucao.senão) {
        this.push("} else {");
        this.indent++;

        for (const item of instrucao.senão.instruções) {
          this.emitInstrucao(item);
        }

        this.indent--;
      }

      this.push("}");
      return;
    }

    if (instrucao instanceof EnquantoCmd) {
      this.push(`while (${this.emitExpressao(instrucao.condição)}) {`);
      this.indent++;

      for (const item of instrucao.instruções) {
        this.emitInstrucao(item);
      }

      this.indent--;
      this.push("}");
      return;
    }

    if (instrucao instanceof FacaEnquantoCmd) {
      this.push("do {");
      this.indent++;

      for (const item of instrucao.instruções) {
        this.emitInstrucao(item);
      }

      this.indent--;
      this.push(`} while (${this.emitExpressao(instrucao.condição)});`);
      return;
    }

    if (instrucao instanceof ParaCmd) {
      const inicializacao = instrucao.inicialização ? this.emitParteFor(instrucao.inicialização) : "";
      const condicao = instrucao.condição ? this.emitForCondicao(instrucao.condição) : "";
      const incremento = instrucao.incremento ? this.emitExpressao(instrucao.incremento) : "";

      this.push(`for (${inicializacao}; ${condicao}; ${incremento}) {`);
      this.indent++;

      for (const item of instrucao.instruções) {
        this.emitInstrucao(item);
      }

      this.indent--;
      this.push("}");
      return;
    }

    if (instrucao instanceof EscolhaCmd) {
      this.push(`switch (${this.emitExpressao(instrucao.condição)}) {`);
      this.indent++;

      for (const caso of instrucao.casos) {
        this.emitCaso(caso);
      }

      this.indent--;
      this.push("}");
      return;
    }

    if (instrucao instanceof RetorneCmd) {
      if (instrucao.expressão) {
        this.push(`return ${this.emitExpressao(instrucao.expressão)};`);
      } else {
        this.push("return;");
      }

      return;
    }

    if (instrucao instanceof PareCmd) {
      this.push("break;");
      return;
    }

    if (instrucao instanceof SenaoCmd) {
      for (const item of instrucao.instruções) {
        this.emitInstrucao(item);
      }

      return;
    }

    this.push(`// TODO: instrução não mapeada (${instrucao.constructor.name})`);
  }

  private emitCaso(caso: CasoCmd) {
    if (caso.condição instanceof CasoContrarioExpr) {
      this.push("default:");
    } else {
      this.push(`case ${this.emitExpressao(caso.condição)}:`);
    }

    this.indent++;

    for (const instrucao of caso.instruções) {
      this.emitInstrucao(instrucao);
    }

    this.indent--;
  }

  private emitDeclaracao(declaracao: DeclaracaoCmd): string {
    const tipo = this.emitTipo(declaracao.tipo);
    const declaracaoVetor = declaracao.children.find(
      child => child instanceof DeclaracaoVetorExpr,
    ) as DeclaracaoVetorExpr | undefined;
    const declaracaoMatriz = declaracao.children.find(
      child => child instanceof DeclaracaoMatrizExpr,
    ) as DeclaracaoMatrizExpr | undefined;
    const declaracaoVariavel = declaracao.children.find(
      child => child instanceof DeclaracaoVariavelExpr,
    ) as DeclaracaoVariavelExpr | undefined;

    const tipoVetor = "dimensão" in declaracao.tipo && declaracao.tipo.dimensão === "vetor" ? declaracao.tipo : undefined;
    const tipoMatriz =
      "dimensão" in declaracao.tipo && declaracao.tipo.dimensão === "matriz" ? declaracao.tipo : undefined;

    if (declaracaoVetor || tipoVetor) {
      const tamanho = declaracaoVetor?.tamanho ?? tipoVetor?.tamanho;
      const tamanhoStr = tamanho ? this.emitExpressao(tamanho) : "";
      const inicializacao = declaracaoVetor?.inicialização ?? declaracao.expressão;

      if (inicializacao instanceof InicializacaoVetorExpr) {
        const valores = inicializacao.valores.map(valor => this.emitExpressao(valor)).join(", ");
        const dimensao = tamanhoStr || String(inicializacao.valores.length);

        return `${tipo} ${declaracao.nome}[${dimensao}] = { ${valores} };`;
      }

      if (tamanhoStr) {
        return `${tipo} ${declaracao.nome}[${tamanhoStr}];`;
      }

      return `${tipo} ${declaracao.nome}[];`;
    }

    if (declaracaoMatriz || tipoMatriz) {
      const linhas = declaracaoMatriz?.linhas ?? tipoMatriz?.linhas;
      const colunas = declaracaoMatriz?.colunas ?? tipoMatriz?.colunas;
      const inicializacao = declaracaoMatriz?.valor ?? declaracao.expressão;

      if (inicializacao instanceof InicializacaoMatrizExpr) {
        return `${tipo} ${declaracao.nome}[][] = ${this.emitExpressao(inicializacao)};`;
      }

      const linhasStr = linhas ? this.emitExpressao(linhas) : "10";
      const colunasStr = colunas ? this.emitExpressao(colunas) : "10";

      return `${tipo} ${declaracao.nome}[${linhasStr}][${colunasStr}];`;
    }

    const inicializacao = declaracaoVariavel?.valor ?? declaracao.expressão;

    if (inicializacao) {
      return `${tipo} ${declaracao.nome} = ${this.emitExpressao(inicializacao)};`;
    }

    return `${tipo} ${declaracao.nome};`;
  }

  private emitParteFor(inicializacao: Expressao | Comando): string {
    if (inicializacao instanceof DeclaracaoCmd) {
      return this.emitDeclaracao(inicializacao).replace(/;$/u, "");
    }

    if (inicializacao instanceof AtribuicaoCmd) {
      return `${this.emitReferencia(inicializacao.variável)} = ${this.emitExpressao(inicializacao.expressão)}`;
    }

    return this.emitExpressao(inicializacao as Expressao);
  }

  private emitForCondicao(condicao: Expressao): string {
    let rendered = this.emitExpressao(condicao).trim();

    while (this.hasSingleOuterParentheses(rendered)) {
      rendered = rendered.slice(1, -1).trim();
    }

    return rendered;
  }

  private hasSingleOuterParentheses(text: string): boolean {
    if (!text.startsWith("(") || !text.endsWith(")")) {
      return false;
    }

    let depth = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char === "(") {
        depth++;
      } else if (char === ")") {
        depth--;

        if (depth < 0) {
          return false;
        }

        if (depth === 0 && i < text.length - 1) {
          return false;
        }
      }
    }

    return depth === 0;
  }

  private emitAtribuicaoComposta(
    comando:
      | AtribuicaoCompostaSomaCmd
      | AtribuicaoCompostaSubtracaoCmd
      | AtribuicaoCompostaMultiplicacaoCmd
      | AtribuicaoCompostaDivisaoCmd,
    operador: string,
  ): string {
    const esquerda = this.emitExpressao(comando.variável);
    const direita = this.emitExpressao(comando.expressão);

    return `${esquerda} ${operador}= ${direita};`;
  }

  private emitExpressao(expressao: Expressao): string {
    if (expressao instanceof InteiroExpr) {
      return String(expressao.valor);
    }

    if (expressao instanceof RealExpr) {
      return String(expressao.valor);
    }

    if (expressao instanceof LogicoExpr) {
      return expressao.valor ? "true" : "false";
    }

    if (expressao instanceof CadeiaExpr) {
      return `\"${this.escapeString(expressao.conteúdo)}\"`;
    }

    if (expressao instanceof CaractereExpr) {
      return `'${this.escapeChar(expressao.conteúdo)}'`;
    }

    if (expressao instanceof ReferenciaVarExpr || expressao instanceof ReferenciaArrayExpr || expressao instanceof ReferenciaMatrizExpr) {
      return this.emitReferencia(expressao);
    }

    if (expressao instanceof SomaExpr) {
      return this.emitBinaria(expressao, "+");
    }

    if (expressao instanceof SubtracaoExpr) {
      return this.emitBinaria(expressao, "-");
    }

    if (expressao instanceof MultiplicacaoExpr) {
      return this.emitBinaria(expressao, "*");
    }

    if (expressao instanceof DivisaoExpr) {
      return this.emitBinaria(expressao, "/");
    }

    if (expressao instanceof ModuloExpr) {
      return this.emitBinaria(expressao, "%");
    }

    if (expressao instanceof OperacaoIgualdadeExpr) {
      return this.emitBinaria(expressao, "==");
    }

    if (expressao instanceof OperacaoDiferencaExpr) {
      return this.emitBinaria(expressao, "!=");
    }

    if (expressao instanceof OperacaoMaiorQueExpr) {
      return this.emitBinaria(expressao, ">");
    }

    if (expressao instanceof OperacaoMaiorOuIgualQueExpr) {
      return this.emitBinaria(expressao, ">=");
    }

    if (expressao instanceof OperacaoMenorQueExpr) {
      return this.emitBinaria(expressao, "<");
    }

    if (expressao instanceof OperacaoMenorOuIgualQueExpr) {
      return this.emitBinaria(expressao, "<=");
    }

    if (expressao instanceof OperacaoAndLogicoExpr) {
      return this.emitBinaria(expressao, "&&");
    }

    if (expressao instanceof OperacaoOrLogicoExpr) {
      return this.emitBinaria(expressao, "||");
    }

    if (expressao instanceof OperacaoAndBitwiseExpr) {
      return this.emitBinaria(expressao, "&");
    }

    if (expressao instanceof OperacaoOrBitwiseExpr) {
      return this.emitBinaria(expressao, "|");
    }

    if (expressao instanceof OperacaoXorExpr) {
      return this.emitBinaria(expressao, "^");
    }

    if (expressao instanceof OperacaoShiftLeftExpr) {
      return this.emitBinaria(expressao, "<<");
    }

    if (expressao instanceof OperacaoShiftRightExpr) {
      return this.emitBinaria(expressao, ">>");
    }

    if (expressao instanceof NegacaoExpr) {
      return `(!${this.emitExpressao(expressao.expressão)})`;
    }

    if (expressao instanceof NegacaoBitwiseExpr) {
      return `(~${this.emitExpressao(expressao.expressão)})`;
    }

    if (expressao instanceof MaisUnarioExpr) {
      return `(+${this.emitExpressao(expressao.valor)})`;
    }

    if (expressao instanceof MenosUnarioExpr) {
      return `(-${this.emitExpressao(expressao.valor)})`;
    }

    if (expressao instanceof IncrementoUnarioPrefixadoExpr) {
      return `++${this.emitReferencia(expressao.variável)}`;
    }

    if (expressao instanceof IncrementoUnarioPosfixadoExpr) {
      return `${this.emitReferencia(expressao.variável)}++`;
    }

    if (expressao instanceof DecrementoUnarioPrefixadoExpr) {
      return `--${this.emitReferencia(expressao.variável)}`;
    }

    if (expressao instanceof DecrementoUnarioPosfixadoExpr) {
      return `${this.emitReferencia(expressao.variável)}--`;
    }

    if (expressao instanceof ExpressaoEntreParenteses) {
      const interno = expressao.children[0];

      if (interno instanceof Expressao) {
        return `(${this.emitExpressao(interno)})`;
      }
    }

    if (expressao instanceof InicializacaoVetorExpr) {
      const valores = expressao.valores.map(valor => this.emitExpressao(valor)).join(", ");

      return `{ ${valores} }`;
    }

    if (expressao instanceof InicializacaoMatrizExpr) {
      const linhas = expressao.linhas.map(linha => this.emitExpressao(linha)).join(", ");

      return `{ ${linhas} }`;
    }

    if (expressao instanceof ChamadaFuncaoExpr) {
      const argumentos = this.getCallArguments(expressao).map(argumento => this.emitExpressao(argumento)).join(", ");

      return `${this.emitNomeChamada(expressao)}(${argumentos})`;
    }

    return `/* TODO:${expressao.constructor.name} */`;
  }

  private emitBinaria(expressao: ExpressaoMatematica, operador: string): string {
    return `(${this.emitExpressao(expressao.esquerda)} ${operador} ${this.emitExpressao(expressao.direita)})`;
  }

  private emitReferencia(expressao: ReferenciaVarExpr | ReferenciaArrayExpr | ReferenciaMatrizExpr): string {
    if (expressao instanceof ReferenciaVarExpr) {
      return PortugolCArduino.resolveArduinoConstantName(expressao.nome) ?? expressao.nome;
    }

    if (expressao instanceof ReferenciaArrayExpr) {
      return `${expressao.variável.nome}[${this.emitExpressao(expressao.índice.índice)}]`;
    }

    return `${expressao.variável.nome}[${this.emitExpressao(expressao.linha.índice)}][${this.emitExpressao(expressao.coluna.índice)}]`;
  }

  private emitChamadaFuncaoComando(chamada: ChamadaFuncaoExpr) {
    if (!chamada.escopoBiblioteca && chamada.nome === "escreva") {
      const argumentosChamada = this.getCallArguments(chamada);

      if (argumentosChamada.length === 0) {
        this.push("Serial.println();");
        return;
      }

      for (const argumento of argumentosChamada) {
        this.push(`Serial.print(${this.emitExpressao(argumento)});`);
      }

      return;
    }

    if (!chamada.escopoBiblioteca && chamada.nome === "leia") {
      this.push("// TODO: leitura de Serial (leia) não implementada no transpiler básico");
      return;
    }

    const argumentos = this.getCallArguments(chamada).map(argumento => this.emitExpressao(argumento)).join(", ");

    this.push(`${this.emitNomeChamada(chamada)}(${argumentos});`);
  }

  private getCallArguments(chamada: ChamadaFuncaoExpr): Expressao[] {
    return chamada.argumentos.filter(argumento => argumento.constructor.name !== "EscopoBibliotecaExpr");
  }

  private emitNomeChamada(chamada: ChamadaFuncaoExpr): string {
    const arduinoName = PortugolCArduino.resolveArduinoFunctionName(chamada.nome);

    if (!chamada.escopoBiblioteca) {
      return arduinoName ?? chamada.nome;
    }

    const biblioteca = chamada.escopoBiblioteca;
    const bibliotecaLower = biblioteca.toLowerCase();

    if (bibliotecaLower === "arduino") {
      return arduinoName ?? chamada.nome;
    }

    if (bibliotecaLower === "matematica") {
      switch (chamada.nome) {
        case "potencia":
          return "pow";

        case "raiz":
          return "pow";

        case "seno":
          return "sin";

        case "cosseno":
          return "cos";

        case "tangente":
          return "tan";

        case "valor_absoluto":
          return "abs";

        default:
          return chamada.nome;
      }
    }

    return `${biblioteca}_${chamada.nome}`;
  }

  private static resolveArduinoFunctionName(nome: string): string | undefined {
    if (this.arduinoFunctions.has(nome)) {
      return nome;
    }

    return this.arduinoFunctionAliases[nome];
  }

  private static resolveArduinoConstantName(nome: string): string | undefined {
    return this.arduinoConstantAliases[nome];
  }

  private escapeString(value: string): string {
    return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", "\\n");
  }

  private escapeChar(value: string): string {
    return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
  }

  private push(line: string) {
    this.lines.push(`${"  ".repeat(this.indent)}${line}`);
  }
}
