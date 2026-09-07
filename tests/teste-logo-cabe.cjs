/**
 * A logo que não cabia.
 *
 * O insertImage do Apps Script recusa imagem acima de 1 milhão de
 * pixels. A logo da Capital Realty tem 2643×493 = 1.302.999 e era
 * recusada; a da Demercado tem 886×281 = 248.966 e passava. Daí uma
 * aparecer no documento e a outra não, sem que houvesse nada errado com
 * o arquivo, com a permissão ou com o empreendimento — as três coisas
 * que a gente checou antes de achar esta.
 *
 * A recusa vinha dentro de um try, então o documento saía sem logo e
 * sem reclamar. É por isso que o tamanho passa a ser conferido ANTES.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando o teto de pixels da logo...');

const root = path.resolve(__dirname, '..');
const codigo = fs.readFileSync(path.join(root, 'app', 'Exportar.gs'), 'utf8');

/** Um PNG de mentira com o cabeçalho de verdade: assinatura + IHDR. */
function pngDe(largura, altura) {
  const b = new Array(24).fill(0);
  [137, 80, 78, 71, 13, 10, 26, 10].forEach(function (v, i) { b[i] = v; });
  const escreve = function (pos, n) {
    b[pos] = (n >> 24) & 0xFF; b[pos + 1] = (n >> 16) & 0xFF;
    b[pos + 2] = (n >> 8) & 0xFF; b[pos + 3] = n & 0xFF;
  };
  escreve(16, largura);
  escreve(20, altura);
  // getBytes() do Apps Script devolve bytes com sinal.
  return b.map(function (v) { return v > 127 ? v - 256 : v; });
}

function blobDe(bytes, nome) {
  return {
    _nome: nome || 'logo.png',
    getBytes: function () { return bytes; },
    getContentType: function () { return 'image/png'; },
    setName: function (n) { this._nome = n; return this; }
  };
}

function montar(respostas) {
  const pedidos = [];
  const ctx = { console: console, JSON: JSON, Math: Math, String: String, Number: Number, Array: Array, Object: Object };
  vm.createContext(ctx);
  vm.runInContext(codigo, ctx);

  // Os dublês vão DEPOIS: declaração de função sobrescreve propriedade
  // do contexto, e aqui o arquivo declara várias.
  ctx.Logger = { log: function () {} };
  ctx.ScriptApp = { getOAuthToken: function () { return 'token-de-teste'; } };
  ctx.UrlFetchApp = {
    fetch: function (url) {
      pedidos.push(url);
      const r = respostas(url);
      return {
        getResponseCode: function () { return r.codigo; },
        getContentText: function () { return r.texto || ''; },
        getBlob: function () { return r.blob; }
      };
    }
  };
  return { ctx: ctx, pedidos: pedidos };
}

// ── 1. O cabeçalho é lido como o Apps Script o entrega
{
  const a = montar(function () { return { codigo: 404 }; });
  const d = a.ctx.cfDimensoesPng_(blobDe(pngDe(2643, 493)));
  assert.ok(d, 'o cabeçalho PNG precisa ser lido');
  assert.strictEqual(d.largura, 2643, 'largura da logo da Capital Realty');
  assert.strictEqual(d.altura, 493, 'altura da logo da Capital Realty');
  assert.strictEqual(d.largura * d.altura, 1302999, 'é este número que estoura o teto');

  assert.strictEqual(a.ctx.cfDimensoesPng_(blobDe([1, 2, 3, 4, 5, 6, 7, 8])), null,
    'sem assinatura PNG não dá para saber o tamanho — e chutar seria pior');
}

// ── 2. A que cabe passa intacta, e sem ida ao servidor
{
  const a = montar(function () { throw new Error('não devia buscar nada'); });
  const original = blobDe(pngDe(886, 281));            // Demercado
  const saida = a.ctx.cfLogoQueCabe_(original, 'id-demercado', []);
  assert.strictEqual(saida, original, 'imagem dentro do teto não pode ser trocada');
  assert.strictEqual(a.pedidos.length, 0, 'nem buscada: seria uma chamada de rede por exportação, à toa');
}

// ── 3. A que não cabe é trocada pela miniatura do próprio Drive
{
  const reduzida = blobDe(pngDe(1000, 187), 'thumb.png');
  const a = montar(function (url) {
    if (url.indexOf('fields=thumbnailLink') >= 0) {
      return { codigo: 200, texto: JSON.stringify({ thumbnailLink: 'https://lh3.googleusercontent.com/abc=s220' }) };
    }
    return { codigo: 200, blob: reduzida };
  });

  const tentativas = [];
  const saida = a.ctx.cfLogoQueCabe_(blobDe(pngDe(2643, 493)), 'id-capital', tentativas);

  assert.strictEqual(saida, reduzida, 'imagem acima do teto precisa ser trocada pela menor');
  assert.ok(a.pedidos.some(function (u) { return /=s1000$/.test(u); }),
    'a miniatura precisa ser pedida maior que o padrão =s220, senão a logo sai borrada');
}

// ── 4. Falhando a redução, devolve a original e diz o motivo
{
  const a = montar(function () { return { codigo: 403 }; });
  const original = blobDe(pngDe(2643, 493));
  const tentativas = [];
  const saida = a.ctx.cfLogoQueCabe_(original, 'id-capital', tentativas);

  assert.strictEqual(saida, original, 'sem miniatura, segue com a original — quem recusa é o insertImage');
  assert.ok(tentativas.length > 0 && /redu/i.test(tentativas.join(' ')),
    'a falha da redução precisa entrar no diagnóstico, não sumir');
}

console.log('OK: a logo grande demais é reduzida antes de chegar ao insertImage.');
