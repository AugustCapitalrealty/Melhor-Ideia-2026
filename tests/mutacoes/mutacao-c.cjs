// Quatro mutações independentes. Cada uma quebra um item do Bloco C;
// a suíte tem que reprovar nas quatro.
const fs = require('fs');
const { execFileSync } = require('child_process');
const raiz = 'c:/Users/guilherme.marques/.gemini/antigravity/scratch/Melhor-Ideia-2026';
const p = raiz + '/app/Interface.html';

const original = fs.readFileSync(p, 'utf8');
const crlf = original.includes('\r\n');
const base = crlf ? original.replace(/\r\n/g, '\n') : original;

const mutacoes = [
  ['trata preço zero como campo em branco',
   '      if (v === null || it.tipo === \'grupo\') return null;\n      if (menor === null || v < menor) menor = v;',
   '      if (!v || it.tipo === \'grupo\') return null;\n      if (menor === null || v < menor) menor = v;'],
  ['marca o menor mesmo com um único preço na linha',
   '      var ganhou = quantos > 1 && efetivo[j] !== null && efetivo[j] === menor;',
   '      var ganhou = efetivo[j] !== null && efetivo[j] === menor;'],
  ['tira o max-height da grade — sticky para de grudar',
   '.grade-rolo{\n  max-height:64vh;\n  overflow:auto;',
   '.grade-rolo{\n  overflow:auto;'],
  ['descarta o rascunho depois de zerar o idEmEdicao',
   '  // Nesta ordem: a chave do rascunho depende de idEmEdicao.\n  descartarRascunho();\n  idEmEdicao = null;',
   '  idEmEdicao = null;\n  descartarRascunho();']
];

let todas = true;
mutacoes.forEach(function (m) {
  const [rotulo, de, para] = m;
  if (!base.includes(de)) { console.log('  ALVO NÃO ENCONTRADO: ' + rotulo); todas = false; return; }
  fs.writeFileSync(p, (function (t) { return crlf ? t.replace(/\n/g, '\r\n') : t; })(base.replace(de, para)), 'utf8');

  let saida = '';
  try {
    saida = execFileSync(process.execPath, ['tests/validar-correcoes.cjs'], { cwd: raiz, encoding: 'utf8' });
  } catch (e) { saida = String(e.stdout || ''); }
  fs.writeFileSync(p, original, 'utf8');

  const linha = saida.split('\n').filter(l => l.includes('Correção 31'))[0] || '';
  const reprovou = linha.indexOf('FALHA') >= 0;
  if (!reprovou) todas = false;
  console.log((reprovou ? '  REPROVOU  ' : '  PASSOU!!  ') + rotulo);
  if (reprovou) console.log('             → ' + linha.replace(/^.*FALHA na Correção 31: /, ''));
});

console.log(todas ? '\nAs quatro mutações foram pegas.' : '\nALGUMA MUTAÇÃO PASSOU.');
