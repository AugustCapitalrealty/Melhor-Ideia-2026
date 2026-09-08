// Cinco mutações na Fase 2. Cada uma quebra um comportamento que a
// Correção 33 diz proteger.
const fs = require('fs');
const { execFileSync } = require('child_process');
const raiz = 'c:/Users/guilherme.marques/.gemini/antigravity/scratch/Melhor-Ideia-2026';
const p = raiz + '/app/Interface.html';

const original = fs.readFileSync(p, 'utf8');
const crlf = original.includes('\r\n');
const base = crlf ? original.replace(/\r\n/g, '\n') : original;

const mutacoes = [
  ['deixa a colagem criar proponente além dos que existem',
   '  var cabem = Math.min(colunas, proponentes.length - c0);',
   '  var cabem = colunas;'],
  ['ignora a coluna de partida e cola sempre da primeira',
   '      itens[alvo].precos[c0 + j] = n === null ? \'\'',
   '      itens[alvo].precos[j] = n === null ? \'\''],
  ['não descarta a linha vazia que o Excel acrescenta',
   '  while (matriz.length && matriz[matriz.length - 1].join(\'\') === \'\') matriz.pop();',
   '  // (linha vazia mantida)'],
  ['intercepta também a célula única',
   '  if (matriz.length < 2 && colunas < 2) return;',
   '  if (false) return;'],
  ['pré-seleciona a primeira sugestão, e Enter passa a escolher sozinho',
   '    if (atual < 0) return;      // nada destacado: Enter é do formulário',
   '    if (atual < 0) atual = 0;']
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
    return l.includes('colagem de bloco') || l.includes('FALHA na Correção 33');
  })[0] || '(nenhuma linha)';
  const reprovou = linha.includes('FALHA');
  if (!reprovou) todas = false;
  console.log((reprovou ? '  REPROVOU  ' : '  PASSOU!!  ') + rotulo);
  console.log('             → ' + linha.trim().replace(/^.*FALHA na Correção 33: /, ''));
});

console.log(todas ? '\nAs cinco mutações foram pegas.' : '\nALGUMA MUTAÇÃO PASSOU.');
