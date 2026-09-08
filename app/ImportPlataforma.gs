/**
 * Importação da plataforma de compras (schema v8).
 *
 * Traz duas coisas que este sistema não tinha como produzir sozinho:
 * o cadastro de 312 fornecedores já enriquecido na Receita, e o histórico
 * de 738 compras realizadas em nove meses de operação.
 *
 * O que ela NÃO faz, e é decisão, não omissão:
 *
 *  • Não cria equalização. As compras entram em `Contratacoes`, tabela
 *    separada. Somadas a `Equalizacoes`, o número declarado ao comitê
 *    saltaria de 4 para centenas — e nenhuma delas foi equalizada aqui.
 *
 *  • Não importa a descrição da compra. É texto livre e carrega nome de
 *    funcionário e de motorista terceirizado, com placa de veículo junto.
 *    O `PROTOCOLO` fica gravado: quem precisar do texto o busca na
 *    plataforma, onde o controle de acesso é mais forte que o de uma
 *    planilha.
 *
 *  • Não usa o CSV agregado da plataforma. Ele soma tudo, inclusive conta
 *    de luz e taxa de bombeiro. O agregado é recalculado aqui, a partir do
 *    detalhe e só sobre natureza disputável — ver `cfRecalcularRelevancia_`.
 *
 * Idempotente pelas chaves naturais: CNPJ para fornecedor, PROTOCOLO para
 * contratação. Rodar duas vezes não duplica nada.
 */

/** Tudo que entra por aqui fica marcado, para dar para desfazer e auditar. */
const CF_ORIGEM_PLATAFORMA = 'import_plataforma';

// ─────────────────────────────────────────────────────────────
//  Leitura do CSV
// ─────────────────────────────────────────────────────────────

/**
 * Lê um CSV do Drive e devolve objetos com o cabeçalho como chave.
 *
 * Separador ponto-e-vírgula, que é o que a exportação da plataforma usa.
 * `Utilities.parseCsv` cuida de aspas e de quebra de linha DENTRO do campo
 * — e há campos assim no arquivo, porque a descrição da compra é digitada
 * em várias linhas.
 */
function cfCsvDoDrive_(idArquivo) {
  const texto = DriveApp.getFileById(idArquivo).getBlob().getDataAsString('UTF-8');
  const matriz = Utilities.parseCsv(texto, ';');
  if (!matriz || matriz.length < 2) return [];

  const cab = matriz[0].map(function (c) { return String(c || '').trim(); });
  return matriz.slice(1)
    .filter(function (l) { return l.join('').trim() !== ''; })
    .map(function (l) {
      const o = {};
      cab.forEach(function (campo, i) { o[campo] = l[i] === undefined ? '' : String(l[i]).trim(); });
      return o;
    });
}

/**
 * Data ISO para Date, sem passar pelo fuso.
 *
 * `new Date('2026-01-26')` é meia-noite UTC, que em São Paulo é 21h do dia
 * 25 — a compra andaria um dia para trás na planilha. Construir com os
 * três números constrói no fuso local, que é onde a data foi digitada.
 */
