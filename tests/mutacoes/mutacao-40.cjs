// Quatro mutações na ordem de busca da logo.
const fs = require('fs');
const { execFileSync } = require('child_process');
const raiz = 'c:/Users/guilherme.marques/.gemini/antigravity/scratch/Melhor-Ideia-2026';
const p = raiz + '/app/Exportar.gs';

const original = fs.readFileSync(p, 'utf8');
const crlf = original.includes('\r\n');
const base = crlf ? original.replace(/\r\n/g, '\n') : original;

const mutacoes = [
  ['o ID do código passa a vencer a pasta do projeto',
   "  // 1. Aba Config — o jeito de corrigir sem tocar em código.",
   "  const antes = doId(CF_LOGO_DRIVE[chave], 'ID no código');\n  if (antes) return antes;\n\n  // 1. Aba Config — o jeito de corrigir sem tocar em código."],
  ['a aba Config deixa de ser consultada',
   "    const alvo = CF_LOGO_CONFIG[chave];",
   "    const alvo = '__NUNCA__';"],
  ['a Config deixa de aceitar a URL de compartilhamento',
   "      const m = bruto.match(/\\/d\\/([A-Za-z0-9_-]+)/);\n      const r = doId(m ? m[1] : bruto, 'aba Config');",
   "      const r = doId(bruto, 'aba Config');"],
  ['arquivo que não é imagem passa a ser aceito',
   "      if (tipo.indexOf('image/') !== 0) {\n        tentativas.push(origem + ': o arquivo é ' + tipo + ', não uma imagem');\n        return null;\n      }",
   "      if (false) { return null; }"]
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
    return l.indexOf('logo vem de') >= 0 || l.indexOf('FALHA na Correção 40') >= 0;
  })[0] || '(nenhuma linha)';
  const reprovou = linha.indexOf('FALHA') >= 0;
  if (!reprovou) todas = false;
  console.log((reprovou ? '  REPROVOU  ' : '  PASSOU!!  ') + rotulo);
  console.log('             → ' + linha.trim().replace(/^.*FALHA na Correção 40: /, '').split('\n')[0]);
});

console.log(todas ? '\nAs quatro mutações foram pegas.' : '\nALGUMA MUTAÇÃO PASSOU.');
