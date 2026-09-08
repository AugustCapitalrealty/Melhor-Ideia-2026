const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const alvo = path.join(raiz, 'app', 'Avaliacao.gs');
const teste = path.join(raiz, 'tests', 'teste-iqf.cjs');
const original = fs.readFileSync(alvo, 'utf8');

const mutacoes = [
  { nome: 'o avaliador passa a vir do formulario, nao do login',
    de: "    AVALIADOR: cfUsuario_(),", para: "    AVALIADOR: d.avaliador || cfUsuario_()," },
  { nome: 'a nota deixa de ser gravada',
    de: "    NOTA: media,", para: "    NOTA: ''," },
  { nome: 'a media vira a soma',
    de: "  const media = Math.round((soma / CF_CRITERIOS_AVALIACAO.length) * 100) / 100;",
    para: "  const media = soma;" },
  { nome: 'nota fora da escala passa a ser aceita',
    de: "  return isFinite(n) && n >= 1 && n <= 5 && Math.floor(n) === n;",
    para: "  return true;" },
  { nome: 'papel fora do enum entra cru',
    de: "  const papel = CF_ENUM.papelAvaliador.indexOf(d.papel) >= 0 ? d.papel : 'outro';",
    para: "  const papel = d.papel || 'outro';" },
  { nome: 'a nota preliminar deixa de ser marcada',
    de: "      preliminar: g.n < CF_IQF_MINIMO_FIRME,", para: "      preliminar: false," },
  { nome: 'a ultima avaliacao vira a ultima lida, nao a mais recente',
    de: "    if (d && (!g.ultima || d > g.ultima)) g.ultima = d;", para: "    if (d) g.ultima = d;" },
  { nome: 'a fila devolve tambem quem ja foi avaliado',
    de: "             !jaAvaliadas[String(e.ID)];", para: "             true;" },
  { nome: 'a fila devolve homologada sem vencedor gravado',
    de: "             e.CNPJ_VENCEDOR &&\r\n", para: "" }
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
