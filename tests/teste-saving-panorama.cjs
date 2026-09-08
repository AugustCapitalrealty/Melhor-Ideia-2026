/**
 * O saving do time ao longo do tempo.
 *
 * O ponto do indicador não é a ferramenta economizar mais — é tornar o
 * que já se economizava VISÍVEL. Hoje o saving mora numa planilha por
 * compra: para saber como o time negociou num semestre, alguém abre
 * dezenas de arquivos, e o que não for aberto não entra na conta.
 *
 * Por isso o que este teste protege não é um número, é a honestidade
 * dele:
 *
 *  1. Saving só existe com homologação, vencedor conhecido e valor
 *     inicial registrado. Faltando um dos três, é `null` — nunca zero,
 *     que afirmaria que se negociou e não se ganhou nada.
 *  2. Contratar por MAIS que a proposta inicial não é saving negativo:
 *     é escopo que mudou. Inventar leitura aí seria pior que calar.
 *  3. O saving entra no mês da DECISÃO, não no da cotação. Sem isso um
 *     mês já fechado mudaria de valor depois.
 *  4. O denominador aparece. "R$ 12 mil em 2 de 40 compras" e "R$ 12 mil
 *     em 2 de 2" são resultados muito diferentes, e esconder o
 *     denominador transforma indicador em vitrine.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando o panorama de saving...');

const root = path.resolve(__dirname, '..');

function montar(dados) {
  const ctx = vm.createContext({ Logger: { log: function () {} }, console: console, JSON: JSON });
  ctx.SpreadsheetApp = { getActiveSpreadsheet: function () { return null; } };
  ctx.PropertiesService = {
    getScriptProperties: function () {
      return { getProperty: function () { return null; }, setProperty: function () {} };
    }
  };
  ctx.Session = { getActiveUser: function () { return { getEmail: function () { return 'a@b.c'; } }; } };
  ctx.Utilities = { formatDate: function () { return '07/09/2026'; }, getUuid: function () { return 'u'; } };

  ['Util.gs', 'Config.gs', 'Cnpj.gs', 'Avaliacao.gs', 'Equalizacao.gs'].forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctx, { filename: f });
  });

  ctx.cfLerTudo_ = function (n) { return (dados || {})[n] || []; };
  ctx.cfDataTexto_ = function (d) { return d ? String(d) : ''; };
  return ctx;
}

/** Uma compra homologada com proposta inicial e valor final. */
function compra(id, inicial, final, opcoes) {
  const o = opcoes || {};
  return {
    eq: {
      ID: id, STATUS: 'homologada', ID_PROPOSTA_VENCEDORA: 'P-' + id,
      VALOR_FINAL: final,
      ID_EMPREENDIMENTO: o.mega || 'MEGA CURITIBA',
      CATEGORIA: o.categoria || 'Material de Consumo',
      HOMOLOGADO_POR: o.por || 'ana@capitalrealty.com.br',
      HOMOLOGADO_EM: o.em || null,
      DATA_EQUALIZACAO: o.cotadaEm || null,
      CRIADO_POR: o.criadoPor || 'outro@capitalrealty.com.br'
    },
    prop: {
      ID: 'P-' + id, ID_EQUALIZACAO: id, VENCEDORA: true,
      VALOR_PROPOSTA_INICIAL: inicial, VALOR_TOTAL_DECLARADO: final
    }
  };
}

function base(compras, extras) {
  return {
    Equalizacoes: compras.map(function (c) { return c.eq; }).concat((extras || {}).eqs || []),
    Propostas: compras.map(function (c) { return c.prop; }).concat((extras || {}).props || [])
  };
}

// ── 1. O saving de uma compra é inicial − contratado
{
  const c = compra('EQ1', 100000, 88000);
  const ctx = montar(base([c]));
  assert.equal(ctx.cfSavingDaEqualizacao_(c.eq, [c.prop]), 12000,
    'negociou de 100.000 para 88.000: o saving é 12.000');
}

