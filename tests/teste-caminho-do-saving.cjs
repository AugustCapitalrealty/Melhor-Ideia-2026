/**
 * O caminho do dado do saving, de ponta a ponta.
 *
 * Este teste existe por causa do defeito mais caro que a auditoria
 * encontrou, e ele não era um bug de cálculo: era um dado que
 * atravessava o sistema inteiro e morria na última etapa.
 *
 * O parser extraía a "proposta inicial:" do arquivo (Import.gs) e até
 * calculava a redução. O gravador não a persistia. Resultado: o
 * indicador que o concurso julga não tinha como produzir número a
 * partir do acervo — **por construção, não por falta de uso**. E o
 * material que ia ao Conselho afirmava que o dado existia.
 *
 * Por isso o teste cobre a CADEIA, não uma função:
 *
 *   parser extrai → gravador persiste → homologação marca vencedor →
 *   cfSavingDaEqualizacao_ produz número
 *
 * Cada elo isolado pode passar com a cadeia rompida. Foi o que houve.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando o caminho do dado do saving...');

const root = path.resolve(__dirname, '..');

// ── Elo 1: o gravador precisa persistir o que o parser extraiu ───────
{
  const src = fs.readFileSync(path.join(root, 'app', 'Persistencia.gs'), 'utf8');

  assert.ok(/VALOR_PROPOSTA_INICIAL:/.test(src),
    'o importador voltou a descartar a proposta inicial. Sem ela não existe ' +
    'saving: o parser extrai o valor e o gravador o joga fora, e o indicador ' +
    'fica impossível de produzir a partir do acervo');
  assert.ok(/REDUCAO_NEGOCIADA:/.test(src),
    'a redução calculada pelo parser também precisa ser persistida');

  // E precisa vir do campo certo, não de um literal.
  assert.ok(/VALOR_PROPOSTA_INICIAL:[^\n]*p\.propostaInicial/.test(src),
    'a proposta inicial precisa vir do que o parser extraiu (p.propostaInicial)');
}

// ── Elo 2: o parser realmente extrai o rótulo ────────────────────────
{
  const src = fs.readFileSync(path.join(root, 'app', 'Import.gs'), 'utf8');
  assert.ok(/propostaInicial:\s*'proposta inicial:'/.test(src),
    'o parser precisa reconhecer o rótulo "proposta inicial:" do documento');
}

// ── Elo 3: a cadeia inteira produz número ────────────────────────────
//
//    Simula o que acontece de verdade: uma equalização importada com a
//    proposta inicial gravada, homologada depois pela tela.
{
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
  ctx.cfDataTexto_ = function (d) { return d ? String(d) : ''; };

  // Como o acervo entra: importada, com a proposta inicial persistida.
  const eqImportada = {
    ID: 'EQ-IMP', STATUS: 'importada',
    ID_EMPREENDIMENTO: 'MEGA CURITIBA', DATA_EQUALIZACAO: new Date(2026, 4, 10)
  };
  const propImportada = {
    ID: 'P1', ID_EQUALIZACAO: 'EQ-IMP',
    VALOR_PROPOSTA_INICIAL: 80000, VALOR_TOTAL_DECLARADO: 70000
  };

  // Antes de homologar, não há saving — e isso está certo: ninguém
  // decidiu ainda.
  assert.strictEqual(ctx.cfSavingDaEqualizacao_(eqImportada, [propImportada]), null,
    'equalização importada e não homologada ainda não produz saving');

  // Depois de alguém marcar o vencedor e homologar — que é o passo
  // manual documentado no plano — o número aparece.
  const eqHomologada = Object.assign({}, eqImportada, {
    STATUS: 'homologada',
    ID_PROPOSTA_VENCEDORA: 'P1',
    VALOR_FINAL: 70000,
    HOMOLOGADO_POR: 'ana@capitalrealty.com.br',
    HOMOLOGADO_EM: new Date(2026, 4, 20)
  });
  const propVencedora = Object.assign({}, propImportada, { VENCEDORA: true });

  assert.equal(ctx.cfSavingDaEqualizacao_(eqHomologada, [propVencedora]), 10000,
    'com a proposta inicial persistida e o vencedor marcado, a cadeia inteira ' +
    'produz o saving: 80.000 negociados para 70.000');

  // E chega ao panorama, que é o que a gestão vê.
  ctx.cfLerTudo_ = function (n) {
    return ({ Equalizacoes: [eqHomologada], Propostas: [propVencedora] })[n] || [];
  };
  const p = ctx.cfPanoramaSaving_();
  assert.equal(p.total, 10000, 'o saving da compra importada precisa entrar no panorama');
  assert.equal(p.compras, 1);
  assert.equal(p.porMes[0].chave, '2026-05', 'pelo mês da homologação');
}

// ── Elo 4: quem digitou não pode virar quem negociou sem aviso ───────
{
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
  ctx.cfDataTexto_ = function (d) { return d ? String(d) : ''; };

  const eq = {
    ID: 'EQ-VELHA', STATUS: 'homologada', ID_PROPOSTA_VENCEDORA: 'P9',
    VALOR_FINAL: 90000, CRIADO_POR: 'quem.digitou@capitalrealty.com.br',
    HOMOLOGADO_EM: new Date(2026, 4, 1)
    // sem HOMOLOGADO_POR: equalização anterior ao schema v7
  };
  const prop = { ID: 'P9', ID_EQUALIZACAO: 'EQ-VELHA', VENCEDORA: true,
                 VALOR_PROPOSTA_INICIAL: 100000, VALOR_TOTAL_DECLARADO: 90000 };

  ctx.cfLerTudo_ = function (n) { return ({ Equalizacoes: [eq], Propostas: [prop] })[n] || []; };
  const p = ctx.cfPanoramaSaving_();

  assert.ok(/sem registro de quem homologou/.test(p.porPessoa[0].chave),
    'sem HOMOLOGADO_POR a quebra cai para quem CRIOU a equalização — e isso ' +
    'precisa aparecer marcado, senão a tela atribui a negociação a quem só ' +
    'digitou: ' + p.porPessoa[0].chave);
}

console.log('OK: o dado da proposta inicial sobrevive da importação até o panorama.');
