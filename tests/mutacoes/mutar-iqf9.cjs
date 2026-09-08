const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const alvo = path.join(raiz, 'app', 'Avaliacao.gs');
const teste = path.join(raiz, 'tests', 'teste-iqf.cjs');
const original = fs.readFileSync(alvo, 'utf8');

const de = '             e.CNPJ_VENCEDOR &&\n';
console.log('ocorrencias da ancora:', original.split(de).length - 1);

fs.writeFileSync(alvo, original.replace(de, ''), 'utf8');
let pegou = false;
try { execFileSync(process.execPath, [teste], { stdio: 'pipe' }); } catch (e) { pegou = true; }
fs.writeFileSync(alvo, original, 'utf8');

console.log((pegou ? 'PEGOU  ' : 'PASSOU ') + ' · a fila devolve homologada sem vencedor gravado');
process.exit(pegou ? 0 : 1);
