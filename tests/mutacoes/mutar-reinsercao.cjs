const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const alvo = path.join(raiz, 'app', 'Interface.html');
const teste = path.join(raiz, 'tests', 'teste-linha-reinserida.cjs');
const original = fs.readFileSync(alvo, 'utf8');

// Cada mutação reintroduz uma das linhas que foram removidas de verdade.
const mutacoes = [
  { nome: 'addProponente volta a criar DUAS colunas (caso real)',
    de: "  proponentes.push({ nome: '', cnpj: '', iqf: null });",
    para: "  proponentes.push({ nome: '', cnpj: '' });\n  proponentes.push({ nome: '', cnpj: '', iqf: null });" },
  { nome: 'a regra .resolvido antiga volta acima da nova (caso real)',
    de: ".resolvido{min-height:20px;margin-top:6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}",
    para: ".resolvido{min-height:20px;margin-top:6px}\n.resolvido{min-height:20px;margin-top:6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}" },
  { nome: 'o th.innerHTML sem seloHtml volta acima do certo (caso real)',
    de: "    th.innerHTML = '<span class=\"th-nome-prop\">' + esc(nomeCurto) + '</span><small>' + rotulo + '</small>' + seloHtml;",
    para: "    th.innerHTML = '<span class=\"th-nome-prop\">' + esc(nomeCurto) + '</span><small>' + rotulo + '</small>';\n" +
          "    th.innerHTML = '<span class=\"th-nome-prop\">' + esc(nomeCurto) + '</span><small>' + rotulo + '</small>' + seloHtml;" }
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
