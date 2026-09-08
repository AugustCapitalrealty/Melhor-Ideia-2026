const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const A = function (p) { return path.join(raiz, p); };
const T = function (n) { return path.join(raiz, 'tests', n); };

const tExp = T('teste-exportacao-benchmark-iqf.cjs');
const tPan = T('teste-saving-panorama.cjs');
const tTela = T('teste-tela-saving.cjs');
const tLinha = T('teste-linha-reinserida.cjs');

const mutacoes = [
  { arq: 'app/Exportar.gs', teste: tExp,
    nome: 'o cabecalho da linha volta a afirmar COMPRA sempre',
    de: "        lv[COL_VALOR - 1] = item.referenciaHistorica.foiVencedora\r\n          ? 'Variação vs últ. compra'\r\n          : 'Variação vs últ. proposta';",
    para: "        lv[COL_VALOR - 1] = 'Variação vs últ. compra';" },

  { arq: 'app/Exportar.gs', teste: tExp,
    nome: 'a legenda global volta a afirmar COMPRA para todos os itens',
    de: "vs a referência | ▼ verde = economia ≤ -10% vs a referência",
    para: "vs última compra | ▼ verde = economia ≤ -10% vs última compra" },

  { arq: 'app/Equalizacao.gs', teste: tPan,
    nome: 'o painel volta a ignorar em silencio o acervo sem decisao',
    de: "    semDecisao: semDecisao,",
    para: "" },

  { arq: 'app/Equalizacao.gs', teste: tPan,
    nome: 'o contador some quando e zero, em vez de ser sempre um numero',
    de: "    semDecisao: semDecisao,",
    para: "    semDecisao: semDecisao || undefined," },

  { arq: 'app/Interface.html', teste: tTela,
    nome: 'a tela para de mostrar a fila que explica o painel vazio',
    de: "        (p.semDecisao > 0\r\n          ? '<br><br><b>' + p.semDecisao +",
    para: "        (false\r\n          ? '<br><br><b>' + p.semDecisao +" },

  // A varredura precisa PEGAR um bloco colado dentro de tests/ — que e o
  // ponto cego que ela tinha: la a duplicata passa duas vezes e a suite
  // fica verde.
  { arq: 'tests/teste-saving-panorama.cjs', teste: tLinha,
    nome: 'um bloco de 2 linhas colado duas vezes DENTRO de tests/',
    de: "  assert.equal(p.homologadas, 1, 'só a homologada entra no denominador');\r\n  assert.equal(p.compras, 1);",
    para: "  assert.equal(p.homologadas, 1, 'só a homologada entra no denominador');\r\n  assert.equal(p.compras, 1);\r\n  assert.equal(p.homologadas, 1, 'só a homologada entra no denominador');\r\n  assert.equal(p.compras, 1);" }
];

let ok = true;

mutacoes.forEach(function (m) {
  const p = A(m.arq);
  const orig = fs.readFileSync(p, 'utf8');
  // O projeto mistura CRLF e LF; a ancora tenta as duas formas.
  const CRLF = String.fromCharCode(13) + String.fromCharCode(10);
  const LF = String.fromCharCode(10);
  let de = m.de, para = m.para;
  if (orig.split(de).length - 1 !== 1) {
    de = m.de.split(CRLF).join(LF);
    para = m.para.split(CRLF).join(LF);
  }
  const n = orig.split(de).length - 1;
  if (n !== 1) { console.log('!! ancora com ' + n + ': ' + m.nome); ok = false; return; }

  fs.writeFileSync(p, orig.replace(de, para), 'utf8');
  let pegou = false;
  try { execFileSync(process.execPath, [m.teste], { stdio: 'pipe' }); }
  catch (e) { pegou = true; }
  fs.writeFileSync(p, orig, 'utf8');

  console.log((pegou ? 'PEGOU  ' : 'PASSOU ') + ' \u00b7 ' + m.nome);
  if (!pegou) ok = false;
});

[tExp, tPan, tTela, tLinha].forEach(function (t) {
  try { execFileSync(process.execPath, [t], { stdio: 'pipe' }); }
  catch (e) { console.log('!! falha com o codigo integro: ' + path.basename(t)); ok = false; }
});
if (ok) console.log('PASSA   \u00b7 os quatro com o codigo integro');

process.exit(ok ? 0 : 1);
