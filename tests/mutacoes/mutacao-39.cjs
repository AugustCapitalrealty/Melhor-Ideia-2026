// Cinco mutações: a marca de volta à anotação, a linha vazia por item,
// a ordem das colunas, a logo só para a Demercado, e a falha silenciosa.
const fs = require('fs');
const { execFileSync } = require('child_process');
const raiz = 'c:/Users/guilherme.marques/.gemini/antigravity/scratch/Melhor-Ideia-2026';
const p = raiz + '/app/Exportar.gs';

const original = fs.readFileSync(p, 'utf8');
const crlf = original.includes('\r\n');
const base = crlf ? original.replace(/\r\n/g, '\n') : original;

const mutacoes = [
  ['a marca volta a existir só como anotação de célula',
   "      if (temMarca) {",
   "      if (false) {"],
  ['todo item ganha linha de marca, inclusive quem não tem nenhuma',
   "      const temMarca = props.some(function (p) {\n        const c = item.precos[p.id];\n        return !!(c && c.marcaCotada);\n      });",
   "      const temMarca = true;"],
  ['a marca deixa de acompanhar a coluna do proponente',
   "          lm[colDe(i) - 1] = (c && c.marcaCotada) ? c.marcaCotada : '—';",
   "          lm[COL_QTD - 1] = (c && c.marcaCotada) ? c.marcaCotada : '—';"],
  ['a logo volta a ser inserida só para a Demercado',
   "  if (lLinhaEmpresa) {\n    try {\n      if (aba && typeof aba.setRowHeight === 'function') aba.setRowHeight(lLinhaEmpresa, 46);",
   "  if (lLinhaEmpresa && ehDemercado) {\n    try {\n      if (aba && typeof aba.setRowHeight === 'function') aba.setRowHeight(lLinhaEmpresa, 46);"],
  // A mutação anterior — apagar UM dos três pontos de log — não era
  // defeito: os outros dois mantinham o rastro completo, com empresa e
  // motivo. Redundância ali é robustez. Esta apaga o rastro inteiro.
  ['a logo desiste em silêncio, sem registrar nada',
   "  const empresa = ehDemercado ? 'Demercado' : 'Capital Realty';\n  try {",
   "  const empresa = ehDemercado ? 'Demercado' : 'Capital Realty';\n  if (aba) return false;\n  try {"]
];

let todas = true;
mutacoes.forEach(function (m) {
  const [rotulo, de, para] = m;
  if (!base.includes(de)) { console.log('  ALVO NÃO ENCONTRADO: ' + rotulo); todas = false; return; }
  const mutado = base.replace(de, para);
  fs.writeFileSync(p, crlf ? mutado.replace(/\n/g, '\r\n') : mutado, 'utf8');

  let saida = '';
  try {
    saida = execFileSync(process.execPath, ['tests/validar-correcoes.cjs'], { cwd: raiz, encoding: 'utf8' });
  } catch (e) { saida = String(e.stdout || ''); }
  fs.writeFileSync(p, original, 'utf8');

  const linha = saida.split('\n').filter(function (l) {
    return l.indexOf('marca cotada sai') >= 0 || l.indexOf('FALHA na Correção 39') >= 0;
  })[0] || '(nenhuma linha)';
  const reprovou = linha.indexOf('FALHA') >= 0;
  if (!reprovou) todas = false;
  console.log((reprovou ? '  REPROVOU  ' : '  PASSOU!!  ') + rotulo);
  console.log('             → ' + linha.trim().replace(/^.*FALHA na Correção 39: /, '').split('\n')[0]);
});

console.log(todas ? '\nAs cinco mutações foram pegas.' : '\nALGUMA MUTAÇÃO PASSOU.');
