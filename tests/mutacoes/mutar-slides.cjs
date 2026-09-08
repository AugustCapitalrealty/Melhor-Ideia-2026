const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const alvo = path.join(raiz, 'app', 'ExportarSlides.gs');
const teste = path.join(raiz, 'tests', 'teste-exportar-slides.cjs');

const CRLF = String.fromCharCode(13) + String.fromCharCode(10);
const LF = String.fromCharCode(10);

const mutacoes = [
  { nome: 'a grade para de paginar por altura (itens do fim somem em silencio)',
    de: '  const cabemLinhas = Math.max(1, Math.floor(util / EX_H.linha));',
    para: '  const cabemLinhas = 100000;' },

  { nome: 'a grade para de paginar por largura (proponentes espremidos)',
    de: '  const cabemProp = Math.max(1, Math.floor((larg - fixas) / porProponente));',
    para: '  const cabemProp = 100000;' },

  { nome: 'quem nao cotou volta a ficar em branco',
    de: "      _cnUmaLinha_(slide, x.prop(i), y, wProp, EX_H.linha, 'não cotou',",
    para: "      _cnUmaLinha_(slide, x.prop(i), y, wProp, EX_H.linha, ''," },

  { nome: 'fornecedor sem avaliacao volta a exibir nota zero',
    de: "    _cnPill_(slide, x, y, 92, 18, 'IQF sem nota',",
    para: "    _cnPill_(slide, x, y, 92, 18, 'IQF 0'," },

  { nome: 'o teto de elementos some (morre no minuto seis com doc parcial)',
    de: '  if (orcamento.elementos > EX_MAX_ELEMENTOS) {',
    para: '  if (false) {' },

  { nome: 'o try/catch por pagina some (a primeira falha aborta o resto)',
    de: '    try {\r\n      p[1](ctx, p[2]);\r\n    } catch (e) {',
    para: '    if (true) {\r\n      p[1](ctx, p[2]);\r\n    } else if (e) {' },

  { nome: 'a guarda de PDF vazio some',
    de: '  if (blob.getBytes().length < 3000) {',
    para: '  if (false) {' },

  { nome: 'a pagina deixa de ser numerada',
    de: "    'Página ' + ctx.pagina,",
    para: "    '',", },

  { nome: 'o identificador some das paginas internas',
    de: '  _cnUmaLinha_(slide, EX_MX, y, ctx.W * 0.6, 14, ctx.titulo,',
    para: "  _cnUmaLinha_(slide, EX_MX, y, ctx.W * 0.6, 14, '',", },

  { nome: 'o deck deixa de ser fechado antes de exportar o PDF',
    de: '  deck.saveAndClose();',
    para: '  // deck.saveAndClose();' },

  { nome: 'o rotulo de assinatura diverge da via oficial',
    de: "  [['Elaborado por (Suprimentos):', 'nome, data e assinatura'],",
    para: "  [['Elaborado por:', 'nome, data e assinatura']," },

  { nome: 'a decisao sai da primeira pagina',
    de: "      'PROPOSTA RECOMENDADA',\r\n      cfValorTexto_(vencedora.total),",
    para: "      'RESUMO',\r\n      cfValorTexto_(vencedora.total)," }
];

let ok = true;
const orig = fs.readFileSync(alvo, 'utf8');

mutacoes.forEach(function (m) {
  let de = m.de, para = m.para;
  if (orig.split(de).length - 1 !== 1) {
    de = m.de.split(CRLF).join(LF);
    para = m.para.split(CRLF).join(LF);
  }
  const n = orig.split(de).length - 1;
  if (n !== 1) { console.log('!! ancora com ' + n + ': ' + m.nome); ok = false; return; }

  fs.writeFileSync(alvo, orig.replace(de, para), 'utf8');
  let pegou = false;
  try { execFileSync(process.execPath, [teste], { stdio: 'pipe' }); }
  catch (e) { pegou = true; }
  fs.writeFileSync(alvo, orig, 'utf8');

  console.log((pegou ? 'PEGOU  ' : 'PASSOU ') + ' \u00b7 ' + m.nome);
  if (!pegou) ok = false;
});

try { execFileSync(process.execPath, [teste], { stdio: 'pipe' }); console.log('PASSA   \u00b7 com o codigo integro'); }
catch (e) { console.log('!! falha com o codigo integro'); ok = false; }

process.exit(ok ? 0 : 1);
