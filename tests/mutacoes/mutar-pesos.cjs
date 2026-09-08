const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const alvo = path.join(raiz, 'app', 'Avaliacao.gs');
const teste = path.join(raiz, 'tests', 'teste-iqf-ponderado.cjs');
const original = fs.readFileSync(alvo, 'utf8');

const mutacoes = [
  { nome: 'Seguranca do Trabalho some da lista (o defeito original)',
    de: "  { campo: 'SEGURANCA', chave: 'seguranca', rotulo: 'Segurança do trabalho e SST', peso: 20,\n" +
        "    ajuda: 'Usou EPI, seguiu as normas e apresentou a documentação de segurança?' },\n",
    para: "" },
  { nome: 'o peso da Qualidade vira 25 em vez de 30',
    de: "rotulo: 'Qualidade técnica e acabamento', peso: 30",
    para: "rotulo: 'Qualidade técnica e acabamento', peso: 25" },
  { nome: 'a ponderacao vira media simples',
    de: "    soma += ((n - 1) / 4) * c.peso;",
    para: "    soma += ((n - 1) / 4) * (100 / CF_CRITERIOS_AVALIACAO.length);" },
  { nome: 'a escala volta a ser n/5, e o pior fornecedor tira 20',
    de: "    soma += ((n - 1) / 4) * c.peso;", para: "    soma += (n / 5) * c.peso;" },
  { nome: 'o piso da Classe A cai para 80',
    de: "  { classe: 'A', minimo: 85, rotulo: 'Preferencial' },",
    para: "  { classe: 'A', minimo: 80, rotulo: 'Preferencial' }," },
  { nome: 'a versao dos criterios deixa de ser gravada',
    de: "    VERSAO_CRITERIOS: CF_VERSAO_CRITERIOS,\n", para: "" },
  { nome: 'o IQF volta a misturar versoes de criterios',
    de: "    if (versao !== CF_VERSAO_CRITERIOS) return;", para: "" }
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
