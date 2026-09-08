const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const alvo = path.join(raiz, 'app', 'Exportar.gs');
const teste = path.join(raiz, 'tests', 'validar-correcoes.cjs');
const original = fs.readFileSync(alvo, 'utf8');

const mutacoes = [
  {
    nome: 'a linha da Diretoria Executiva volta ao documento',
    de: "   ['Revisado por:', 'escopo e valores conferidos — nome, data e assinatura']].forEach(function (c) {",
    para: "   ['Revisado por:', 'escopo e valores conferidos — nome, data e assinatura'],\r\n" +
          "   ['Homologação (Diretoria Executiva):', 'nome, data e assinatura']].forEach(function (c) {"
  },
  {
    nome: 'o titulo volta a ser HOMOLOGACAO',
    de: "li[COL_ROTULO - 1] = 'RESPONSÁVEIS';",
    para: "li[COL_ROTULO - 1] = 'HOMOLOGAÇÃO';"
  },
  {
    nome: 'a linha Revisado por some',
    de: "   ['Revisado por:', 'escopo e valores conferidos — nome, data e assinatura']].forEach(function (c) {",
    para: "  ].forEach(function (c) {"
  }
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
