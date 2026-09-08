/**
 * Teste Automatizado: Exportação Executiva com Benchmark Histórico e IQF
 *
 * Valida os requisitos pedidos pela Diretoria:
 * 1. IQF dos proponentes no cabeçalho do mapa comparativo (★ nota Classe A/B/C ou 'sem nota').
 * 2. IQF do fornecedor vencedor/indicado no Bloco de Scorecard.
 * 3. Benchmark de última compra homologada [★ Última: R$ XX,XX (Mega ...)] na descrição dos itens.
 * 4. Linha de 'Variação vs últ. compra' destacando sobrepreço (▲ +X%) e economia (▼ -Y%).
 * 5. Legenda explicativa no rodapé da tabela comparativa.
 * 6. Garantia de documento 100% estático (sem fórmulas '=') e compatível com geração de PDF.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

console.log('Validando Exportação Executiva com Benchmark Histórico e IQF (Planilha e PDF)...');

const ctx = vm.createContext({
  Logger: { log: () => {} },
  console: console
});

const escrito = [];
const merges = [];
const moeda = [];
const notas = [];
const coresFundo = [];
const coresTexto = [];

const faixaMock = {
  merge: function () { return faixaMock; },
  setValues: function (g) {
    g.forEach(function (l) { escrito.push(l.slice()); });
    return faixaMock;
  },
  setValue: function (v) { return faixaMock; },
  setNumberFormat: function (f) { return faixaMock; },
  setBorder: function () { return faixaMock; },
  setVerticalAlignment: function () { return faixaMock; },
  setHorizontalAlignment: function () { return faixaMock; },
  setFontSize: function () { return faixaMock; },
  setFontStyle: function () { return faixaMock; },
  setFontWeight: function () { return faixaMock; },
  setFontColor: function (c) { coresTexto.push(c); return faixaMock; },
  setBackground: function (c) { coresFundo.push(c); return faixaMock; },
  setWrap: function () { return faixaMock; },
  setNote: function (n) { notas.push(n); return faixaMock; }
};

const abaMock = {
  setName: () => {},
  getSheetId: () => 0,
  setColumnWidth: () => {},
  setRowHeight: () => {},
  getRange: function (l, c, nl, nc) {
    return faixaMock;
  }
};

const ssMock = {
  getId: () => 'SS-TEST-BENCHMARK',
  getUrl: () => 'https://docs.google.com/spreadsheets/d/SS-TEST-BENCHMARK/edit',
  getSheets: () => [abaMock]
};

ctx.SpreadsheetApp = {
  create: () => ssMock,
  flush: () => {},
  BorderStyle: { SOLID: 'SOLID', SOLID_MEDIUM: 'SOLID_MEDIUM' }
};

ctx.ScriptApp = { getOAuthToken: () => 'token' };
ctx.UrlFetchApp = {
  fetch: () => ({
    getResponseCode: () => 200,
    getBlob: () => ({
      setName: function () { return this; },
      getBytes: () => new Array(9000).fill(0)
    })
  })
};

ctx.DriveApp = {
  getFileById: () => ({
    moveTo: () => {}
  }),
  getFolderById: () => ({
    createFile: () => ({ getId: () => 'PDF-TEST-BENCHMARK', getUrl: () => 'https://drive.google.com/file/d/PDF-TEST-BENCHMARK/view' })
  }),
  createFile: () => ({ getId: () => 'PDF-TEST-BENCHMARK', getUrl: () => 'https://drive.google.com/file/d/PDF-TEST-BENCHMARK/view' })
};

ctx.cfPdfDaPlanilha_ = (ssId, gid, nome) => ({
  getId: 'PDF-TEST-BENCHMARK',
  getUrl: 'https://drive.google.com/file/d/PDF-TEST-BENCHMARK/view'
});

ctx.Utilities = {
  formatDate: () => '07/09/2026 15:00',
  getUuid: () => 'uuid-123'
};

// Carrega os módulos do backend
['Util.gs', 'Config.gs', 'Consulta.gs', 'Cnpj.gs', 'Avaliacao.gs', 'Equalizacao.gs', 'Exportar.gs'].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctx, { filename: f });
});

// Setup de dados simulando uma equalização com benchmark histórico e IQFs
ctx.cfLerTudo_ = (nomeTabela) => {
  if (nomeTabela === 'Equalizacoes') {
    return [{
      ID: 'EQ-BENCH-1',
      ID_EMPREENDIMENTO: 'MEGA CENTRO LOGÍSTICO CURITIBA',
      PROJETO: 'Material de Consumo e Copa',
      STATUS: 'homologada',
      ID_PROPOSTA_VENCEDORA: 'PROP-1',
      VALOR_FINAL: 1350
    }];
  }
  if (nomeTabela === 'Fornecedores') {
    return [
      { CNPJ: '11111111000111', RAZAO_SOCIAL: 'FORNECEDOR ALFA LTDA', NOME_FANTASIA: 'Alfa Suprimentos' },
      { CNPJ: '22222222000122', RAZAO_SOCIAL: 'BETA DISTRIBUIDORA DE ALIMENTOS', NOME_FANTASIA: 'Beta Foods' },
      { CNPJ: '33333333000133', RAZAO_SOCIAL: 'GAMA COMERCIO GERAL EIRELI', NOME_FANTASIA: 'Gama Geral' }
    ];
  }
  if (nomeTabela === 'Propostas') {
    return [
      {
        ID: 'PROP-1', ID_EQUALIZACAO: 'EQ-BENCH-1', CNPJ: '11111111000111', ORDEM: 1,
        RAZAO_SOCIAL_INFORMADA: 'Alfa', VALOR_TOTAL_CALCULADO: 1350, VENCEDORA: true,
        NUMERO_PROPOSTA: 'PROP-A-2026', CONDICOES_PAGAMENTO: '30 dias'
      },
      {
        ID: 'PROP-2', ID_EQUALIZACAO: 'EQ-BENCH-1', CNPJ: '22222222000122', ORDEM: 2,
        RAZAO_SOCIAL_INFORMADA: 'Beta', VALOR_TOTAL_CALCULADO: 1750,
        NUMERO_PROPOSTA: 'PROP-B-2026', CONDICOES_PAGAMENTO: '28 dias'
      },
      {
        ID: 'PROP-3', ID_EQUALIZACAO: 'EQ-BENCH-1', CNPJ: '33333333000133', ORDEM: 3,
        RAZAO_SOCIAL_INFORMADA: 'Gama', VALOR_TOTAL_CALCULADO: 1500,
        NUMERO_PROPOSTA: 'PROP-G-2026', CONDICOES_PAGAMENTO: '15 dias'
      }
    ];
  }
  if (nomeTabela === 'Avaliacoes') {
    return [
      // Alfa: 4 avaliações com média 87.5 -> Classe A (definitiva)
      { CNPJ: '11111111000111', NOTA: 88, VERSAO_CRITERIOS: 2, CONCLUIDA: true },
      { CNPJ: '11111111000111', NOTA: 90, VERSAO_CRITERIOS: 2, CONCLUIDA: true },
      { CNPJ: '11111111000111', NOTA: 85, VERSAO_CRITERIOS: 2, CONCLUIDA: true },
      { CNPJ: '11111111000111', NOTA: 87, VERSAO_CRITERIOS: 2, CONCLUIDA: true },
      // Beta: 1 avaliação com nota 72 -> Classe B prelim. (< 3 avaliações)
      { CNPJ: '22222222000122', NOTA: 72, VERSAO_CRITERIOS: 2, CONCLUIDA: true }
      // Gama: sem avaliações
    ];
  }
  if (nomeTabela === 'EAP') {
    return [
      {
        ID: 'ITEM-1', ID_EQUALIZACAO: 'EQ-BENCH-1', ID_PAI: '', ORDEM: 1, TIPO: 'item',
        DESCRICAO: 'Café em pó tradicional 500g', MARCA_REFERENCIA: 'Melitta',
        QUANTIDADE_REFERENCIA: 50, UNIDADE_REFERENCIA: 'pct'
      }
    ];
  }
  if (nomeTabela === 'Precos') {
    return [
      // Preços atuais da equalização EQ-BENCH-1:
      // Alfa cotou a R$ 27,00 (economia de -10% vs última de R$ 30,00)
      { ID_EAP: 'ITEM-1', ID_PROPOSTA: 'PROP-1', ID_EQUALIZACAO: 'EQ-BENCH-1', PRECO_UNITARIO: 27.00, VALOR_TOTAL: 1350, STATUS_PRECO: 'cotado', MARCA_COTADA: 'Melitta' },
      // Beta cotou a R$ 35,00 (sobrepreço de +16,7% vs última de R$ 30,00)
      { ID_EAP: 'ITEM-1', ID_PROPOSTA: 'PROP-2', ID_EQUALIZACAO: 'EQ-BENCH-1', PRECO_UNITARIO: 35.00, VALOR_TOTAL: 1750, STATUS_PRECO: 'cotado', MARCA_COTADA: 'Pilão' },
      // Gama cotou a R$ 30,00 (igual à última)
      { ID_EAP: 'ITEM-1', ID_PROPOSTA: 'PROP-3', ID_EQUALIZACAO: 'EQ-BENCH-1', PRECO_UNITARIO: 30.00, VALOR_TOTAL: 1500, STATUS_PRECO: 'cotado', MARCA_COTADA: 'Melitta' },

      // Preço histórico em outra equalização homologada anterior:
      {
        ID_EAP: 'HIST-ITEM-1', ID_PROPOSTA: 'PROP-HIST', ID_EQUALIZACAO: 'EQ-ANTIGA',
        PRECO_UNITARIO: 30.00, VALOR_TOTAL: 1500, STATUS_PRECO: 'cotado', MARCA_COTADA: 'Melitta'
      }
    ];
  }
  if (nomeTabela === 'Pendencias') return [];
  return [];
};

ctx.cfDataTexto_ = () => '01/06/2026';
ctx.cfUsuario_ = () => 'diretoria.suprimentos@capitalrealty.com.br';

// Histórico anterior para alimentar o matching de preços de cfCarregarPrecos_
ctx.cfCarregarPrecos_ = () => [
  {
    idEqualizacao: 'EQ-ANTIGA',
    statusEqualizacao: 'homologada',
    data: new Date('2026-06-01'),
    empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA',
    itemDescricao: 'Café em pó tradicional 500g',
    descricao: 'Café em pó tradicional 500g',
    chave: 'cafe em po tradicional 500g',
    unidade: 'pct',
    precoUnitario: 30.00,
    valor: 30.00,
    fornecedor: 'FORNECEDOR HISTORICO LTDA',
    marcaCotada: 'Melitta',
    vencedora: true,
    status: 'cotado'
  }
];

const resultado = ctx.cfExportarEqualizacao_('EQ-BENCH-1');

// ── 1. Retorno de URLs
assert.equal(resultado.planilha, 'https://docs.google.com/spreadsheets/d/SS-TEST-BENCHMARK/edit', 'URL da planilha inválida');
assert.equal(resultado.pdf, 'https://drive.google.com/file/d/PDF-TEST-BENCHMARK/view', 'URL do PDF inválida');
console.log('✓ 1. Planilha e PDF gerados com URLs corretas.');

// ── 2. Nenhuma célula com fórmula '=' (garantia de retrato estático)
const comFormula = [];
escrito.forEach((linha, l) => {
  linha.forEach((c, col) => {
    if (typeof c === 'string' && c.trim().charAt(0) === '=') {
      comFormula.push(`L${l + 1}C${col + 1}: ${c}`);
    }
  });
});
assert.equal(comFormula.length, 0, 'Documento contém fórmulas: ' + comFormula.join(', '));
console.log('✓ 2. Documento 100% estático sem fórmulas (retrato oficial auditável).');

// ── 3. IQF no Cabeçalho dos Proponentes da Tabela Comparativa
const linhaIqfCab = escrito.filter(l => l.some(c => String(c).includes('prelim.')) && l.some(c => String(c).includes('sem nota')))[0];
assert.ok(linhaIqfCab, 'Linha de IQF no cabeçalho comparativo não foi encontrada');
const txtIqfCab = linhaIqfCab.map(String).join(' | ');
assert.ok(txtIqfCab.includes('★') && txtIqfCab.includes('Classe A'), 'Alfa deve exibir IQF Classe A com estrela no cabeçalho');
assert.ok(txtIqfCab.includes('Classe B') && txtIqfCab.includes('prelim.'), 'Beta deve exibir IQF Classe B prelim. no cabeçalho');
assert.ok(txtIqfCab.includes('sem nota'), 'Gama deve exibir "sem nota" no cabeçalho');
console.log('✓ 3. Cabeçalho comparativo possui linha executiva de IQF (Classe A, Classe B prelim. e sem nota).');

// ── 4. IQF no Bloco de Scorecard
const linhaScorecardIqf = escrito.filter(l => l.indexOf('Índice Fornecedor (IQF):') >= 0)[0];
assert.ok(linhaScorecardIqf, 'Scorecard deve conter a linha Índice Fornecedor (IQF)');
const txtScorecardIqf = linhaScorecardIqf.join(' | ');
assert.ok(txtScorecardIqf.includes('Classe A'), 'Scorecard deve destacar Classe A para o fornecedor Alfa homologado');
assert.ok(txtScorecardIqf.includes('avaliações pós-serviço registradas'), 'Scorecard deve detalhar número de avaliações do fornecedor homologado');
console.log('✓ 4. Scorecard da Diretoria exibe IQF do fornecedor homologado com transparência total.');

// ── 5. Benchmark Histórico na Descrição do Item
const linhaItem = escrito.filter(l => String(l[2]).includes('Café em pó tradicional 500g') && l.includes('pct'))[0];
assert.ok(linhaItem, 'Linha do item Café não encontrada na grade comparativa');
const descItem = linhaItem.join(' | ');
assert.ok(descItem.includes('[Ref: Melitta]'), 'Descrição deve manter [Ref: Melitta]');
assert.ok(descItem.includes('★ Última: R$ 30,00'), 'Descrição deve exibir benchmark histórico [★ Última: R$ 30,00]');
console.log('✓ 5. Descrição do item exibe benchmark histórico [★ Última: R$ 30,00 (Mega Curitiba)].');

// ── 6. Linha de 'Variação vs últ. compra' com Alertas de Sobrepreço e Economia
const linhaVariacao = escrito.filter(l => l.indexOf('Variação vs últ. compra') >= 0)[0];
assert.ok(linhaVariacao, 'Linha de Variação vs últ. compra não foi gerada');
const txtVariacao = linhaVariacao.join(' | ');
assert.ok(txtVariacao.includes('▼ -10% vs últ.'), 'Alfa cotou R$ 27 (-10% vs R$ 30) -> deve exibir "▼ -10% vs últ."');
assert.ok(txtVariacao.includes('▲ +17% vs últ.'), 'Beta cotou R$ 35 (+16.7% vs R$ 30) -> deve exibir "▲ +17% vs últ."');
assert.ok(txtVariacao.includes('0% vs últ.'), 'Gama cotou R$ 30 (0% vs R$ 30) -> deve exibir "0% vs últ."');
console.log('✓ 6. Linha de "Variação vs últ. compra" exibe deltas executivos (▲ +17%, ▼ -10%, 0% vs últ.).');

// ── 7. Cores de Destaque Executivo (Sobrepreço em Vermelho e Economia em Verde)
assert.ok(coresTexto.includes('#B03024'), 'Sobrepreço deve usar cor de texto vermelha (#B03024)');
assert.ok(coresFundo.includes('#FEE2E2'), 'Sobrepreço deve usar fundo vermelho suave (#FEE2E2)');
assert.ok(coresTexto.includes('#1F7A4C'), 'Economia/Saving deve usar cor de texto verde (#1F7A4C)');
assert.ok(coresFundo.includes('#DCFCE7'), 'Economia/Saving deve usar fundo verde suave (#DCFCE7)');
console.log('✓ 7. Cores executivas de alerta (vermelho para sobrepreço, verde para economia) aplicadas.');

// ── 8. Legenda Explicativa no Rodapé do Comparativo
const linhaLegenda = escrito.filter(l => l.indexOf('Legenda:') >= 0)[0];
assert.ok(linhaLegenda, 'Linha de Legenda explicativa não foi gerada');
const txtLegenda = linhaLegenda.join(' | ');
assert.ok(txtLegenda.includes('✓ verde = menor preço da linha'), 'Legenda deve explicar ✓ menor preço');
assert.ok(txtLegenda.includes('▲ vermelho = sobrepreço ≥ +15%'), 'Legenda deve explicar ▲ sobrepreço');
assert.ok(txtLegenda.includes('▼ verde = economia ≤ -10%'), 'Legenda deve explicar ▼ economia');
assert.ok(txtLegenda.includes('· = não cotou'), 'Legenda deve explicar não cotado');
console.log('✓ 8. Legenda executiva de rodapé documenta todas as cores e símbolos para auditoria da Diretoria.');
// ── 9. Referência que NUNCA foi comprada não pode virar "compra"
//
//    Até aqui o acervo do teste tinha "vencedora: true", e por isso o
//    rótulo "compra" estava certo. O outro ramo nunca era exercitado — e
//    era justamente o ramo do acervo REAL: equalização importada não tem
//    vencedor marcado, então sua referência é uma proposta cotada e não
//    uma compra. O cabeçalho da linha e a legenda diziam "compra" de
//    qualquer jeito, contradizendo a nota da própria célula ao lado.
//
//    Num documento assinado que vai à Diretoria, afirmar que houve
//    compra onde só houve cotação é afirmar um fato que não aconteceu.
escrito.length = 0;
ctx.cfCarregarPrecos_ = () => [
  {
    idEqualizacao: 'EQ-ANTIGA',
    statusEqualizacao: 'importada',
    data: new Date('2026-06-01'),
    empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA',
    itemDescricao: 'Café em pó tradicional 500g',
    descricao: 'Café em pó tradicional 500g',
    chave: 'cafe em po tradicional 500g',
    unidade: 'pct',
    precoUnitario: 30.00,
    valor: 30.00,
    fornecedor: 'FORNECEDOR HISTORICO LTDA',
    marcaCotada: 'Melitta',
    vencedora: false,
    status: 'cotado'
  }
];

ctx.cfExportarEqualizacao_('EQ-BENCH-1');

assert.ok(!escrito.some(l => l.indexOf('Variação vs últ. compra') >= 0),
  'a referência não foi comprada (vencedora: false) e mesmo assim a grade ' +
  'anuncia “últ. compra” — o documento afirma uma compra que não houve');

const linhaVarProp = escrito.filter(l => l.indexOf('Variação vs últ. proposta') >= 0)[0];
assert.ok(linhaVarProp,
  'sem compra homologada o rótulo precisa dizer “últ. proposta”: é o que a ' +
  'nota de cada célula já dizia, e o cabeçalho contradizia');

const legendaProp = escrito.filter(l => l.indexOf('Legenda:') >= 0)[0].join(' | ');
assert.ok(legendaProp.indexOf('vs última compra') < 0,
  'a legenda vale para a grade INTEIRA e não pode afirmar compra: itens ' +
  'diferentes têm referências de naturezas diferentes');
assert.ok(/refer[êe]ncia/i.test(legendaProp),
  'a legenda precisa falar em referência e mandar ler o rótulo da linha');
console.log('✓ 9. Referência apenas cotada é rotulada como proposta, nunca como compra.');

console.log('\n===============================================================');
console.log('🎉 SUCESSO: Exportação de Planilha e PDF com Benchmark Histórico');
console.log('   e IQF validada com 100% de conformidade executiva!');
console.log('===============================================================\n');
