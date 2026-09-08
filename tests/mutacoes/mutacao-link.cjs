// A Correção 30 reprova se o link voltar a ser apagado?
// Mutação: acrescenta um setValues DEPOIS de aplicar o rich text — que é
// exatamente o que o plano original fazia, só que em outra ordem.
const fs = require('fs');
const { execFileSync } = require('child_process');
const raiz = 'c:/Users/guilherme.marques/.gemini/antigravity/scratch/Melhor-Ideia-2026';
const p = raiz + '/app/Exportar.gs';

const original = fs.readFileSync(p, 'utf8');
const crlf = original.includes('\r\n');
const s = crlf ? original.replace(/\r\n/g, '\n') : original;

const alvo = "  // Sem congelar coluna: os títulos e rótulos são mesclados de B até o fim,";
if (!s.includes(alvo)) throw new Error('alvo não encontrado');

const mutado = s.replace(alvo,
  "  aba.getRange(1, 1, grade.length, largura).setValues(grade);\n" + alvo);

fs.writeFileSync(p, crlf ? mutado.replace(/\n/g, '\r\n') : mutado, 'utf8');
let saida = '', codigo = 0;
try {
  saida = execFileSync(process.execPath, ['tests/validar-correcoes.cjs'], { cwd: raiz, encoding: 'utf8' });
} catch (e) {
  saida = String(e.stdout || '');
  codigo = e.status;
}
fs.writeFileSync(p, original, 'utf8');

const reprovou = saida.includes('FALHA na Correção 30');
console.log('com o setValues depois do link: exit=' + codigo + ' · teste ' +
  (reprovou ? 'REPROVOU (correto)' : 'PASSOU — não protege nada'));
console.log(saida.split('\n').filter(l => l.includes('30')).join('\n'));
