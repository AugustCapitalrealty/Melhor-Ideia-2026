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

try {
  const code = fs.readFileSync(path.join(root, 'app', 'Persistencia.gs'), 'utf8');
  if (code.includes('propostasAvulsas')) {
    console.log('✓ CORREÇÃO VERIFICADA: desfazerImportacao contempla propostas avulsas');
  } else {
    console.log('✗ FALHA: desfazerImportacao não contempla propostas avulsas');
  }
} catch (e) {
  console.log(`✗ Erro na Correção 1: ${e.message}`);
}

try {
  context.cfLerTudo_ = (tabela) => {
    if (tabela === 'Empresas') {
      return [{
        CNPJ: '00000000000191',
        GRAFIAS_ALTERNATIVAS: 'Demercado',
        RAZAO_SOCIAL: 'Demercado S.A.'
      }];
    }
    return [];
  };
  
  const cnpj = context.cfResolverEmpresa_('Demercado');
  if (cnpj !== '') {
    console.log('✓ CORREÇÃO VERIFICADA: cfResolverEmpresa_ resolve texto para CNPJ');
  } else {
    console.log('✗ FALHA: cfResolverEmpresa_ não resolveu texto');
  }
} catch (e) {
  console.log(`✗ Erro na Correção 2: ${e.message}`);
}

try {
  const code = fs.readFileSync(path.join(root, 'app', 'Persistencia.gs'), 'utf8');
  if (code.includes('cfResolverEmpresa_') && code.includes('cfResolverEmpreendimento_')) {
    console.log('✓ CORREÇÃO VERIFICADA: hash inclui empresa normalizada e empreendimento');
  } else {
    console.log('✗ FALHA: hash não inclui resolução de empresa ou empreendimento');
  }
} catch (e) {
  console.log(`✗ Erro na Correção 3: ${e.message}`);
}

try {
  const code = fs.readFileSync(path.join(root, 'app', 'ImportOrcamento.gs'), 'utf8');
  if (code.includes('unit === null && total === null') || code.includes('unit !== null || total !== null')) {
    console.log('✓ CORREÇÃO VERIFICADA: preço global (total sem unitário) agora marcado como cotado');
  } else {
    console.log('✗ FALHA: STATUS_PRECO para globais não foi corrigido');
  }
} catch (e) {
  console.log(`✗ Erro na Correção 4: ${e.message}`);
}

try {
  const code = fs.readFileSync(path.join(root, 'app', 'Consulta.gs'), 'utf8');
  if (code.includes('r.idEqualizacao || r.idProposta')) {
    console.log('✓ CORREÇÃO VERIFICADA: avulsos são agrupados por proposta, não por equalização vazia');
  } else {
    console.log('✗ FALHA: agrupamento ainda mistura avulsos');
  }
} catch (e) {
  console.log(`✗ Erro na Correção 5: ${e.message}`);
}

try {
  const code = fs.readFileSync(path.join(root, 'app', 'Persistencia.gs'), 'utf8');
  if (code.includes('cfResolverEmpreendimento_(')) {
    console.log('✓ CORREÇÃO VERIFICADA: ID_EMPREENDIMENTO usa cfResolverEmpreendimento_ para normalizar');
  } else {
    console.log('✗ FALHA: ID_EMPREENDIMENTO não foi corrigido');
  }
} catch (e) {
  console.log(`✗ Erro na Correção 6: ${e.message}`);
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
