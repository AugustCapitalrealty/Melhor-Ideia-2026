// Quatro mutações na derivação de categoria do fornecedor.
const fs = require('fs');
const { execFileSync } = require('child_process');
const raiz = 'c:/Users/guilherme.marques/.gemini/antigravity/scratch/Melhor-Ideia-2026';

const alvos = {
  eq: raiz + '/app/Equalizacao.gs',
  fo: raiz + '/app/Fornecedores.gs'
};
const originais = {};
Object.keys(alvos).forEach(k => { originais[k] = fs.readFileSync(alvos[k], 'utf8'); });

const mutacoes = [
  ['eq', 'o CNAE passa a ganhar do que o fornecedor cotou',
   '  const nomes = Object.keys(contadas).sort(function (a, b) { return contadas[b] - contadas[a]; });',
   '  const porCnaeForte = cfCategoriaPorCnae_(cnae);\n  if (porCnaeForte) return { lista: [porCnaeForte], principal: porCnaeForte, origem: \'cnae\' };\n  const nomes = Object.keys(contadas).sort(function (a, b) { return contadas[b] - contadas[a]; });'],
  ['eq', 'item solto de outra categoria passa a listar o fornecedor nela',
   '  const relevantes = nomes.filter(function (n) { return contadas[n] >= Math.max(2, maior * 0.15); });',
   '  const relevantes = nomes.slice();'],
  ['eq', 'subcategoria passa a escolher no empate',
   '  if (pontos.length > 1 && pontos[0].n === pontos[1].n) return \'\';\n  return pontos[0].nome;\n}\n\n/**\n * Todas as categorias em que um fornecedor atua',
   '  return pontos[0].nome;\n}\n\n/**\n * Todas as categorias em que um fornecedor atua'],
  ['fo', 'volta a ler a coluna errada do CNAE',
   "    cnae: cad.CNAE_PRINCIPAL || '',",
   "    cnae: cad.CNAE || '',"]
];

let todas = true;
mutacoes.forEach(function (m) {
  const [chave, rotulo, de, para] = m;
  const p = alvos[chave];
  const original = originais[chave];
  const crlf = original.includes('\r\n');
  const base = crlf ? original.replace(/\r\n/g, '\n') : original;

  if (!base.includes(de)) { console.log('  ALVO NÃO ENCONTRADO: ' + rotulo); todas = false; return; }
  const mutado = base.replace(de, para);
  fs.writeFileSync(p, crlf ? mutado.replace(/\n/g, '\r\n') : mutado, 'utf8');

  let saida = '';
  try {
    saida = execFileSync(process.execPath, ['tests/validar-correcoes.cjs'], { cwd: raiz, encoding: 'utf8' });
  } catch (e) { saida = String(e.stdout || ''); }
  fs.writeFileSync(p, original, 'utf8');

  const linha = saida.split('\n').filter(function (l) {
    return l.includes('categoria do fornecedor') || l.includes('FALHA na Correção 34');
  })[0] || '(nenhuma linha)';
  const reprovou = linha.includes('FALHA');
  if (!reprovou) todas = false;
  console.log((reprovou ? '  REPROVOU  ' : '  PASSOU!!  ') + rotulo);
  console.log('             → ' + linha.trim().replace(/^.*FALHA na Correção 34: /, '').split('\n')[0]);
});

console.log(todas ? '\nAs quatro mutações foram pegas.' : '\nALGUMA MUTAÇÃO PASSOU.');