// ── 2. Falta qualquer uma das três condições, e é null
{
  const semInicial = compra('EQ2', '', 88000);
  const ctx = montar(base([semInicial]));
  assert.strictEqual(ctx.cfSavingDaEqualizacao_(semInicial.eq, [semInicial.prop]), null,
    'sem valor inicial registrado não dá para saber quanto se negociou');

  const emAberto = compra('EQ3', 100000, 88000);
  emAberto.eq.STATUS = 'em_cotacao';
  assert.strictEqual(ctx.cfSavingDaEqualizacao_(emAberto.eq, [emAberto.prop]), null,
    'compra não homologada ainda não gerou saving nenhum');

  const semVencedor = compra('EQ4', 100000, 88000);
  semVencedor.eq.ID_PROPOSTA_VENCEDORA = '';
  semVencedor.prop.VENCEDORA = false;
  assert.strictEqual(ctx.cfSavingDaEqualizacao_(semVencedor.eq, [semVencedor.prop]), null,
    'sem saber qual proposta venceu não há de quem calcular o saving');
}

// ── 3. Contratar por mais que a inicial não vira saving negativo
{
  const cresceu = compra('EQ5', 80000, 95000);
  const ctx = montar(base([cresceu]));
  assert.strictEqual(ctx.cfSavingDaEqualizacao_(cresceu.eq, [cresceu.prop]), null,
    'contratar acima da proposta inicial é escopo que mudou, não prejuízo de negociação — ' +
    'chamar isso de saving negativo seria inventar uma leitura que o dado não sustenta');
}

// ── 4. O saving entra no mês da DECISÃO, não no da cotação
{
  const c = compra('EQ6', 100000, 90000, {
    cotadaEm: new Date(2026, 2, 10),   // cotada em março
    em: new Date(2026, 4, 20)          // homologada em maio
  });
  const ctx = montar(base([c]));
  const p = ctx.cfPanoramaSaving_();

  assert.equal(p.porMes.length, 1, 'a compra tem que cair num mês só');
  assert.equal(p.porMes[0].chave, '2026-05',
    'a negociação rendeu no mês em que foi fechada, não no da cotação — senão ' +
    'um mês já fechado mudaria de valor depois: ' + p.porMes[0].chave);
  assert.equal(p.dataAproximada, 0, 'com HOMOLOGADO_EM a data não é aproximada');
}

// ── 5. Sem a data da decisão, cai para a da cotação — e AVISA
{
  const c = compra('EQ7', 100000, 90000, { cotadaEm: new Date(2026, 2, 10), em: null });
  const ctx = montar(base([c]));
  const p = ctx.cfPanoramaSaving_();

  assert.equal(p.porMes[0].chave, '2026-03', 'sem a data da decisão, usa a da equalização');
  assert.equal(p.dataAproximada, 1,
    'a aproximação precisa ser contada e exposta — para ninguém apresentar ' +
    'como precisão o que é estimativa');
}

// ── 6. O denominador aparece: quantas homologadas NÃO renderam saving
{
  const comSaving = compra('EQ8', 100000, 90000, { em: new Date(2026, 4, 1) });
  const semRegistro = compra('EQ9', '', 50000, { em: new Date(2026, 4, 2) });
  const ctx = montar(base([comSaving, semRegistro]));
  const p = ctx.cfPanoramaSaving_();

  assert.equal(p.total, 10000, 'só a compra com registro entra no total');
  assert.equal(p.compras, 1, 'uma compra produziu saving');
  assert.equal(p.homologadas, 2, 'duas foram homologadas');
  assert.equal(p.semRegistro, 1,
    'a diferença precisa ser exposta: é ela que diz quantas negociações ' +
    'ninguém registrou, e isso é acionável');
}

