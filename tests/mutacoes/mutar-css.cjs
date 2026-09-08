const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const alvo = path.join(raiz, 'app', 'Interface.html');
const teste = path.join(raiz, 'tests', 'teste-css-integro.cjs');
const original = fs.readFileSync(alvo, 'utf8');

const mutacoes = [
  {
    nome: 'a chave de fechamento do @media some de novo (o defeito original)',
    de: "  .ficha-dl dd{margin-bottom:8px}\r\n}\r\n",
    para: "  .ficha-dl dd{margin-bottom:8px}\r\n"
  },
  {
    nome: 'o modal de predefinicoes e movido para dentro de um @media',
    de: ".modal-presets-janela {",
    para: "@media(max-width:640px){ .modal-presets-janela {"
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