function cfDataIso_(texto) {
  const s = String(texto || '').trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return '';
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** 'TRUE'/'FALSE' do Postgres para booleano. Vazio continua vazio. */
function cfBoolTexto_(texto) {
  const s = String(texto || '').trim().toUpperCase();
  if (s === 'TRUE' || s === 'T' || s === '1' || s === 'SIM') return true;
  if (s === 'FALSE' || s === 'F' || s === '0' || s === 'NAO' || s === 'NÃO') return false;
  return '';
}

// ─────────────────────────────────────────────────────────────
//  1. As 16 naturezas orçamentárias
// ─────────────────────────────────────────────────────────────

function simularSemearNaturezas() { return cfSemearNaturezas_(false); }
function semearNaturezas() { return cfSemearNaturezas_(true); }

/**
 * Popula a aba `Naturezas` com as 16 da plataforma.
 *
 * Semente, não fonte da verdade: depois da primeira vez quem manda é a
 * planilha. Mudar `DISPUTAVEL` numa célula passa a valer sem publicar
 * código, que é o ponto de a regra morar em tabela.
 */
function cfSemearNaturezas_(aplicar) {
  const existentes = cfIndexarPor_('Naturezas', 'ID');
  const novas = CF_NATUREZAS_ORCAMENTARIAS.filter(function (n) { return !existentes[n.ID]; })
    .map(function (n) {
      return { ID: n.ID, NOME: n.NOME, DISPUTAVEL: n.DISPUTAVEL, ATIVA: true };
    });

  if (aplicar && novas.length) cfInserir_('Naturezas', novas);

  const r = {
    ok: true,
    aplicado: !!aplicar,
    jaExistiam: CF_NATUREZAS_ORCAMENTARIAS.length - novas.length,
    inseridas: novas.length,
    disputaveis: CF_NATUREZAS_ORCAMENTARIAS.filter(function (n) { return n.DISPUTAVEL; }).length
  };
  Logger.log(JSON.stringify(r));
  return r;
}

// ─────────────────────────────────────────────────────────────
//  2. Fornecedores
// ─────────────────────────────────────────────────────────────

function simularImportarFornecedores(idArquivo) { return cfImportarFornecedores_(idArquivo, false); }
function importarFornecedores(idArquivo) { return cfImportarFornecedores_(idArquivo, true); }

/**
 * Os campos que a plataforma mantém e este sistema apenas recebe.
 *
 * CONTATO_NOME, CONTATO_TEL e CONTATO_EMAIL estão de fora de propósito:
 * são tratados à parte, porque o contato digitado por quem cotou vale mais
 * que o cadastral da Receita — ver `cfCadastrarProponentes_`.
 */
const CF_CAMPOS_DA_PLATAFORMA = [
  'RAZAO_SOCIAL', 'NOME_FANTASIA', 'CIDADE', 'UF', 'SITUACAO_CNPJ',
  'CNAE_PRINCIPAL', 'CNAES_SECUNDARIOS', 'NATUREZA_JURIDICA', 'PORTE'
];

function cfImportarFornecedores_(idArquivo, aplicar) {
  const linhas = cfCsvDoDrive_(idArquivo);
  if (!linhas.length) return { ok: false, erro: 'CSV vazio ou ilegível.' };

  const existentes = {};
  cfLerTudo_('Fornecedores').forEach(function (f) {
    existentes[cfSoDigitos_(f.CNPJ)] = f;
  });

  const novos = [], atualizacoes = [];
  const recusados = [];
  let inalterados = 0, irregulares = 0;

  linhas.forEach(function (l) {
    const cnpj = cfSoDigitos_(l.CNPJ);
    // CNPJ de 14 dígitos é a única chave que este sistema tem. Linha sem
    // ele não vira fornecedor meio cadastrado: fica no relatório.
    if (cnpj.length !== 14) { recusados.push(l.RAZAO_SOCIAL + ' (CNPJ "' + l.CNPJ + '")'); return; }

    const sit = String(l.SITUACAO_CNPJ || '').trim().toUpperCase();
    if (sit && sit !== 'ATIVA') irregulares++;

    const dados = {};
    CF_CAMPOS_DA_PLATAFORMA.forEach(function (campo) {
      if (String(l[campo] || '').trim()) dados[campo] = l[campo];
    });
    if (String(l.CAPITAL_SOCIAL || '').trim()) dados.CAPITAL_SOCIAL = cfNumero_(l.CAPITAL_SOCIAL);
    if (cfDataIso_(l.DATA_INICIO_ATIVIDADE)) dados.DATA_INICIO_ATIVIDADE = cfDataIso_(l.DATA_INICIO_ATIVIDADE);
    if (cfDataIso_(l.DATA_SITUACAO_CADASTRAL)) dados.DATA_SITUACAO_CADASTRAL = cfDataIso_(l.DATA_SITUACAO_CADASTRAL);
    if (cfBoolTexto_(l.IS_MEI) !== '') dados.IS_MEI = cfBoolTexto_(l.IS_MEI);
    if (cfDataIso_(l.ATUALIZADO_EM)) dados.ATUALIZADO_EM = cfDataIso_(l.ATUALIZADO_EM);

    const atual = existentes[cnpj];

    if (!atual) {
      dados.CNPJ = cnpj;
      dados.ORIGEM = CF_ORIGEM_PLATAFORMA;
      // O telefone entra só no cadastro novo. Em quem já existe, o contato
      // veio de alguém que cotou de verdade, e isso não se sobrescreve com
      // dado cadastral.
      if (String(l.CONTATO_TEL || '').trim()) dados.CONTATO_TEL = l.CONTATO_TEL;
      if (String(l.CONTATO_EMAIL || '').trim()) dados.CONTATO_EMAIL = l.CONTATO_EMAIL;
      novos.push(dados);
      existentes[cnpj] = dados;
      return;
    }

    // Em quem já existe, só escreve o que mudou de verdade. Reescrever
    // célula igual custa uma chamada de API por campo e não muda nada.
    const mudar = {};
    Object.keys(dados).forEach(function (campo) {
      const antes = atual[campo];
      const depois = dados[campo];
      const iguais = (antes instanceof Date && depois instanceof Date)
        ? antes.getTime() === depois.getTime()
        : String(antes === undefined || antes === null ? '' : antes) === String(depois);
      if (!iguais) mudar[campo] = depois;
    });
    // Contato vazio no cadastro é o único caso em que o dado da plataforma
    // preenche: melhor um telefone cadastral que nenhum.
    if (!String(atual.CONTATO_TEL || '').trim() && String(l.CONTATO_TEL || '').trim()) {
      mudar.CONTATO_TEL = l.CONTATO_TEL;
    }
    if (!String(atual.CONTATO_EMAIL || '').trim() && String(l.CONTATO_EMAIL || '').trim()) {
      mudar.CONTATO_EMAIL = l.CONTATO_EMAIL;
    }

    if (Object.keys(mudar).length) atualizacoes.push({ linha: atual._linha, campos: mudar });
    else inalterados++;
  });

  if (aplicar) {
    if (novos.length) cfInserir_('Fornecedores', novos);
    atualizacoes.forEach(function (a) { cfAtualizarLinha_('Fornecedores', a.linha, a.campos); });
  }

  const r = {
    ok: true,
    aplicado: !!aplicar,
    lidos: linhas.length,
    novos: novos.length,
    atualizados: atualizacoes.length,
    inalterados: inalterados,
    recusados: recusados.length,
    exemplosRecusados: recusados.slice(0, 5),
    situacaoIrregular: irregulares
  };
  Logger.log(JSON.stringify(r));
  return r;
}

// ─────────────────────────────────────────────────────────────
//  3. Contratações
// ─────────────────────────────────────────────────────────────

function simularImportarContratacoes(idArquivo) { return cfImportarContratacoes_(idArquivo, false); }
function importarContratacoes(idArquivo) { return cfImportarContratacoes_(idArquivo, true); }

/**
 * O detalhe, uma linha por compra.
 *
 * `PROTOCOLO` é a chave: é o número que a plataforma dá a cada solicitação
 * e que não se repete. Reimportar o mesmo arquivo não duplica.
 *
 * `EMPREENDIMENTO` entra como texto. A plataforma atende imóveis que este
 * sistema ainda não cadastrou — Mega Canoas, por exemplo, e o rateio entre
 * Megas. Exigir cadastro aqui seria descartar histórico por causa de um
 * cadastro que vem depois.
 */
function cfImportarContratacoes_(idArquivo, aplicar) {
  const linhas = cfCsvDoDrive_(idArquivo);
  if (!linhas.length) return { ok: false, erro: 'CSV vazio ou ilegível.' };

  const jaTem = cfIndexarPor_('Contratacoes', 'PROTOCOLO');
  const fornecedores = {};
  cfLerTudo_('Fornecedores').forEach(function (f) { fornecedores[cfSoDigitos_(f.CNPJ)] = true; });

  const novas = [];
  const semFornecedor = {}, semNatureza = [];
  let repetidas = 0, disputaveis = 0, valorDisputavel = 0, valorTotal = 0;
  const porEmpreendimento = {};

  linhas.forEach(function (l) {
    const protocolo = String(l.PROTOCOLO || '').trim();
    if (!protocolo) return;
    if (jaTem[protocolo]) { repetidas++; return; }

    const cnpj = cfSoDigitos_(l.CNPJ);
    // Contratação de um CNPJ que não está no cadastro não é descartada: é
    // histórico real. Fica registrada e contada, para o relatório dizer
    // quantas ficaram órfãs em vez de sumir com elas.
    if (cnpj && !fornecedores[cnpj]) semFornecedor[cnpj] = true;

    const natureza = String(l.NATUREZA_ORCAMENTARIA || '').trim();
    if (!natureza) semNatureza.push(protocolo);
    const disputavel = cfNaturezaDisputavel_(natureza);

    const valor = cfNumero_(l.VALOR) || 0;
    valorTotal += valor;
    if (disputavel) { disputaveis++; valorDisputavel += valor; }

    const emp = String(l.EMPREENDIMENTO || '').trim() || '(sem empreendimento)';
    porEmpreendimento[emp] = (porEmpreendimento[emp] || 0) + 1;

    novas.push({
      ID: 'CTR-' + protocolo,
      CNPJ: cnpj,
      DATA: cfDataIso_(l.DATA),
      EMPREENDIMENTO: emp,
      NATUREZA_ORCAMENTARIA: natureza,
      DISPUTAVEL: disputavel,
      VALOR: valor,
      PROTOCOLO: protocolo,
      ORIGEM: CF_ORIGEM_PLATAFORMA,
      IMPORTADO_EM: new Date()
    });
    jaTem[protocolo] = true;
  });

  if (aplicar && novas.length) cfInserir_('Contratacoes', novas);

  const r = {
    ok: true,
    aplicado: !!aplicar,
    lidas: linhas.length,
    novas: novas.length,
    jaImportadas: repetidas,
    disputaveis: disputaveis,
    naoDisputaveis: novas.length - disputaveis,
    valorTotal: Math.round(valorTotal * 100) / 100,
    valorDisputavel: Math.round(valorDisputavel * 100) / 100,
    cnpjSemCadastro: Object.keys(semFornecedor).length,
    semNatureza: semNatureza.length,
    porEmpreendimento: porEmpreendimento
  };
  Logger.log(JSON.stringify(r));
  return r;
}

// ─────────────────────────────────────────────────────────────
//  4. Relevância do fornecedor
// ─────────────────────────────────────────────────────────────

function simularRecalcularRelevancia() { return cfRecalcularRelevancia_(false); }
function recalcularRelevancia() { return cfRecalcularRelevancia_(true); }

/**
 * Quantas vezes cada fornecedor foi contratado — só no que se disputa.
 *
 * Este é o filtro que faz o número servir para alguma coisa. Sem ele, o
 * topo do ranking é RGE, Celesc e Corsan: 34% do valor histórico é fatura
 * de concessionária, taxa e folha. Ninguém pede três cotações para a conta
 * de luz, e um autocomplete que sugere a distribuidora de energia quando o
 * comprador procura quem conserta uma cancela é pior que um alfabético.
 *
 * Não é nota. É relevância: com que frequência a companhia contrata esta
 * empresa, e quando foi a última vez.
 */
function cfRecalcularRelevancia_(aplicar) {
  const soma = {};
  cfLerTudo_('Contratacoes').forEach(function (c) {
    if (c.DISPUTAVEL !== true) return;
    const cnpj = cfSoDigitos_(c.CNPJ);
    if (!cnpj) return;
    const g = soma[cnpj] || (soma[cnpj] = { q: 0, v: 0, ultima: null });
    g.q++;
    g.v += cfNumero_(c.VALOR) || 0;
    const d = c.DATA instanceof Date ? c.DATA : cfDataIso_(c.DATA);
    if (d && (!g.ultima || d.getTime() > g.ultima.getTime())) g.ultima = d;
  });

  const atualizacoes = [];
  cfLerTudo_('Fornecedores').forEach(function (f) {
    const cnpj = cfSoDigitos_(f.CNPJ);
    const g = soma[cnpj];
    // Fornecedor sem contratação disputável fica com zero explícito, e não
    // vazio: zero aqui é informação — "concorreu e não levou" é o caso de
    // 44% da base, e a tela precisa poder dizer isso.
    const quer = {
      CONTRATACOES_HISTORICO: g ? g.q : 0,
      ULTIMA_CONTRATACAO: g && g.ultima ? g.ultima : '',
      VALOR_TOTAL_HISTORICO: g ? Math.round(g.v * 100) / 100 : 0
    };
    const mudar = {};
    Object.keys(quer).forEach(function (campo) {
      const antes = f[campo];
      const depois = quer[campo];
      const iguais = (antes instanceof Date && depois instanceof Date)
        ? antes.getTime() === depois.getTime()
        : String(antes === undefined || antes === null ? '' : antes) === String(depois);
      if (!iguais) mudar[campo] = depois;
    });
    if (Object.keys(mudar).length) atualizacoes.push({ linha: f._linha, campos: mudar });
  });

  if (aplicar) {
    atualizacoes.forEach(function (a) { cfAtualizarLinha_('Fornecedores', a.linha, a.campos); });
  }

  const comHistorico = Object.keys(soma).length;
  const r = {
    ok: true,
    aplicado: !!aplicar,
    fornecedoresComContratacao: comHistorico,
    linhasAtualizadas: atualizacoes.length,
    topo: Object.keys(soma)
      .sort(function (a, b) { return soma[b].q - soma[a].q; })
      .slice(0, 5)
      .map(function (c) { return c + ': ' + soma[c].q + 'x'; })
  };
  Logger.log(JSON.stringify(r));
  return r;
}

// ─────────────────────────────────────────────────────────────
//  5. O roteiro inteiro
// ─────────────────────────────────────────────────────────────

/**
 * Simula tudo, sem escrever nada. Rode esta primeiro.
 *
 * @param {string} idFornecedores ID do CSV de fornecedores no Drive
 * @param {string} idContratacoes ID do CSV de detalhe de contratações
 */
function simularImportacaoDaPlataforma(idFornecedores, idContratacoes) {
  return {
    naturezas: cfSemearNaturezas_(false),
    fornecedores: cfImportarFornecedores_(idFornecedores, false),
    contratacoes: cfImportarContratacoes_(idContratacoes, false)
  };
}

/**
 * Executa na ordem que as dependências pedem: naturezas antes das
 * contratações, porque é delas que sai DISPUTAVEL; contratações antes da
 * relevância, porque é delas que sai a contagem.
 */
function importarDaPlataforma(idFornecedores, idContratacoes) {
  const naturezas = cfSemearNaturezas_(true);
  const fornecedores = cfImportarFornecedores_(idFornecedores, true);
  const contratacoes = cfImportarContratacoes_(idContratacoes, true);
  const relevancia = cfRecalcularRelevancia_(true);

  cfLog_('importacao_plataforma', 'Contratacoes', '',
    contratacoes.novas + ' contratações, ' + fornecedores.novos + ' fornecedores novos');

  return {
    naturezas: naturezas,
    fornecedores: fornecedores,
    contratacoes: contratacoes,
    relevancia: relevancia
  };
}
