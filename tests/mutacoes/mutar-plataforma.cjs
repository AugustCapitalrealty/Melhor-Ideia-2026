/**
 * Mutação do teste da importação da plataforma de compras.
 *
 *   node tests/mutacoes/mutar-plataforma.cjs
 *
 * Cinco quebras, todas em coisas que já custaram caro em outros lugares
 * deste projeto: um filtro que some, uma data que anda um dia, um campo
 * que sobrescreve o que não devia, e uma chave que deixa de barrar o
 * repetido.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const CONFIG = path.join(root, 'app', 'Config.gs');
const IMPORT = path.join(root, 'app', 'ImportPlataforma.gs');
const TESTE = path.join(root, 'tests', 'teste-import-plataforma.cjs');

const mutacoes = [
  {
    nome: 'toda natureza vira disputável',
    arquivo: CONFIG,
    de: '  return n ? n.DISPUTAVEL === true : true;',
    para: '  return true;',
    custo: 'o ranking de fornecedor volta a ter a distribuidora de energia no topo'
  },
  {
    nome: 'data ISO lida como UTC',
    arquivo: IMPORT,
    de: '  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));',
    para: '  return new Date(s);',
    custo: 'toda compra anda um dia para trás no fuso de São Paulo'
  },
  {
    nome: 'contato cadastral sobrescreve o de quem cotou',
    arquivo: IMPORT,
    de: "    if (!String(atual.CONTATO_TEL || '').trim() && String(l.CONTATO_TEL || '').trim()) {",
    para: "    if (String(l.CONTATO_TEL || '').trim()) {",
    custo: 'o telefone do vendedor que cotou é apagado pelo telefone da Receita'
  },
  {
    nome: 'protocolo repetido entra de novo',
    arquivo: IMPORT,
    de: '    if (jaTem[protocolo]) { repetidas++; return; }',
    para: '    if (false) { repetidas++; return; }',
    custo: 'reimportar o arquivo duplica as 738 compras'
  },
  {
    nome: 'relevância conta conta de luz',
    arquivo: IMPORT,
    de: '    if (c.DISPUTAVEL !== true) return;',
    para: '    if (false) return;',
    custo: 'a COPEL passa a ser o fornecedor mais relevante da base'
  }
];

let pegou = 0;
const passou = [];

mutacoes.forEach(function (m) {
  const antes = fs.readFileSync(m.arquivo, 'utf8');
  if (antes.split(m.de).length - 1 !== 1) {
    console.log('  ?  ' + m.nome + ' — alvo não encontrado; a mutação precisa ser reescrita');
    passou.push(m);
    return;
  }
  fs.writeFileSync(m.arquivo, antes.replace(m.de, m.para), 'utf8');

  let falhou = false;
  try { execFileSync(process.execPath, [TESTE], { stdio: 'pipe' }); }
  catch (e) { falhou = true; }

  fs.writeFileSync(m.arquivo, antes, 'utf8');

  if (falhou) { pegou++; console.log('  PEGOU   ' + m.nome); }
  else { passou.push(m); console.log('  PASSOU  ' + m.nome + '  <-- o teste não protege isto'); }
});

console.log('\n' + pegou + ' de ' + mutacoes.length + ' quebras foram pegas.');
if (passou.length) {
  console.log('\nO defeito está no TESTE, não no sistema:');
  passou.forEach(function (m) { console.log('  - ' + m.nome + ': ' + m.custo); });
  process.exit(1);
}
console.log('O teste protege o que diz proteger.');
