/**
 * A folha de estilo fecha o que abre — e o que é de desktop não fica
 * preso em media query de celular.
 *
 * O defeito que este teste guarda: um @media(max-width:640px) sem a
 * chave de fechamento engoliu as ~750 linhas seguintes, que são todo o
 * modal de predefinições da EAP. Em tela de celular funcionava; no
 * desktop o modal aparecia como HTML cru — botão de sistema, checkbox
 * solto, sem colunas, textos colados. Parecia design malfeito e era
 * uma chave faltando.
 *
 * Balanço de chaves sozinho não bastaria: uma folha pode estar
 * perfeitamente balanceada e ainda assim ter a regra do desktop dentro
 * de um @media. Por isso o segundo teste é sobre ONDE a regra está.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Validando a integridade da folha de estilo...');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8')
  .replace(/\r\n/g, '\n');

const i = html.indexOf('<style>');
const f = html.indexOf('</style>');
assert.ok(i >= 0 && f > i, 'Interface.html precisa ter um bloco <style>');

const css = html.slice(i + 7, f);
const linhas = css.split('\n');

/**
 * Percorre a folha guardando o que abriu cada nível.
 *
 * Comentários saem antes: uma chave dentro de /* *\/ não abre nada, e
 * contá-la daria alarme falso.
 */
function percorrer() {
  const pilha = [];
  const eventos = [];
  let emComentario = false;

  linhas.forEach(function (bruta, idx) {
    let l = bruta;
    if (emComentario) {
      const fim = l.indexOf('*/');
      if (fim < 0) return;
      l = l.slice(fim + 2);
      emComentario = false;
    }
    l = l.replace(/\/\*[\s\S]*?\*\//g, '');
    const abriu = l.indexOf('/*');
    if (abriu >= 0) { emComentario = true; l = l.slice(0, abriu); }

    for (const ch of l) {
      if (ch === '{') pilha.push({ linha: idx + 1, texto: l.trim().slice(0, 60) });
      else if (ch === '}') pilha.pop();
    }
    eventos.push({ linha: idx + 1, texto: l, pilha: pilha.slice() });
  });

  return { pilha: pilha, eventos: eventos };
}

const r = percorrer();

// ── 1. Nada fica aberto
assert.strictEqual(
  r.pilha.length, 0,
  'a folha termina com ' + r.pilha.length + ' bloco(s) sem fechar' +
  (r.pilha.length ? ' — o primeiro abriu na linha ' + r.pilha[0].linha +
   ' do <style>: ' + r.pilha[0].texto : '') +
  '. Tudo depois disso vira regra aninhada e o navegador descarta.'
);

// ── 2. O que é de tela grande não pode estar dentro de um @media
//
//    Uma por tela, para o teste dizer QUAL modal quebrou, e não só que
//    "alguma coisa" quebrou.
const REGRAS_DE_DESKTOP = [
  '.modal-presets-janela',
  '.modal-presets-corpo',
  '.preset-card-item',
  '.presets-lista-cards',
  '.bt-preset',
  '.grade-compra',
  '.gaveta',
  '.pill',
  '.bloco'
];

REGRAS_DE_DESKTOP.forEach(function (seletor) {
  // Onde a regra é declarada: início de linha, seguido de { ou de vírgula.
  const evento = r.eventos.filter(function (e) {
    return new RegExp('^\\s*' + seletor.replace('.', '\\.') + '\\s*[,{]').test(e.texto);
  })[0];

  assert.ok(evento, 'a regra ' + seletor + ' sumiu da folha de estilo');

  const dentroDeMedia = evento.pilha.filter(function (n) {
    return /@media/.test(n.texto);
  })[0];

  assert.ok(
    !dentroDeMedia,
    seletor + ' está dentro do ' + dentroDeMedia_texto(dentroDeMedia) +
    ' aberto na linha ' + (dentroDeMedia ? dentroDeMedia.linha : '?') +
    ' do <style> — no desktop essa regra não vale, e a tela aparece sem estilo.'
  );
});

function dentroDeMedia_texto(n) {
  return n ? n.texto : '@media';
}

// ── 3. O atributo hidden tem de vencer qualquer display forçado
//
//    `hidden` esconde por uma regra do navegador, a mais fraca que
//    existe. Um `display: flex !important` numa classe a derruba — e foi
//    assim que o modal de predefinições virou uma camada fixa, inset:0 e
//    z-index 10000, que nunca fechava e engolia todo clique do app. A
//    tela parecia travada, e nenhum botão respondia porque todos
//    estavam embaixo dela.
const guarda = /\[hidden\][^{]*\{[^}]*display\s*:\s*none[^}]*!important/i.exec(css);
assert.ok(
  guarda,
  'falta a guarda [hidden] { display: none !important } — sem ela, qualquer ' +
  'display !important deixa um elemento hidden visível para sempre'
);

// Entre dois !important de mesma especificidade quem vence é o último.
// Por isso a guarda precisa vir depois de todo display forçado.
const displaysForcados = [];
const reDisplay = /display\s*:\s*[^;}]+!important/gi;
let d;
while ((d = reDisplay.exec(css)) !== null) {
  if (d.index !== guarda.index) displaysForcados.push(d.index);
}

const ultimo = displaysForcados.length ? Math.max.apply(null, displaysForcados) : -1;
assert.ok(
  guarda.index > ultimo,
  'a guarda [hidden] está ANTES do último "display: ... !important" da folha ' +
  '(posição ' + guarda.index + ' contra ' + ultimo + '). Mesma especificidade, ' +
  'os dois !important: vence quem vem por último, então a guarda perde e o ' +
  'elemento hidden continua visível.'
);

// A guarda não é decorativa: a tela realmente esconde coisas assim.
const marcacao = html.slice(f);
assert.ok(
  (marcacao.match(/\shidden\b/g) || []).length >= 3,
  'a tela usa o atributo hidden em vários elementos — se parou de usar, ' +
  'esta guarda e este teste precisam ser revistos, não removidos em silêncio'
);

console.log('OK: a folha fecha o que abre, nenhuma regra de desktop está presa em @media, ' +
            'e o atributo hidden vence qualquer display forçado.');
