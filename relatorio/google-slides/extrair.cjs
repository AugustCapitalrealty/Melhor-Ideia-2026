// Prepara a apresentação nativa do Google Slides a partir de relatorio/rascunho/deck.html (15/10/2026).
// Para cada slide: (1) bg-NN.png = o slide sem nenhum texto (formas, fotos, telas e cartões ficam no fundo);
// (2) layout.json = cada bloco de texto com posição, fonte, tamanho, cor e trechos em negrito, para o Apps Script
// recriar como caixa de texto editável. Uso: PLAYWRIGHT_MODULE=<playwright-core> node relatorio/google-slides/extrair.cjs <pasta-saida>
'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');

const DECK = path.resolve(__dirname, '..', 'rascunho', 'deck.html');
const SAIDA = path.resolve(process.argv[2] || path.join(__dirname, 'saida'));

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const total = await (async () => { await page.goto(pathToFileURL(DECK).href + '#1'); return page.evaluate(() => document.querySelectorAll('.slide').length); })();
  const layout = [];
  for (let n = 1; n <= total; n++) {
    await page.goto(pathToFileURL(DECK).href + '?s=' + n + '#' + n);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    const blocos = await page.evaluate(() => {
      const slide = document.querySelector('.slide.ativo');
      const blocoDe = (el) => { const d = getComputedStyle(el).display; return d !== 'inline' && d !== 'contents'; };
      const out = [];
      // bloco de texto = elemento de bloco com texto próprio e sem filho de bloco que tenha texto
      slide.querySelectorAll('*').forEach((el) => {
        if (!blocoDe(el) || !el.innerText || !el.innerText.trim()) return;
        if ([...el.children].some((c) => blocoDe(c) && c.innerText && c.innerText.trim())) return;
        if (getComputedStyle(el).visibility === 'hidden') return;
        const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
        const cs = getComputedStyle(el);
        const trechos = [];
        let prefixo = '';
        if (el.tagName === 'LI') {
          const ol = el.parentElement.tagName === 'OL';
          prefixo = ol ? ([...el.parentElement.children].indexOf(el) + 1) + '. ' : '• ';
          const mk = getComputedStyle(el, '::marker');
          trechos.push({ t: prefixo, b: ol, c: mk.color || cs.color, f: ol ? 'Montserrat' : cs.fontFamily, s: parseFloat(cs.fontSize), i: false });
        }
        const andar = (node) => {
          node.childNodes.forEach((ch) => {
            if (ch.nodeType === 3) {
              const t = ch.textContent.replace(/\s+/g, ' '); if (!t) return;
              const p = getComputedStyle(ch.parentElement);
              trechos.push({ t, b: Number(p.fontWeight) >= 600, c: p.color, f: p.fontFamily, s: parseFloat(p.fontSize), i: p.fontStyle === 'italic' });
            } else if (ch.nodeType === 1) {
              if (ch.tagName === 'BR') trechos.push({ t: '\n' }); else andar(ch);
            }
          });
        };
        andar(el);
        // tira espaço do começo e do fim do bloco
        while (trechos.length && trechos[0].t !== prefixo && /^\s+$/.test(trechos[0].t)) trechos.shift();
        if (trechos.length) { const k = prefixo ? 1 : 0; if (trechos[k]) trechos[k].t = trechos[k].t.replace(/^\s+/, ''); const u = trechos[trechos.length - 1]; u.t = u.t.replace(/\s+$/, ''); }
        out.push({ x: r.left, y: r.top, w: r.width, h: r.height, alinhar: cs.textAlign, altLinha: parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2,
          maiusc: cs.textTransform === 'uppercase', esp: parseFloat(cs.letterSpacing) || 0, trechos });
      });
      return out;
    });
    layout.push({ n, blocos });
    // fundo: o mesmo slide sem texto
    await page.addStyleTag({ content: '.slide.ativo *, .slide.ativo *::marker { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }' });
    await page.screenshot({ path: path.join(SAIDA, `bg-${String(n).padStart(2, '0')}.png`) });
    console.log('ok', n, blocos.length, 'blocos');
  }
  fs.writeFileSync(path.join(SAIDA, 'layout.json'), JSON.stringify(layout));
  await browser.close();
})();
