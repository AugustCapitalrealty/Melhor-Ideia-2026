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
 * A linha sem o que está dentro de parênteses e colchetes.
 *
 * Serve para olhar o TOPO da expressão. `cfInserir_('x', [y])` é uma
 * chamada — código vivo — mesmo tendo `+` lá dentro; `seloHtml + '</th>'`
 * é uma expressão solta, e depois de um `;` ela é código morto. Sem
 * remover o interior dos parênteses, as duas parecem iguais e a regra
 * acusa meia dúzia de chamadas legítimas.
 */
function topoDaExpressao(s) {
  // 1. As strings saem PRIMEIRO. Uma delas pode conter um parêntese
  //    solto — 'E-mail enviado (EQU ' — e aí a contagem de parênteses
  //    nunca fecha.
  let t = s.replace(/'(\\.|[^'\\])*'/g, '§')
           .replace(/"(\\.|[^"\\])*"/g, '§')
           .replace(/`(\\.|[^`\\])*`/g, '§');

  // 2. Agora os parênteses, do mais interno para fora. O substituto NÃO
  //    pode ter parênteses: trocar "()" por "()" não muda nada e o laço
  //    para antes de chegar ao de fora.
  let antes;
  do { antes = t; t = t.replace(/\([^()]*\)/g, '§').replace(/\[[^\[\]]*\]/g, '§'); }
  while (t !== antes);

  return t;
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

/**
 * Os testes entram na varredura, e nao por simetria.
 *
 * Numa linha de producao a duplicata quebra alguma coisa e alguem
 * percebe. Num teste ela PASSA — duas vezes — e a suite fica verde
 * enquanto a assercao some do lugar onde deveria estar. Foi assim que
 * teste-exportacao-benchmark-iqf.cjs ficou com um par de linhas
 * repetido: dois "5." iguais na saida, e ninguem leu.
 *
 * O proprio arquivo da varredura fica de fora: ele carrega, dentro de
 * strings, exemplos do padrao que procura, e se auto-acusaria.
 */
const alvos = ['app/Interface.html', 'app/Codigo.gs', 'app/Equalizacao.gs',
  'app/Avaliacao.gs', 'app/Cnpj.gs', 'app/Exportar.gs', 'app/Fornecedores.gs',
  'app/Consulta.gs', 'app/Util.gs', 'app/Manutencao.gs',
  'app/Apresentacao_Conselho.gs', 'app/ExportarSlides.gs']
  .concat(fs.readdirSync(path.join(root, 'tests'))
    .filter(function (f) { return /[.]cjs$/.test(f) && f !== 'teste-linha-reinserida.cjs'; })
    .map(function (f) { return 'tests/' + f; }));

alvos.forEach(function (rel) {
  const linhas = fs.readFileSync(path.join(root, rel), 'utf8')
    .replace(/\r\n/g, '\n').split('\n');

  // ── Quarta regra: um BLOCO inteiro colado duas vezes.
  //
  // As outras tres olham duas linhas vizinhas, e por isso nao veem o
  // caso mais comum de colagem: selecionar duas ou tres linhas e colar
  // sem apagar as antigas. O resultado e a-b-a-b, onde nenhum par
  // VIZINHO e igual — (a,b) difere, (b,a) difere — e a varredura passa
  // batido. Foi exatamente o que houve em
  // teste-exportacao-benchmark-iqf.cjs: assert + console.log repetidos,
  // numa suite verde.
  //
  // Dois blocos identicos e consecutivos nao acontecem por acaso em
  // codigo escrito a mao, entao a regra pode ser larga sem ser barulhenta.
  // O que a segura sao as linhas SEM substancia: fechamentos e brancos
  // se repetem o tempo todo e nao significam nada.
  const temSubstancia = function (l) {
    const n = nucleo(l);
    return n.length >= 20 && !/^[)\]}\s]+$/.test(n) && !/^(\/\/|\/[*]|[*])/.test(n);
  };

  for (let i = 0; i < linhas.length; i++) {
    for (let k = 2; k <= 6 && i + 2 * k <= linhas.length; k++) {
      const bloco = linhas.slice(i, i + k);
      let igual = true;
      for (let j = 0; j < k; j++) { if (bloco[j] !== linhas[i + k + j]) { igual = false; break; } }
      if (!igual) continue;
      if (!bloco.some(temSubstancia)) continue;

      suspeitas.push({
        arquivo: rel,
        linha: i + k + 1,
        tipo: 'bloco de ' + k + ' linhas colado duas vezes',
        de: nucleo(bloco[0]).slice(0, 78),
        para: nucleo(bloco[k - 1]).slice(0, 78)
      });
      i += 2 * k - 1;
      break;
    }
  }

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

    // Terceira regra: expressão que continua DEPOIS de a anterior fechar.
    //
    // Foi este o caso que escapou e matou o selo de IQF no cabeçalho da
    // grade: a linha de cima terminava em `;` e a de baixo começava com
    // `+` ou com uma string, virando código inalcançável dentro de um
    // return. Sintaxe válida, nenhum erro, recurso desligado em silêncio.
    //
    // A condição é estreita de propósito: linha anterior termina em `;`,
    // esta começa como continuação de expressão, mesma indentação, e
    // nenhuma das duas é declaração. Zero falsos positivos no projeto.
    //    A checagem do `;` é na linha CRUA, não no núcleo — o núcleo
    //    remove justamente o `;` que interessa. Foi esse o erro da
    //    primeira versão desta regra, e ela não pegou o caso real.
    const continuacao = !identicas && !prefixo &&
      /;\s*$/.test(a) && /;\s*$/.test(b) &&
      / \+ |^\+/.test(topoDaExpressao(nb)) &&   // concatena no TOPO, não dentro de uma chamada
      nb.indexOf('=') < 0 &&                    // não é atribuição: seria código vivo
      !/^(var|let|const|function|return|if|for|while|throw)\b/.test(nb);

    if (identicas || prefixo || continuacao) {
      suspeitas.push({
        arquivo: rel,
        linha: i + 1,
        tipo: identicas ? 'linha idêntica repetida'
            : (prefixo ? 'versão curta acima da longa'
                       : 'expressão continua depois de a anterior fechar (código morto)'),
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
