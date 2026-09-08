// Duas mutações no teste de handlers da interface:
//  1. renomear uma função que o HTML chama  → tem que reprovar
//  2. reintroduzir a colisão de nome        → tem que reprovar
const fs = require('fs');
const { execFileSync } = require('child_process');
const raiz = 'c:/Users/guilherme.marques/.gemini/antigravity/scratch/Melhor-Ideia-2026';
const p = raiz + '/app/Interface.html';

const original = fs.readFileSync(p, 'utf8');
const crlf = original.includes('\r\n');
const base = crlf ? original.replace(/\r\n/g, '\n') : original;

const mutacoes = [
  ['renomeia a definição e deixa o onclick apontando para o nome antigo',
   'function abrirFichaFornecedor(cnpj) {',
   'function abrirFichaFornecedorRenomeada(cnpj) {'],
  ['reintroduz a colisão: duas funções com o mesmo nome',
   'function fecharFichaFornecedor() {',
   'function abrirFicha() { return 0; }\nfunction fecharFichaFornecedor() {']
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
    return l.includes('interface compila') || l.includes('FALHA na Correção 17');
  })[0] || '(nenhuma linha)';
  const reprovou = linha.includes('FALHA');
  if (!reprovou) todas = false;
  console.log((reprovou ? '  REPROVOU  ' : '  PASSOU!!  ') + rotulo);
  console.log('             → ' + linha.trim().replace(/^.*FALHA na Correção 17: /, ''));
});

console.log(todas ? '\nAs duas mutações foram pegas.' : '\nALGUMA MUTAÇÃO PASSOU.');
