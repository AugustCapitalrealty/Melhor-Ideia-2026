const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const arq = {
  per: path.join(raiz, 'app', 'Persistencia.gs'),
  eq: path.join(raiz, 'app', 'Equalizacao.gs'),
  ui: path.join(raiz, 'app', 'Interface.html')
};
const orig = {
  per: fs.readFileSync(arq.per, 'utf8'),
  eq: fs.readFileSync(arq.eq, 'utf8'),
  ui: fs.readFileSync(arq.ui, 'utf8')
};

const tCaminho = path.join(raiz, 'tests', 'teste-caminho-do-saving.cjs');
const tLaco = path.join(raiz, 'tests', 'teste-laco-avaliacao.cjs');
const tLinha = path.join(raiz, 'tests', 'teste-linha-reinserida.cjs');

const mutacoes = [
  { a: 'per', t: tCaminho, nome: 'o importador volta a descartar a proposta inicial (o defeito)',
    de: "        VALOR_PROPOSTA_INICIAL: cfNumero_(p.propostaInicial) === null ? '' : cfNumero_(p.propostaInicial),\r\n",
    para: "" },
  { a: 'per', t: tCaminho, nome: 'a proposta inicial passa a ser um literal em vez do que o parser extraiu',
    de: "VALOR_PROPOSTA_INICIAL: cfNumero_(p.propostaInicial) === null ? '' : cfNumero_(p.propostaInicial),",
    para: "VALOR_PROPOSTA_INICIAL: ''," },
  { a: 'per', t: tCaminho, nome: 'a reducao negociada deixa de ser persistida',
    de: "        REDUCAO_NEGOCIADA: cfNumero_(p.reducaoCalculada) || '',\r\n", para: "" },
  { a: 'eq', t: tCaminho, nome: 'o fallback para quem criou volta a ser silencioso',
    de: "      (eq.CRIADO_POR ? eq.CRIADO_POR + ' (criou; sem registro de quem homologou)' : '');",
    para: "      (eq.CRIADO_POR || '');" },
  { a: 'ui', t: tLaco, nome: 'o selo de IQF volta a morrer no cabecalho da grade',
    de: "             '<small>' + rotuloBase + '</small>' +\r\n             seloHtml + '</th>';",
    para: "             '<small>' + rotuloBase + '</small></th>';\r\n             seloHtml + '</th>';" },
  { a: 'ui', t: tLinha, nome: 'a varredura precisa PEGAR a linha morta reinserida',
    de: "             '<small>' + rotuloBase + '</small>' +\r\n             seloHtml + '</th>';",
    para: "             '<small>' + rotuloBase + '</small></th>';\r\n             seloHtml + '</th>';" }
];

let ok = true;
mutacoes.forEach(function (m) {
  const o = orig[m.a];
  const n = o.split(m.de).length - 1;
  if (n !== 1) { console.log('!! ancora com ' + n + ': ' + m.nome); ok = false; return; }
  fs.writeFileSync(arq[m.a], o.replace(m.de, m.para), 'utf8');
  let pegou = false;
  try { execFileSync(process.execPath, [m.t], { stdio: 'pipe' }); } catch (e) { pegou = true; }
  fs.writeFileSync(arq[m.a], o, 'utf8');
  console.log((pegou ? 'PEGOU  ' : 'PASSOU ') + ' · ' + m.nome);
  if (!pegou) ok = false;
});

[tCaminho, tLaco, tLinha].forEach(function (t) {
  try { execFileSync(process.execPath, [t], { stdio: 'pipe' }); }
  catch (e) { console.log('!! falha com o codigo integro: ' + path.basename(t)); ok = false; }
});
if (ok) console.log('PASSA   · os tres com o codigo integro');
process.exit(ok ? 0 : 1);
