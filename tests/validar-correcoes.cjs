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
  // onclick apontando para função inexistente falha só quando clicado — e
  // no navegador de outra pessoa, dias depois.
  //
  // A lista é EXTRAÍDA do markup, não escrita à mão. Escrita à mão, ela
  // só cobre o que alguém lembrou de acrescentar, e o handler novo — que
  // é justamente o que ainda não foi clicado por ninguém — passa direto.
  const globais = ['Number','String','Boolean','Array','Object','Date','Math','JSON',
                   'RegExp','parseInt','parseFloat','isNaN','alert','confirm','prompt',
                   'setTimeout','clearTimeout','encodeURIComponent','decodeURIComponent',
                   'window','document','console','if','for','while','return','function',
                   'switch','catch','typeof'];

  // Varre o arquivo INTEIRO, e não só o markup estático: a maior parte
  // dos handlers nasce dentro de strings no JS (a lista de cartões, a
  // grade, a ficha), e são justamente os das telas que mudam mais.
  const chamadas = {};
  let m;
  const reAttr = /\bon(?:click|input|change|blur|focus|paste|keydown|keyup|submit)\s*=\s*\\?"([^"\\]*)/g;
  while ((m = reAttr.exec(html)) !== null) {
    const corpo = m[1];
    let c;
    const reFn = /(^|[^.\w$])([a-zA-Z_$][\w$]*)\s*\(/g;
    while ((c = reFn.exec(corpo)) !== null) {
      if (globais.indexOf(c[2]) < 0) chamadas[c[2]] = true;
    }
  }

  const nomes = Object.keys(chamadas);
  // Um piso: se a varredura achar quase nada, foi o padrão que quebrou —
  // e um teste que não acha nada passa sempre.
  assert.ok(nomes.length >= 25,
    'a extração achou só ' + nomes.length + ' handlers — o padrão deve ter quebrado');

  const faltando = nomes.filter(function (n) {
    return js.indexOf('function ' + n + '(') < 0;
  });
  assert.equal(faltando.length, 0, 'funções chamadas pelo HTML e não definidas: ' + faltando.join(', '));

  // Nome definido duas vezes é pior que nome faltando: não dá erro em
  // lugar nenhum. A segunda definição substitui a primeira em silêncio, e
  // o botão que chamava a primeira passa a fazer outra coisa. Aconteceu
  // com abrirFicha, que era a ficha da equalização e virou a do
  // fornecedor — o botão antigo continuou lá, chamando a função errada.
  const definidas = {};
  let d;
  const reDef = /\bfunction\s+([a-zA-Z_$][\w$]*)\s*\(/g;
  while ((d = reDef.exec(js)) !== null) definidas[d[1]] = (definidas[d[1]] || 0) + 1;
  const duplicadas = Object.keys(definidas).filter(function (n) { return definidas[n] > 1; });
  assert.equal(duplicadas.length, 0,
    'funções definidas mais de uma vez (a última vence em silêncio): ' + duplicadas.join(', '));

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


// ─────────────────────────────────────────────────────────────
//  Correção 29 — a contratante das equalizações já gravadas
//
//  As 4 equalizações da base estão sem CNPJ_EMPRESA. Como a regra é
//  fechada (Curitiba é Demercado; Esteio e Itajaí são Capital Realty),
//  a correção deriva do Mega em vez de perguntar. O que este teste
//  protege é a parte perigosa: derivar errado assinaria o contrato com a
//  empresa errada, e não deixar rastro é pior que deixar vazio.
// ─────────────────────────────────────────────────────────────
try {
  const ctxM = vm.createContext({ Logger: { log: () => {} }, console: console });
  ['Util.gs', 'Config.gs', 'Equalizacao.gs', 'Manutencao.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxM, { filename: f });
  });

  // Toda grafia que aparece no acervo tem que cair no mesmo Mega.
  assert.equal(ctxM.cfMegaCanonico_('MEGA CENTRO LOGÍSTICO CURITIBA'), 'MEGA CENTRO LOGÍSTICO CURITIBA');
  assert.equal(ctxM.cfMegaCanonico_('Mega Curitiba'), 'MEGA CENTRO LOGÍSTICO CURITIBA');
  assert.equal(ctxM.cfMegaCanonico_('mega centro logistico esteio'), 'MEGA CENTRO LOGÍSTICO ESTEIO');
  assert.equal(ctxM.cfMegaCanonico_('Itajaí'), 'MEGA CENTRO LOGÍSTICO ITAJAÍ');
  assert.equal(ctxM.cfMegaCanonico_('Mega Sorocaba'), '',
    'Mega desconhecido não pode ser adivinhado');
  assert.equal(ctxM.cfMegaCanonico_(''), '');

  const gravadas = [];
  ctxM.cfLerTudo_ = () => ([
    { _linha: 2, ID: 'EQU-1', ID_EMPREENDIMENTO: 'MEGA CENTRO LOGÍSTICO CURITIBA', CNPJ_EMPRESA: '' },
    { _linha: 3, ID: 'EQU-2', ID_EMPREENDIMENTO: 'Mega Esteio',                    CNPJ_EMPRESA: '' },
    { _linha: 4, ID: 'EQU-3', ID_EMPREENDIMENTO: 'MEGA CENTRO LOGÍSTICO ITAJAÍ',   CNPJ_EMPRESA: '03015145000154' },
    { _linha: 5, ID: 'EQU-4', ID_EMPREENDIMENTO: 'Depósito Provisório',            CNPJ_EMPRESA: '' }
  ]);
  ctxM.cfAtualizarLinha_ = (aba, linha, campos) => gravadas.push({ aba, linha, campos });
  ctxM.cfLog_ = () => {};

  // Simular não pode tocar em nada.
  const simulado = ctxM.simularCorrecaoEmpresaDasEqualizacoes();
  assert.equal(gravadas.length, 0, 'a simulação gravou na planilha');
  assert.equal(simulado.corrigidas, 2);
  assert.equal(simulado.aplicado, false);

  const aplicado = ctxM.corrigirEmpresaDasEqualizacoes();
  assert.equal(aplicado.corrigidas, 2);
  assert.equal(gravadas.length, 2);

  const porLinha = {};
  gravadas.forEach(g => { porLinha[g.linha] = g.campos.CNPJ_EMPRESA; });
  assert.equal(porLinha[2], '08601964000105', 'Curitiba tem que ser Demercado');
  assert.equal(porLinha[3], '03015145000154', 'Esteio tem que ser Capital Realty');
  assert.equal(porLinha[4], undefined, 'equalização já correta não pode ser reescrita');
  assert.equal(porLinha[5], undefined, 'Mega não reconhecido não pode receber contratante chutada');
  assert.equal(aplicado.puladas, 1);

  console.log('✓ CORREÇÃO VERIFICADA: contratante das equalizações antigas deriva do Mega, e o desconhecido fica vazio');
} catch (e) {
  console.log(`✗ FALHA na Correção 29: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 30 — o dossiê de aprovação: scorecard, spread e o link
//
//  Três coisas que o documento passou a levar para quem homologa, e uma
//  armadilha de ordem.
//
//  A armadilha: o plano mandava aplicar o hyperlink durante a montagem da
//  grade. Só que a grade inteira é escrita depois, num setValues único, e
//  setValues devolve a célula a texto puro — o link seria criado e apagado
//  no mesmo request, sem erro nenhum. Só se descobre abrindo o PDF.
//  Por isso este teste afirma a ORDEM, não só o resultado.
// ─────────────────────────────────────────────────────────────
try {
  const ctxL = vm.createContext({ Logger: { log: () => {} }, console: console });

  const ordem = [];               // a sequência de operações na planilha
  let escrito = null;
  const linksAplicados = [];

  const faixaL = {
    setValues: (m) => { escrito = m; ordem.push('setValues'); return faixaL; },
    merge: () => faixaL,
    setRichTextValue: (v) => { ordem.push('setRichTextValue'); linksAplicados.push(v); return faixaL; }
  };
  ['setFontWeight','setFontSize','setHorizontalAlignment','setVerticalAlignment',
   'setBackground','setFontColor','setBorder','setNumberFormat','setWrap']
    .forEach(m => { faixaL[m] = () => faixaL; });

  const formatos = [];
  faixaL.setNumberFormat = (f) => { formatos.push(f); return faixaL; };

  const abaL = {
    setName: () => {}, setColumnWidth: () => {}, setRowHeight: () => {},
    getSheetId: () => 0, getRange: () => faixaL
  };

  ctxL.SpreadsheetApp = {
    create: () => ({ getSheets: () => [abaL], getId: () => 'SS1', getUrl: () => 'url-planilha' }),
    flush: () => {},
    BorderStyle: { SOLID: 'SOLID', SOLID_MEDIUM: 'SOLID_MEDIUM' },
    newRichTextValue: () => {
      const v = { texto: '', url: '' };
      const b = {
        setText: (t) => { v.texto = t; return b; },
        setLinkUrl: (u) => { v.url = u; return b; },
        build: () => v
      };
      return b;
    }
  };
  ctxL.DriveApp = {
    getFileById: () => ({ moveTo: () => {} }),
    getFolderById: () => ({ createFile: () => ({ getId: () => 'PDF1', getUrl: () => 'url-pdf' }) }),
    createFile: () => ({ getId: () => 'PDF1', getUrl: () => 'url-pdf' })
  };
  ctxL.ScriptApp = { getOAuthToken: () => 't' };
  ctxL.UrlFetchApp = {
    fetch: () => ({ getResponseCode: () => 200, getBlob: () => ({
      setName: function () { return this; },
      getBytes: () => new Array(9000).fill(0)
    }) })
  };
  ctxL.Utilities = { formatDate: () => '06/09/2026 10:00', getUuid: () => 'x' };

  ['Util.gs', 'Config.gs', 'Consulta.gs', 'Cnpj.gs', 'Equalizacao.gs', 'Exportar.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxL, { filename: f });
  });

  // ── O normalizador de link, antes de tudo: é ele que decide o que vira
  //    âncora clicável num PDF que circula fora da empresa.
  assert.equal(ctxL.cfLinkDoDrive_('https://drive.google.com/file/d/ABC/view'),
    'https://drive.google.com/file/d/ABC/view');
  assert.equal(ctxL.cfLinkDoDrive_('1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7'),
    'https://drive.google.com/file/d/1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7/view',
    'ID solto do Drive tem que virar URL');
  assert.equal(ctxL.cfLinkDoDrive_(''), '');
  assert.equal(ctxL.cfLinkDoDrive_('   '), '');
  assert.equal(ctxL.cfLinkDoDrive_('javascript:alert(1)'), '',
    'javascript: não pode virar link — o PDF circula fora da empresa');
  assert.equal(ctxL.cfLinkDoDrive_('data:text/html,<script>'), '');
  assert.equal(ctxL.cfLinkDoDrive_('drive.google.com/file/d/ABC'), '',
    'sem esquema não é URL: o navegador trataria como caminho relativo');

  // ── A tela precisa concordar com o servidor sobre o que é link válido.
  const htmlL = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');
  const mL = htmlL.match(/function linkDoDrive\(valor\)[\s\S]*?\n\}/);
  assert.ok(mL, 'linkDoDrive não foi encontrada na interface');
  const ctxTela = vm.createContext({});
  vm.runInContext(mL[0], ctxTela);
  ['https://x.com/a', '1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7', 'javascript:alert(1)', '', 'x.com/a']
    .forEach(function (entrada) {
      assert.equal(ctxTela.linkDoDrive(entrada), ctxL.cfLinkDoDrive_(entrada),
        'tela e servidor discordam sobre o link "' + entrada + '"');
    });

  // ── Uma equalização com dois proponentes, vencedor homologado e
  //    negociação: é o caso que o dossiê existe para resumir.
  ctxL.cfLerTudo_ = (n) => ({
    Equalizacoes: [{ ID: 'EQ1', ID_EMPREENDIMENTO: 'MEGA CENTRO LOGÍSTICO CURITIBA',
                     PROJETO: 'Limpeza', STATUS: 'homologada',
                     ID_PROPOSTA_VENCEDORA: 'P1', PARECER_FAVORAVEL: 'Menor prazo' }],
    Propostas: [
      { ID: 'P1', ID_EQUALIZACAO: 'EQ1', CNPJ: '11222333000181', ORDEM: 1,
        RAZAO_SOCIAL_INFORMADA: 'Alfa', VALOR_TOTAL_CALCULADO: 100,
        VALOR_PROPOSTA_INICIAL: 125, REDUCAO_NEGOCIADA: 25, VENCEDORA: true,
        CONDICOES_PAGAMENTO: '28 dias', LEAD_TIME_DIAS: 5,
        LINK_PROPOSTA: 'https://drive.google.com/file/d/PROPOSTA-ALFA/view' },
      { ID: 'P2', ID_EQUALIZACAO: 'EQ1', CNPJ: '11222333000262', ORDEM: 2,
        RAZAO_SOCIAL_INFORMADA: 'Beta', VALOR_TOTAL_CALCULADO: 130 }
    ],
    EAP: [{ ID: 'N1', ID_EQUALIZACAO: 'EQ1', ID_PAI: '', ORDEM: 1, TIPO: 'item', DESCRICAO: 'Soda' }],
    Precos: [
      { ID_EAP: 'N1', ID_PROPOSTA: 'P1', ID_EQUALIZACAO: 'EQ1', PRECO_UNITARIO: 100, VALOR_TOTAL: 100, STATUS_PRECO: 'cotado' },
      { ID_EAP: 'N1', ID_PROPOSTA: 'P2', ID_EQUALIZACAO: 'EQ1', PRECO_UNITARIO: 130, VALOR_TOTAL: 130, STATUS_PRECO: 'cotado' }
    ],
    Fornecedores: [], Pendencias: []
  })[n] || [];
  ctxL.cfDataTexto_ = () => '06/09/2026';
  ctxL.cfUsuario_ = () => 'guilherme.marques@capitalrealty.com.br';

  ctxL.cfExportarEqualizacao_('EQ1');
  const texto = escrito.map(l => l.join('|')).join('\n');

  // ── Scorecard
  assert.ok(texto.indexOf('PROPOSTA HOMOLOGADA') >= 0,
    'equalização homologada tem que abrir dizendo que foi homologada');
  assert.ok(texto.indexOf('Economia na disputa:') >= 0, 'faltou a economia da disputa');
  assert.ok(texto.indexOf('Economia na negociação:') >= 0, 'faltou a economia da negociação');
  // Duas porcentagens diferentes convivem no documento, e a base de cada
  // uma decide se o número faz sentido:
  //   economia na disputa = 30/130 = 23,1% — do que se deixou de gastar
  //   variação sobre o menor = 30/100 = +30,0% — quanto o outro é mais caro
  // Trocar as bases é o erro clássico de relatório de saving, e é
  // sempre para mais: 30% soa melhor que 23% na apresentação.
  assert.ok(texto.indexOf('23,1% abaixo da proposta mais cara (R$ 130,00)') >= 0,
    'a economia da disputa tem que ser sobre a proposta mais cara (30/130), não sobre a vencedora');

  // O scorecard vem ANTES do cadastro: quem homologa lê para conferir, não
  // para descobrir.
  assert.ok(escrito.findIndex(l => l.join('|').indexOf('PROPOSTA HOMOLOGADA') >= 0) <
            escrito.findIndex(l => l.join('|').indexOf('INFORMAÇÕES OBRIGATÓRIAS') >= 0),
    'o resumo tem que vir antes das informações obrigatórias');

  // ── Spread: quanto o segundo está acima do menor
  const lSpread = escrito.filter(l => l[1] === 'Variação sobre o menor')[0];
  assert.ok(lSpread, 'faltou a linha de variação sobre o menor');
  const valoresSpread = lSpread.filter(v => typeof v === 'number');
  // Comparado com tolerância, não com igualdade: (130-100)/100 dá
  // 0.30000000000000004 em ponto flutuante. O formato de percentual
  // arredonda para +30,0% na tela, mas o teste veria a diferença.
  assert.equal(valoresSpread.length, 2, 'o spread tem que sair para os dois proponentes');
  assert.equal(valoresSpread[0], 0, 'o menor preço é a base: variação zero');
  assert.ok(Math.abs(valoresSpread[1] - 0.3) < 1e-9,
    'quem cotou 130 contra 100 está 30% acima, e saiu ' + valoresSpread[1]);
  assert.ok(formatos.indexOf('+0.0%;-0.0%;0.0%') >= 0,
    'a variação precisa de formato de percentual, senão sai 0,3 em vez de +30,0%');

  // ── Alçadas
  ['HOMOLOGAÇÃO', 'Elaborado por (Suprimentos):', 'Parecer técnico (Gestor da área):',
   'Homologação (Diretoria Executiva):', '(   ) Aprovado'].forEach(function (t) {
    assert.ok(texto.indexOf(t) >= 0, 'faltou o quadro de alçadas: "' + t + '"');
  });

  // ── O link: aplicado, correto, e DEPOIS do setValues
  assert.equal(linksAplicados.length, 1, 'o link da proposta não foi aplicado');
  assert.equal(linksAplicados[0].url, 'https://drive.google.com/file/d/PROPOSTA-ALFA/view');
  assert.equal(linksAplicados[0].texto, 'Abrir proposta ↗');
  // lastIndexOf, não indexOf: o que quebra o link é QUALQUER setValues
  // depois dele, inclusive um acrescentado sem querer numa mudança
  // futura. Comparar com o primeiro deixaria essa porta aberta.
  assert.ok(ordem.lastIndexOf('setValues') < ordem.indexOf('setRichTextValue'),
    'houve setValues depois do rich text — ele devolve a célula a texto puro e o link some');
  assert.ok(texto.indexOf('Proposta original:') >= 0,
    'a linha da proposta original tem que existir mesmo antes do rich text');

  // Quem não mandou link fica com o travessão, não com célula vazia
  // ambígua nem com o link do vizinho.
  const lLink = escrito.filter(l => l[1] === 'Proposta original:')[0];
  assert.ok(lLink.indexOf('—') >= 0, 'proponente sem link tem que mostrar travessão');

  console.log('✓ CORREÇÃO VERIFICADA: dossiê de aprovação — resumo, spread, alçadas e link clicável na ordem certa');
} catch (e) {
  console.log(`✗ FALHA na Correção 30: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 31 — ergonomia da grade: cabeçalho fixo, menor preço ao
//  vivo e rascunho por contexto
// ─────────────────────────────────────────────────────────────
try {
  const html31 = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');

  // ── Cabeçalho congelado.
  //
  //  Aqui a verificação é no fonte, e não por comportamento, porque não há
  //  comportamento a executar: é CSS. O que se afirma é o PAR — sticky sem
  //  altura limitada no container nunca gruda, porque o scrollport não
  //  rola. O projeto já tinha aprendido isso na tabela do mapa e não tinha
  //  aplicado na grade de edição.
  const mRolo = html31.match(/\.grade-rolo\{[^}]*\}/);
  assert.ok(mRolo, '.grade-rolo não foi encontrada');
  assert.ok(/max-height:\s*\d+/.test(mRolo[0]),
    '.grade-rolo sem max-height: o container não rola e o thead sticky nunca gruda');
  assert.ok(/overflow:\s*auto/.test(mRolo[0]),
    '.grade-rolo precisa rolar nos dois eixos');

  const mThead = html31.match(/table\.grade thead th\{[^}]*\}/);
  assert.ok(mThead, 'a regra do thead da grade não foi encontrada');
  assert.ok(/position:sticky/.test(mThead[0]) && /top:0/.test(mThead[0]),
    'o cabeçalho da grade não está congelado no topo');
  assert.ok(/background:#fff/.test(mThead[0]),
    'cabeçalho sticky sem fundo opaco deixa a linha de baixo aparecer através dele');

  // O canto (Código e Descrição no cabeçalho) fica acima do cabeçalho E
  // das colunas fixas do corpo, senão some atrás de um dos dois ao rolar.
  const mCanto = html31.match(/table\.grade thead th\.col-cod,\s*\n\s*table\.grade thead th\.col-desc \{[^}]*\}/);
  assert.ok(mCanto, 'a regra do canto congelado não foi encontrada');
  const zCanto = Number((mCanto[0].match(/z-index:(\d+)/) || [])[1]);
  const zThead = Number((mThead[0].match(/z-index:(\d+)/) || [])[1]);
  assert.ok(zCanto > zThead,
    'o canto (z-index ' + zCanto + ') tem que ficar acima do resto do cabeçalho (z-index ' + zThead + ')');

  // ── Menor preço da linha, enquanto se digita.
  const ctx31 = vm.createContext({ console: console });
  ['function num(', 'function marcarMenoresDaLinha('].forEach(function (assinatura) {
    const i = html31.indexOf(assinatura);
    assert.ok(i >= 0, assinatura + ' não encontrada na interface');
    // Recorta até a primeira chave de fechamento em coluna zero.
    const fim = html31.indexOf('\n}', i);
    vm.runInContext(html31.slice(i, fim + 2), ctx31);
  });

  const marcados = {};
  ctx31.document = {
    querySelectorAll: function (sel) {
      const l = Number(sel.match(/data-l="(\d+)"/)[1]);
      const quantos = ctx31.itens[l].precos.length;
      const campos = [];
      for (let j = 0; j < quantos; j++) {
        campos.push({
          classList: {
            toggle: function (cls, ligado) { marcados[l + ':' + j] = !!ligado; }
          }
        });
      }
      return campos;
    }
  };

  //   item 0: A 5,00 · B 4,00        → B é o menor
  //   item 1: A 9,00 · B 9,00        → empate, marca os dois
  //   item 2: A 3,00 · B em branco   → sem disputa, não marca
  //   item 3: A 0,00 · B 4,00        → zero é preço, não ausência
  ctx31.itens = [
    { tipo: 'item', quantidade: '10', precos: ['5,00', '4,00'] },
    { tipo: 'item', quantidade: '1',  precos: ['9,00', '9,00'] },
    { tipo: 'item', quantidade: '2',  precos: ['3,00', ''] },
    { tipo: 'item', quantidade: '1',  precos: ['0,00', '4,00'] }
  ];
  ctx31.marcarMenoresDaLinha();

  assert.equal(marcados['0:0'], false, 'marcou o preço mais caro da linha');
  assert.equal(marcados['0:1'], true,  'não marcou o menor preço da linha');
  assert.equal(marcados['1:0'], true,  'empate tem que marcar os dois');
  assert.equal(marcados['1:1'], true,  'empate tem que marcar os dois');
  assert.equal(marcados['2:0'], false, 'preço sozinho não é o menor de nada: não houve comparação');

  // Zero é um preço — item de brinde, item já contratado. Tratá-lo como
  // campo vazio esconderia justamente a linha mais barata da cotação.
  assert.equal(marcados['3:0'], true,  'zero é preço cotado, não campo em branco');
  assert.equal(marcados['3:1'], false, 'com um zero na linha, 4,00 não é o menor');

  // Grupo não é linha de preço.
  ctx31.itens = [{ tipo: 'grupo', quantidade: '', precos: ['1,00', '2,00'] }];
  ctx31.baseValores = () => 'unitario';
  ctx31.marcarMenoresDaLinha();
  assert.equal(marcados['0:0'], false, 'linha de grupo não tem menor preço');
  assert.equal(marcados['0:1'], false, 'linha de grupo não tem menor preço');

  // ── Rascunho por contexto.
  const iChave = html31.indexOf('function chaveRascunho(');
  assert.ok(iChave >= 0, 'chaveRascunho não encontrada');
  const ctxR = vm.createContext({ CHAVE_RASCUNHO: 'cf_rascunho_v1', idEmEdicao: null });
  vm.runInContext(html31.slice(iChave, html31.indexOf('\n}', iChave) + 2), ctxR);

  assert.equal(ctxR.chaveRascunho(), 'cf_rascunho_v1');
  vm.runInContext("idEmEdicao = 'EQU-2026-0007'", ctxR);
  assert.equal(ctxR.chaveRascunho(), 'cf_rascunho_edicao_EQU-2026-0007',
    'editar uma equalização tem que usar chave própria, senão sobrescreve a cotação nova');
  vm.runInContext("idEmEdicao = 'EQU-2026-0008'", ctxR);
  assert.notEqual(ctxR.chaveRascunho(), 'cf_rascunho_edicao_EQU-2026-0007',
    'duas equalizações em edição não podem dividir o mesmo rascunho');

  // A ordem importa: descartar depois de zerar idEmEdicao apagaria a chave
  // errada e deixaria o rascunho da edição órfão no navegador para sempre.
  const iLimpar = html31.indexOf('function limparFormulario(');
  const corpoLimpar = html31.slice(iLimpar, html31.indexOf('\n}', iLimpar));
  assert.ok(corpoLimpar.indexOf('descartarRascunho()') < corpoLimpar.indexOf('idEmEdicao = null'),
    'limparFormulario descarta o rascunho depois de zerar idEmEdicao — apaga a chave errada');

  // E editar precisa de fato salvar: o return antecipado deixava a
  // renegociação inteira sem rede.
  const iSalvar = html31.indexOf('function salvarRascunho(');
  const corpoSalvar = html31.slice(iSalvar, html31.indexOf('\n}', iSalvar));
  assert.ok(corpoSalvar.indexOf('if (idEmEdicao) return;') < 0,
    'salvarRascunho ainda desiste quando está editando: a renegociação fica sem rascunho');

  console.log('✓ CORREÇÃO VERIFICADA: cabeçalho fixo, menor preço da linha ao vivo e rascunho por contexto');
} catch (e) {
  console.log(`✗ FALHA na Correção 31: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 32 — a medição de tempo, que é o dado que falta
//
//  O que este teste protege não é o cálculo: é a recusa a registrar
//  número ruim. Uma média envenenada por uma aba esquecida aberta a noite
//  toda é pior que nenhuma média, porque parece dado.
// ─────────────────────────────────────────────────────────────
try {
  const ctxT = vm.createContext({ Logger: { log: () => {} }, console: console });
  ['Util.gs', 'Config.gs', 'Equalizacao.gs', 'Manutencao.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxT, { filename: f });
  });

  const registros = [];
  ctxT.cfLog_ = (acao, entidade, alvo, detalhe) => registros.push({ acao, alvo, detalhe });

  // ── O que entra
  ctxT.cfRegistrarTempo_('EQ1', 600, 3, 12, false);
  assert.equal(registros.length, 1, 'medição plausível não foi registrada');
  assert.equal(registros[0].acao, 'tempo_equalizacao');
  const d = JSON.parse(registros[0].detalhe);
  assert.equal(d.segundos, 600);
  assert.equal(d.nos, 12);
  assert.equal(d.proponentes, 3,
    'o tamanho tem que ir junto: "10 minutos" sozinho não se compara com nada');

  // ── O que não entra
  registros.length = 0;
  ctxT.cfRegistrarTempo_('EQ2', 5, 3, 12, false);
  assert.equal(registros.length, 0, '5 segundos é gerador de exemplo, não trabalho medido');

  ctxT.cfRegistrarTempo_('EQ3', 40000, 3, 12, false);
  assert.equal(registros.length, 0, 'aba esquecida aberta a noite toda envenenaria a média');

  ctxT.cfRegistrarTempo_('EQ4', null, 3, 12, false);
  assert.equal(registros.length, 0, 'tela antiga não manda o tempo: ausência não é zero');

  ctxT.cfRegistrarTempo_('EQ5', undefined, 3, 12, false);
  assert.equal(registros.length, 0);

  // Registrar tempo nunca pode derrubar a gravação da equalização.
  ctxT.cfLog_ = () => { throw new Error('Log indisponível'); };
  assert.doesNotThrow(() => ctxT.cfRegistrarTempo_('EQ6', 600, 3, 12, false),
    'falha ao registrar o tempo não pode derrubar a gravação');

  // ── Mediana, e não média: com poucas medições uma equalização atípica
  //    desloca a média inteira e não desloca a mediana.
  assert.equal(ctxT.cfMediana_([300, 600, 3000]), 600,
    'a mediana de 5/10/50 minutos é 10, não os 21 da média');
  assert.equal(ctxT.cfMediana_([100, 200]), 150);
  assert.equal(ctxT.cfMediana_([]), null);
  assert.equal(ctxT.cfMediana_([42]), 42);

  // ── A linha de base do Excel entra por mão, e recusa entrada inválida.
  const regB = [];
  ctxT.cfLog_ = (acao, entidade, alvo, detalhe) => regB.push({ acao, detalhe });
  ctxT.registrarTempoNaPlanilha(47, '12 itens, 3 proponentes');
  assert.equal(regB.length, 1);
  assert.equal(regB[0].acao, 'tempo_planilha');
  assert.equal(JSON.parse(regB[0].detalhe).segundos, 2820, '47 minutos são 2820 segundos');

  regB.length = 0;
  ctxT.registrarTempoNaPlanilha(0, 'x');
  ctxT.registrarTempoNaPlanilha(-5, 'x');
  ctxT.registrarTempoNaPlanilha('', 'x');
  assert.equal(regB.length, 0, 'minutos ausentes ou negativos não podem virar linha de base');

  // ── O front manda os segundos decorridos, não a hora de início.
  //
  //  Enviar a hora do cliente e subtrair da hora do servidor misturaria
  //  dois relógios: uma estação com o horário errado produziria durações
  //  negativas ou de horas. A diferença entre dois instantes do MESMO
  //  relógio não tem esse problema.
  const htmlT = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');
  const iSeg = htmlT.indexOf('function segundosDecorridos(');
  assert.ok(iSeg >= 0, 'segundosDecorridos não encontrada na interface');
  const ctxS = vm.createContext({ inicioPreenchimento: null, Date: Date, Math: Math });
  vm.runInContext(htmlT.slice(iSeg, htmlT.indexOf('\n}', iSeg) + 2), ctxS);
  assert.equal(ctxS.segundosDecorridos(), null, 'sem início marcado não há tempo a informar');
  vm.runInContext('inicioPreenchimento = Date.now() - 65000', ctxS);
  const s = ctxS.segundosDecorridos();
  assert.ok(s >= 64 && s <= 66, 'os segundos decorridos saíram errados: ' + s);

  assert.ok(htmlT.indexOf('segundosPreenchimento: segundosDecorridos()') >= 0,
    'o tempo não está sendo enviado na gravação');

  console.log('✓ CORREÇÃO VERIFICADA: tempo por equalização é medido, e medição implausível é recusada');
} catch (e) {
  console.log(`✗ FALHA na Correção 32: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 33 — colar um bloco do Excel, e o teclado no autocomplete
//
//  Os dois últimos itens da Fase 2. O da colagem é o que tem casos de
//  borda de verdade: bloco mais largo que a cotação, linha final vazia
//  que o Excel sempre acrescenta, e célula única, que precisa continuar
//  colando do jeito normal do navegador.
// ─────────────────────────────────────────────────────────────
try {
  const html33 = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');

  const recortar = function (assinatura) {
    const i = html33.indexOf(assinatura);
    assert.ok(i >= 0, assinatura + ' não encontrada');
    return html33.slice(i, html33.indexOf('\n}', i) + 2);
  };

  const ctx33 = vm.createContext({ console: console, Math: Math, Number: Number, String: String });
  ['function num(', 'function linhasComPreco(', 'function colarColuna(']
    .forEach(function (a) { vm.runInContext(recortar(a), ctx33); });

  // Dublês do que a colagem toca.
  let redesenhou = 0, salvou = 0, mensagem = '';
  ctx33.desenharGrade = function () { redesenhou++; };
  ctx33.salvarRascunho = function () { salvou++; };
  ctx33.document = {
    getElementById: function () { return { set innerHTML(v) { mensagem = v; } }; }
  };
  ctx33.addItem = function () {
    ctx33.itens.push({ tipo: 'item', descricao: '', quantidade: '', unidade: 'un',
                       precos: ctx33.proponentes.map(function () { return ''; }) });
  };
  ctx33.window = {};

  const colar = function (texto, l, c) {
    let impediu = false;
    ctx33.colarColuna({
      clipboardData: { getData: function () { return texto; } },
      preventDefault: function () { impediu = true; }
    }, { dataset: { l: String(l), c: String(c) } });
    return impediu;
  };

  const partida = function () {
    ctx33.proponentes = [{ nome: 'A' }, { nome: 'B' }, { nome: 'C' }];
    ctx33.itens = [
      { tipo: 'grupo', descricao: 'MATERIAIS', precos: ['', '', ''] },
      { tipo: 'item', descricao: 'Café',  quantidade: '1', precos: ['', '', ''] },
      { tipo: 'item', descricao: 'Papel', quantidade: '1', precos: ['', '', ''] }
    ];
  };

  // ── Bloco 2x2 a partir da primeira coluna
  partida();
  assert.equal(colar('10,00\t12,00\n20,00\t22,00', 1, 0), true,
    'colagem de bloco tem que impedir o comportamento padrão do navegador');
  assert.equal(ctx33.itens[1].precos[0], '10,00');
  assert.equal(ctx33.itens[1].precos[1], '12,00');
  assert.equal(ctx33.itens[2].precos[0], '20,00');
  assert.equal(ctx33.itens[2].precos[1], '22,00');
  assert.equal(ctx33.itens[1].precos[2], '', 'coluna não colada não pode ser tocada');
  assert.equal(ctx33.itens[0].precos[0], '', 'linha de grupo não recebe preço');

  // ── Uma coluna só continua funcionando como antes
  partida();
  colar('5,00\n7,00', 1, 2);
  assert.equal(ctx33.itens[1].precos[2], '5,00');
  assert.equal(ctx33.itens[2].precos[2], '7,00');
  assert.equal(ctx33.itens[1].precos[0], '', 'colagem de coluna não pode espalhar para os lados');

  // ── Célula única: o navegador cola sozinho
  partida();
  assert.equal(colar('9,90', 1, 0), false,
    'uma célula só tem que deixar o navegador colar normalmente');

  // ── A linha vazia final que o Excel sempre acrescenta não vira item
  partida();
  colar('1,00\t2,00\n3,00\t4,00\n', 1, 0);
  assert.equal(ctx33.itens.length, 3, 'a linha vazia do fim do Excel virou item novo');

  // ── Bloco mais alto que a grade cria as linhas que faltam
  partida();
  colar('1,00\n2,00\n3,00\n4,00', 1, 0);
  assert.equal(ctx33.itens.length, 5, 'faltou criar as linhas para o que sobrou');
  assert.equal(ctx33.itens[4].precos[0], '4,00');

  // ── Bloco mais largo que a cotação: avisa, não inventa proponente
  //
  //  Proponente anônimo com preços é pior que preço faltando — ele entra
  //  no comparativo e pode até ganhar.
  partida();
  colar('1,00\t2,00\t3,00\t4,00\n5,00\t6,00\t7,00\t8,00', 1, 0);
  assert.equal(ctx33.proponentes.length, 3, 'a colagem criou proponente que ninguém pediu');
  assert.equal(ctx33.itens[1].precos[2], '3,00');
  assert.ok(mensagem.indexOf('ficou de fora') >= 0 || mensagem.indexOf('ficaram') >= 0,
    'colar mais colunas do que cabe tem que avisar; a mensagem foi: ' + mensagem);

  // ── Colar no meio respeita a coluna de partida
  partida();
  colar('7,00\t8,00', 1, 1);
  assert.equal(ctx33.itens[1].precos[0], '', 'colou à esquerda da célula de partida');
  assert.equal(ctx33.itens[1].precos[1], '7,00');
  assert.equal(ctx33.itens[1].precos[2], '8,00');

  // ── Separador decimal: o mesmo num() do resto da tela
  partida();
  colar('1.234,56\t1234.56', 1, 0);
  assert.equal(ctx33.itens[1].precos[0], '1.234,56');
  assert.equal(ctx33.itens[1].precos[1], '1.234,56',
    'o formato americano tem que virar o brasileiro na gravação');

  // ── Autocomplete por teclado
  const ctxN = vm.createContext({ console: console, Array: Array, Object: Object });
  ['function navegarSugestoes(', 'function fecharSugestoes(', 'function marcarAriaExpandido(']
    .forEach(function (a) { vm.runInContext(recortar(a), ctxN); });

  const opcoes = [0, 1, 2].map(function () {
    return {
      classList: { ativa: false,
        toggle: function (c, v) { this.ativa = v; } },
      atributos: {},
      setAttribute: function (k, v) { this.atributos[k] = v; },
      scrollIntoView: function () {}
    };
  });
  let escolhido = null, fechou = false;
  ctxN.escolherFornecedor = function (i, k) { escolhido = k; };
  ctxN.sugestoesAbertas = { 0: [{}, {}, {}] };
  ctxN.sugestaoAtiva = {};
  ctxN.document = {
    getElementById: function (id) {
      if (id === 'sug0') {
        return { hidden: false, querySelectorAll: function () { return opcoes; },
                 set hidden2(v) {} };
      }
      return { setAttribute: function () {} };
    }
  };

  const tecla = function (k) {
    let impediu = false;
    ctxN.navegarSugestoes({ key: k, preventDefault: function () { impediu = true; } }, 0);
    return impediu;
  };

  // Enter sem nada destacado não escolhe: o comprador pode estar só
  // confirmando o nome que digitou.
  assert.equal(tecla('Enter'), false, 'Enter sem destaque não pode escolher fornecedor');
  assert.equal(escolhido, null);

  assert.equal(tecla('ArrowDown'), true, 'a seta tem que impedir a rolagem da página');
  assert.equal(ctxN.sugestaoAtiva[0], 0);
  assert.equal(opcoes[0].classList.ativa, true);
  assert.equal(opcoes[0].atributos['aria-selected'], 'true');

  tecla('ArrowDown'); tecla('ArrowDown');
  assert.equal(ctxN.sugestaoAtiva[0], 2);
  tecla('ArrowDown');
  assert.equal(ctxN.sugestaoAtiva[0], 0, 'passando do fim, a seta volta ao começo');
  tecla('ArrowUp');
  assert.equal(ctxN.sugestaoAtiva[0], 2, 'no começo, a seta para cima vai ao fim');

  assert.equal(tecla('Enter'), true);
  assert.equal(escolhido, 2, 'Enter tem que escolher a opção destacada');

  console.log('✓ CORREÇÃO VERIFICADA: colagem de bloco do Excel e navegação por teclado nas sugestões');
} catch (e) {
  console.log(`✗ FALHA na Correção 33: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 34 — a categoria do fornecedor vem do que ele cotou
//
//  A primeira versão tirava a categoria do fornecedor só das
//  equalizações que ele disputou. Como a maior parte do acervo é
//  orçamento avulso, quase todo fornecedor ficava sem categoria nenhuma
//  — e um filtro por categoria numa lista onde ninguém tem categoria é
//  um filtro que só faz a tela parecer quebrada.
// ─────────────────────────────────────────────────────────────
try {
  const ctxF = vm.createContext({ Logger: { log: () => {} }, console: console });
  ['Util.gs', 'Config.gs', 'Cnpj.gs', 'Equalizacao.gs', 'Fornecedores.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctxF, { filename: f });
  });

  // ── CNAE → categoria
  assert.equal(ctxF.cfCategoriaPorCnae_('4321-5/00 — Instalação e manutenção elétrica'),
    'Material de Construção');
  assert.equal(ctxF.cfCategoriaPorCnae_('8121400'), 'Serviços & Facilities');
  assert.equal(ctxF.cfCategoriaPorCnae_('4761-0/03'), 'Material de Consumo');
  assert.equal(ctxF.cfCategoriaPorCnae_('6209-1/00'), 'Tecnologia & Segurança');
  assert.equal(ctxF.cfCategoriaPorCnae_('7732-2/01'), 'Equipamentos & Locação');
  assert.equal(ctxF.cfCategoriaPorCnae_('0111-3/01'), '', 'CNAE não mapeado não pode virar categoria');
  assert.equal(ctxF.cfCategoriaPorCnae_(''), '');
  assert.equal(ctxF.cfCategoriaPorCnae_('abc'), '');

  // ── Subcategoria dentro da categoria
  assert.equal(
    ctxF.cfSubcategoriaDerivada_(['Detergente neutro 5L', 'Água sanitária 2L', 'Saco de lixo 100L'],
      'Material de Consumo'),
    'Higiene & Limpeza');
  assert.equal(
    ctxF.cfSubcategoriaDerivada_(['Cabo flexível 2,5mm', 'Disjuntor bipolar', 'Luminária LED 40W'],
      'Material de Construção'),
    'Elétrica & Iluminação');
  assert.equal(ctxF.cfSubcategoriaDerivada_(['Item genérico'], 'Material de Consumo'), '',
    'sem palavra reconhecida não se inventa subcategoria');
  // Empate fica em branco. Um fornecedor que vende café E detergente
  // atende as duas coisas; rotulá-lo de uma delas esconde a outra de
  // quem filtrar — e a etiqueta errada não se distingue da certa.
  assert.equal(
    ctxF.cfSubcategoriaDerivada_(['Café em pó 500g', 'Detergente neutro'], 'Material de Consumo'), '',
    'empate entre subcategorias tem que ficar sem subcategoria');
  assert.equal(ctxF.cfSubcategoriaDerivada_(['Café em pó'], 'Categoria Que Não Existe'), '');

  // ── A categoria do fornecedor: três fontes, nesta ordem
  //
  //  1. Só orçamentos avulsos — é o caso da maioria do acervo. Sem isto,
  //     estes fornecedores não teriam categoria nenhuma.
  const soItens = ctxF.cfCategoriasDoFornecedor_({}, [
    'Papel higiênico folha dupla', 'Detergente neutro', 'Sabão em pó',
    'Desinfetante 5L', 'Saco de lixo 60L'
  ], '');
  assert.equal(soItens.principal, 'Material de Consumo');
  assert.equal(soItens.origem, 'itens');

  //  2. Sem itens reconhecidos, o CNAE decide — e fica marcado como tal,
  //     porque é o que a empresa declarou na abertura, não o que vende.
  const soCnae = ctxF.cfCategoriasDoFornecedor_({}, ['Serviço conforme proposta'], '4321-5/00');
  assert.equal(soCnae.principal, 'Material de Construção');
  assert.equal(soCnae.origem, 'cnae');

  //  3. O que ele cotou ganha do CNAE. Um atacadista com CNAE de papelaria
  //     que só cota material elétrico atende elétrica, não papelaria.
  const itensGanham = ctxF.cfCategoriasDoFornecedor_({}, [
    'Cabo flexível 2,5mm', 'Disjuntor DIN 25A', 'Eletroduto 3/4',
    'Luminária LED', 'Tomada 2P+T'
  ], '4761-0/03');
  assert.equal(itensGanham.principal, 'Material de Construção',
    'o CNAE não pode ganhar do que o fornecedor cotou de fato');

  //  4. A equalização pesa mais que item solto: é categoria já decidida.
  const comEq = ctxF.cfCategoriasDoFornecedor_({ 'Serviços & Facilities': 2 },
    ['Papel higiênico', 'Detergente'], '');
  assert.equal(comEq.principal, 'Serviços & Facilities');

  //  5. Sem nada: sem categoria. Melhor vazio que chute.
  const nada = ctxF.cfCategoriasDoFornecedor_({}, [], '');
  // length, e não deepEqual: o array nasce dentro do vm e tem outro
  // Array.prototype, então a comparação estrita reprova dois vazios.
  assert.equal(nada.lista.length, 0);
  assert.equal(nada.principal, '');

  //  6. Categoria com uma menção solta entre dezenas é ruído e não entra
  //     na lista — senão um fornecedor de limpeza que cotou um cabo uma
  //     vez apareceria no filtro de elétrica.
  const ruido = ctxF.cfCategoriasDoFornecedor_({}, [
    'Detergente', 'Sabão em pó', 'Desinfetante', 'Papel higiênico',
    'Saco de lixo', 'Água sanitária', 'Esponja', 'Vassoura', 'Rodo',
    'Pano de chão', 'Álcool 70', 'Luva de látex',
    'Cabo flexível 2,5mm'
  ], '');
  assert.equal(ruido.principal, 'Material de Consumo');
  assert.equal(ruido.lista.indexOf('Material de Construção'), -1,
    'um item solto de outra categoria não pode listar o fornecedor nela');

  // ── A ficha lê a coluna certa do cadastro
  //
  //  Ela lia cad.CNAE, e a coluna chama CNAE_PRINCIPAL: o CNAE nunca
  //  aparecia para ninguém, e o campo parecia vazio no cadastro.
  const src = fs.readFileSync(path.join(root, 'app', 'Fornecedores.gs'), 'utf8');
  assert.ok(src.indexOf('cad.CNAE ||') < 0,
    'Fornecedores.gs voltou a ler cad.CNAE — a coluna é CNAE_PRINCIPAL');

  // ── A contagem das pílulas conta fornecedores, não equalizações
  ctxF.cfLerTudo_ = (n) => ({
    Fornecedores: [
      { CNPJ: '11111111000111', RAZAO_SOCIAL: 'Limpa Tudo', CNAE_PRINCIPAL: '4649-4/08' },
      { CNPJ: '22222222000122', RAZAO_SOCIAL: 'Elétrica Boa',  CNAE_PRINCIPAL: '4321-5/00' }
    ],
    Equalizacoes: [],
    Propostas: [
      { ID: 'P1', ID_EQUALIZACAO: '', CNPJ: '11111111000111', RAZAO_SOCIAL_INFORMADA: 'Limpa Tudo' },
      { ID: 'P2', ID_EQUALIZACAO: '', CNPJ: '22222222000122', RAZAO_SOCIAL_INFORMADA: 'Elétrica Boa' }
    ],
    EAP: [
      { ID: 'N1', DESCRICAO: 'Detergente neutro 5L' },
      { ID: 'N2', DESCRICAO: 'Sabão em pó 1kg' },
      { ID: 'N3', DESCRICAO: 'Cabo flexível 2,5mm' },
      { ID: 'N4', DESCRICAO: 'Disjuntor DIN 25A' }
    ],
    Precos: [
      { ID_PROPOSTA: 'P1', ID_EAP: 'N1', PRECO_UNITARIO: 10 },
      { ID_PROPOSTA: 'P1', ID_EAP: 'N2', PRECO_UNITARIO: 12 },
      { ID_PROPOSTA: 'P2', ID_EAP: 'N3', PRECO_UNITARIO: 3 },
      { ID_PROPOSTA: 'P2', ID_EAP: 'N4', PRECO_UNITARIO: 30 }
    ]
  })[n] || [];
  ctxF.cfDataTexto_ = () => '06/09/2026';

  const lista = ctxF.cfFornecedores_('');
  assert.equal(lista.length, 2);

  const limpa = lista.filter(function (f) { return f.cnpj === '11111111000111'; })[0];
  assert.equal(limpa.categoriaPrincipal, 'Material de Consumo',
    'fornecedor só com orçamento avulso continuou sem categoria');
  assert.equal(limpa.subcategoria, 'Higiene & Limpeza');
  assert.equal(limpa.cnae, '4649-4/08', 'o CNAE não chegou à tela');

  const eletrica = lista.filter(function (f) { return f.cnpj === '22222222000122'; })[0];
  assert.equal(eletrica.categoriaPrincipal, 'Material de Construção');
  assert.equal(eletrica.subcategoria, 'Elétrica & Iluminação');

  // O filtro por categoria devolve só quem atende aquela categoria.
  assert.equal(ctxF.cfFornecedores_('Material de Consumo').length, 1);
  assert.equal(ctxF.cfFornecedores_('Tecnologia & Segurança').length, 0);

  const contagem = ctxF.cfCategoriasDeFornecedores_();
  assert.equal(contagem.total, 2);
  const consumo = contagem.categorias.filter(function (c) { return c.nome === 'Material de Consumo'; })[0];
  assert.equal(consumo.n, 1, 'a pílula da tela de fornecedores conta fornecedores, não equalizações');

  console.log('✓ CORREÇÃO VERIFICADA: categoria do fornecedor sai do que ele cotou, com CNAE como reforço');
} catch (e) {
  console.log(`✗ FALHA na Correção 34: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 35 (P0-1) — edição de equalização homologada revoga homologação,
//  reabre para 'em_negociacao' e preserva IDs de propostas de mesmo CNPJ
// ─────────────────────────────────────────────────────────────
try {
  const ctx35 = vm.createContext({ Logger: { log: () => {} }, console: console });
  ['Util.gs', 'Config.gs', 'Schema.gs', 'Persistencia.gs', 'Cnpj.gs', 'Equalizacao.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctx35, { filename: f });
  });

  const ID_EQ = 'EQU-HOMOLOGADA-TESTE';
  const agora = new Date(2026, 8, 1, 10, 0, 0);
  const tabelas = {
    Equalizacoes: [{
      ID: ID_EQ,
      CNPJ_EMPRESA: '03015145000154',
      ID_EMPREENDIMENTO: 'MEGA CENTRO LOGÍSTICO CURITIBA',
      PROJETO: 'Pintura',
      AREA: 'Facilities',
      DATA_EQUALIZACAO: agora,
      STATUS: 'homologada',
      ORIGEM: 'app',
      ID_PROPOSTA_VENCEDORA: 'PRP-ORIG-1',
      CNPJ_VENCEDOR: '11222333000181',
      VALOR_FINAL: 1500,
      PARECER_FAVORAVEL: 'Menor preço homologado.',
      CRIADO_POR: 'usuario@capitalrealty.com.br',
      CRIADO_EM: agora
    }],
    Propostas: [
      { ID: 'PRP-ORIG-1', ID_EQUALIZACAO: ID_EQ, CNPJ: '11222333000181', ORDEM: 1, VENCEDORA: true },
      { ID: 'PRP-ORIG-2', ID_EQUALIZACAO: ID_EQ, CNPJ: '44555666000192', ORDEM: 2, VENCEDORA: false }
    ],
    EAP: [
      { ID: 'EAP-1', ID_EQUALIZACAO: ID_EQ, ORDEM: 1, TIPO: 'item', DESCRICAO: 'Pintura Epóxi' }
    ],
    Precos: [
      { ID: 'PRC-1', ID_EQUALIZACAO: ID_EQ, ID_EAP: 'EAP-1', ID_PROPOSTA: 'PRP-ORIG-1', PRECO_UNITARIO: 1500 }
    ],
    Fornecedores: []
  };

  ctx35.cfLerTudo_ = (n) => (tabelas[n] ? JSON.parse(JSON.stringify(tabelas[n])) : []);
  ctx35.cfInserir_ = (aba, linhas) => { tabelas[aba] = (tabelas[aba] || []).concat(linhas); };
  ctx35.cfApagarPor_ = (aba, campo, valor) => {
    if (tabelas[aba]) {
      tabelas[aba] = tabelas[aba].filter(r => String(r[campo]) !== String(valor));
    }
  };
  ctx35.cfComTrava_ = (fn) => fn();
  ctx35.cfUsuario_ = () => 'usuario@capitalrealty.com.br';
  ctx35.cfLog_ = () => {};
  let seq = 500;
  ctx35.cfNovoId_ = (p) => p + '-' + (++seq);

  // Edita alterando o preço (renegociação)
  const res = ctx35.cfCriarEqualizacao_({
    id: ID_EQ,
    empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA',
    projeto: 'Pintura Renegociada',
    area: 'Facilities',
    proponentes: [
      { nome: 'Fornecedor A', cnpj: '11.222.333/0001-81' },
      { nome: 'Fornecedor B', cnpj: '44.555.666/0001-92' }
    ],
    itens: [
      { tipo: 'item', nivel: 0, descricao: 'Pintura Epóxi', quantidade: '1', precos: ['1400,00', '1600,00'] }
    ]
  });

  assert.equal(res.editada, true);
  assert.equal(res.reaberta, true, 'deve sinalizar reaberta: true');

  const eqAtual = tabelas.Equalizacoes.find(e => e.ID === ID_EQ);
  assert.equal(eqAtual.STATUS, 'em_negociacao', 'deve reabrir status para em_negociacao');
  assert.equal(eqAtual.ID_PROPOSTA_VENCEDORA, '', 'deve limpar ID_PROPOSTA_VENCEDORA');
  assert.equal(eqAtual.CNPJ_VENCEDOR, '', 'deve limpar CNPJ_VENCEDOR');
  assert.equal(eqAtual.VALOR_FINAL, '', 'deve limpar VALOR_FINAL');
  assert.equal(eqAtual.PARECER_FAVORAVEL, '', 'deve limpar PARECER_FAVORAVEL');

  // Os IDs de proposta devem ter sido preservados porque o CNPJ bateu
  const prop1 = tabelas.Propostas.find(p => p.CNPJ === '11222333000181');
  assert.equal(prop1.ID, 'PRP-ORIG-1', 'deve reaproveitar PRP-ORIG-1 para o mesmo CNPJ');
  assert.equal(prop1.VENCEDORA, false, 'proposta não deve continuar vencedora tacitamente');

  console.log('✓ CORREÇÃO VERIFICADA: edição de homologação revoga status e preserva IDs sem referências órfãs');
} catch (e) {
  console.log(`✗ FALHA na Correção 35: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 36 (P0-2) — rollback transacional em memória restaura estado se gravação falhar
// ─────────────────────────────────────────────────────────────
try {
  const ctx36 = vm.createContext({ Logger: { log: () => {} }, console: console });
  ['Util.gs', 'Config.gs', 'Schema.gs', 'Persistencia.gs', 'Cnpj.gs', 'Equalizacao.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctx36, { filename: f });
  });

  const ID_EQ = 'EQU-ROLLBACK-TESTE';
  const tabelas = {
    Equalizacoes: [{ ID: ID_EQ, PROJETO: 'Original Intacto', STATUS: 'em_cotacao' }],
    Propostas: [{ ID: 'PRP-R1', ID_EQUALIZACAO: ID_EQ, CNPJ: '11222333000181' }],
    EAP: [{ ID: 'EAP-R1', ID_EQUALIZACAO: ID_EQ, DESCRICAO: 'Item Seguro' }],
    Precos: [{ ID: 'PRC-R1', ID_EQUALIZACAO: ID_EQ, ID_PROPOSTA: 'PRP-R1', VALOR_TOTAL: 500 }],
    Fornecedores: []
  };

  ctx36.cfLerTudo_ = (n) => (tabelas[n] ? JSON.parse(JSON.stringify(tabelas[n])) : []);
  let deveFalhar = true;
  ctx36.cfInserir_ = (aba, linhas) => {
    // Simula falha transitória ao tentar inserir Precos na nova versão
    if (aba === 'Precos' && deveFalhar) {
      deveFalhar = false;
      throw new Error('Falha de quota ou timeout simulado no Google Sheets');
    }
    tabelas[aba] = (tabelas[aba] || []).concat(linhas);
  };
  ctx36.cfApagarPor_ = (aba, campo, valor) => {
    if (tabelas[aba]) {
      tabelas[aba] = tabelas[aba].filter(r => String(r[campo]) !== String(valor));
    }
  };
  ctx36.cfComTrava_ = (fn) => fn();
  ctx36.cfUsuario_ = () => 'usuario@capitalrealty.com.br';
  ctx36.cfLog_ = () => {};
  ctx36.cfNovoId_ = (p) => p + '-novo';

  let disparouErro = false;
  try {
    ctx36.cfCriarEqualizacao_({
      id: ID_EQ,
      empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA',
      projeto: 'Tentativa Quebrada',
      proponentes: [{ nome: 'Alfa', cnpj: '11222333000181' }],
      itens: [{ tipo: 'item', nivel: 0, descricao: 'Item Novo', quantidade: '1', precos: ['700'] }]
    });
  } catch (err) {
    disparouErro = true;
    assert.ok(err.message.includes('Falha de quota'), 'deve propagar o erro original');
  }

  assert.ok(disparouErro, 'deve ter lançado exceção');
  // Verifica se o rollback restaurou as 4 tabelas
  assert.equal(tabelas.Equalizacoes.length, 1, 'Equalizacoes restaurada');
  assert.equal(tabelas.Equalizacoes[0].PROJETO, 'Original Intacto', 'conteúdo original restaurado');
  assert.equal(tabelas.Propostas.length, 1, 'Propostas restaurada');
  assert.equal(tabelas.EAP.length, 1, 'EAP restaurada');
  assert.equal(tabelas.Precos.length, 1, 'Precos restaurada');
  assert.equal(tabelas.Precos[0].VALOR_TOTAL, 500, 'Preco original restaurado');

  console.log('✓ CORREÇÃO VERIFICADA: rollback transacional restaura dados íntegros após falha parcial');
} catch (e) {
  console.log(`✗ FALHA na Correção 36: ${e.message}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────
//  Correção 37 (P0-3) — alinhamento estrito de valores entre homologação e exportação
// ─────────────────────────────────────────────────────────────
try {
  const ctx37 = vm.createContext({ Logger: { log: () => {} }, console: console });
  ['Util.gs', 'Config.gs', 'Schema.gs', 'Persistencia.gs', 'Cnpj.gs', 'Equalizacao.gs', 'Exportar.gs'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctx37, { filename: f });
  });
  ctx37.cfDataTexto_ = () => '06/09/2026';

  const ID_EQ = 'EQU-VALORES-TESTE';
  const agora = new Date(2026, 8, 1);
  const tabelas = {
    Equalizacoes: [{
      _linha: 2,
      ID: ID_EQ,
      CNPJ_EMPRESA: '03015145000154',
      ID_EMPREENDIMENTO: 'MEGA CENTRO LOGÍSTICO CURITIBA',
      PROJETO: 'Instalação Ar Condicionado',
      STATUS: 'em_cotacao',
      ORIGEM: 'app',
      DATA_EQUALIZACAO: agora
    }],
    Propostas: [
      {
        _linha: 2,
        ID: 'PRP-V1',
        ID_EQUALIZACAO: ID_EQ,
        CNPJ: '11222333000181',
        RAZAO_SOCIAL_INFORMADA: 'Clima Bom Ltda',
        ORDEM: 1,
        VALOR_TOTAL_DECLARADO: 900, // Fornecedor deu desconto global no total
        VALOR_TOTAL_CALCULADO: 1000 // Soma dos itens dá 1000
      }
    ],
    EAP: [{ ID: 'EAP-1', ID_EQUALIZACAO: ID_EQ, ORDEM: 1, TIPO: 'item', DESCRICAO: 'Aparelho Split' }],
    Precos: [{ ID: 'PRC-1', ID_EQUALIZACAO: ID_EQ, ID_EAP: 'EAP-1', ID_PROPOSTA: 'PRP-V1', VALOR_TOTAL: 1000 }],
    Fornecedores: [{ CNPJ: '11222333000181', RAZAO_SOCIAL: 'Clima Bom Ltda' }]
  };

  ctx37.cfLerTudo_ = (n) => (tabelas[n] ? JSON.parse(JSON.stringify(tabelas[n])) : []);
  ctx37.cfAtualizarLinha_ = (aba, linha, dados) => {
    Object.assign(tabelas[aba][linha - 2], dados);
  };
  ctx37.cfComTrava_ = (fn) => fn();
  ctx37.cfLog_ = () => {};

  // Homologa a proposta
  const resHomolog = ctx37.cfHomologar_(ID_EQ, 'PRP-V1', 'Negociação com desconto global.');
  assert.equal(resHomolog.valor, 900, 'homologação deve considerar total declarado de 900');
  assert.equal(tabelas.Equalizacoes[0].VALOR_FINAL, 900, 'VALOR_FINAL deve ser 900');

  // Agora testa o mapa e o bloco de scorecard exportado
  const mapa = ctx37.cfMapaEqualizacao_(ID_EQ);
  assert.equal(mapa.equalizacao.valorFinal, 900, 'mapa deve expor valorFinal 900');

  const grade = [];
  const merges = [];
  const moeda = [];
  const faixas = { titulo: [], cabecalho: [], destaque: [] };
  const vazia = () => ['', '', '', '', ''];
  const linha = (conteudo) => { grade.push(conteudo); return grade.length; };

  ctx37.cfBlocoScorecard_(mapa.equalizacao, mapa.proponentes, linha, vazia, grade, merges, moeda, faixas, 5, 2, 3);

  // Procura a linha de Valor no scorecard gerado
  const linhaValor = grade.find(l => l[1] === 'Valor:');
  assert.ok(linhaValor, 'deve existir linha de Valor');
  assert.equal(linhaValor[2], 900, 'valor no scorecard exportado DEVE ser 900, igual à homologação');
  assert.ok(linhaValor[3].includes('1.000,00'), 'deve explicitar a soma dos itens cotados de R$ 1.000,00');

  console.log('✓ CORREÇÃO VERIFICADA: homologação e exportação concordam rigorosamente no valor homologado com ajuste');
} catch (e) {
  console.log(`✗ FALHA na Correção 37: ${e.message}`);
  process.exitCode = 1;
}
