const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const context = vm.createContext({
  Logger: { log: console.log },
  console: console
});

function loadFiles(files) {
  files.forEach(f => {
    const code = fs.readFileSync(path.join(root, 'app', f), 'utf8');
    vm.runInContext(code, context, { filename: f });
  });
}

loadFiles(['Util.gs', 'Config.gs', 'Schema.gs', 'Persistencia.gs', 'ImportOrcamento.gs', 'Consulta.gs']);

console.log('Validando correções contra os defeitos originais...\n');

// ─────────────────────────────────────────────────────────────
//  Correções 1 a 6 — os seis defeitos do diagnóstico inicial
//
//  Estas seis já foram "verificadas" antes por busca de texto no
//  código-fonte (code.includes('propostasAvulsas')), o que passa com a
//  função quebrada desde que o identificador exista — e, pior, imprimiam
//  FALHA sem lançar: a suíte saía com exit 0 mesmo reprovando.
//  Agora cada uma exercita o comportamento e quebra o teste se voltar.
// ─────────────────────────────────────────────────────────────

const crypto = require('node:crypto');

// cfHash_ e cfNovoId_ dependem de Utilities. Sem isso, os testes de
// impressão digital não rodam.
context.Utilities = {
  DigestAlgorithm: { SHA_256: 'SHA_256' },
  computeDigest: function (_alg, texto) {
    return Array.from(crypto.createHash('sha256').update(String(texto)).digest())
      .map(function (b) { return b > 127 ? b - 256 : b; });   // Apps Script devolve bytes com sinal
  },
  formatDate: function () { return '20260906'; },
  getUuid: function () { return 'abcd-efgh'; }
};

// ── 1. Desfazer importação alcança a proposta avulsa
//
//  Orçamento em PDF entra sem equalização. O rollback percorria só as
//  equalizações da importação, então o avulso ficava para trás e a base
//  guardava preço de um documento que o usuário mandou apagar.
{
  const apagou = [];
  context.cfLerTudo_ = function (t) {
    if (t === 'Propostas') return [{ ID: 'PRP-1', ID_IMPORTACAO: 'IMP-1', ID_EQUALIZACAO: '' }];
    return [];                                    // nenhuma equalização nesta importação
  };
  context.cfApagarPor_ = function (tabela, campo, valor) {
    apagou.push(tabela + ':' + campo + '=' + valor);
    return 1;
  };
  context.cfLog_ = function () {};

  const apagados = context.cfDesfazerImportacao_('IMP-1', false);

  assert.ok(apagou.indexOf('Propostas:ID=PRP-1') >= 0,
    'a proposta avulsa da importação não foi apagada');
  assert.ok(apagou.indexOf('Precos:ID_PROPOSTA=PRP-1') >= 0,
    'os preços da proposta avulsa continuaram na base');
  assert.equal(apagados.Propostas, 1);
  console.log('✓ CORREÇÃO VERIFICADA: desfazer importação alcança a proposta avulsa');
}

// ── 2. Texto de empresa vira CNPJ
//
//  A planilha traz "Demercado" escrito à mão, em grafias que variam. O
//  hash e o vínculo precisam do CNPJ, não da grafia do dia.
{
  context.cfLerTudo_ = function (t) {
    if (t === 'Empresas') return [{
      CNPJ: '08601964000105',
      GRAFIAS_ALTERNATIVAS: 'Demercado|Demercado Ltda',
      RAZAO_SOCIAL: 'DEMERCADO COMERCIO S.A.'
    }];
    return [];
  };
  assert.equal(context.cfResolverEmpresa_('Demercado'), '08601964000105');
  assert.equal(context.cfResolverEmpresa_('DEMERCADO COMERCIO S.A.'), '08601964000105',
    'a razão social cadastrada tem que resolver igual à grafia curta');
  assert.equal(context.cfResolverEmpresa_('Empresa Que Não Existe'), '',
    'texto desconhecido não pode resolver para um CNPJ qualquer');
  console.log('✓ CORREÇÃO VERIFICADA: texto de empresa resolve para o CNPJ cadastrado');
}

// ── 3. A impressão digital do arquivo olha o conteúdo que importa
//
//  Duas grafias da mesma empresa não podem gerar duas importações. E
//  mudar a unidade de embalagem tem que gerar, porque muda o preço.
{
  context.cfLerTudo_ = function (t) {
    if (t === 'Empresas') return [{ CNPJ: '08601964000105', GRAFIAS_ALTERNATIVAS: 'Demercado' }];
    if (t === 'Empreendimentos') return [{ ID: 'MEGA-CWB', NOME: 'MEGA CENTRO LOGÍSTICO CURITIBA', APELIDOS: 'Mega Curitiba' }];
    return [];
  };
  const analise = function (empresa, unidade, valor) {
    return { equalizacoes: [{
      aba: 'Mapa_Demercado_Consumo',
      cabecalho: { empresa: empresa, empreendimento: 'Mega Curitiba', projeto: 'Consumo' },
      proponentes: [{ cnpjLimpo: '11111111000111', razaoSocial: 'ALFA',
                      condicoesPagamento: '30 dias', prazoExecucao: '' }],
      eap: [{ codigoOriginal: '1', descricao: 'Café em pó', unidade: unidade,
              precos: [{ valor: valor, status: 'cotado' }] }]
    }] };
  };
  const base = context.cfImpressaoDoArquivo_(analise('Demercado', 'CX 500g', 100));

  assert.equal(context.cfImpressaoDoArquivo_(analise('Demercado Ltda', 'CX 500g', 100)), base,
    'a mesma empresa escrita de outro jeito gerou impressão digital diferente');
  assert.notEqual(context.cfImpressaoDoArquivo_(analise('Demercado', 'PCT 250g', 100)), base,
    'trocar a unidade de embalagem não mudou a impressão digital');
  assert.notEqual(context.cfImpressaoDoArquivo_(analise('Demercado', 'CX 500g', 120)), base,
    'trocar o preço não mudou a impressão digital');
  console.log('✓ CORREÇÃO VERIFICADA: impressão digital normaliza a empresa e inclui unidade e preço');
}

// ── 4. Preço global é preço cotado
//
//  Muito orçamento traz só o total da linha, sem unitário. Isso é uma
//  cotação — marcá-la como "não cotado" tirava o fornecedor da
//  comparação e falseava o menor preço.
{
  const gravado = { Precos: [], EAP: [], Propostas: [], Fornecedores: [], Pendencias: [] };
  context.cfIndexarPor_ = function () { return {}; };
  context.cfInserir_ = function (tabela, linhas) {
    (gravado[tabela] = gravado[tabela] || []).push.apply(gravado[tabela], linhas);
  };
  context.cfLerTudo_ = function () { return []; };

  context.cfGravarOrcamento_({
    fornecedor: { cnpj: '11.111.111/0001-11', razaoSocial: 'ALFA', uf: 'PR' },
    numero: '123', data: '2026-04-28', empreendimento: 'Mega Curitiba',
    itens: [
      { descricao: 'Serviço fechado', quantidade: 1, precoUnitario: '', valorTotal: '2.200,00' },
      { descricao: 'Item sem preço',  quantidade: 5, precoUnitario: '', valorTotal: '' }
    ]
  }, 'IMP-1');

  const comTotal = gravado.Precos[0], semNada = gravado.Precos[1];
  assert.equal(comTotal.STATUS_PRECO, 'cotado',
    'total da linha sem unitário tem que contar como cotado');
  assert.equal(comTotal.VALOR_TOTAL, 2200);
  assert.equal(semNada.STATUS_PRECO, 'nao_cotado',
    'linha sem unitário e sem total continua não cotada');
  console.log('✓ CORREÇÃO VERIFICADA: preço só com total da linha conta como cotado');
}

// ── 5. Avulsos não se misturam
//
//  A chave de agrupamento usava a equalização. Como o avulso não tem
//  equalização, dois orçamentos de fornecedores diferentes caíam no
//  mesmo grupo e apareciam como se disputassem a mesma cotação.
{
  const agrupar = vm.runInContext('cfAgruparPorItem_', context);
  const linha = function (idProposta, cnpj, valor) {
    return { chave: 'cafe', descricao: 'Café em pó', codigo: '', data: new Date(2026, 3, 28),
             empreendimento: 'Mega Curitiba', projeto: '', area: '',
             idEqualizacao: '', idProposta: idProposta, cnpj: cnpj,
             valor: valor, status: 'cotado' };
  };
  const r = agrupar([linha('PRP-1', '111', 100), linha('PRP-2', '222', 130)], 'café');

  assert.equal(r.grupos.length, 2,
    'dois orçamentos avulsos diferentes foram agrupados como se fossem a mesma cotação');
  console.log('✓ CORREÇÃO VERIFICADA: orçamentos avulsos não são agrupados entre si');
}

