/**
 * Linha antiga reinserida acima da nova.
 *
 * Aconteceu cinco vezes numa única sessão de edição, em dois arquivos, e
 * o estrago foi de três tipos diferentes:
 *
 *  - `Cnpj.gs`: quebrou a sintaxe. Barulhento, achado em segundos.
 *  - `addProponente`: dois `proponentes.push` seguidos — cada clique
 *    criava DUAS colunas de proponente. Só apareceu porque um teste
 *    contava.
 *  - `selo()`: `'</span>';` fechou o `return` e a linha seguinte, que
 *    desenha o selo de IQF, virou código morto. Sintaxe válida, nenhum
 *    erro, recurso silenciosamente desligado. **Este é o perigoso.**
 *
 * A assinatura é sempre a mesma: duas linhas consecutivas, mesma
 * indentação, e a de cima é uma versão mais curta da de baixo. Este
 * teste procura exatamente esse padrão.
 *
 * Ele é uma heurística, não uma prova. Se acusar código legítimo, a
 * saída diz qual linha — e a correção é reescrever aquele trecho, não
 * afrouxar o teste.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Procurando linhas reinseridas por colagem...');

const root = path.resolve(__dirname, '..');

/** Tira o que não muda o sentido: espaço e pontuação de fim de linha. */
function nucleo(linha) {
  return linha.trim().replace(/[;,]+$/, '').trim();
}

/**
 * O mesmo, tirando também os fechamentos.
 *
 * `push({ a, b })` e `push({ a, b, c })` não são prefixo um do outro por
 * causa do `})` no fim do primeiro. Sem os fechamentos, são — e foi
 * assim que `addProponente` passou a criar duas colunas.
 */
function tronco(linha) {
  return nucleo(linha).replace(/[)\]}\s]+$/, '').trim();
}

/**
 * Duas regras, escolhidas por PRECISÃO e não por cobertura.
 *
 * Uma terceira — "mesma variável atribuída em linhas seguidas" — pegaria
 * mais um dos casos reais, mas acusa todo `if (a) x; if (b) y;` do
 * arquivo. Teste que acusa código legítimo é desligado pela equipe na
 * primeira semana, e aí não protege nada.
 *
 * O que ESTE teste não pega: quando a linha antiga não é prefixo da
 * nova. Foi o caso do `'</span>';` que virou código morto dentro de um
 * `return`. Contra esse, a defesa continua sendo o teste de
 * comportamento do recurso — que existe, em teste-laco-avaliacao.cjs.
 */

const suspeitas = [];

['app/Interface.html', 'app/Codigo.gs', 'app/Equalizacao.gs', 'app/Avaliacao.gs',
 'app/Cnpj.gs', 'app/Exportar.gs', 'app/Fornecedores.gs', 'app/Consulta.gs',
 'app/Util.gs', 'app/Manutencao.gs',
 'app/Apresentacao_Conselho.gs'].forEach(function (rel) {
  const linhas = fs.readFileSync(path.join(root, rel), 'utf8')
    .replace(/\r\n/g, '\n').split('\n');

  for (let i = 0; i + 1 < linhas.length; i++) {
    const a = linhas[i];
    const b = linhas[i + 1];

    const na = nucleo(a);
    const nb = nucleo(b);
    if (!na || !nb) continue;
    if (/^(\/\/|\/\*|\*)/.test(na)) continue;     // comentário não conta

    // Mesma indentação: coladas do mesmo lugar.
    const ia = a.match(/^\s*/)[0];
    const ib = b.match(/^\s*/)[0];
    if (ia !== ib) continue;

    const identicas = na === nb && na.length >= 8;

    const ta = tronco(a);
    const tb = tronco(b);
    const prefixo = !identicas && ta.length >= 24 && tb.length > ta.length &&
                    tb.startsWith(ta);

    if (identicas || prefixo) {
      suspeitas.push({
        arquivo: rel,
        linha: i + 1,
        tipo: identicas ? 'linha idêntica repetida' : 'versão curta acima da longa',
        de: na.slice(0, 78),
        para: nb.slice(0, 78)
      });
    }
  }
});

if (suspeitas.length) {
  console.log('');
  suspeitas.forEach(function (s) {
    console.log('  ' + s.arquivo + ':' + s.linha + '  (' + s.tipo + ')');
    console.log('    - ' + s.de);
    console.log('    + ' + s.para);
  });
  console.log('');
}

assert.equal(
  suspeitas.length, 0,
  suspeitas.length + ' linha(s) parecem ter sido reinseridas por colagem. ' +
  'A de cima é uma versão mais curta da de baixo, na mesma indentação — ' +
  'foi assim que "addProponente" passou a criar duas colunas e que o selo ' +
  'de IQF virou código morto dentro de um return. Se for código legítimo, ' +
  'reescreva o trecho para não parecer duplicata.'
);

console.log('OK: nenhuma linha reinserida por colagem.');
