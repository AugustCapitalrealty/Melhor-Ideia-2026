/**
 * A via alternativa do documento, desenhada em Google Slides.
 *
 * Este teste existe desde a primeira linha do gerador, e não depois: o
 * `Apresentacao_Conselho.gs` tem 718 linhas sem nenhum teste, e foi
 * exatamente ali que a frase "o dado existe na base; falta somar" —
 * falsa — sobreviveu até alguém ler o slide. Um gerador de documento
 * falha em silêncio: ele sempre produz *alguma coisa*.
 *
 * O que se afirma aqui é comportamento, não texto do fonte: monta um
 * SlidesApp de mentira que grava tudo que foi desenhado, roda o gerador
 * de verdade e afirma sobre o que saiu.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando a via alternativa em Google Slides...');

const root = path.resolve(__dirname, '..');


// ─────────────────────────────────────────────────────────────
//  Um SlidesApp de mentira que grava o que foi desenhado
// ─────────────────────────────────────────────────────────────

function montarSlidesApp(registro) {
  const estiloTexto = {
    setFontSize: function () { return this; }, setBold: function () { return this; },
    setItalic: function () { return this; }, setForegroundColor: function () { return this; },
    setFontFamily: function () { return this; }
  };
  const estiloPar = {
    setParagraphAlignment: function () { return this; },
    setLineSpacing: function () { return this; }
  };

  function novaForma(slide, tipo, x, y, w, h) {
    const forma = {
      tipo: tipo, x: x, y: y, w: w, h: h, texto: '',
      getFill: function () { return { setSolidFill: function (c) { forma.fill = c; return this; } }; },
      getBorder: function () {
        return {
          setTransparent: function () { return this; },
          setWeight: function () { return this; },
          getLineFill: function () { return { setSolidFill: function () { return this; } }; }
        };
      },
      setContentAlignment: function () { return forma; },
      getText: function () {
        return {
          setText: function (t) { forma.texto = String(t); return this; },
          getTextStyle: function () { return estiloTexto; },
          getParagraphStyle: function () { return estiloPar; }
        };
      }
    };
    slide.formas.push(forma);
    return forma;
  }

  function novoSlide(deck) {
    const slide = {
      formas: [],
      getBackground: function () { return { setSolidFill: function () { return this; } }; },
      insertShape: function (tipo, x, y, w, h) { return novaForma(slide, tipo, x, y, w, h); },
      remove: function () {
        const i = deck.slides.indexOf(slide);
        if (i >= 0) deck.slides.splice(i, 1);
      }
    };
    deck.slides.push(slide);
    return slide;
  }

  const SlidesApp = {
    ShapeType: { TEXT_BOX: 'TEXT_BOX', RECTANGLE: 'RECTANGLE', ROUND_RECTANGLE: 'ROUND_RECTANGLE' },
    ContentAlignment: { MIDDLE: 'MIDDLE' },
    ParagraphAlignment: { CENTER: 'CENTER', START: 'START' },
    PredefinedLayout: { BLANK: 'BLANK' },
    create: function (nome) {
      const deck = {
        id: 'DECK-FALSO', nome: nome, slides: [],
        getId: function () { return deck.id; },
        getUrl: function () { return 'https://slides/' + deck.id; },
        getPageWidth: function () { return 720; },      // 16:9 padrão, em pontos
        getPageHeight: function () { return 405; },
        getSlides: function () { return deck.slides.slice(); },
        appendSlide: function () { return novoSlide(deck); },
        saveAndClose: function () { deck.fechado = true; }
      };
      registro.deck = deck;
      // O Slides cria um slide de título; o gerador precisa removê-lo.
      novoSlide(deck);
      return deck;
    },
    openById: function () { throw new Error('template não usado neste teste'); }
  };
  return SlidesApp;
}

function montar(fixture, opcoes) {
  const o = opcoes || {};
  const registro = {};
  const ctx = vm.createContext({
    Logger: { log: function () {} }, console: { log: function () {} },
    JSON: JSON, Math: Math, Object: Object, String: String, Number: Number,
    Array: Array, Date: Date, isFinite: isFinite, parseFloat: parseFloat,
    parseInt: parseInt, RegExp: RegExp, Error: Error
  });

  ctx.SlidesApp = montarSlidesApp(registro);
  ctx.SpreadsheetApp = { getActiveSpreadsheet: function () { return null; } };
  ctx.PropertiesService = {
    getScriptProperties: function () {
      return { getProperty: function () { return null; }, setProperty: function () {} };
    }
  };
  ctx.Session = { getActiveUser: function () { return { getEmail: function () { return 'a@b.c'; } }; } };
  ctx.Utilities = {
    formatDate: function () { return '07/09/2026 10:00'; },
    getUuid: function () { return 'u'; }
  };
  ctx.DriveApp = {
    getFileById: function () {
      return {
        getAs: function () {
          return {
            setName: function (n) { registro.pdfNome = n; return this; },
            getBytes: function () { return new Array(o.pdfVazio ? 100 : 50000); }
          };
        }
      };
    },
    getFolderById: function () {
      return { createFile: function (b) { registro.pdfCriado = true;
        return { getUrl: function () { return 'https://drive/pdf'; } }; } };
    },
    createFile: function () { return { getUrl: function () { return 'https://drive/raiz'; } }; }
  };

  ['Util.gs', 'Config.gs', 'Cnpj.gs', 'Avaliacao.gs', 'Equalizacao.gs',
   'Exportar.gs', 'Apresentacao_Conselho.gs', 'ExportarSlides.gs'].forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctx, { filename: f });
  });

  // Os mocks vão DEPOIS de carregar: declaração de função sobrescreve
  // propriedade do contexto, e um mock posto antes some sem avisar.
  ctx.cfMapaEqualizacao_ = function () { return fixture; };
  ctx.cfEmpresaDoMega_ = function () { return { nome: 'DEMERCADO COMERCIO LTDA' }; };
  ctx.cfDataTexto_ = function (d) { return d ? String(d) : ''; };
  if (o.quebrarPagina) ctx[o.quebrarPagina] = function () { throw new Error('falha proposital'); };

  return { ctx: ctx, registro: registro };
}


// ─────────────────────────────────────────────────────────────
//  Leitura do que foi desenhado
// ─────────────────────────────────────────────────────────────

function textos(deck) {
  return deck.slides.map(function (s) {
    return s.formas.map(function (f) { return f.texto; }).filter(Boolean);
  });
}
function tudo(deck) { return textos(deck).map(function (t) { return t.join(' | '); }); }


// ─────────────────────────────────────────────────────────────
//  Fixture
// ─────────────────────────────────────────────────────────────

function proponente(id, nome, total, extras) {
  return Object.assign({
    id: id, nome: nome, cnpj: '11222333000181', total: total,
    contato: 'Fulano', telefone: '41 3333-0000', email: 'x@y.com',
    cidade: 'Curitiba', uf: 'PR', numero: 'P-' + id,
    condicoes: '30 dias', prazoExecucao: '15 dias', validadeAte: '30/09/2026',
    vencedora: false, iqf: null
  }, extras || {});
}

function item(codigo, descricao, precos, opcoes) {
  const o = opcoes || {};
  return {
    tipo: o.tipo || 'item', codigo: codigo, descricao: descricao,
    quantidade: o.quantidade === undefined ? 10 : o.quantidade,
    unidade: o.unidade || 'un', precos: precos || {}, menor: o.menor || null
  };
}

function fixtureBase(qtdItens, props) {
  const linhas = [item('1', 'GRUPO PRINCIPAL', {}, { tipo: 'grupo' })];
  for (let i = 1; i <= qtdItens; i++) {
    const precos = {};
    props.forEach(function (p, j) {
      // O último proponente não cota o item 2: é a ressalva que o
      // documento precisa mostrar.
      if (i === 2 && j === props.length - 1) {
        precos[p.id] = { valor: null, total: null, status: 'nao_cotado', marcaCotada: '' };
      } else {
        precos[p.id] = { valor: 100 + j * 10, total: (100 + j * 10) * 10,
                         status: 'cotado', marcaCotada: 'Marca ' + j };
      }
    });
    linhas.push(item('1.' + i, 'Item de teste número ' + i, precos, { menor: props[0].id }));
  }
  return {
    equalizacao: {
      id: 'EQ-SLIDE-1', empreendimento: 'MEGA CURITIBA', projeto: 'Retrofit',
      area: 'Facilities', grupoCentroCusto: 'GCC-1', data: '01/09/2026',
      status: 'em_analise'
    },
    proponentes: props,
    linhas: linhas,
    pendencias: []
  };
}


// ═════════════════════════════════════════════════════════════
//  1. O documento sai inteiro, e na ordem
// ═════════════════════════════════════════════════════════════
{
  const props = [proponente('A', 'ALFA CONSTRUTORA LTDA', 1000, { vencedora: true }),
                 proponente('B', 'BETA SERVICOS EIRELI', 1200)];
  const a = montar(fixtureBase(6, props));
  const r = a.ctx.cfExportarEqualizacaoSlides_('EQ-SLIDE-1');

  const paginas = tudo(a.registro.deck);
  assert.ok(paginas.length >= 6,
    'o documento precisa ter capa, cadastro, grade, totais, negociação e ' +
    'responsáveis — saíram ' + paginas.length + ' páginas');

  assert.ok(/PROPOSTA RECOMENDADA/.test(paginas[0]),
    'a decisão vem na primeira página: quem homologa lê para conferir, não ' +
    'para descobrir');
  assert.ok(/ALFA/.test(paginas[0]), 'e a página da decisão nomeia o vencedor');

  assert.ok(paginas.some(function (p) { return /Elaborado por \(Suprimentos\)/.test(p); }),
    'a página de responsáveis precisa existir');

  assert.equal(r.pdf, 'https://drive/pdf', 'o PDF vai para a pasta do projeto');
  assert.ok(/EQ-SLIDE-1/.test(a.registro.pdfNome), 'o PDF leva o identificador no nome');
  assert.ok(a.registro.deck.fechado,
    'o deck precisa ser fechado ANTES de exportar, senão o PDF sai sem as ' +
    'últimas alterações');
}

// ═════════════════════════════════════════════════════════════
//  2. As duas vias assinam com as MESMAS palavras
// ═════════════════════════════════════════════════════════════
//
//   Duas vias do mesmo documento com textos de assinatura diferentes é
//   o tipo de divergência que só aparece depois que alguém assinou.
{
  const oficial = fs.readFileSync(path.join(root, 'app', 'Exportar.gs'), 'utf8');
  const slides = fs.readFileSync(path.join(root, 'app', 'ExportarSlides.gs'), 'utf8');
  ['Elaborado por (Suprimentos):',
   'Revisado por:',
   'escopo e valores conferidos'].forEach(function (rotulo) {
    assert.ok(oficial.indexOf(rotulo) >= 0 && slides.indexOf(rotulo) >= 0,
      'o rótulo de assinatura “' + rotulo + '” precisa ser idêntico nas duas vias');
  });
}

// ═════════════════════════════════════════════════════════════
//  3. A grade pagina, e o cabeçalho se repete
// ═════════════════════════════════════════════════════════════
//
//   O Slides não reflui: a página tem tamanho fixo e nada empurra nada.
//   Sem paginação nossa, os itens do fim simplesmente somem para fora da
//   página — sem erro, sem aviso, sem nada.
{
  const props = [proponente('A', 'ALFA', 1000), proponente('B', 'BETA', 1200)];
  const a = montar(fixtureBase(60, props));
  a.ctx.cfExportarEqualizacaoSlides_('EQ-SLIDE-1');

  const paginas = tudo(a.registro.deck);
  const daGrade = paginas.filter(function (p) { return /Grade comparativa/.test(p); });

  assert.ok(daGrade.length >= 2,
    '61 linhas não cabem numa página só: a grade precisa paginar, e saiu em ' +
    daGrade.length + ' página(s)');

  daGrade.forEach(function (p, i) {
    assert.ok(/Descrição/.test(p) && /Qtd\./.test(p),
      'o cabeçalho da grade precisa se repetir na página ' + (i + 1) + ': é o ' +
      'que a planilha ganha de graça no PDF e aqui é por nossa conta');
  });

  // Nenhum item pode ficar de fora — é o defeito silencioso desta abordagem.
  const desenhados = paginas.join(' | ');
  for (let i = 1; i <= 60; i++) {
    assert.ok(desenhados.indexOf('Item de teste número ' + i + ' ') >= 0 ||
              desenhados.indexOf('Item de teste número ' + i + '|') >= 0 ||
              new RegExp('Item de teste número ' + i + '(\\D|$)').test(desenhados),
      'o item ' + i + ' sumiu do documento: paginação perdeu conteúdo');
  }
}

// ═════════════════════════════════════════════════════════════
//  4. Muitos proponentes paginam para o lado
// ═════════════════════════════════════════════════════════════
{
  const props = [];
  for (let i = 0; i < 8; i++) props.push(proponente('P' + i, 'FORNECEDOR ' + i, 1000 + i));
  const a = montar(fixtureBase(5, props));
  a.ctx.cfExportarEqualizacaoSlides_('EQ-SLIDE-1');

  const paginas = tudo(a.registro.deck);
  const daGrade = paginas.filter(function (p) { return /Grade comparativa/.test(p); });
  assert.ok(daGrade.length >= 2,
    'oito proponentes não cabem na largura: a grade precisa quebrar para o ' +
    'lado também, e não espremer a descrição até virar ilegível');
  assert.ok(daGrade.some(function (p) { return /proponentes 1/.test(p); }),
    'e cada página precisa dizer quais proponentes estão nela');
}

// ═════════════════════════════════════════════════════════════
//  5. Quem não cotou é dito, não deixado em branco
// ═════════════════════════════════════════════════════════════
//
//   Célula vazia o leitor lê como "esqueci de preencher". O documento
//   precisa dizer que o fornecedor não ofereceu aquele item, porque isso
//   muda a comparação daquela linha.
{
  const props = [proponente('A', 'ALFA', 1000), proponente('B', 'BETA', 1200)];
  const a = montar(fixtureBase(4, props));
  a.ctx.cfExportarEqualizacaoSlides_('EQ-SLIDE-1');

  // A busca é RESTRITA às páginas da grade, e isso não é detalhe: a
  // legenda da página de totais explica o que “não cotou” significa, e
  // procurar no documento inteiro casa com a legenda mesmo quando a
  // grade está em branco. A primeira versão deste teste fazia isso e
  // passava com o recurso desligado.
  const daGrade = tudo(a.registro.deck)
    .filter(function (p) { return /Grade comparativa/.test(p); });

  assert.ok(daGrade.length, 'sem página de grade não há o que verificar');
  assert.ok(daGrade.some(function (p) { return /não cotou/.test(p); }),
    'na GRADE, o item que um proponente não cotou precisa aparecer marcado — ' +
    'célula vazia o leitor lê como “esqueci de preencher”');
}

// ═════════════════════════════════════════════════════════════
//  6. Fornecedor sem avaliação não vira nota zero
// ═════════════════════════════════════════════════════════════
//
//   É o mesmo defeito que a taxa de vitória tinha ao exibir 0% sem
//   disputa: inventar desempenho ruim para quem nunca foi avaliado.
{
  const props = [
    proponente('A', 'ALFA', 1000, { iqf: { nota: 88.5, classe: 'A', preliminar: false } }),
    proponente('B', 'BETA', 1200, { iqf: null })
  ];
  const a = montar(fixtureBase(3, props));
  a.ctx.cfExportarEqualizacaoSlides_('EQ-SLIDE-1');

  const capa = tudo(a.registro.deck)[0];
  assert.ok(/IQF 88\.5/.test(capa) || /IQF 88,5/.test(capa),
    'o IQF de quem tem nota precisa aparecer: ' + capa);
  assert.ok(/IQF sem nota/.test(capa),
    'e quem não tem avaliação precisa aparecer como “sem nota”, nunca como 0');
  assert.ok(!/IQF 0\b/.test(capa),
    'nota zero para quem nunca foi avaliado é desempenho inventado');
}

// ═════════════════════════════════════════════════════════════
//  7. Equalização grande demais é recusada com instrução
// ═════════════════════════════════════════════════════════════
//
//   Sem escrita em lote, uma grade grande não termina nos 6 minutos do
//   Apps Script. Morrer no meio deixa um documento parcial no Drive com
//   cara de pronto — pior que recusar.
{
  const props = [];
  for (let i = 0; i < 6; i++) props.push(proponente('P' + i, 'FORN ' + i, 1000));
  const a = montar(fixtureBase(400, props));

  let erro = null;
  try { a.ctx.cfExportarEqualizacaoSlides_('EQ-SLIDE-1'); } catch (e) { erro = e; }

  assert.ok(erro, 'uma equalização grande demais precisa ser recusada antes de começar');
  assert.ok(/planilha/.test(erro.message),
    'e a recusa precisa dizer o que fazer — usar a via em planilha: ' + erro.message);
}

// ═════════════════════════════════════════════════════════════
//  8. Uma página que quebra não derruba o documento
// ═════════════════════════════════════════════════════════════
{
  const props = [proponente('A', 'ALFA', 1000)];
  const a = montar(fixtureBase(3, props), { quebrarPagina: '_exPaginaTotais_' });
  a.ctx.cfExportarEqualizacaoSlides_('EQ-SLIDE-1');

  const paginas = tudo(a.registro.deck);
  assert.ok(paginas.some(function (p) { return /Não consegui desenhar/.test(p); }),
    'a página que falhou precisa virar um aviso visível, não um buraco');
  assert.ok(paginas.some(function (p) { return /Elaborado por/.test(p); }),
    'e as páginas seguintes precisam continuar saindo: um try/catch por página ' +
    'existe justamente para a primeira falha não abortar o resto');
  assert.ok(paginas.some(function (p) { return /via oficial em planilha/.test(p); }),
    'o aviso de falha diz que a via oficial não foi afetada');
}

// ═════════════════════════════════════════════════════════════
//  9. PDF praticamente vazio é falha, não sucesso
// ═════════════════════════════════════════════════════════════
{
  const props = [proponente('A', 'ALFA', 1000)];
  const a = montar(fixtureBase(3, props), { pdfVazio: true });

  let erro = null;
  try { a.ctx.cfExportarEqualizacaoSlides_('EQ-SLIDE-1'); } catch (e) { erro = e; }
  assert.ok(erro && /vazio/.test(erro.message),
    'um PDF de poucos bytes é uma falha silenciosa com cara de sucesso — a via ' +
    'em planilha já tinha essa guarda e esta precisa ter também');
}

// ═════════════════════════════════════════════════════════════
// 10. Toda página se identifica
// ═════════════════════════════════════════════════════════════
//
//   Folha solta de um documento de conferência precisa dizer de onde
//   veio e onde está — a planilha faz isso com cabeçalho de impressão.
{
  const props = [proponente('A', 'ALFA', 1000)];
  const a = montar(fixtureBase(10, props));
  a.ctx.cfExportarEqualizacaoSlides_('EQ-SLIDE-1');

  tudo(a.registro.deck).forEach(function (p, i) {
    assert.ok(/EQ-SLIDE-1/.test(p),
      'a página ' + (i + 1) + ' não carrega o identificador da equalização');
    assert.ok(/Página \d+/.test(p),
      'a página ' + (i + 1) + ' não está numerada');
  });
}

console.log('OK: a via em Slides pagina, identifica cada página, marca o que não ' +
            'foi cotado e recusa o que não caberia no tempo.');