// ── 6. Empreendimento gravado em forma canônica
//
//  "Mega Curitiba", "MEGA CENTRO LOGÍSTICO CURITIBA" e "Curitiba" são o
//  mesmo lugar. Gravar o texto cru fragmenta o histórico de preço em
//  três, e a comparação ao longo do tempo deixa de existir.
{
  context.cfLerTudo_ = function (t) {
    if (t === 'Empreendimentos') return [{
      ID: 'MEGA-CWB', NOME: 'MEGA CENTRO LOGÍSTICO CURITIBA', APELIDOS: 'Mega Curitiba|Curitiba'
    }];
    return [];
  };
  assert.equal(context.cfResolverEmpreendimento_('Mega Curitiba'), 'MEGA-CWB');
  assert.equal(context.cfResolverEmpreendimento_('MEGA CENTRO LOGÍSTICO CURITIBA'), 'MEGA-CWB');
  assert.equal(context.cfResolverEmpreendimento_('Lugar Novo'), 'Lugar Novo',
    'sem cadastro correspondente, o texto original é preservado');

  // E o caminho de gravação usa isso — nos dois lados, planilha e PDF.
  const gravado = { Precos: [], EAP: [], Propostas: [], Fornecedores: [] };
  context.cfIndexarPor_ = function () { return {}; };
  context.cfInserir_ = function (tabela, linhas) {
    (gravado[tabela] = gravado[tabela] || []).push.apply(gravado[tabela], linhas);
  };
  context.cfGravarOrcamento_({
    fornecedor: { cnpj: '11.111.111/0001-11', razaoSocial: 'ALFA', uf: 'PR' },
    numero: '123', data: '2026-04-28', empreendimento: 'Mega Curitiba',
    itens: [{ descricao: 'Café', quantidade: 1, precoUnitario: '10', valorTotal: '10' }]
  }, 'IMP-1');
  assert.equal(gravado.Precos[0].ID_EMPREENDIMENTO, 'MEGA-CWB',
    'a importação de orçamento avulso gravou o empreendimento em texto cru');
  console.log('✓ CORREÇÃO VERIFICADA: empreendimento é gravado em forma canônica');
}

