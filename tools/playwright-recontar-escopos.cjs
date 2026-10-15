// Recontagem dos escopos na produção (15/10/2026): abre o app (@77) num Chrome com perfil próprio, espera a lista
// carregar e salva a tela e o texto. Na 1ª vez, entre com a conta Google na janela que abrir.
// Uso: PLAYWRIGHT_MODULE=<playwright-core fora do projeto> node tools/playwright-recontar-escopos.cjs
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const fs = require('fs');
const path = require('path');
const URL = 'https://script.google.com/macros/s/AKfycbxy2cJdA-d5zM39KXeRhyZxinfTWEaVIJLMs5Y03rQBQNPH1mFnh0HbIjLSI4ciHA94Aw/exec';
const os = require('os');
const BASE = path.join(os.tmpdir(), 'melhor-ideia-playwright');  // fora do repositório: o perfil guarda o login
const OUT = path.join(BASE, 'telas');
fs.mkdirSync(OUT, { recursive: true });

async function acharApp(page) {
  for (let i = 0; i < 300; i++) {  // até 5 min para o login
    for (const f of page.frames()) {
      try { if (/Escopos de contratação/.test(await f.locator('body').innerText({ timeout: 500 }))) return f; } catch {}
    }
    await page.waitForTimeout(1000);
  }
}

(async () => {
  const ctx = await chromium.launchPersistentContext(path.join(BASE, 'perfil'), {
    channel: 'chrome', headless: false, viewport: { width: 1600, height: 1000 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(URL);
  const app = await acharApp(page);
  if (!app) { console.log('app não carregou'); await ctx.close(); return; }
  for (let i = 0; i < 60; i++) {
    const t = await app.locator('body').innerText();
    if (!/carregando…|Carregando escopos/.test(t)) break;
    await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, '02-lista.png'), fullPage: true });
  fs.writeFileSync(path.join(OUT, '02-lista.txt'), await app.locator('body').innerText());
  console.log('ok lista');
  await ctx.close();
})();
