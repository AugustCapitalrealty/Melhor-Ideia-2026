const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const alvo = path.join(raiz, 'app', 'Equalizacao.gs');
const teste = path.join(raiz, 'tests', 'teste-saving-panorama.cjs');
const original = fs.readFileSync(alvo, 'utf8');

const mutacoes = [
  { nome: 'saving negativo passa a ser reportado como prejuizo',
    de: "  return saving > 0 ? Math.round(saving * 100) / 100 : null;",
    para: "  return Math.round(saving * 100) / 100;" },
  // A mutação anterior aqui ("apagar o guarda de inicial") SOBREVIVIA, e
  // não era defeito: sem o guarda, inicial vira null, a subtração dá NaN
  // e `NaN > 0` é falso — o retorno continua null. O código se defende
  // sozinho. Trocada por uma que muda o resultado de verdade.
  { nome: 'compra sem valor inicial vira saving ZERO em vez de null',
    de: "  if (inicial === null || inicial <= 0) return null;",
    para: "  if (inicial === null || inicial <= 0) return 0;" },
  { nome: 'equalizacao nao homologada passa a contar',
    de: "  if (String(eq.STATUS || '') !== 'homologada') return null;\r\n",
    para: "" },
  { nome: 'o saving volta a cair no mes da COTACAO',
    de: "    const data = dataDecisao || cfData_(eq.DATA_EQUALIZACAO);",
    para: "    const data = cfData_(eq.DATA_EQUALIZACAO) || dataDecisao;" },
  { nome: 'a aproximacao de data deixa de ser contada',
    de: "    if (!dataDecisao) aproximadas++;", para: "" },
  { nome: 'o denominador de homologadas sem registro some',
    de: "    semRegistro: homologadas - compras,", para: "    semRegistro: 0," },
  { nome: 'o percentual passa a ser sobre o contratado (infla o resultado)',
    de: "      ? Math.round((total / (total + totalContratado)) * 1000) / 10 : null,",
    para: "      ? Math.round((total / totalContratado) * 1000) / 10 : null," },
  { nome: 'quem criou volta a ganhar de quem homologou',
    de: "    acumular(porPessoa, eq.HOMOLOGADO_POR || eq.CRIADO_POR, saving, contratado);",
    para: "    acumular(porPessoa, eq.CRIADO_POR || eq.HOMOLOGADO_POR, saving, contratado);" },
  { nome: 'as quebras deixam de sair ordenadas por saving',
    de: "      : lista.sort(function (a, b) { return b.saving - a.saving; });",
    para: "      : lista;" }
];

let ok = true;
mutacoes.forEach(function (m) {
  const n = original.split(m.de).length - 1;
  if (n !== 1) { console.log('!! ancora com ' + n + ' ocorrencia(s): ' + m.nome); ok = false; return; }
  fs.writeFileSync(alvo, original.replace(m.de, m.para), 'utf8');
  let pegou = false;
  try { execFileSync(process.execPath, [teste], { stdio: 'pipe' }); } catch (e) { pegou = true; }
  fs.writeFileSync(alvo, original, 'utf8');
  console.log((pegou ? 'PEGOU  ' : 'PASSOU ') + ' · ' + m.nome);
  if (!pegou) ok = false;
});

try { execFileSync(process.execPath, [teste], { stdio: 'pipe' }); console.log('PASSA   · com o codigo integro'); }
catch (e) { console.log('!! falha com o codigo integro'); ok = false; }
process.exit(ok ? 0 : 1);
