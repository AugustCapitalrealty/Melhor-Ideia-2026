// Confere que a Correção 29 reprova de fato: quebra a regra do Mega,
// roda a suíte, e restaura o arquivo.
const fs = require('fs');
const { execFileSync } = require('child_process');
const raiz = 'c:/Users/guilherme.marques/.gemini/antigravity/scratch/Melhor-Ideia-2026';
const p = raiz + '/app/Manutencao.gs';

const original = fs.readFileSync(p, 'utf8');
const alvo = "  if (t.indexOf('itajai') >= 0)   return 'MEGA CENTRO LOGÍSTICO ITAJAÍ';\n  return '';";
if (!original.includes(alvo)) throw new Error('alvo da mutação não encontrado');

// Mutação: Mega desconhecido passa a ser chutado como Curitiba.
const mutado = original.replace(alvo,
  "  if (t.indexOf('itajai') >= 0)   return 'MEGA CENTRO LOGÍSTICO ITAJAÍ';\n  return 'MEGA CENTRO LOGÍSTICO CURITIBA';");

fs.writeFileSync(p, mutado, 'utf8');
let saida = '', codigo = 0;
try {
  saida = execFileSync(process.execPath, ['tests/validar-correcoes.cjs'],
    { cwd: raiz, encoding: 'utf8' });
} catch (e) {
  saida = String(e.stdout || '');
  codigo = e.status;
}
fs.writeFileSync(p, original, 'utf8');

const reprovou = saida.includes('FALHA na Correção 29');
console.log('com a regra quebrada, exit=' + codigo + ' e o teste ' +
  (reprovou ? 'REPROVOU (correto)' : 'PASSOU — o teste não protege nada'));
if (reprovou) console.log(saida.split('\n').filter(l => l.includes('29')).join('\n'));
