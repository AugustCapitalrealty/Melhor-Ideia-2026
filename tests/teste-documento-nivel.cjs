/**
 * O documento exportado, no nível em que ele vai para a diretoria.
 *
 * Cinco coisas que um documento formal não pode fazer, e fazia:
 *
 *  1. Mostrar "em_cotacao" — nome de coluna de banco vazando no lugar
 *     do estado da compra.
 *  2. Deixar a célula de Unitário vazia, com borda, na linha de VALOR
 *     TOTAL — o número mais importante da página com um buraco ao lado.
 *  3. Dizer "—" tanto para quem não cotou o item quanto para quem cotou
 *     sem dizer a marca. São coisas diferentes: a segunda é um preço
 *     barato de origem desconhecida.
 *  4. Sumir com a linha de marca quando ninguém informou nenhuma —
 *     indistinguível de "marca não se aplica a este item".
 *  5. Escrever "deixou itens sem cotar" sem dizer quais, mandando o
 *     comprador varrer a tabela para descobrir o que cobrar.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando o nível do documento exportado...');

const root = path.resolve(__dirname, '..');

// ── O cenário: três proponentes e as três situações de marca ─────────
//
//  N1 pede a marca Coala:
//     Alfa  cota Coala  → a marca pedida
//     Beta  cota Pato   → outra marca
//     Gama  cota, sem informar marca
//  N2 pede a marca Bic, e NINGUÉM informa marca
//  N3 não pede marca; Beta não cota
function montar() {
  const merges = [];
  let escrito = null;

  const faixa = {};
  ['setValues', 'merge', 'setRichTextValue', 'setNote', 'setFontWeight', 'setFontSize',
   'setHorizontalAlignment', 'setVerticalAlignment', 'setBackground', 'setFontColor',
   'setBorder', 'setNumberFormat', 'setWrap', 'setFontStyle']
    .forEach(function (m) { faixa[m] = function () { return faixa; }; });

  const aba = {
    setName: function () {}, setColumnWidth: function () {}, setRowHeight: function () {},
    getSheetId: function () { return 0; },
    getColumnWidth: function () { return 330; }, getRowHeight: function () { return 46; },
    insertImage: function () { return { setWidth: function () {}, setHeight: function () {} }; },
    getRange: function (l, c, nl, nc) {
      // Uma faixa que lembra de onde veio: sem isso não dá para afirmar
      // nada sobre mesclagem, que é metade do que este teste cobre.
      const propria = Object.create(faixa);
      propria.merge = function () { merges.push({ l: l, c: c, nl: nl, nc: nc }); return propria; };
      propria.setValues = function (m) { escrito = m; return propria; };
      return propria;
    }
  };

  const ctx = vm.createContext({ Logger: { log: function () {} }, console: console });

  ctx.SpreadsheetApp = {
    create: function () { return { getSheets: function () { return [aba]; },
                                   getId: function () { return 'SS1'; },
                                   getUrl: function () { return 'u'; } }; },
    flush: function () {},
    BorderStyle: { SOLID: 'SOLID', SOLID_MEDIUM: 'SOLID_MEDIUM' },
    newRichTextValue: function () {
      const b = { setText: function () { return b; }, setLinkUrl: function () { return b; },
                  build: function () { return {}; } };
      return b;
    }
  };
  ctx.DriveApp = {
    getFileById: function () { return { moveTo: function () {}, getBlob: function () { return {}; },
      getName: function () { return 'logo.png'; }, getMimeType: function () { return 'image/png'; },
      getSize: function () { return 4200; }, getId: function () { return 'L'; } }; },
    getFolderById: function () { return { createFile: function () { return { getId: function () { return 'P'; }, getUrl: function () { return 'u'; } }; },
      getFiles: function () { return { hasNext: function () { return false; } }; } }; },
    createFile: function () { return { getId: function () { return 'P'; }, getUrl: function () { return 'u'; } }; }
  };
  ctx.ScriptApp = { getOAuthToken: function () { return 't'; } };
  ctx.UrlFetchApp = {
    fetch: function () {
      return {
        getResponseCode: function () { return 200; },
        getContentText: function () { return '{}'; },
        getBlob: function () {
          return { setName: function () { return this; },
                   getContentType: function () { return 'image/png'; },
                   getBytes: function () { return new Array(9000).fill(0); } };
        }
      };
    }
  };
  ctx.Utilities = { formatDate: function () { return '07/09/2026 10:00'; }, getUuid: function () { return 'x'; } };

  ['Util.gs', 'Config.gs', 'Consulta.gs', 'Cnpj.gs', 'Avaliacao.gs', 'Equalizacao.gs', 'Exportar.gs'].forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctx, { filename: f });
  });

  const preco = function (eap, prop, valor, marca, status) {
    return { ID_EAP: eap, ID_PROPOSTA: prop, ID_EQUALIZACAO: 'EQ1',
             PRECO_UNITARIO: valor, VALOR_TOTAL: valor,
             STATUS_PRECO: status || 'cotado', MARCA_COTADA: marca || '' };
  };

  ctx.cfLerTudo_ = function (n) {
    return ({
      Equalizacoes: [{ ID: 'EQ1', ID_EMPREENDIMENTO: 'MEGA CENTRO LOGÍSTICO ESTEIO',
                       PROJETO: 'Reposição', STATUS: 'em_cotacao' }],
      Propostas: [
        { ID: 'P1', ID_EQUALIZACAO: 'EQ1', CNPJ: '11222333000181', ORDEM: 1,
          RAZAO_SOCIAL_INFORMADA: 'Alfa', VALOR_TOTAL_CALCULADO: 100 },
        { ID: 'P2', ID_EQUALIZACAO: 'EQ1', CNPJ: '11222333000262', ORDEM: 2,
          RAZAO_SOCIAL_INFORMADA: 'Beta', VALOR_TOTAL_CALCULADO: 130 },
        { ID: 'P3', ID_EQUALIZACAO: 'EQ1', CNPJ: '11222333000343', ORDEM: 3,
          RAZAO_SOCIAL_INFORMADA: 'Gama', VALOR_TOTAL_CALCULADO: 120 }
      ],
      EAP: [
        { ID: 'N1', ID_EQUALIZACAO: 'EQ1', ID_PAI: '', ORDEM: 1, TIPO: 'item',
          DESCRICAO: 'Papel higiênico rolão', MARCA_REFERENCIA: 'Coala' },
        { ID: 'N2', ID_EQUALIZACAO: 'EQ1', ID_PAI: '', ORDEM: 2, TIPO: 'item',
          DESCRICAO: 'Caneta esferográfica', MARCA_REFERENCIA: 'Bic' },
        { ID: 'N3', ID_EQUALIZACAO: 'EQ1', ID_PAI: '', ORDEM: 3, TIPO: 'item',
          DESCRICAO: 'Rodo 60cm' }
      ],
      Precos: [
        preco('N1', 'P1', 100, 'Coala'),
        preco('N1', 'P2', 130, 'Pato'),
        preco('N1', 'P3', 120, ''),
        preco('N2', 'P1', 10, ''),
        preco('N2', 'P2', 12, ''),
        preco('N2', 'P3', 11, ''),
        preco('N3', 'P1', 20, ''),
        preco('N3', 'P3', 22, '')
      ],
      Fornecedores: [], Pendencias: []
    })[n] || [];
  };
  ctx.cfDataTexto_ = function () { return '07/09/2026'; };
  ctx.cfUsuario_ = function () { return 'guilherme.marques@capitalrealty.com.br'; };

  ctx.cfExportarEqualizacao_('EQ1');
  return { ctx: ctx, grade: escrito, merges: merges,
           texto: escrito.map(function (l) { return l.join('|'); }).join('\n') };
}

const r = montar();
const linhaCom = function (rotulo) {
  return r.grade.filter(function (l) { return l.indexOf(rotulo) >= 0; })[0];
};

// ── 1. Situação em português
{
  const l = linhaCom('Situação:');
  assert.ok(l, 'faltou a linha de situação');
  assert.ok(l.join('|').indexOf('Em cotação') >= 0,
    'a situação precisa sair legível, e saiu: ' + l.join('|'));
  assert.ok(r.texto.indexOf('em_cotacao') < 0,
    'o nome interno do status vazou para o documento');
}

// ── 2. VALOR TOTAL ocupa o par Unitário+Total
{
  const iTotal = r.grade.findIndex(function (l) { return l.indexOf('VALOR TOTAL') >= 0; });
  assert.ok(iTotal >= 0, 'faltou a linha de VALOR TOTAL');
  const lTotal = r.grade[iTotal];

  // A linha da grade é 0-based; a da planilha, 1-based.
  const nLinha = iTotal + 1;
  const mesclagens = r.merges.filter(function (m) { return m.l === nLinha && m.nc === 2; });
  assert.equal(mesclagens.length, 3,
    'cada proponente precisa da sua mesclagem Unitário+Total na linha do VALOR TOTAL, ' +
    'e vieram ' + mesclagens.length);

  // O valor tem de estar na PRIMEIRA célula do par: a mesclagem do
  // Sheets preserva o canto superior esquerdo e descarta o resto.
  mesclagens.forEach(function (m) {
    const v = lTotal[m.c - 1];
    assert.ok(typeof v === 'number' && v > 0,
      'o total ficou fora da célula que sobrevive à mesclagem (coluna ' + m.c + ': ' + v + ')');
  });
}

// ── 3. As três situações de marca, cada uma com o seu texto
{
  const lm = r.grade.filter(function (l) { return l.indexOf('Marca cotada') >= 0; });
  assert.equal(lm.length, 2,
    'a linha de marca precisa sair para os DOIS itens com referência, e saiu ' + lm.length + ' vez(es)');

  const papel = lm[0];
  const celulas = papel.map(String);

  assert.ok(celulas.some(function (c) { return c === 'Coala'; }),
    'quem cotou a marca pedida sai só com o nome dela');
  assert.ok(celulas.some(function (c) { return c.indexOf('Pato') >= 0 && c.indexOf('≠') >= 0; }),
    'quem cotou outra marca precisa sair marcado como divergente');
  assert.ok(celulas.some(function (c) { return c === 'marca não informada'; }),
    'quem cotou sem dizer a marca não pode sair igual a quem não cotou');
  assert.ok(!celulas.some(function (c) { return c === '—'; }),
    'o traço voltou e confunde de novo as três situações');

  // ── 4. Item com referência e nenhuma marca informada ainda aparece
  const caneta = lm[1];
  const informadas = caneta.filter(function (c) { return String(c) === 'marca não informada'; });
  assert.equal(informadas.length, 3,
    'o item pedia Bic e ninguém informou marca: os três precisam dizer isso, e disseram ' +
    informadas.length);
}

// ── 5. Item sem marca de referência e sem marca cotada não ganha linha
{
  const rodo = r.grade.findIndex(function (l) { return l.indexOf('Rodo 60cm') >= 0; });
  const seguinte = r.grade[rodo + 1] || [];
  assert.ok(seguinte.indexOf('Marca cotada') < 0,
    'item que não pede marca não pode ganhar uma linha de marca vazia');
}

// ── 6. Quem não cotou o item fica em branco, não em "não informada"
{
  const iRodo = r.grade.findIndex(function (l) { return l.indexOf('Rodo 60cm') >= 0; });
  const lRodo = r.grade[iRodo].map(String);
  assert.ok(lRodo.some(function (c) { return c === 'não cotou'; }),
    'quem não cotou o item precisa dizer isso na linha do preço');
}

// ── 7. Linha de rodapé vazia para todos não é impressa
{
  assert.ok(r.texto.indexOf('Revisão do fornecedor') < 0,
    'nenhum proponente informou revisão — a linha em branco não pode ir para o documento');
  // A de baixo tem dado, então continua.
  assert.ok(r.texto.indexOf('Faturamento Direto:') >= 0,
    'linha com conteúdo não pode ser suprimida junto');
}

// ── 8. As ressalvas dizem QUAIS itens
{
  const mapa = r.ctx.cfMapaEqualizacao_('EQ1');
  const descricoes = mapa.pendencias.map(function (p) { return p.descricao; }).join(' || ');

  const semCotar = mapa.pendencias.filter(function (p) { return p.tipo === 'cesta_incompleta'; })[0];
  assert.ok(semCotar, 'Beta não cotou o rodo — faltou a ressalva');
  assert.ok(semCotar.descricao.indexOf('Rodo 60cm') >= 0,
    'a ressalva precisa nomear o item, e disse: ' + semCotar.descricao);
  assert.ok(/1 de 3|1 de 3 itens/.test(semCotar.descricao),
    'a ressalva precisa dizer quantos de quantos, e disse: ' + semCotar.descricao);

  const semMarca = mapa.pendencias.filter(function (p) { return p.tipo === 'marca_nao_informada'; });
  assert.ok(semMarca.length >= 1, 'faltou a ressalva de quem cotou sem informar marca');
  assert.ok(descricoes.indexOf('Caneta esferográfica') >= 0,
    'a ressalva de marca não informada precisa nomear o item');

  const divergente = mapa.pendencias.filter(function (p) { return p.tipo === 'marca_divergente'; })[0];
  assert.ok(divergente, 'Beta ofereceu Pato onde se pediu Coala — faltou a ressalva');
  assert.ok(divergente.descricao.indexOf('Pato') >= 0 && divergente.descricao.indexOf('Coala') >= 0,
    'a ressalva precisa dizer o que foi oferecido E o que foi pedido: ' + divergente.descricao);

  // Quem cotou tudo e informou tudo não vira ressalva.
  assert.ok(descricoes.indexOf('Alfa não cotou') < 0,
    'Alfa cotou os três itens — não pode virar ressalva');
}

console.log('OK: situação legível, totais mesclados, as três situações de marca separadas ' +
            'e ressalvas que nomeiam os itens.');
