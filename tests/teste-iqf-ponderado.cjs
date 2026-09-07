/**
 * Os cinco critérios são os que o Comitê Avaliador recebeu por escrito.
 *
 * A minuta de resposta ao comitê (docs/RESPOSTA_AO_COMITE.md, item 2)
 * fixou cinco critérios ponderados:
 *
 *   Qualidade Técnica e Acabamento .............. 30%
 *   Pontualidade e Cumprimento de SLA ........... 25%
 *   Segurança do Trabalho e SST ................. 20%
 *   Atendimento, Postura e Comunicação .......... 15%
 *   Limpeza e Organização ....................... 10%
 *
 * Uma versão anterior do sistema trazia outros cinco, em média simples:
 * tinha trocado Segurança e Limpeza — 30% do peso combinado, e os dois
 * mais específicos de condomínio logístico — por Conformidade e
 * Documentação. Um avaliador que releia a própria minuta ao lado do
 * sistema veria os itens não baterem.
 *
 * Este teste existe para que isso não volte a acontecer em silêncio: se
 * alguém mudar critério ou peso, o teste reprova e obriga a decisão a
 * ser consciente.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando os critérios ponderados e o IQF em classes...');

const root = path.resolve(__dirname, '..');

function montar(dados) {
  const gravado = [];
  const ctx = vm.createContext({ Logger: { log: function () {} }, console: console, JSON: JSON });

  ctx.SpreadsheetApp = { getActiveSpreadsheet: function () { return null; } };
  ctx.PropertiesService = {
    getScriptProperties: function () {
      return { getProperty: function () { return null; }, setProperty: function () {} };
    }
  };
  ctx.Session = { getActiveUser: function () { return { getEmail: function () { return 'quem.logou@capitalrealty.com.br'; } }; } };
  ctx.Utilities = { formatDate: function () { return '07/09/2026'; }, getUuid: function () { return 'u'; } };

  ['Util.gs', 'Config.gs', 'Cnpj.gs', 'Avaliacao.gs'].forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctx, { filename: f });
  });

  ctx.cfLerTudo_ = function (n) { return (dados || {})[n] || []; };
  ctx.cfInserir_ = function (n, linhas) {
    linhas.forEach(function (l) { gravado.push(l); });
    return linhas.length;
  };
  ctx.cfLog_ = function () {};
  ctx.cfUsuario_ = function () { return 'quem.logou@capitalrealty.com.br'; };
  ctx.cfDataTexto_ = function (d) { return d ? String(d) : ''; };

  return { ctx: ctx, gravado: gravado };
}

// ── 1. Os critérios e os pesos são exatamente os prometidos
{
  const a = montar();
  const criterios = vm.runInContext('CF_CRITERIOS_AVALIACAO', a.ctx);

  const esperado = [
    { chave: 'qualidade', peso: 30, contem: 'Qualidade' },
    { chave: 'prazo', peso: 25, contem: 'SLA' },
    { chave: 'seguranca', peso: 20, contem: 'Segurança' },
    { chave: 'atendimento', peso: 15, contem: 'Atendimento' },
    { chave: 'limpeza', peso: 10, contem: 'Limpeza' }
  ];

  assert.equal(criterios.length, 5, 'são cinco critérios, nem mais nem menos');

  esperado.forEach(function (e) {
    const c = criterios.filter(function (x) { return x.chave === e.chave; })[0];
    assert.ok(c, 'o critério "' + e.chave + '" foi prometido ao comitê e sumiu do sistema');
    assert.equal(c.peso, e.peso,
      'o peso de "' + e.chave + '" precisa ser ' + e.peso + '%, como consta na minuta ao comitê, e é ' + c.peso);
    assert.ok(c.rotulo.indexOf(e.contem) >= 0,
      'o rótulo de "' + e.chave + '" precisa falar de ' + e.contem + ', e diz: ' + c.rotulo);
  });

  const soma = criterios.reduce(function (s, c) { return s + c.peso; }, 0);
  assert.equal(soma, 100, 'os pesos precisam somar 100, e somam ' + soma);

  // E os dois que NÃO foram prometidos não podem voltar como critério.
  ['conformidade', 'documentacao'].forEach(function (fora) {
    assert.ok(!criterios.some(function (c) { return c.chave === fora; }),
      'o critério "' + fora + '" não foi prometido ao comitê e voltou para a lista');
  });
}

// ── 2. A conta é ponderada, e 1 em tudo vale zero
{
  const a = montar();
  const nota100 = a.ctx.cfNota100_;

  const tudo = function (n) {
    return { QUALIDADE: n, PRAZO: n, SEGURANCA: n, ATENDIMENTO: n, LIMPEZA: n };
  };

  assert.equal(nota100(tudo(5)), 100, 'tudo 5 é 100');
  assert.equal(nota100(tudo(1)), 0,
    'tudo 1 tem de ser ZERO, não 20 — fosse nota/5, o pior fornecedor possível ' +
    'sairia com 20 pontos e a Classe C viraria o piso de todo mundo');
  assert.equal(nota100(tudo(3)), 50, 'tudo 3 é o meio da escala');

  // O peso pesa: nota baixa no critério de 30% derruba mais que no de 10%.
  const ruimNoPesado = nota100({ QUALIDADE: 1, PRAZO: 5, SEGURANCA: 5, ATENDIMENTO: 5, LIMPEZA: 5 });
  const ruimNoLeve  = nota100({ QUALIDADE: 5, PRAZO: 5, SEGURANCA: 5, ATENDIMENTO: 5, LIMPEZA: 1 });
  assert.ok(ruimNoPesado < ruimNoLeve,
    'falhar na Qualidade (30%) tem de doer mais que falhar na Limpeza (10%) — ' +
    'saiu ' + ruimNoPesado + ' contra ' + ruimNoLeve);
  assert.equal(ruimNoPesado, 70, 'perder os 30% inteiros deixa 70');
  assert.equal(ruimNoLeve, 90, 'perder os 10% inteiros deixa 90');
}

// ── 3. As classes A, B e C que a minuta descreve
{
  const a = montar();
  const classe = function (n) { return a.ctx.cfClasseIqf_(n).classe; };

  assert.equal(classe(100), 'A');
  assert.equal(classe(85), 'A', '85 é o piso da Classe A');
  assert.equal(classe(84.9), 'B', 'logo abaixo de 85 já é B');
  assert.equal(classe(70), 'B', '70 é o piso da Classe B');
  assert.equal(classe(69.9), 'C');
  assert.equal(classe(0), 'C');
}

// ── 4. A avaliação grava a nota ponderada e a versão dos critérios
{
  const a = montar();
  a.ctx.cfSalvarAvaliacao_({
    cnpj: '11222333000181', recontrataria: true,
    qualidade: 5, prazo: 4, seguranca: 5, atendimento: 3, limpeza: 4
  });

  const l = a.gravado[0];
  // (4/4)*30 + (3/4)*25 + (4/4)*20 + (2/4)*15 + (3/4)*10 = 30+18,75+20+7,5+7,5 = 83,75
  assert.equal(l.NOTA, 83.8, 'a nota gravada é a ponderada 0-100, e saiu ' + l.NOTA);
  assert.equal(l.SEGURANCA, 5, 'a nota de segurança precisa ser gravada na coluna dela');
  assert.equal(l.LIMPEZA, 4, 'a nota de limpeza precisa ser gravada na coluna dela');
  assert.ok(l.VERSAO_CRITERIOS >= 2,
    'a versão dos critérios precisa ser gravada, senão não dá para trocar os ' +
    'critérios depois sem corromper o histórico');
}

// ── 5. Avaliação de outra versão de critérios não entra na média
//
//     É o ponto todo de gravar a versão: 3,0 da escala 1-5 e 83,8 da
//     0-100 não somam. O resultado não seria nem uma coisa nem outra —
//     e pareceria uma nota.
{
  const a = montar({
    Avaliacoes: [
      { ID: 'A1', CNPJ: '11222333000181', NOTA: 3.0, VERSAO_CRITERIOS: 1,
        RECONTRATARIA: true, DATA_AVALIACAO: '2026-09-06' },
      { ID: 'A2', CNPJ: '11222333000181', NOTA: 90, VERSAO_CRITERIOS: 2,
        RECONTRATARIA: true, DATA_AVALIACAO: '2026-09-07',
        QUALIDADE: 5, PRAZO: 5, SEGURANCA: 4, ATENDIMENTO: 5, LIMPEZA: 4 },
      { ID: 'A3', CNPJ: '11222333000181', NOTA: 80, VERSAO_CRITERIOS: 2,
        RECONTRATARIA: false, DATA_AVALIACAO: '2026-09-07',
        QUALIDADE: 4, PRAZO: 4, SEGURANCA: 4, ATENDIMENTO: 4, LIMPEZA: 4 }
    ]
  });

  const iqf = a.ctx.cfIqfPorCnpj_()['11222333000181'];
  assert.ok(iqf, 'o IQF sumiu');
  assert.equal(iqf.avaliacoes, 2,
    'só as avaliações da versão de critérios em vigor entram na conta, e entraram ' +
    iqf.avaliacoes);
  assert.equal(iqf.nota, 85, 'a média de 90 e 80 é 85');
  assert.equal(iqf.classe, 'A', '85 é Classe A');
  assert.equal(iqf.classeRotulo, 'Preferencial', 'a classe precisa vir com o rótulo legível');
}

// ── 6. A tela usa a mesma lista de critérios do servidor
{
  const html = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');

  // A cópia de segurança do formulário não pode divergir do servidor:
  // gravar resposta a uma pergunta que o servidor não fez é pior que
  // deixar o formulário vazio.
  ['seguranca', 'limpeza', 'qualidade', 'prazo', 'atendimento'].forEach(function (chave) {
    assert.ok(html.indexOf("chave: '" + chave + "'") >= 0,
      'a cópia de segurança dos critérios na tela não tem "' + chave + '"');
  });
  ['conformidade', 'documentacao'].forEach(function (fora) {
    assert.ok(html.indexOf("chave: '" + fora + "'") < 0,
      'a tela ainda oferece o critério "' + fora + '", que saiu da lista do servidor');
  });
}

console.log('OK: cinco critérios ponderados como prometido, nota 0-100 e classes A/B/C.');
