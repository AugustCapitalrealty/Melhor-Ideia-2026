/**
 * Roda cada mutação: quebra o código de produção, roda o teste, e exige
 * que ele FALHE. Depois desfaz e exige que ele PASSE.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = 'C:/Users/guilherme.marques/.gemini/antigravity/scratch/Melhor-Ideia-2026';
const teste = process.argv[2] || 'tests/teste-lista-eap.cjs';

const MUTACOES = [
  ['M01 recalcularCodigos: tira a normalizacao de nivel', 'app/Interface.html',
   '    if (nivel > anterior + 1) nivel = anterior + 1;\n    it.nivel = nivel;',
   '    it.nivel = nivel;'],

  ['M02 recalcularCodigos: nao reinicia contadores de baixo', 'app/Interface.html',
   '    for (var k = nivel + 1; k < contador.length; k++) contador[k] = 0;',
   '    for (var k = nivel + 1; k < contador.length; k++) { /* mutado */ }'],

  ['M03 seletorUnidade: volta a usar so UNIDADES', 'app/Interface.html',
   '  var lista = UNIDADES.indexOf(v) >= 0 ? UNIDADES : UNIDADES.concat([v]);',
   '  var lista = UNIDADES;'],

  ['M04 cfCriarEqualizacao_: nao limpa a pilha de niveis', 'app/Equalizacao.gs',
   '      for (let k = nivel + 1; k <= 3; k++) delete pilha[k];',
   '      for (let k = nivel + 1; k <= 3; k++) { /* mutado */ }'],

  ['M05 cfCriarEqualizacao_: ID_PAI sempre vazio', 'app/Equalizacao.gs',
   "        ID_PAI: nivel > 0 ? (pilha[nivel - 1] || '') : '',",
   "        ID_PAI: '',"],

  ['M06 cfMapaEqualizacao_: ignora a ORDEM ao remontar a arvore', 'app/Equalizacao.gs',
   '    filhos[k].sort(function (a, b) { return (cfNumero_(a.ORDEM) || 0) - (cfNumero_(b.ORDEM) || 0); });',
   '    filhos[k].sort(function (a, b) { return (cfNumero_(b.ORDEM) || 0) - (cfNumero_(a.ORDEM) || 0); });'],

  ['M07 apiOpcoes: nao manda o icone da categoria', 'app/Codigo.gs',
   '          icone: c.icone,',
   '          icone: undefined,'],

  ['M08 apiOpcoes: nao manda as subcategorias', 'app/Codigo.gs',
   "          subs: (CF_SUBCATEGORIAS[c.nome] || []).map(function (s) { return s.nome; })",
   '          subs: []'],

  ['M09 montarSeletorSubcategorias: nunca esconde o campo', 'app/Interface.html',
   '  if (!subs.length) {\n    box.hidden = true;',
   '  if (!subs.length) {\n    box.hidden = false;'],

  ['M10 cfContarChaves_: conta chave repetida duas vezes', 'app/Equalizacao.gs',
   '    if (!chave || vistas[chave]) return;',
   '    if (!chave) return;'],

  ['M11 cfCategoriaDerivada_: decide no empate', 'app/Equalizacao.gs',
   "  if (pontos.length > 1 && pontos[0].n === pontos[1].n) return '';\n  return pontos[0].nome;\n}\n\n/** Os textos de uma equalização",
   "  return pontos[0].nome;\n}\n\n/** Os textos de uma equalização"],

  // A guarda `d.length < 4` era o alvo original. Ela SOBREVIVEU, e a
  // conclusão é que não era defeito: nenhuma chave de 4 dígitos pode ser
  // prefixo de um texto de 3, então trocá-la por `< 1` não muda resposta
  // nenhuma — é atalho, não regra. As duas mutações abaixo atacam o que
  // de fato decide.
  ['M12a cfCategoriaPorCnae_: nao tira a pontuacao do CNAE', 'app/Equalizacao.gs',
   "  const d = String(cnae || '').replace(/\\D/g, '');",
   "  const d = String(cnae || '');"],

  ['M12b cfCategoriaPorCnae_: CNAE desconhecido cai na primeira categoria', 'app/Equalizacao.gs',
   "    if (d.indexOf(CF_CNAE_CATEGORIA[i][0]) === 0) return CF_CNAE_CATEGORIA[i][1];\n  }\n  return '';",
   "    if (d.indexOf(CF_CNAE_CATEGORIA[i][0]) === 0) return CF_CNAE_CATEGORIA[i][1];\n  }\n  return CF_CNAE_CATEGORIA[0][1];"],

  ['M13 cfSubcategoriaDerivada_: decide no empate', 'app/Equalizacao.gs',
   "  if (pontos.length > 1 && pontos[0].n === pontos[1].n) return '';\n  return pontos[0].nome;\n}\n\n/**\n * Todas as categorias",
   "  return pontos[0].nome;\n}\n\n/**\n * Todas as categorias"],

  ['M14 cfFornecedores_: some com quem nao tem categoria', 'app/Fornecedores.gs',
   '    if (!alvo) return true;',
   '    if (!alvo) return f.categorias.length > 0;'],

  ['M15 cfCategoriasDeFornecedores_: conta errado a pilula', 'app/Fornecedores.gs',
   '    f.categorias.forEach(function (c) { conta[c] = (conta[c] || 0) + 1; });',
   '    f.categorias.forEach(function (c) { conta[c] = (conta[c] || 0) + 2; });'],

  ['M16 cfCategoriasDeFornecedores_: nao conta os sem categoria', 'app/Fornecedores.gs',
   '    if (!f.categorias.length) { sem++; return; }',
   '    if (!f.categorias.length) { return; }'],

  ['M17 cfFichaFornecedor_: perde o historico de preco por item', 'app/Fornecedores.gs',
   '  const itens = Object.keys(porItem).map(function (k) {',
   '  const itens = [].map(function (k) {'],

  ['M18 cfLogoBlob_: aba Config deixa de ser a primeira fonte', 'app/Exportar.gs',
   "      const r = doId(m ? m[1] : bruto, 'aba Config');\n      if (r) return r;",
   "      const r = doId(m ? m[1] : bruto, 'aba Config');\n      if (false) return r;"],

  ['M19 cfLogoBlob_: aceita PDF como logo na pasta', 'app/Exportar.gs',
   "      if (arq.getMimeType().indexOf('image/') !== 0) continue;",
   "      if (false) continue;"],

  ['M20 fixarLogosNaPasta: duplica logo que ja esta na pasta', 'app/Exportar.gs',
   "    if (achada.origem.indexOf('pasta do projeto') === 0) {\n      Logger.log(nome + ': já está na pasta — ' + achada.origem);\n      return;\n    }",
   "    if (false) {\n      Logger.log(nome + ': já está na pasta — ' + achada.origem);\n      return;\n    }"],

  ['M21 migrarParaSchemaV4: sobrescreve categoria gravada a mao', 'app/Migracao.gs',
   '      if (eq.CATEGORIA) { jaTinham++; return; }',
   '      if (false) { jaTinham++; return; }'],

  ['M22 migrarParaSchemaV4: grava chute onde nao ha evidencia', 'app/Migracao.gs',
   "      if (!cat) {\n        semConfianca++;",
   "      if (false) {\n        semConfianca++;"]
];

