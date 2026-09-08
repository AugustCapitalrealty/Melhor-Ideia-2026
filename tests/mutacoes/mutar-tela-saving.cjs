const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const alvo = path.join(raiz, 'app', 'Interface.html');
const teste = path.join(raiz, 'tests', 'teste-tela-saving.cjs');
const original = fs.readFileSync(alvo, 'utf8');

const mutacoes = [
  { nome: 'sem saving o bloco volta a sumir em vez de explicar',
    de: "    el.hidden = false;\r\n    return;\r\n  }",
    para: "    el.hidden = true;\r\n    return;\r\n  }" },
  { nome: 'o denominador some e fica so o total',
    de: "  el.innerHTML = cabecalho + denominador + serie +",
    para: "  el.innerHTML = cabecalho + serie +" },
  { nome: 'a ressalva de mes aproximado deixa de aparecer',
    de: "      (p.dataAproximada > 0\r\n",
    para: "      (false\r\n" },
  { nome: 'a quebra por quem negociou some',
    de: "      quebra('Por quem negociou', p.porPessoa, soLogin) +", para: "" },
  { nome: 'o nome do Mega sai inteiro e estoura a coluna',
    de: "      quebra('Por Mega', p.porMega, simplificarMega) +",
    para: "      quebra('Por Mega', p.porMega) +" },
  { nome: 'a serie deixa de sair em ordem cronologica',
    de: "  var serie = '<div class=\"sav-serie\">' + (p.porMes || []).map(function (m) {",
    para: "  var serie = '<div class=\"sav-serie\">' + (p.porMes || []).slice().reverse().map(function (m) {" },
  { nome: 'ninguem chama o panorama ao abrir a aba',
    de: "      carregarPanoramaSaving();\r\n", para: "" }
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