// ─────────────────────────────────────────────────────────────
//  Correção 7 — linhas fantasma de checkbox
//
//  cfFormatarAba_ aplica validação de checkbox na aba inteira, e o Sheets
//  passa a devolver FALSE em toda linha em branco. Antes da correção,
//  cfLerTudo_ aceitava essas linhas como registro: uma base recém-criada
//  reportava ~1000 fornecedores e ~1000 pendências em aberto.
//
//  Contexto isolado de propósito: os testes acima substituem cfLerTudo_
//  por um dublê, e aqui a função real é justamente o que está sob teste.
// ─────────────────────────────────────────────────────────────
try {
  const ctxDados = vm.createContext({ Logger: { log: () => {} }, console: console });

  const CABECALHO = ['CNPJ', 'RAZAO_SOCIAL', 'APELIDO', 'GRAFIAS_ALTERNATIVAS', 'ATIVA'];
  const REAIS = [
    ['00000000000191', 'Demercado S.A.', 'Demercado', '', true],
    ['11222333000181', 'Capital Realty', 'Capital', '', false]
  ];
  const FANTASMAS = Array.from({ length: 997 }, () => ['', '', '', '', false]);
  const GRADE = [CABECALHO].concat(REAIS, FANTASMAS);

  const abaFalsa = {
    getLastRow: () => GRADE.length,
    getLastColumn: () => CABECALHO.length,
    getRange: (linha, coluna, nLinhas, nColunas) => ({
      getValues: () => GRADE.slice(linha - 1, linha - 1 + nLinhas)
        .map(l => l.slice(coluna - 1, coluna - 1 + nColunas))
    })
  };

  ctxDados.cfPlanilha_ = () => ({ getSheetByName: () => abaFalsa });
  vm.runInContext(fs.readFileSync(path.join(root, 'app', 'Dados.gs'), 'utf8'),
                  ctxDados, { filename: 'Dados.gs' });

  const lidas = ctxDados.cfLerTudo_('Empresas');

  assert.equal(lidas.length, 2,
    `esperava 2 registros reais, veio ${lidas.length} (as 997 linhas de checkbox vazio voltaram como registro)`);
  assert.equal(lidas[0].CNPJ, '00000000000191');

  // A segunda linha tem ATIVA=false e precisa sobreviver: ela é real porque
  // tem CNPJ. O filtro descarta a linha só quando NADA além de false existe.
  assert.equal(lidas[1].ATIVA, false, 'registro real com checkbox desmarcado foi descartado junto');

  console.log('✓ CORREÇÃO VERIFICADA: linhas de checkbox vazio não viram registro fantasma');
} catch (e) {
  console.log(`✗ FALHA na Correção 7: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 8 — inserção não pode cair embaixo das fantasmas
//
//  cfInserir_ gravava em getLastRow() + 1. Numa aba com mil linhas de
//  checkbox vazio isso significa gravar na linha 1001: foi assim que os
//  dados reais da base foram parar embaixo de mil linhas em branco.
// ─────────────────────────────────────────────────────────────
try {
  const ctxIns = vm.createContext({ Logger: { log: () => {} }, console: console });

  const CABECALHO = ['ID', 'DESCRICAO', 'ATIVA'];
  const GRADE = [CABECALHO,
    ['EQ-1', 'primeira', true],
    ['EQ-2', 'segunda', false]
  ].concat(Array.from({ length: 997 }, () => ['', '', false]));

  let escrita = null;
  const abaFalsa = {
    getLastRow: () => GRADE.length,          // 1000 — inflado pelas fantasmas
    getLastColumn: () => CABECALHO.length,
    getRange: (linha, coluna, nLinhas, nColunas) => ({
      getValues: () => GRADE.slice(linha - 1, linha - 1 + nLinhas)
        .map(l => l.slice(coluna - 1, coluna - 1 + nColunas)),
      setValues: (m) => { escrita = { linha, coluna, matriz: m }; }
    })
  };

  ctxIns.cfPlanilha_ = () => ({ getSheetByName: () => abaFalsa });
  vm.runInContext(fs.readFileSync(path.join(root, 'app', 'Dados.gs'), 'utf8'),
                  ctxIns, { filename: 'Dados.gs' });

  assert.equal(ctxIns.cfUltimaLinhaReal_('Equalizacoes'), 3,
    'cfUltimaLinhaReal_ devia parar na última linha com registro, não no fim das fantasmas');

  const n = ctxIns.cfInserir_('Equalizacoes', [{ ID: 'EQ-3', DESCRICAO: 'terceira' }]);

  assert.equal(n, 1);
  assert.equal(escrita.linha, 4,
    `gravou na linha ${escrita.linha} em vez da 4 — a inserção ainda usa getLastRow()`);
  assert.equal(escrita.matriz[0][0], 'EQ-3');

  console.log('✓ CORREÇÃO VERIFICADA: inserção grava logo após o último registro real');
} catch (e) {
  console.log(`✗ FALHA na Correção 8: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 9 — a faxina não pode apagar antes de escrever
//
//  A primeira versão fazia clearContent() e depois setValues(). Quando a
//  validação da coluna ORIGEM rejeitou a escrita, a aba Propostas já tinha
//  sido limpa: 11 registros perdidos. A ordem inversa é o que garante que
//  uma falha na escrita não destrua nada.
// ─────────────────────────────────────────────────────────────
try {
  const ctxMan = vm.createContext({ Logger: { log: () => {} }, console: console });

  const CABECALHO = ['ID', 'ORIGEM', 'VENCEDORA'];
  const GRADE = [CABECALHO,
    ['PROP-1', 'app', true],
    ['PROP-2', '', false]           // ORIGEM vazia: era o que a validação barrava
  ].concat(Array.from({ length: 5 }, () => ['', '', false]));

  const ops = [];
  const abaFalsa = {
    getLastRow: () => GRADE.length,
    getLastColumn: () => CABECALHO.length,
    getMaxRows: () => GRADE.length,
    getRange: (linha, coluna, nLinhas, nColunas) => ({
      getValues: () => GRADE.slice(linha - 1, linha - 1 + nLinhas)
        .map(l => l.slice(coluna - 1, coluna - 1 + nColunas)),
      setValues: (m) => ops.push({ op: 'setValues', linha, n: m.length }),
      clearContent: () => ops.push({ op: 'clearContent', linha, n: nLinhas })
    })
  };

  ctxMan.cfPlanilha_ = () => ({
    getSheetByName: (n) => (n === 'Propostas' ? abaFalsa : null)
  });

  ['Util.gs', 'Config.gs', 'Dados.gs', 'Manutencao.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxMan, { filename: f });
  });

  const r = ctxMan.cfLimpezaFantasma_(true);

  assert.equal(r.abas.length, 1);
  assert.equal(r.abas[0].reais, 2, 'as duas linhas com ID deviam contar como registro');
  assert.equal(r.abas[0].fantasmas, 5);

  assert.equal(ops.length, 2, `esperava setValues + clearContent, veio ${JSON.stringify(ops)}`);
  assert.equal(ops[0].op, 'setValues',
    'clearContent veio primeiro — uma falha na escrita apagaria a aba, que foi o defeito original');
  assert.equal(ops[1].op, 'clearContent');
  assert.equal(ops[1].linha, 4, 'a limpeza deve começar depois do último registro reescrito');

  console.log('✓ CORREÇÃO VERIFICADA: faxina escreve antes de apagar');
} catch (e) {
  console.log(`✗ FALHA na Correção 9: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 10 — formato segue o nome da coluna, não o índice
//
//  RAZAO_SOCIAL_INFORMADA foi declarada na posição 5, mas cfGarantirAba_
//  acrescenta coluna nova no fim da aba — ela ficou na 25. cfFormatarAba_
//  usava o índice da declaração, então da coluna 5 em diante todo formato
//  caiu uma casa adiante: checkbox em VALOR_FATURAMENTO_DIRETO, formato de
//  data em VALOR_TOTAL_DECLARADO. O total passou a voltar como Date.
// ─────────────────────────────────────────────────────────────
try {
  const ctxFmt = vm.createContext({ Logger: { log: () => {} }, console: console });

  const aplicados = { formato: {}, checkbox: [], largura: {} };
  const validacaoFalsa = {
    requireCheckbox: () => ({ build: () => ({ tipo: 'checkbox' }) }),
    requireValueInList: () => ({
      setAllowInvalid: () => ({ setHelpText: () => ({ build: () => ({ tipo: 'lista' }) }) })
    })
  };
  ctxFmt.SpreadsheetApp = { newDataValidation: () => validacaoFalsa };

  // O cabeçalho REAL está fora da ordem declarada: B foi para o fim.
  const CABECALHO_REAL = ['A', 'C', 'B'];

  const abaFalsa = {
    getMaxRows: () => 10,
    getLastColumn: () => CABECALHO_REAL.length,
    setFrozenRows: () => {}, setRowHeight: () => {},
    setColumnWidth: (c, w) => { aplicados.largura[c] = w; },
    getRange: (linha, coluna) => ({
      getValues: () => [CABECALHO_REAL],
      setFontWeight: function () { return this; }, setBackground: function () { return this; },
      setFontColor: function () { return this; }, setVerticalAlignment: function () { return this; },
      setWrap: function () { return this; },
      getCell: () => ({ setNote: () => {} }),
      setNumberFormat: (f) => { aplicados.formato[coluna] = f; },
      // v vem null nas colunas sem validação — é assim que a herdada é limpa.
      setDataValidation: (v) => { if (v && v.tipo === 'checkbox') aplicados.checkbox.push(coluna); }
    })
  };

  ['Util.gs', 'Config.gs', 'Schema.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxFmt, { filename: f });
  });

  ctxFmt.cfFormatarAba_(abaFalsa, {
    nome: 'T',
    colunas: [
      { campo: 'A', tipo: 'texto',    largura: 100 },
      { campo: 'B', tipo: 'booleano', largura: 200 },   // declarada em 2, está em 3
      { campo: 'C', tipo: 'data',     largura: 300 }    // declarada em 3, está em 2
    ]
  });

  assert.deepEqual(aplicados.checkbox, [3],
    `checkbox foi para a coluna ${aplicados.checkbox} — devia seguir o nome "B", que está na 3`);
  assert.ok(aplicados.formato[2], 'a coluna 2 ("C", tipo data) ficou sem formato');
  assert.equal(aplicados.largura[2], 300, 'largura de "C" foi para a coluna errada');
  assert.equal(aplicados.largura[3], 200, 'largura de "B" foi para a coluna errada');

  // Guarda direta contra a reincidência: a declaração precisa refletir a aba.
  // CF_SCHEMA é `const`: vira binding léxico, não propriedade do global do vm.
  const props = vm.runInContext('CF_SCHEMA', ctxFmt)
    .find(d => d.nome === 'Propostas').colunas.map(c => c.campo);
  assert.ok(props.indexOf('RAZAO_SOCIAL_INFORMADA') > props.indexOf('ID_IMPORTACAO'),
    'RAZAO_SOCIAL_INFORMADA voltou para o meio da declaração — coluna nova vai no fim');

  console.log('✓ CORREÇÃO VERIFICADA: formato de coluna segue o nome, não a ordem declarada');
} catch (e) {
  console.log(`✗ FALHA na Correção 10: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 11 — validação herdada precisa ser limpa
//
//  cfFormatarAba_ aplicava validação mas nunca removia. Uma coluna que
//  recebeu checkbox por engano (VALOR_FATURAMENTO_DIRETO, enquanto durou o
//  desalinhamento) seguia devolvendo false mesmo depois de reaplicado o
//  formato de moeda — setNumberFormat não desfaz validação.
// ─────────────────────────────────────────────────────────────
try {
  const ctxVal = vm.createContext({ Logger: { log: () => {} }, console: console });

  const validacoes = {};
  ctxVal.SpreadsheetApp = {
    newDataValidation: () => ({
      requireCheckbox: () => ({ build: () => ({ tipo: 'checkbox' }) }),
      requireValueInList: () => ({
        setAllowInvalid: () => ({ setHelpText: () => ({ build: () => ({ tipo: 'lista' }) }) })
      })
    })
  };

  const CABECALHO_REAL = ['TEXTO', 'MOEDA', 'FLAG', 'TIPO'];
  const abaFalsa = {
    getMaxRows: () => 10,
    getLastColumn: () => CABECALHO_REAL.length,
    setFrozenRows: () => {}, setRowHeight: () => {}, setColumnWidth: () => {},
    getRange: (linha, coluna) => ({
      getValues: () => [CABECALHO_REAL],
      setFontWeight: function () { return this; }, setBackground: function () { return this; },
      setFontColor: function () { return this; }, setVerticalAlignment: function () { return this; },
      setWrap: function () { return this; },
      getCell: () => ({ setNote: () => {} }),
      setNumberFormat: () => {},
      setDataValidation: (v) => { validacoes[coluna] = v; }
    })
  };

  ['Util.gs', 'Config.gs', 'Schema.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxVal, { filename: f });
  });

  ctxVal.cfFormatarAba_(abaFalsa, {
    nome: 'T',
    colunas: [
      { campo: 'TEXTO', tipo: 'texto' },
      { campo: 'MOEDA', tipo: 'moeda' },
      { campo: 'FLAG',  tipo: 'booleano' },
      { campo: 'TIPO',  tipo: 'enum:tipoNo' }
    ]
  });

  assert.equal(validacoes[1], null, 'coluna de texto ficou com validação herdada');
  assert.equal(validacoes[2], null,
    'coluna de moeda ficou com validação herdada — é o caso de VALOR_FATURAMENTO_DIRETO');
  assert.equal((validacoes[3] || {}).tipo, 'checkbox', 'coluna booleana perdeu o checkbox');
  assert.equal((validacoes[4] || {}).tipo, 'lista', 'coluna enum perdeu a lista');

  console.log('✓ CORREÇÃO VERIFICADA: coluna sem tipo de validação tem a herdada limpa');
} catch (e) {
  console.log(`✗ FALHA na Correção 11: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 12 — o menor da linha só sai de quem cotou
//
//  No mapa de equalização, "não cotou" é gravado como preço com
//  STATUS_PRECO != cotado. Se o menor fosse escolhido pelo valor bruto,
//  um zero de quem não cotou ganharia de quem cotou de verdade — e o
//  comparativo apontaria o fornecedor errado como mais barato.
// ─────────────────────────────────────────────────────────────
try {
  const ctxEq = vm.createContext({ Logger: { log: () => {} }, console: console });

  const tabelas = {
    Equalizacoes: [{ ID: 'EQ1', ID_EMPREENDIMENTO: 'MEGA ESTEIO', PROJETO: 'Limpeza',
                     AREA: 'Facilities', DATA_EQUALIZACAO: new Date(2026, 5, 1),
                     STATUS: 'homologada', ID_IMPORTACAO: 'IMP1' }],
    Propostas: [
      { ID: 'P1', ID_EQUALIZACAO: 'EQ1', CNPJ: '11222333000181', ORDEM: 1, VALOR_TOTAL_DECLARADO: 100 },
      { ID: 'P2', ID_EQUALIZACAO: 'EQ1', CNPJ: '',               ORDEM: 2,
        RAZAO_SOCIAL_INFORMADA: 'Sem cadastro Ltda', VALOR_TOTAL_DECLARADO: 90 }
    ],
    Fornecedores: [{ CNPJ: '11222333000181', RAZAO_SOCIAL: 'Fornecedor Um' }],
    EAP: [
      { ID: 'N1', ID_EQUALIZACAO: 'EQ1', ID_PAI: '',   ORDEM: 1, TIPO: 'grupo', DESCRICAO: 'MATERIAIS' },
      { ID: 'N2', ID_EQUALIZACAO: 'EQ1', ID_PAI: 'N1', ORDEM: 2, TIPO: 'item',  DESCRICAO: 'Detergente' }
    ],
    Precos: [
      { ID_EAP: 'N2', ID_PROPOSTA: 'P1', ID_EQUALIZACAO: 'EQ1', PRECO_UNITARIO: 50, STATUS_PRECO: 'cotado' },
      // Zero, mas não cotado: não pode vencer a linha.
      { ID_EAP: 'N2', ID_PROPOSTA: 'P2', ID_EQUALIZACAO: 'EQ1', PRECO_UNITARIO: 0,  STATUS_PRECO: 'nao_cotado' }
    ],
    Pendencias: [{ ID_IMPORTACAO: 'IMP1', TIPO: 'cesta_incompleta',
                   DESCRICAO: 'Proponente 2: 1 de 1 itens sem cotação', RESOLVIDA: false }]
  };

  ctxEq.cfLerTudo_ = (nome) => tabelas[nome] || [];
  ctxEq.cfDataTexto_ = (d) => (d ? '01/06/2026' : null);

  ['Util.gs', 'Config.gs', 'Equalizacao.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxEq, { filename: f });
  });

  const m = ctxEq.cfMapaEqualizacao_('EQ1');

  const linhaItem = m.linhas.filter(l => l.tipo === 'item')[0];
  assert.equal(linhaItem.menor, 'P1',
    `menor da linha veio ${linhaItem.menor} — o zero de quem não cotou venceu quem cotou`);

  assert.equal(m.linhas.length, 2, 'a árvore devia trazer o grupo e o item');
  assert.equal(m.linhas[0].nivel, 0, 'o grupo é raiz');
  assert.equal(m.linhas[1].nivel, 1, 'o item é filho do grupo');

  assert.equal(m.proponentes[0].nome, 'Fornecedor Um', 'o nome do cadastro devia prevalecer');
  assert.equal(m.proponentes[1].nome, 'Sem cadastro Ltda',
    'sem CNPJ no cadastro, o nome informado no documento precisa sobreviver');

  assert.equal(m.pendencias.length, 1, 'as pendências da importação precisam chegar ao mapa');

  console.log('✓ CORREÇÃO VERIFICADA: menor do mapa sai só de quem cotou');
} catch (e) {
  console.log(`✗ FALHA na Correção 12: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 13 — o mesmo produto escrito de dois jeitos é uma série só
//
//  "CAFE MELITA TRADICIONAL 500G" e "CAFE MELITTA TRADICIONAL 500 GR" são
//  o mesmo café. Com cfNormalizar_ puro a série ficava partida em duas,
//  cada uma contando meia história de preço.
// ─────────────────────────────────────────────────────────────
try {
  const ctxCh = vm.createContext({ Logger: { log: () => {} }, console: console });
  vm.runInContext(fs.readFileSync(path.join(root, 'app', 'Util.gs'), 'utf8'), ctxCh, { filename: 'Util.gs' });
  const chave = ctxCh.cfChaveItem_;

  assert.equal(chave('CAFE MELITA TRADICIONAL 500G'),
               chave('CAFE MELITTA TRADICIONAL 500 GR'),
               'as duas grafias do café deviam cair na mesma chave');

  assert.equal(chave('AGUA SANITARIA 5 LT'), chave('AGUA SANITARIA 5 LITROS'),
               'lt e litros são a mesma unidade');
  assert.equal(chave('ALCOOL 1L'), chave('ALCOOL 1 LT'));
  assert.equal(chave('COPO 50 UND'), chave('COPO 50 UNIDADES'));

  // O que NÃO pode juntar: produtos de verdade diferentes.
  assert.notEqual(chave('CAFE MELITA TRADICIONAL 500G'), chave('CAFE MELITA TRADICIONAL 250G'),
                  'gramaturas diferentes são produtos diferentes');
  assert.notEqual(chave('DETERGENTE NEUTRO'), chave('DETERGENTE CLORADO'));
  assert.notEqual(chave('PAPEL TOALHA'), chave('PAPEL HIGIENICO'));

  console.log('✓ CORREÇÃO VERIFICADA: grafias do mesmo item caem na mesma chave de série');
} catch (e) {
  console.log(`✗ FALHA na Correção 13: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 14 — gravação da equalização criada na tela
//
//  Primeiro caminho de escrita vindo do navegador. Três regras que, se
//  quebrarem, corrompem a base silenciosamente: hierarquia pelo nível,
//  grupo sem preço, e branco virando nao_cotado em vez de zero.
// ─────────────────────────────────────────────────────────────
try {
  const ctxNovo = vm.createContext({ Logger: { log: () => {} }, console: console });

  const gravado = {};
  let seq = 0;

  ['Util.gs', 'Config.gs', 'Equalizacao.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxNovo, { filename: f });
  });

  // Depois da carga: `function` no vm vira propriedade do global, então
  // Util.gs sobrescreveria qualquer dublê definido antes.
  ctxNovo.cfLerTudo_ = () => [];
  ctxNovo.cfInserir_ = (aba, linhas) => { gravado[aba] = (gravado[aba] || []).concat(linhas); };
  ctxNovo.cfComTrava_ = (fn) => fn();
  ctxNovo.cfUsuario_ = () => 'guilherme.marques@capitalrealty.com.br';
  ctxNovo.cfLog_ = () => {};
  ctxNovo.cfNovoId_ = (p) => p + '-' + (++seq);

  const r = ctxNovo.cfCriarEqualizacao_({
    empreendimento: 'MEGA CENTRO LOGÍSTICO ITAJAÍ',
    projeto: 'Limpeza', area: 'Facilities', data: '05/09/2026',
    proponentes: [{ nome: 'Alfa Ltda', cnpj: '11.222.333/0001-81' }, { nome: 'Beta ME', cnpj: '' }],
    itens: [
      { tipo: 'grupo', nivel: 0, descricao: 'MATERIAIS', precos: ['99', '99'] },
      { tipo: 'item',  nivel: 1, descricao: 'Detergente', quantidade: '10', unidade: 'un',
        precos: ['5,50', ''] }
    ]
  });

  const eap = gravado.EAP, precos = gravado.Precos;

  assert.equal(eap.length, 2);
  assert.equal(eap[0].ID_PAI, '', 'o grupo de nível 0 é raiz');
  assert.equal(eap[1].ID_PAI, eap[0].ID, 'o item de nível 1 devia pendurar no grupo acima');

  // Grupo agrega. Preço nele faria o total contar duas vezes.
  assert.equal(precos.length, 2, `grupo não pode gerar preço — vieram ${precos.length} linhas`);
  assert.ok(precos.every(p => p.ID_EAP === eap[1].ID), 'todo preço devia ser do item, não do grupo');

  const cotado = precos.filter(p => p.STATUS_PRECO === 'cotado')[0];
  assert.equal(cotado.PRECO_UNITARIO, 5.5, 'vírgula decimal do formato BR precisa virar número');
  assert.equal(cotado.VALOR_TOTAL, 55, 'total é unitário × quantidade');

  const semCotar = precos.filter(p => p.STATUS_PRECO === 'nao_cotado')[0];
  assert.equal(semCotar.PRECO_UNITARIO, '',
    'preço em branco vira nao_cotado com valor vazio — zero mentiria que cotou de graça');

  assert.equal(gravado.Propostas[0].VALOR_TOTAL_CALCULADO, 55);
  // Vazio, não zero — ver Correção 23. Zero venceria a comparação.
  assert.equal(gravado.Propostas[1].VALOR_TOTAL_CALCULADO, '');
  assert.equal(gravado.Fornecedores.length, 1, 'só o proponente com CNPJ válido entra no cadastro');

  // Empreendimento é lista fechada: nunca se deduz, nunca se aceita texto solto.
  assert.throws(() => ctxNovo.cfCriarEqualizacao_({
    empreendimento: 'Mega Qualquer',
    proponentes: [{ nome: 'X' }], itens: [{ tipo: 'item', descricao: 'Y', precos: [''] }]
  }), /não é um dos Megas/, 'empreendimento fora da lista devia ser recusado');

  console.log('✓ CORREÇÃO VERIFICADA: equalização criada na tela grava hierarquia e preços corretos');
} catch (e) {
  console.log(`✗ FALHA na Correção 14: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 15 — a tela e o servidor precisam ler número igual
//
//  O front apagava todo ponto; cfNumero_ só apaga ponto quando há vírgula
//  junto. Digitar "12.500" somava R$ 12.500,00 na tela e gravava 12,5 na
//  planilha. Sem erro, sem aviso, no campo mais caro do sistema.
//
//  Este teste extrai a função num() do próprio Interface.html: se alguém
//  "simplificar" ela de novo, quebra aqui.
// ─────────────────────────────────────────────────────────────
try {
  const ctxN = vm.createContext({ Logger: { log: () => {} }, console: console });
  vm.runInContext(fs.readFileSync(path.join(root, 'app', 'Util.gs'), 'utf8'), ctxN, { filename: 'Util.gs' });

  const html = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');
  const inicio = html.indexOf('function num(v) {');
  assert.ok(inicio > 0, 'não achei a função num() no Interface.html');
  const fim = html.indexOf('\n}', inicio);
  const fonteNum = html.slice(inicio, fim + 2);

  const ctxF = vm.createContext({});
  vm.runInContext(fonteNum, ctxF, { filename: 'Interface.html#num' });

  const casos = ['1.234', '1234.56', '1.234,56', '12.500', '12500', '1,5', '0,99',
                 'R$ 1.234,56', '  2.000,00 ', '', '-', '3', '1,234.56', '10.00'];

  casos.forEach(v => {
    const front = ctxF.num(v);
    const back = ctxN.cfNumero_(v);
    assert.equal(front, back,
      `"${v}": a tela leu ${front} e o servidor leu ${back} — a tela somaria um valor e a planilha guardaria outro`);
  });

  // O caso que motivou tudo, explícito.
  assert.equal(ctxF.num('12.500'), ctxN.cfNumero_('12.500'));

  console.log('✓ CORREÇÃO VERIFICADA: tela e servidor leem número pela mesma regra');
} catch (e) {
  console.log(`✗ FALHA na Correção 15: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 16 — a contratante sai do Mega, não da escolha do usuário
//
//  Curitiba é Demercado; Esteio e Itajaí são Capital Realty. A relação é
//  fixa, então o seletor de empresa só existia para ser preenchido errado.
//  O servidor deriva e ignora o que a tela mandar.
// ─────────────────────────────────────────────────────────────
try {
  const ctxE = vm.createContext({ Logger: { log: () => {} }, console: console });
  const gravadoE = {};
  let seqE = 0;

  ['Util.gs', 'Config.gs', 'Equalizacao.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxE, { filename: f });
  });
  ctxE.cfLerTudo_ = () => [];
  ctxE.cfInserir_ = (aba, linhas) => { gravadoE[aba] = (gravadoE[aba] || []).concat(linhas); };
  ctxE.cfComTrava_ = (fn) => fn();
  ctxE.cfUsuario_ = () => 'guilherme.marques@capitalrealty.com.br';
  ctxE.cfLog_ = () => {};
  ctxE.cfNovoId_ = (p) => p + '-' + (++seqE);

  const DEMERCADO = '08601964000105';
  const CAPITAL = '03015145000154';

  assert.equal(ctxE.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO CURITIBA').cnpj, DEMERCADO);
  assert.equal(ctxE.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO ESTEIO').cnpj, CAPITAL);
  assert.equal(ctxE.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO ITAJAÍ').cnpj, CAPITAL);

  // Mesmo que a tela mande outra empresa, o servidor usa a do Mega.
  ctxE.cfCriarEqualizacao_({
    empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA',
    empresaCnpj: CAPITAL,
    proponentes: [{ nome: 'Alfa' }],
    itens: [{ tipo: 'item', nivel: 0, descricao: 'X', precos: ['1'] }]
  });

  assert.equal(gravadoE.Equalizacoes[0].CNPJ_EMPRESA, DEMERCADO,
    'a tela mandou Capital Realty num Mega de Curitiba e o servidor obedeceu');

  console.log('✓ CORREÇÃO VERIFICADA: contratante derivada do Mega, não do cliente');
} catch (e) {
  console.log(`✗ FALHA na Correção 16: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 17 — o JavaScript da interface precisa compilar
//
//  Nenhum teste olhava para Interface.html. Um erro de sintaxe ali não
//  quebra o deploy nem o Apps Script: quebra a tela inteira em silêncio,
//  no navegador do usuário, depois do push.
// ─────────────────────────────────────────────────────────────
try {
  const html = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');
  const i = html.indexOf('<script>');
  const f = html.lastIndexOf('</script>');
  assert.ok(i > 0 && f > i, 'não achei o bloco <script> no Interface.html');

  const js = html.slice(i + '<script>'.length, f);
  new vm.Script(js, { filename: 'Interface.html#script' });   // lança se não compilar

  // As funções que o HTML chama por onclick/oninput precisam existir: um
  // onclick apontando para função inexistente falha só quando clicado.
  const chamadas = ['aba', 'buscar', 'desenharMapa', 'abrirMapa', 'verMapaDe',
                    'navegarGrade', 'colarColuna', 'salvarRascunho', 'descartarRascunho',
                    'atualizarNomes', 'mostrarEmpresa', 'addItem', 'removerItem',
                    'addProponente', 'removerProponente', 'calcular', 'normalizarCampo',
                    'salvarEqualizacao', 'num', 'alternarFatDir', 'alternarNegociacao',
                    'digitouCampoProp', 'editarEqualizacao', 'cancelarEdicao', 'carregarDadosParaEdicao'];
  const faltando = chamadas.filter(function (n) {
    return js.indexOf('function ' + n + '(') < 0;
  });
  assert.equal(faltando.length, 0, 'funções chamadas pelo HTML e não definidas: ' + faltando.join(', '));

  console.log('✓ CORREÇÃO VERIFICADA: o JavaScript da interface compila e tem as funções que o HTML chama');
} catch (e) {
  console.log(`✗ FALHA na Correção 17: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 18 — busca de fornecedor por CNPJ ou nome
//
//  Um campo só. Dígitos vão à consulta pública; texto procura no cadastro. A ordem
//  importa: cadastro interno antes da rede, porque o nome que a operação
//  ajustou à mão vale mais que a razão social crua — e não gasta consulta.
// ─────────────────────────────────────────────────────────────
try {
  const ctxC = vm.createContext({ Logger: { log: () => {} }, console: console });

  let foiARede = false;
  ctxC.UrlFetchApp = {
    fetch: () => {
      foiARede = true;
      return {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({
          razao_social: 'FORNECEDOR DA RECEITA LTDA', municipio: 'CURITIBA', uf: 'PR',
          descricao_situacao_cadastral: 'ATIVA', cnae_fiscal: 4321,
          cnae_fiscal_descricao: 'Instalação elétrica'
        })
      };
    }
  };
  ctxC.CacheService = { getScriptCache: () => ({ get: () => null, put: () => {} }) };

  ['Util.gs', 'Config.gs', 'Cnpj.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxC, { filename: f });
  });

  const CADASTRADO = '11222333000181';   // dígitos verificadores válidos
  ctxC.cfLerTudo_ = () => [
    { CNPJ: CADASTRADO, RAZAO_SOCIAL: 'ALFA MANUTENCAO LTDA', CIDADE: 'Itajaí', UF: 'SC' },
    { CNPJ: '', RAZAO_SOCIAL: 'BETA SEM CNPJ' }
  ];

  // Dígito verificador barra antes de gastar rede.
  assert.equal(ctxC.cfCnpjValido_('11222333000181'), true);
  assert.equal(ctxC.cfCnpjValido_('11222333000182'), false, 'DV errado devia ser recusado');
  assert.equal(ctxC.cfCnpjValido_('00000000000000'), false, 'repetido não é CNPJ');

  // Já cadastrado: responde da base, sem tocar na rede.
  foiARede = false;
  const doCadastro = ctxC.cfBuscarFornecedor_('11.222.333/0001-81');
  assert.equal(doCadastro.tipo, 'cnpj');
  assert.equal(doCadastro.achados[0].razaoSocial, 'ALFA MANUTENCAO LTDA');
  assert.equal(doCadastro.achados[0].fonte, 'cadastro');
  assert.equal(foiARede, false, 'consultou a Receita para um CNPJ que já estava no cadastro');

  // Não cadastrado: aí sim vai à rede.
  foiARede = false;
  const daReceita = ctxC.cfBuscarFornecedor_('34.028.316/0001-03');
  assert.equal(foiARede, true);
  assert.equal(daReceita.achados[0].razaoSocial, 'FORNECEDOR DA RECEITA LTDA');
  assert.equal(daReceita.achados[0].fonte, 'consulta_publica');

  // Texto procura por nome, no cadastro.
  foiARede = false;
  const porNome = ctxC.cfBuscarFornecedor_('alfa');
  assert.equal(porNome.tipo, 'nome');
  assert.equal(porNome.achados.length, 1);
  assert.equal(foiARede, false, 'busca por nome não pode ir à Receita');

  // Nome com número não pode virar consulta de CNPJ.
  foiARede = false;
  ctxC.cfBuscarFornecedor_('Alfa 2000 Serviços');
  assert.equal(foiARede, false, '"Alfa 2000" foi tratado como CNPJ');

  console.log('✓ CORREÇÃO VERIFICADA: fornecedor vem do cadastro antes da consulta pública, por CNPJ ou por nome');
} catch (e) {
  console.log(`✗ FALHA na Correção 18: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 19 — o rodapé da planilha EQU chega à gravação
//
//  Dados da proposta e histórico de negociação existiam no schema e a tela
//  não capturava nada. Sem eles a equalização gravada é mais pobre que a
//  planilha que ela substitui — o que derruba o argumento inteiro.
// ─────────────────────────────────────────────────────────────
try {
  const ctxR = vm.createContext({ Logger: { log: () => {} }, console: console });
  const gravadoR = {};
  let seqR = 0;

  ['Util.gs', 'Config.gs', 'Equalizacao.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxR, { filename: f });
  });
  ctxR.cfLerTudo_ = () => [];
  ctxR.cfInserir_ = (aba, linhas) => { gravadoR[aba] = (gravadoR[aba] || []).concat(linhas); };
  ctxR.cfComTrava_ = (fn) => fn();
  ctxR.cfUsuario_ = () => 'guilherme.marques@capitalrealty.com.br';
  ctxR.cfLog_ = () => {};
  ctxR.cfNovoId_ = (p) => p + '-' + (++seqR);

  ctxR.cfCriarEqualizacao_({
    empreendimento: 'MEGA CENTRO LOGÍSTICO ESTEIO',
    detalhamento: 'Fornecimento de material de consumo',
    premissas: 'Entrega única',
    notasCr: 'Conferir NF',
    proponentes: [{
      nome: 'Contabilista', cnpj: '11222333000181',
      numero: '1/062959', data: '2026-04-28', condicoes: 'Boleto para 28 dias',
      leadTime: '5', prazoExecucao: '0', centroCusto: 'Material de consumo',
      dataPrevInicio: '2026-05-04', dataPrevTermino: '2026-05-04',
      faturamentoDireto: true, valorFaturamentoDireto: '100,00',
      propostaInicial: '2.000,00', r01: '1.687,47'
    }],
    itens: [{ tipo: 'item', nivel: 0, descricao: 'Soda', quantidade: '1', unidade: 'kg', precos: ['47,20'] }]
  });

  const eq = gravadoR.Equalizacoes[0];
  assert.equal(eq.DETALHAMENTO_APROVACAO, 'Fornecimento de material de consumo');
  assert.equal(eq.PREMISSAS, 'Entrega única');
  assert.equal(eq.NOTAS_CR, 'Conferir NF');

  const pr = gravadoR.Propostas[0];
  assert.equal(pr.NUMERO_PROPOSTA, '1/062959');
  assert.equal(pr.CONDICOES_PAGAMENTO, 'Boleto para 28 dias');
  assert.equal(pr.LEAD_TIME_DIAS, 5);
  assert.equal(pr.OBSERVACAO, 'Material de consumo');
  assert.equal(pr.FATURAMENTO_DIRETO, true);
  assert.equal(pr.VALOR_FATURAMENTO_DIRETO, 100);

  // A rodada é a última preenchida, e o declarado acompanha.
  assert.equal(pr.RODADA, 'R01', 'com R01 preenchida a rodada não é mais "inicial"');
  assert.equal(pr.VALOR_TOTAL_DECLARADO, 1687.47);
  assert.equal(pr.VALOR_PROPOSTA_INICIAL, 2000);
  assert.equal(Math.round(pr.REDUCAO_NEGOCIADA * 100) / 100, 312.53);

  // Sem proposta inicial não existe redução — foi o defeito da planilha,
  // que copiava o total e reportava 100% de economia.
  gravadoR.Propostas = [];
  ctxR.cfCriarEqualizacao_({
    empreendimento: 'MEGA CENTRO LOGÍSTICO ESTEIO',
    proponentes: [{ nome: 'X', r01: '900,00' }],
    itens: [{ tipo: 'item', nivel: 0, descricao: 'Y', precos: ['10'] }]
  });
  assert.equal(gravadoR.Propostas[0].REDUCAO_NEGOCIADA, '',
    'sem proposta inicial a redução tem que ficar vazia, não igual ao total');

  console.log('✓ CORREÇÃO VERIFICADA: dados da proposta e negociação são gravados');
} catch (e) {
  console.log(`✗ FALHA na Correção 19: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 20 — homologar exige justificativa fora do menor valor
//
//  Escolher a proposta mais cara é decisão legítima: prazo, escopo,
//  histórico do fornecedor. Mas precisa estar escrita — é a defesa de quem
//  comprou quando alguém perguntar meses depois.
// ─────────────────────────────────────────────────────────────
try {
  const ctxH = vm.createContext({ Logger: { log: () => {} }, console: console });
  const atualizado = [];

  ['Util.gs', 'Config.gs', 'Equalizacao.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxH, { filename: f });
  });

  const tabelas = {
    Equalizacoes: [{ ID: 'EQ1', _linha: 2, STATUS: 'em_cotacao' }],
    Propostas: [
      { ID: 'P1', _linha: 2, ID_EQUALIZACAO: 'EQ1', CNPJ: '11222333000181',
        VALOR_TOTAL_DECLARADO: 1000, VENCEDORA: false },
      { ID: 'P2', _linha: 3, ID_EQUALIZACAO: 'EQ1', CNPJ: '22333444000199',
        VALOR_TOTAL_DECLARADO: 1500, VENCEDORA: false }
    ]
  };
  ctxH.cfLerTudo_ = (n) => tabelas[n] || [];
  ctxH.cfAtualizarLinha_ = (aba, linha, campos) => atualizado.push({ aba, linha, campos });
  ctxH.cfComTrava_ = (fn) => fn();
  ctxH.cfLog_ = () => {};

  // A mais cara, sem justificativa: tem que recusar.
  assert.throws(() => ctxH.cfHomologar_('EQ1', 'P2', ''), /justificativa/i,
    'aceitou homologar a proposta mais cara sem justificativa');

  // A mais barata não precisa de justificativa.
  atualizado.length = 0;
  const r = ctxH.cfHomologar_('EQ1', 'P1', '');
  assert.equal(r.eraMenor, true);
  const eq = atualizado.filter(a => a.aba === 'Equalizacoes')[0];
  assert.equal(eq.campos.STATUS, 'homologada');
  assert.equal(eq.campos.ID_PROPOSTA_VENCEDORA, 'P1');
  assert.equal(eq.campos.VALOR_FINAL, 1000);
  assert.ok(atualizado.some(a => a.aba === 'Propostas' && a.linha === 2 && a.campos.VENCEDORA === true));

  // A mais cara COM justificativa passa.
  atualizado.length = 0;
  const r2 = ctxH.cfHomologar_('EQ1', 'P2', 'Único com prazo de 10 dias.');
  assert.equal(r2.eraMenor, false);
  assert.equal(atualizado.filter(a => a.aba === 'Equalizacoes')[0].campos.PARECER_FAVORAVEL,
               'Único com prazo de 10 dias.');

  console.log('✓ CORREÇÃO VERIFICADA: homologação registra vencedor e cobra justificativa');
} catch (e) {
  console.log(`✗ FALHA na Correção 20: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 21 — a exportação é retrato, não fonte
//
//  Se a planilha exportada sair com fórmula, ela vira uma segunda fonte
//  editável — e o problema da fórmula quebrada, que motivou o projeto
//  inteiro, volta pela porta dos fundos.
// ─────────────────────────────────────────────────────────────
try {
  const ctxX = vm.createContext({ Logger: { log: () => {} }, console: console });

  let escrito = null;
  // Dublê encadeável: a formatação usa cadeias longas de setX().
  const faixaFalsa = {
    setValues: (m) => { escrito = m; return faixaFalsa; },
    merge: () => faixaFalsa
  };
  ['setFontWeight','setFontSize','setHorizontalAlignment','setVerticalAlignment',
   'setBackground','setFontColor','setBorder','setNumberFormat','setWrap']
    .forEach(function (m) { faixaFalsa[m] = function () { return faixaFalsa; }; });

  const abaFalsa = {
    setName: () => {}, setColumnWidth: () => {}, setFrozenColumns: () => {},
    getSheetId: () => 0,
    getRange: () => faixaFalsa
  };
  ctxX.SpreadsheetApp = {
    create: () => ({ getSheets: () => [abaFalsa], getId: () => 'SS1', getUrl: () => 'url-planilha' }),
    flush: () => {},
    BorderStyle: { SOLID: 'SOLID' }
  };
  ctxX.DriveApp = {
    getFileById: () => ({ moveTo: () => {} }),
    getFolderById: () => ({ createFile: () => ({ getId: () => 'PDF1', getUrl: () => 'url-pdf' }) }),
    createFile: () => ({ getId: () => 'PDF1', getUrl: () => 'url-pdf' })
  };
  ctxX.ScriptApp = { getOAuthToken: () => 't' };
  ctxX.UrlFetchApp = {
    fetch: () => ({ getResponseCode: () => 200, getBlob: () => ({
      setName: function () { return this; },
      getBytes: () => new Array(9000).fill(0)
    }) })
  };
  ctxX.Utilities = { formatDate: () => '06/09/2026 10:00', getUuid: () => 'x' };

  ['Util.gs', 'Config.gs', 'Consulta.gs', 'Cnpj.gs', 'Equalizacao.gs', 'Exportar.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxX, { filename: f });
  });

  ctxX.cfLerTudo_ = (n) => ({
    Equalizacoes: [{ ID: 'EQ1', ID_EMPREENDIMENTO: 'MEGA CENTRO LOGÍSTICO CURITIBA',
                     PROJETO: 'Limpeza', STATUS: 'homologada', PARECER_FAVORAVEL: 'Menor prazo' }],
    Propostas: [{ ID: 'P1', ID_EQUALIZACAO: 'EQ1', CNPJ: '11222333000181', ORDEM: 1,
                  RAZAO_SOCIAL_INFORMADA: 'Alfa', VALOR_TOTAL_CALCULADO: 100,
                  NUMERO_PROPOSTA: '123', CONDICOES_PAGAMENTO: '28 dias' }],
    EAP: [{ ID: 'N1', ID_EQUALIZACAO: 'EQ1', ID_PAI: '', ORDEM: 1, TIPO: 'item', DESCRICAO: 'Soda' }],
    Precos: [{ ID_EAP: 'N1', ID_PROPOSTA: 'P1', ID_EQUALIZACAO: 'EQ1',
               PRECO_UNITARIO: 100, STATUS_PRECO: 'cotado' }],
    Fornecedores: [], Pendencias: []
  })[n] || [];
  ctxX.cfDataTexto_ = () => '06/09/2026';
  ctxX.cfUsuario_ = () => 'guilherme.marques@capitalrealty.com.br';
  const coresAplicadas = [];
  faixaFalsa.setBackground = function (c) { coresAplicadas.push(c); return faixaFalsa; };

  const r = ctxX.cfExportarEqualizacao_('EQ1');
  assert.equal(r.planilha, 'url-planilha');
  assert.equal(r.pdf, 'url-pdf');
  assert.ok(escrito && escrito.length, 'nada foi escrito na planilha');
  assert.ok(coresAplicadas.indexOf('#E4F2EA') >= 0, 'não destacou os melhores valores em verde (#E4F2EA)');

  // Nenhuma célula pode começar com "=".
  const comFormula = [];
  escrito.forEach(function (linha, l) {
    linha.forEach(function (c, k) {
      if (typeof c === 'string' && c.trim().charAt(0) === '=') comFormula.push(l + ',' + k);
    });
  });
  assert.equal(comFormula.length, 0,
    'a exportação escreveu fórmula nas células ' + comFormula.join(' ') + ' — ela tem que ser retrato');

  // O conteúdo essencial precisa estar lá.
  const texto = escrito.map(l => l.join('|')).join('\n');
  ['EQ1', 'Alfa', 'Soda', 'VALOR TOTAL', 'Menor prazo',
   'INFORMAÇÕES OBRIGATÓRIAS', 'Unitário', 'Total',
   'Histórico da Negociação', 'Numero da Proposta:'].forEach(function (t) {
    assert.ok(texto.indexOf(t) >= 0, 'a exportação não trouxe "' + t + '"');
  });

  // O identificador precisa estar no documento, não só no nome do arquivo:
  // sem ele o retrato não volta para a equalização que o gerou.
  assert.ok(texto.indexOf('Identificador:') >= 0, 'faltou carimbar o identificador');

  // Dinheiro tem que ser número, não texto já formatado: escrevendo
  // "182,50" o Sheets reinterpreta e mostra "182,5", e texto não soma.
  const temMoedaTexto = escrito.some(function (l) {
    return l.some(function (c) { return typeof c === 'string' && /^R\$\s*[\d.,]+$/.test(c.trim()); });
  });
  assert.equal(temMoedaTexto, false, 'valor monetário foi escrito como texto formatado');

  console.log('✓ CORREÇÃO VERIFICADA: exportação sai como valor estático, com o conteúdo completo');
} catch (e) {
  console.log(`✗ FALHA na Correção 21: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 22 — data digitada na tela não pode retroceder um dia
//
//  <input type="date"> devolve "2026-04-28". cfData_ só reconhecia
//  dd/mm/aaaa e caía no new Date(valor), que lê ISO como meia-noite UTC —
//  em America/Sao_Paulo isso é 27/04 às 21h. Toda data da tela voltava um
//  dia: validade de proposta vencia na véspera.
// ─────────────────────────────────────────────────────────────
try {
  const ctxD = vm.createContext({ Logger: { log: () => {} }, console: console });
  vm.runInContext(fs.readFileSync(path.join(root, 'app', 'Util.gs'), 'utf8'), ctxD, { filename: 'Util.gs' });

  const d = ctxD.cfData_('2026-04-28');
  // instanceof não vale aqui: o Date nasce dentro do vm, que é outro realm.
  assert.equal(Object.prototype.toString.call(d), '[object Date]', 'ISO devia virar Date');
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 3, 'abril');
  assert.equal(d.getDate(), 28, `dia veio ${d.getDate()} em vez de 28 — a data retrocedeu`);

  // O formato brasileiro segue funcionando.
  const br = ctxD.cfData_('28/04/2026');
  assert.equal(br.getDate(), 28);
  assert.equal(br.getMonth(), 3);

  // E as duas formas têm que concordar: a tela manda ISO, o importador manda BR.
  assert.equal(d.getTime(), br.getTime(),
    'ISO e dd/mm/aaaa da mesma data precisam produzir o mesmo instante');

  console.log('✓ CORREÇÃO VERIFICADA: data do formulário não retrocede um dia');
} catch (e) {
  console.log(`✗ FALHA na Correção 22: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 23 — quem não cotou nada fica sem total, não com zero
//
//  Zero venceria a comparação de menor valor, e o sistema passaria a
//  exigir justificativa de quem escolhesse qualquer fornecedor real.
//  Acontece no primeiro convite recusado.
// ─────────────────────────────────────────────────────────────
try {
  const ctxZ = vm.createContext({ Logger: { log: () => {} }, console: console });
  const gravadoZ = {};
  let seqZ = 0;

  ['Util.gs', 'Config.gs', 'Equalizacao.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxZ, { filename: f });
  });
  ctxZ.cfLerTudo_ = () => [];
  ctxZ.cfInserir_ = (aba, linhas) => { gravadoZ[aba] = (gravadoZ[aba] || []).concat(linhas); };
  ctxZ.cfComTrava_ = (fn) => fn();
  ctxZ.cfUsuario_ = () => 'x@capitalrealty.com.br';
  ctxZ.cfLog_ = () => {};
  ctxZ.cfNovoId_ = (p) => p + '-' + (++seqZ);

  ctxZ.cfCriarEqualizacao_({
    empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA',
    proponentes: [{ nome: 'Cotou' }, { nome: 'Nao cotou nada' }],
    itens: [{ tipo: 'item', nivel: 0, descricao: 'Item', precos: ['10', ''] }]
  });

  assert.equal(gravadoZ.Propostas[0].VALOR_TOTAL_CALCULADO, 10);
  assert.equal(gravadoZ.Propostas[1].VALOR_TOTAL_CALCULADO, '',
    'proponente sem nenhuma cotação ficou com 0 e venceria a comparação');

  console.log('✓ CORREÇÃO VERIFICADA: proponente sem cotação não vira o menor valor');
} catch (e) {
  console.log(`✗ FALHA na Correção 23: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 24 — total da linha × preço unitário
//
//  A planilha EQU só traz o total da linha; ter o unitário é a melhoria.
//  Transcrevendo um documento antigo digita-se o total, e o unitário sai
//  da quantidade. Sem essa distinção, R$ 524,00 de um lote de café virava
//  "café custa R$ 524,00 a unidade" no histórico de preços.
// ─────────────────────────────────────────────────────────────
try {
  const ctxB = vm.createContext({ Logger: { log: () => {} }, console: console });
  let gravadoB = {};
  let seqB = 0;

  ['Util.gs', 'Config.gs', 'Equalizacao.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxB, { filename: f });
  });
  ctxB.cfLerTudo_ = () => [];
  ctxB.cfInserir_ = (aba, linhas) => { gravadoB[aba] = (gravadoB[aba] || []).concat(linhas); };
  ctxB.cfComTrava_ = (fn) => fn();
  ctxB.cfUsuario_ = () => 'x@capitalrealty.com.br';
  ctxB.cfLog_ = () => {};
  ctxB.cfNovoId_ = (p) => p + '-' + (++seqB);

  const item = { tipo: 'item', nivel: 0, descricao: 'Café Melitta 500g',
                 quantidade: '4', unidade: 'un', precos: ['524,00'] };

  // Base "total": 524 é o total de 4 unidades → unitário 131.
  ctxB.cfCriarEqualizacao_({
    empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA', baseValores: 'total',
    proponentes: [{ nome: 'A' }], itens: [JSON.parse(JSON.stringify(item))]
  });
  let pr = gravadoB.Precos[0];
  assert.equal(pr.VALOR_TOTAL, 524, 'o total digitado tem que ser preservado');
  assert.equal(pr.PRECO_UNITARIO, 131, 'o unitário sai do total dividido pela quantidade');
  assert.equal(pr.ORIGEM_CALCULO, 'calculado', 'unitário derivado precisa ficar marcado como calculado');
  assert.equal(gravadoB.Propostas[0].VALOR_TOTAL_CALCULADO, 524,
    'somar o total da linha não pode multiplicar de novo pela quantidade');

  // Base "unitario": 524 é o preço de um → total 2096.
  gravadoB = {}; seqB = 0;
  ctxB.cfCriarEqualizacao_({
    empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA', baseValores: 'unitario',
    proponentes: [{ nome: 'A' }], itens: [JSON.parse(JSON.stringify(item))]
  });
  pr = gravadoB.Precos[0];
  assert.equal(pr.PRECO_UNITARIO, 524);
  assert.equal(pr.VALOR_TOTAL, 2096);
  assert.equal(pr.ORIGEM_CALCULO, 'informado');

  // Sem quantidade, as duas bases coincidem — é o caso do formulário real.
  gravadoB = {}; seqB = 0;
  ctxB.cfCriarEqualizacao_({
    empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA', baseValores: 'total',
    proponentes: [{ nome: 'A' }],
    itens: [{ tipo: 'item', nivel: 0, descricao: 'Açúcar', precos: ['29,00'] }]
  });
  assert.equal(gravadoB.Precos[0].PRECO_UNITARIO, 29);
  assert.equal(gravadoB.Precos[0].VALOR_TOTAL, 29);

  console.log('✓ CORREÇÃO VERIFICADA: total da linha e preço unitário são coisas distintas');
} catch (e) {
  console.log(`✗ FALHA na Correção 24: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 25 — a faxina de teste só toca no que é de teste
//
//  Dado fictício misturado ao histórico envenena a consulta de preço. A
//  marca no PROJETO é o que permite apagar exatamente o inventado — e o
//  risco desta rotina é o oposto: apagar o que é real.
// ─────────────────────────────────────────────────────────────
try {
  const ctxT = vm.createContext({ Logger: { log: () => {} }, console: console });
  const apagados = [];

  ['Util.gs', 'Config.gs', 'Manutencao.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxT, { filename: f });
  });

  const tabelas = {
    Equalizacoes: [
      { ID: 'EQ-REAL', PROJETO: 'Contrato anual de limpeza' },
      { ID: 'EQ-TESTE', PROJETO: '::TESTE:: Reposição trimestral' }
    ],
    Propostas: [{ ID_EQUALIZACAO: 'EQ-REAL' }, { ID_EQUALIZACAO: 'EQ-TESTE' }],
    EAP: [{ ID_EQUALIZACAO: 'EQ-TESTE' }, { ID_EQUALIZACAO: 'EQ-TESTE' }],
    Precos: [{ ID_EQUALIZACAO: 'EQ-REAL' }, { ID_EQUALIZACAO: 'EQ-TESTE' },
             { ID_EQUALIZACAO: 'EQ-TESTE' }, { ID_EQUALIZACAO: 'EQ-TESTE' }]
  };
  ctxT.cfLerTudo_ = (n) => tabelas[n] || [];
  ctxT.cfApagarPor_ = (aba, campo, valor) => { apagados.push({ aba, campo, valor }); };
  ctxT.cfComTrava_ = (fn) => fn();
  ctxT.cfLog_ = () => {};

  const sim = ctxT.cfLimpezaDeTeste_(false);
  assert.equal(sim.equalizacoes.length, 1, 'só a marcada devia entrar na conta');
  assert.equal(sim.equalizacoes[0].ID, 'EQ-TESTE');
  assert.equal(sim.detalhe.Precos, 3);
  assert.equal(apagados.length, 0, 'a simulação apagou alguma coisa');

  ctxT.cfLimpezaDeTeste_(true);
  assert.ok(apagados.length > 0);
  assert.ok(apagados.every(a => a.valor === 'EQ-TESTE'),
    'a faxina tocou em algo que não é de teste: ' + JSON.stringify(apagados));

  // Filhos antes do pai: parar no meio pode deixar a equalização, que se
  // acha e se apaga de novo — nunca preços órfãos, que ninguém encontra.
  const ordem = apagados.map(a => a.aba);
  assert.ok(ordem.indexOf('Precos') < ordem.indexOf('Equalizacoes'),
    'apagou a equalização antes dos preços, deixando órfãos');

  console.log('✓ CORREÇÃO VERIFICADA: faxina de teste apaga só o marcado, filhos antes do pai');
} catch (e) {
  console.log(`✗ FALHA na Correção 25: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 26 — PDF vazio tem que falhar, não ser entregue
//
//  O primeiro PDF saiu em branco e o sistema devolveu o link como se
//  tivesse dado certo. Arquivo vazio com cara de sucesso é pior que erro:
//  só se descobre na hora de mostrar para alguém.
// ─────────────────────────────────────────────────────────────
try {
  const ctxP = vm.createContext({ Logger: { log: () => {} }, console: console });

  let bytes = 200;                       // um PDF em branco
  ctxP.UrlFetchApp = {
    fetch: () => ({
      getResponseCode: () => 200,
      getBlob: () => ({ setName: function () { return this; }, getBytes: () => new Array(bytes).fill(0) })
    })
  };
  ctxP.ScriptApp = { getOAuthToken: () => 't' };
  ctxP.DriveApp = {
    getFolderById: () => ({ createFile: () => ({ getId: () => 'P', getUrl: () => 'u' }) }),
    createFile: () => ({ getId: () => 'P', getUrl: () => 'u' })
  };
  ctxP.SpreadsheetApp = { flush: () => {} };
  ctxP.Utilities = { formatDate: () => '' };

  ['Util.gs', 'Config.gs', 'Exportar.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxP, { filename: f });
  });

  assert.throws(() => ctxP.cfPdfDaPlanilha_('SS', 0, 'x'), /vazio/i,
    'entregou um PDF em branco como se fosse sucesso');

  bytes = 40000;                         // um PDF de verdade
  const ok = ctxP.cfPdfDaPlanilha_('SS', 0, 'x');
  assert.equal(ok.getUrl(), 'u');

  console.log('✓ CORREÇÃO VERIFICADA: PDF em branco falha em vez de ser entregue');
} catch (e) {
  console.log(`✗ FALHA na Correção 26: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 27 — o código da EAP sai da árvore, não da digitação
//
//  Na planilha antiga o código era digitado, e divergia da hierarquia
//  assim que alguém inseria uma linha no meio: o código dizia uma coisa e
//  o recuo dizia outra, e a conferência contra o documento original virava
//  adivinhação.
// ─────────────────────────────────────────────────────────────
try {
  const html = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');
  const i = html.indexOf('function recalcularCodigos() {');
  assert.ok(i > 0, 'não achei recalcularCodigos no Interface.html');
  const fim = html.indexOf('\n}', i);

  const ctxCod = vm.createContext({});
  vm.runInContext(html.slice(i, fim + 2), ctxCod, { filename: 'Interface.html#codigos' });

  ctxCod.itens = [
    { nivel: 0 },                    // 1.0
    { nivel: 1 }, { nivel: 1 },      // 1.1, 1.2
    { nivel: 2 }, { nivel: 2 },      // 1.2.1, 1.2.2
    { nivel: 1 },                    // 1.3
    { nivel: 0 },                    // 2.0
    { nivel: 1 },                    // 2.1
    { nivel: 2 }                     // 2.1.1
  ];
  ctxCod.recalcularCodigos();

  const codigos = ctxCod.itens.map(function (i) { return i.codigo; });
  assert.deepEqual(codigos,
    ['1.0', '1.1', '1.2', '1.2.1', '1.2.2', '1.3', '2.0', '2.1', '2.1.1'],
    'numeração saiu ' + codigos.join(' '));

  // O ponto que mais erra à mão: ao abrir o grupo 2, os filhos recomeçam
  // do 1 — não continuam de onde o grupo 1 parou.
  assert.equal(codigos[7], '2.1', 'o primeiro filho do segundo grupo tem que ser 2.1');

  console.log('✓ CORREÇÃO VERIFICADA: código da EAP é derivado da hierarquia');
} catch (e) {
  console.log(`✗ FALHA na Correção 27: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 28 — edição de equalização atualiza no mesmo ID sem duplicar
//
//  Ao salvar uma equalização que já existe (passando dados.id),
//  cfCriarEqualizacao_ deve limpar os nós, preços e propostas antigos daquela
//  equalização, regravar os dados atualizados preservando o mesmo ID e
//  a auditoria original (CRIADO_POR, CRIADO_EM, STATUS), definir ATUALIZADO_EM
//  e retornar editada: true.
// ─────────────────────────────────────────────────────────────
try {
  const ctxEd = vm.createContext({ Logger: { log: () => {} }, console: console });
  ['Util.gs', 'Config.gs', 'Schema.gs', 'Persistencia.gs', 'Cnpj.gs', 'Equalizacao.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxEd, { filename: f });
  });

  const ID_EXISTENTE = 'EQU-20260906-TESTE';
  const agoraOriginal = new Date(2026, 8, 1, 10, 0, 0);
  const tabelas = {
    Equalizacoes: [{
      ID: ID_EXISTENTE,
      CNPJ_EMPRESA: '03015145000154',
      ID_EMPREENDIMENTO: 'MEGA CENTRO LOGÍSTICO ITAJAÍ',
      PROJETO: 'Projeto Original',
      AREA: 'Facilities',
      DATA_EQUALIZACAO: agoraOriginal,
      STATUS: 'em_cotacao',
      ORIGEM: 'app',
      CRIADO_POR: 'usuario.antigo@capitalrealty.com.br',
      CRIADO_EM: agoraOriginal
    }],
    Propostas: [
      { ID: 'PRP-1', ID_EQUALIZACAO: ID_EXISTENTE, CNPJ: '11222333000181', ORDEM: 1 }
    ],
    EAP: [
      { ID: 'EAP-1', ID_EQUALIZACAO: ID_EXISTENTE, ORDEM: 1, TIPO: 'item', DESCRICAO: 'Item Antigo' }
    ],
    Precos: [
      { ID: 'PRC-1', ID_EQUALIZACAO: ID_EXISTENTE, ID_EAP: 'EAP-1', ID_PROPOSTA: 'PRP-1', PRECO_UNITARIO: 10 }
    ],
    Fornecedores: []
  };

  const operacoesApagar = [];
  ctxEd.cfLerTudo_ = (n) => tabelas[n] || [];
  ctxEd.cfInserir_ = (aba, linhas) => { tabelas[aba] = (tabelas[aba] || []).concat(linhas); };
  ctxEd.cfApagarPor_ = (aba, campo, valor) => {
    operacoesApagar.push({ aba, campo, valor });
    if (tabelas[aba]) {
      tabelas[aba] = tabelas[aba].filter(r => String(r[campo]) !== String(valor));
    }
  };
  ctxEd.cfComTrava_ = (fn) => fn();
  ctxEd.cfUsuario_ = () => 'editor@capitalrealty.com.br';
  ctxEd.cfLog_ = () => {};
  let seq = 100;
  ctxEd.cfNovoId_ = (p) => p + '-' + (++seq);

  const res = ctxEd.cfCriarEqualizacao_({
    id: ID_EXISTENTE,
    empreendimento: 'MEGA CENTRO LOGÍSTICO ITAJAÍ',
    projeto: 'Projeto Atualizado',
    area: 'Engenharia',
    data: '06/09/2026',
    proponentes: [
      { nome: 'Alfa Editada', cnpj: '11.222.333/0001-81' },
      { nome: 'Beta Nova', cnpj: '' }
    ],
    itens: [
      { tipo: 'grupo', nivel: 0, descricao: 'SERVIÇOS', precos: ['', ''] },
      { tipo: 'item', nivel: 1, descricao: 'Instalação Elétrica', quantidade: '2', unidade: 'un', precos: ['150,00', '200,00'] }
    ]
  });

  assert.equal(res.id, ID_EXISTENTE, 'deve manter o mesmo ID');
  assert.equal(res.editada, true, 'deve marcar editada: true');

  // Verifica que apagou os registros antigos antes de reinserir
  const abasLimpas = operacoesApagar.map(o => o.aba);
  assert.ok(abasLimpas.includes('Precos'), 'deve limpar Precos antigos');
  assert.ok(abasLimpas.includes('EAP'), 'deve limpar EAP antigo');
  assert.ok(abasLimpas.includes('Propostas'), 'deve limpar Propostas antigas');
  assert.ok(abasLimpas.includes('Equalizacoes'), 'deve limpar Equalizacoes antiga');

  // Verifica a equalização regravada
  const eqAtual = tabelas.Equalizacoes.find(e => e.ID === ID_EXISTENTE);
  assert.ok(eqAtual, 'equalização atualizada deve estar presente');
  assert.equal(eqAtual.PROJETO, 'Projeto Atualizado');
  assert.equal(eqAtual.AREA, 'Engenharia');
  assert.equal(eqAtual.CRIADO_POR, 'usuario.antigo@capitalrealty.com.br', 'deve preservar criador original');
  assert.ok(eqAtual.ATUALIZADO_EM, 'deve ter data de atualização');

  // Verifica nós e preços atualizados
  assert.equal(tabelas.EAP.length, 2);
  assert.equal(tabelas.Precos.length, 2);
  const prc = tabelas.Precos.filter(p => p.STATUS_PRECO === 'cotado');
  assert.equal(prc.length, 2);
  assert.equal(prc[0].PRECO_UNITARIO, 150);

  console.log('✓ CORREÇÃO VERIFICADA: edição de equalização atualiza no mesmo ID preservando auditoria');
} catch (e) {
  console.log(`✗ FALHA na Correção 28: ${e.message}`);
  process.exitCode = 1;
}