function roda() {
  try {
    execFileSync(process.execPath, [teste], { cwd: root, stdio: 'pipe' });
    return { ok: true };
  } catch (e) {
    const saida = String(e.stdout || '') + String(e.stderr || '');
    const m = saida.match(/AssertionError[^\n]*\n?[^\n]*/) ||
              saida.match(/(Error|TypeError|ReferenceError)[^\n]*/);
    return { ok: false, motivo: (m ? m[0] : saida.slice(-200)).replace(/\s+/g, ' ').slice(0, 130) };
  }
}

const base = roda();
if (!base.ok) { console.log('!! o teste JA falha sem mutação:', base.motivo); process.exit(1); }
console.log('base: teste passa com o código íntegro.\n');

let sobreviventes = 0;
MUTACOES.forEach(function (mut) {
  const [rotulo, arq, de, para] = mut;
  const p = path.join(root, arq);
  const original = fs.readFileSync(p, 'utf8');
  const crlf = original.indexOf('\r\n') >= 0;
  const de2 = crlf ? de.replace(/\n/g, '\r\n') : de;
  const para2 = crlf ? para.replace(/\n/g, '\r\n') : para;

  const n = original.split(de2).length - 1;
  if (n !== 1) {
    console.log('?? ' + rotulo + ' — alvo aparece ' + n + 'x em ' + arq + ' (mutação não aplicada)');
    sobreviventes++;
    return;
  }

  fs.writeFileSync(p, original.replace(de2, para2), 'utf8');
  const r = roda();
  fs.writeFileSync(p, original, 'utf8');

  if (r.ok) { console.log('SOBREVIVEU  ' + rotulo); sobreviventes++; }
  else console.log('pegou       ' + rotulo + '  →  ' + r.motivo);
});

const fim = roda();
console.log('\nrestaurado: teste ' + (fim.ok ? 'passa' : 'FALHA — restauração quebrou algo'));
console.log('mutações sobreviventes: ' + sobreviventes + ' de ' + MUTACOES.length);
process.exit(sobreviventes === 0 && fim.ok ? 0 : 1);