// ── 7. Quebra por Mega, categoria e quem negociou
{
  const ctx = montar(base([
    compra('A', 100000, 90000, { mega: 'MEGA CURITIBA', categoria: 'Material de Consumo',
                                 por: 'ana@capitalrealty.com.br', em: new Date(2026, 4, 1) }),
    compra('B', 50000, 45000,  { mega: 'MEGA ESTEIO',   categoria: 'Material de Consumo',
                                 por: 'ana@capitalrealty.com.br', em: new Date(2026, 5, 1) }),
    compra('C', 200000, 180000,{ mega: 'MEGA CURITIBA', categoria: 'Obras & Reformas',
                                 por: 'bruno@capitalrealty.com.br', em: new Date(2026, 5, 3) })
  ]));
  const p = ctx.cfPanoramaSaving_();

  assert.equal(p.total, 35000, '10.000 + 5.000 + 20.000');
  assert.equal(p.porMes.length, 2, 'maio e junho');
  assert.equal(p.porMes[0].chave, '2026-05', 'a série sai em ordem cronológica');
  assert.equal(p.porMes[1].chave, '2026-06');

  const curitiba = p.porMega.filter(function (g) { return g.chave === 'MEGA CURITIBA'; })[0];
  assert.equal(curitiba.saving, 30000, 'Curitiba somou duas compras');
  assert.equal(curitiba.compras, 2);

  const ana = p.porPessoa.filter(function (g) { return g.chave === 'ana@capitalrealty.com.br'; })[0];
  assert.equal(ana.saving, 15000, 'a Ana negociou duas compras');

  // Ordenado por saving: quem mais rendeu vem primeiro.
  assert.equal(p.porPessoa[0].chave, 'bruno@capitalrealty.com.br',
    'as quebras saem ordenadas por saving, não por ordem de leitura');
}

// ── 8. O percentual é sobre o que se ia pagar, não sobre o pago
{
  const ctx = montar(base([compra('EQ10', 100000, 80000, { em: new Date(2026, 4, 1) })]));
  const p = ctx.cfPanoramaSaving_();

  // 20.000 de saving sobre 100.000 de proposta inicial = 20%.
  // Sobre o contratado (80.000) daria 25% — e inflaria o resultado.
  assert.equal(p.percentual, 20,
    'o percentual é sobre a proposta inicial (o que se ia pagar), não sobre o ' +
    'contratado — sobre o contratado o mesmo saving pareceria maior');
}

// ── 9. Quem homologou ganha de quem criou
{
  const c = compra('EQ11', 100000, 90000, {
    por: 'quem.negociou@capitalrealty.com.br',
    criadoPor: 'quem.digitou@capitalrealty.com.br',
    em: new Date(2026, 4, 1)
  });
  const ctx = montar(base([c]));
  const p = ctx.cfPanoramaSaving_();

  assert.equal(p.porPessoa[0].chave, 'quem.negociou@capitalrealty.com.br',
    'o saving é de quem negociou, não de quem criou a equalização');
}

// ── 10. O acervo sem decisão precisa ser contado, não ignorado
//
//    Equalização importada não traz vencedor: o documento de origem
//    não registra quem ganhou. Ela já tem as propostas e o valor
//    inicial, mas até alguém homologar não produz saving nenhum.
//
//    Se o painel apenas as ignorar, o gestor lê "não há dado" onde a
//    verdade é "há N compras esperando um clique" — e a única ação que
//    enche a tela fica invisível. É o mesmo princípio do denominador:
//    número de saving sem o que ficou de fora é vitrine.
{
  const importadas = [{ ID: 'EQ-IMP-1', STATUS: 'importada' },
                      { ID: 'EQ-IMP-2', STATUS: 'importada' },
                      { ID: 'EQ-RASC', STATUS: 'rascunho' }];
  const ctx = montar(base([compra('EQ12', 100000, 90000, { em: new Date(2026, 4, 1) })],
                          { eqs: importadas }));
  const p = ctx.cfPanoramaSaving_();

  assert.equal(p.semDecisao, 3,
    'as equalizações sem homologação precisam ser contadas: cada uma é um ' +
    'saving que a tela ainda não pode mostrar, e somá-las é o que separa ' +
    '“painel vazio” de “fila de trabalho”');

  // E não podem contaminar o que JÁ foi decidido.
  assert.equal(p.homologadas, 1, 'só a homologada entra no denominador');
  assert.equal(p.compras, 1);
  assert.equal(p.total, 10000);
}

// ── 11. Sem acervo pendente, o contador é zero e não some
{
  const ctx = montar(base([compra('EQ13', 100000, 90000, { em: new Date(2026, 4, 1) })]));
  const p = ctx.cfPanoramaSaving_();
  assert.strictEqual(p.semDecisao, 0,
    'o campo precisa existir sempre: se sumir quando é zero, a tela passa a ' +
    'testar undefined e a mensagem some junto');
}

console.log('OK: saving por mês, Mega, categoria e negociador — com denominador à vista.');
