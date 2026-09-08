const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const teste = path.join(raiz, 'tests', 'teste-documento-nivel.cjs');

const arquivos = {
  exp: path.join(raiz, 'app', 'Exportar.gs'),
  eq: path.join(raiz, 'app', 'Equalizacao.gs')
};
const originais = {
  exp: fs.readFileSync(arquivos.exp, 'utf8'),
  eq: fs.readFileSync(arquivos.eq, 'utf8')
};

const mutacoes = [
  { arq: 'exp', nome: 'a situacao volta a sair como nome de coluna',
    de: "['Situação:', cfStatusTexto_(eq.status),", para: "['Situação:', eq.status," },
  { arq: 'exp', nome: 'a mesclagem do VALOR TOTAL some',
    de: "  props.forEach(function (p, i) { merges.push({ l: lTotal, c: colDe(i), nl: 1, nc: 2 }); });\r\n",
    para: "" },
  { arq: 'exp', nome: 'o total volta para a celula que a mesclagem descarta',
    de: "props.forEach(function (p, i) { li[colDe(i) - 1] = p.calculado === null ? '' : p.calculado; });",
    para: "props.forEach(function (p, i) { li[colDe(i)] = p.calculado === null ? '' : p.calculado; });" },
  { arq: 'exp', nome: 'quem cotou sem marca volta a sair igual a quem nao cotou',
    de: "          if (!c.marcaCotada) { lm[colDe(i) - 1] = 'marca não informada'; return; }",
    para: "          if (!c.marcaCotada) { lm[colDe(i) - 1] = '—'; return; }" },
  { arq: 'exp', nome: 'a linha de marca some quando ninguem informou',
    de: "      if (temMarca || item.marcaReferencia) {", para: "      if (temMarca) {" },
  { arq: 'exp', nome: 'a divergencia de marca deixa de ser sinalizada',
    de: "            (cfMarcaDivergente_(c.marcaCotada, item.marcaReferencia) ? ' (≠ referência)' : '');",
    para: "            '';" },
  { arq: 'exp', nome: 'linha de rodape vazia volta a ser impressa',
    de: "    if (!temAlgo) return;\r\n", para: "" },
  { arq: 'exp', nome: 'celula sem linha de preco volta a sair em branco',
    de: "        if (!c) { li[colDe(i) - 1] = 'não cotou'; return; }", para: "        if (!c) return;" },
  { arq: 'eq', nome: 'a ressalva volta a nao dizer quais itens',
    de: "              descricao: p.nome + ' não cotou ' + semCotar.length + ' de ' + totalItens +\r\n" +
        "                         ' itens: ' + lista(semCotar, 6) + '.'",
    para: "              descricao: 'Fornecedor ' + p.nome + ' deixou itens sem cotar.'" },
  { arq: 'eq', nome: 'a ressalva de marca nao informada some',
    de: "        if (semMarca.length) {", para: "        if (false && semMarca.length) {" },
  { arq: 'eq', nome: 'a ressalva de marca divergente some',
    de: "        if (outraMarca.length) {", para: "        if (false && outraMarca.length) {" }
];

let ok = true;
mutacoes.forEach(function (m) {
  const original = originais[m.arq];
  const n = original.split(m.de).length - 1;
  if (n !== 1) { console.log('!! ancora com ' + n + ' ocorrencia(s): ' + m.nome); ok = false; return; }
  fs.writeFileSync(arquivos[m.arq], original.replace(m.de, m.para), 'utf8');
  let pegou = false;
  try { execFileSync(process.execPath, [teste], { stdio: 'pipe' }); } catch (e) { pegou = true; }
  fs.writeFileSync(arquivos[m.arq], original, 'utf8');
  console.log((pegou ? 'PEGOU  ' : 'PASSOU ') + ' · ' + m.nome);
  if (!pegou) ok = false;
});

try { execFileSync(process.execPath, [teste], { stdio: 'pipe' }); console.log('PASSA   · com o codigo integro'); }
catch (e) { console.log('!! falha com o codigo integro'); ok = false; }
process.exit(ok ? 0 : 1);
