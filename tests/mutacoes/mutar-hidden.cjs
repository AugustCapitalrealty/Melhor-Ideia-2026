const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const alvo = path.join(raiz, 'app', 'Interface.html');
const teste = path.join(raiz, 'tests', 'teste-css-integro.cjs');
const original = fs.readFileSync(alvo, 'utf8');

const GUARDA = "[hidden] { display: none !important; }";

const mutacoes = [
  {
    nome: 'a guarda [hidden] some (o defeito: modal que nunca fecha)',
    de: GUARDA + "\r\n",
    para: ""
  },
  {
    nome: 'a guarda existe mas vem ANTES do display forcado do modal',
    de: GUARDA,
    para: ""
  },
  {
    nome: 'a guarda perde o !important',
    de: GUARDA,
    para: "[hidden] { display: none; }"
  }
];

let ok = true;

// A segunda mutacao precisa mover a guarda para o topo, nao so remove-la.
mutacoes.forEach(function (m, i) {
  const n = original.split(m.de).length - 1;
  if (n !== 1) { console.log('!! ancora com ' + n + ' ocorrencia(s): ' + m.nome); ok = false; return; }

  let mutado = original.replace(m.de, m.para);
  if (i === 1) {
    // Reinsere a guarda logo depois do <style>, antes de tudo.
    mutado = mutado.replace('<style>\r\n', '<style>\r\n' + GUARDA + '\r\n');
  }

  fs.writeFileSync(alvo, mutado, 'utf8');
  let pegou = false;
  try { execFileSync(process.execPath, [teste], { stdio: 'pipe' }); } catch (e) { pegou = true; }
  fs.writeFileSync(alvo, original, 'utf8');
  console.log((pegou ? 'PEGOU  ' : 'PASSOU ') + ' · ' + m.nome);
  if (!pegou) ok = false;
});

try { execFileSync(process.execPath, [teste], { stdio: 'pipe' }); console.log('PASSA   · com o codigo integro'); }
catch (e) { console.log('!! falha com o codigo integro'); ok = false; }
process.exit(ok ? 0 : 1);
