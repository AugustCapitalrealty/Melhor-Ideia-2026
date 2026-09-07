/**
 * O laço se fecha: a nota aparece onde se decide.
 *
 * Foi isto que o comitê recebeu por escrito:
 *
 *   "Retroalimentação direta: o histórico e a reputação do prestador
 *    aparecem na tela durante a próxima equalização."
 *   "a nota do fornecedor aparece na tela do comprador na cotação
 *    seguinte — quem avalia colhe o benefício na próxima contratação."
 *
 * Não é detalhe de interface: é o que separa esta ideia do formulário
 * que fracassou antes. Uma nota que só existe numa tela que se visita
 * depois faz da avaliação um favor que não retorna para quem a fez — e
 * favor que não retorna ninguém repete.
 *
 * Por isso o teste exige as duas pontas: o servidor mandando a nota
 * junto do proponente, e a tela mostrando na coluna dele.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando o laço: a nota do fornecedor na tela de quem decide...');

const root = path.resolve(__dirname, '..');

// ── Ponta 1: o servidor manda o IQF junto de cada proponente ──────────
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

  const avaliada = '11222333000181';
  const semNota = '99888777000166';

  const dados = {
    Equalizacoes: [{ ID: 'EQ1', ID_EMPREENDIMENTO: 'MEGA CURITIBA', PROJETO: 'Reposição',
                     STATUS: 'em_cotacao' }],
    Propostas: [
      { ID: 'P1', ID_EQUALIZACAO: 'EQ1', CNPJ: avaliada, ORDEM: 1,
        RAZAO_SOCIAL_INFORMADA: 'Alfa', VALOR_TOTAL_CALCULADO: 100 },
      { ID: 'P2', ID_EQUALIZACAO: 'EQ1', CNPJ: semNota, ORDEM: 2,
        RAZAO_SOCIAL_INFORMADA: 'Beta', VALOR_TOTAL_CALCULADO: 130 }
    ],
    EAP: [{ ID: 'N1', ID_EQUALIZACAO: 'EQ1', ID_PAI: '', ORDEM: 1, TIPO: 'item', DESCRICAO: 'Rodo' }],
    Precos: [
      { ID_EAP: 'N1', ID_PROPOSTA: 'P1', ID_EQUALIZACAO: 'EQ1', PRECO_UNITARIO: 100,
        VALOR_TOTAL: 100, STATUS_PRECO: 'cotado' },
      { ID_EAP: 'N1', ID_PROPOSTA: 'P2', ID_EQUALIZACAO: 'EQ1', PRECO_UNITARIO: 130,
        VALOR_TOTAL: 130, STATUS_PRECO: 'cotado' }
    ],
    Avaliacoes: [
      { ID: 'A1', CNPJ: avaliada, NOTA: 4.4, RECONTRATARIA: true, DATA_AVALIACAO: '2026-08-01',
        PRAZO: 4, QUALIDADE: 5, CONFORMIDADE: 4, ATENDIMENTO: 5, DOCUMENTACAO: 4 },
      { ID: 'A2', CNPJ: avaliada, NOTA: 4.0, RECONTRATARIA: true, DATA_AVALIACAO: '2026-09-01',
        PRAZO: 4, QUALIDADE: 4, CONFORMIDADE: 4, ATENDIMENTO: 4, DOCUMENTACAO: 4 }
    ],
    Fornecedores: [], Pendencias: [], Notas: [], Clausulas: [], Ajustes: []
  };

  ctx.cfLerTudo_ = function (n) { return dados[n] || []; };
  ctx.cfDataTexto_ = function (d) { return d ? String(d) : ''; };

  const mapa = ctx.cfMapaEqualizacao_('EQ1');
  const comNota = mapa.proponentes.filter(function (p) { return p.cnpj === avaliada; })[0];
  const sem = mapa.proponentes.filter(function (p) { return p.cnpj === semNota; })[0];

  assert.ok(comNota, 'o proponente avaliado sumiu do mapa');
  assert.ok(comNota.iqf,
    'o mapa da equalização precisa trazer o IQF do proponente — sem isso a nota ' +
    'nunca chega à tela de quem decide, e avaliar vira favor que não retorna');
  assert.equal(comNota.iqf.avaliacoes, 2, 'a contagem de avaliações veio errada');
  assert.ok(Math.abs(comNota.iqf.nota - 4.2) < 0.01, 'a média de 4,4 e 4,0 é 4,2');

  assert.strictEqual(sem.iqf, null,
    'quem não tem avaliação precisa vir como null — "sem nota" e "nota zero" ' +
    'são coisas diferentes na hora de escolher um fornecedor');
}

// ── Ponta 2: a tela desenha a nota na coluna do proponente ────────────
{
  const html = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');

  const iScript = html.indexOf('<script>');
  const fScript = html.lastIndexOf('</script>');
  const script = html.slice(iScript + 8, fScript);

  const ctx = {
    document: {
      getElementById: function () { return { value: '', addEventListener: function () {}, options: [] }; },
      addEventListener: function () {}, querySelector: function () { return null; },
      querySelectorAll: function () { return []; },
      body: { classList: { add: function () {} } }
    },
    window: { addEventListener: function () {} },
    google: { script: { run: new Proxy({}, { get: function () { return function () { return this; }; } }) } },
    localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
    setTimeout: function () {}, clearTimeout: function () {},
    console: console, Date: Date, location: { search: '' }, confirm: function () { return true; }
  };
  vm.createContext(ctx);
  vm.runInContext(script, ctx);

  assert.strictEqual(typeof ctx.seloIqfColuna, 'function',
    'faltou a função que desenha a nota no cabeçalho da coluna do proponente');

  const bom = ctx.seloIqfColuna({ nota: 4.2, avaliacoes: 3, preliminar: false });
  assert.ok(/4,2/.test(bom), 'a nota precisa sair com vírgula, e saiu: ' + bom);
  assert.ok(/iqf-col/.test(bom), 'faltou a classe do selo de coluna');
  assert.ok(!/prelim/.test(bom), 'com três avaliações a nota não é preliminar');

  // A ressalva tem de estar VISÍVEL, não só no title.
  //
  // Este teste passava com o rótulo removido, porque a palavra
  // "preliminar" também aparece no tooltip — e ninguém decide uma
  // compra passando o mouse por cima. A mutação pegou o teste, não o
  // código.
  const preliminar = ctx.seloIqfColuna({ nota: 3.0, avaliacoes: 1, preliminar: true });
  assert.ok(/iqf-col-prelim/.test(preliminar),
    'nota preliminar precisa dizer que é preliminar no rótulo visível — é nesta ' +
    'tela que ela vai ser usada para decidir: ' + preliminar);

  const nenhuma = ctx.seloIqfColuna(null);
  assert.ok(/sem nota/.test(nenhuma),
    'sem avaliação precisa aparecer como "sem nota", não sumir: a ausência é informação');
  assert.ok(!/★/.test(nenhuma), 'quem não tem nota não pode ganhar estrela');

  // E o cabeçalho da tabela precisa realmente chamar a função.
  assert.ok(/seloIqfColuna\(p\.iqf\)/.test(script),
    'a função existe mas o cabeçalho da tabela não a usa — o selo nunca apareceria');
}

console.log('OK: a nota do fornecedor chega à tela onde a compra é decidida.');
