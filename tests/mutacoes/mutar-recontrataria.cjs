const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const alvo = path.join(raiz, 'app', 'Avaliacao.gs');
const teste = path.join(raiz, 'tests', 'teste-iqf.cjs');
const original = fs.readFileSync(alvo, 'utf8');

const mutacoes = [
  { nome: 'silencio volta a ser gravado como "nao recontrataria" (o defeito)',
    de: "  if (recontrataria === null) {\n" +
        "    throw new Error('Falta responder se contrataria este fornecedor de novo.');\n" +
        "  }\n",
    para: "" },
  { nome: 'o "nao" explicito passa a ser gravado como sim',
    de: "    RECONTRATARIA: recontrataria,", para: "    RECONTRATARIA: true," }
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
