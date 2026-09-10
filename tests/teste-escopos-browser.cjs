/** Opcional: PLAYWRIGHT_MODULE aponta para playwright instalado fora do projeto. */
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {ambiente}=require('./teste-escopos.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
  const app=ambiente(),assets=JSON.parse(fs.readFileSync('app/EscopoAssets.html','utf8'));
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
    await page.route('https://fonts.googleapis.com/**',route=>route.abort());
    await page.route('https://fonts.gstatic.com/**',route=>route.abort());
    page.on('pageerror',e=>{errors.push(e.message);console.error('Erro no navegador:',e.message);});
    await page.exposeFunction('esBackend',async(name,args)=>{
      if(name==='apiEscopoImagem')return {ok:true,url:'data:image/png;base64,'+assets.curitiba.base64};
      if(!app.ctx[name])return {ok:false,erro:'API fora do cenário de teste'};
      return JSON.parse(JSON.stringify(app.ctx[name](...args)));
    });
    const mock=`function esTestRunner(success,failure){return new Proxy({}, {get(_,key){if(key==='withSuccessHandler')return fn=>esTestRunner(fn,failure);if(key==='withFailureHandler')return fn=>esTestRunner(success,fn);return (...args)=>window.esBackend(key,args).then(success||(()=>{}),failure||(()=>{}));}});}window.google={script:{run:esTestRunner()}};`;
    const html='<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial;background:#f5f7fb;margin:30px}[hidden]{display:none!important}</style></head><body><script>'+mock+'</script>'+fs.readFileSync('app/EscopoInterface.html','utf8')+'</body></html>';
    await page.setContent(html);
    await page.evaluate(()=>{document.getElementById('v-escopos').hidden=false;return esCarregarUI();});
    await page.getByRole('button',{name:'Novo escopo',exact:true}).click();
    await page.locator('#es-titulo').fill('Adequações elétricas — teste de interface');
    await page.locator('#es-megaId').selectOption('ctba');
    assert.equal(await page.locator('#es-endereco').inputValue(),'BR-116, 1500, Campina Grande do Sul - PR, 83430-000');
    await page.locator('#es-objetivo').fill('Organizar instalações e corrigir pendências.');
    await page.locator('#es-vistoria').fill('Fiações expostas e ausência de identificação.');
    await page.getByRole('button',{name:'+ Grupo de serviços',exact:true}).click();
    await page.locator('#es-grupos input:not([type=file])').fill('Módulo 01 — Quadro elétrico — Térreo');
    await page.locator('#es-grupos textarea').fill('Organizar fiações\nIdentificar circuitos\nRealizar testes');
    await page.getByRole('button',{name:'+ Item para cotação',exact:true}).click();
    await page.locator('#es-itens textarea').fill('Organização do quadro elétrico e testes');
    await page.getByLabel('Quantidade',{exact:true}).fill('1,5');
    await page.getByLabel('Unidade',{exact:true}).fill('vb');
    await page.locator('#es-vinc-itens-0 input').check();
    await page.locator('input[type=file][multiple]').setInputFiles([{name:'foto.png',mimeType:'image/png',buffer:Buffer.from(assets.logo.base64,'base64')}]);
    await page.waitForFunction(()=>!esUI.ocupado);
    assert.equal(await page.locator('#es-grupos .es-foto').count(),1,'foto aparece dentro do grupo');
    assert.equal(await page.getByLabel('Título do conjunto fotográfico',{exact:true}).inputValue(),'Módulo 01 — Quadro elétrico — Térreo');
    assert(await page.locator('#es-vinc-fotos-0 input').isChecked(),'upload já vincula ao grupo');
    await page.getByLabel('Título do conjunto fotográfico',{exact:true}).fill('QD Módulo 01');
    await page.getByLabel('Legenda (opcional)',{exact:true}).fill('Situação encontrada na vistoria.');
    await page.locator('#es-vinc-fotos-0 input').check();
    await page.getByRole('button',{name:'Salvar rascunho',exact:true}).click();
    await page.waitForFunction(()=>!esUI.ocupado);
    assert.match(await page.locator('#es-status').innerText(),/Rascunho salvo/);
    const id=await page.evaluate(()=>esUI.id);
    await page.getByRole('button',{name:'Gerar Slides e PDF',exact:true}).click();
    await page.waitForFunction(()=>!esUI.ocupado);
    assert.match(await page.locator('#es-status').innerText(),/prontos/);
    assert.equal(await page.getByRole('link',{name:'Abrir Slides',exact:true}).count(),1);
    await page.getByRole('button',{name:'Atualizar lista',exact:true}).click();
    await page.waitForFunction(()=>!esUI.ocupado);
    await page.getByRole('button',{name:'Novo escopo',exact:true}).click();
    await page.locator('#es-lista').selectOption(id);
    await page.getByRole('button',{name:'Abrir',exact:true}).click();
    await page.waitForFunction(()=>!esUI.ocupado);
    assert.equal(await page.locator('#es-grupos .es-foto').count(),1);
    await page.locator('#es-vinc-fotos-0 input').uncheck();
    assert.equal(await page.locator('#es-fotos .es-foto').count(),1,'foto sem vínculo continua acessível');
    await page.locator('#es-vinc-fotos-0 input').check();
    assert.equal(await page.locator('#es-grupos .es-foto').count(),1,'foto retorna ao grupo ao vincular');
    assert.equal(await page.getByLabel('Quantidade',{exact:true}).inputValue(),'1.5');
    await page.getByRole('button',{name:'Duplicar grupo',exact:true}).click();
    assert.match(await page.locator('#es-cobertura').innerText(),/cópia/);
    await page.getByRole('button',{name:'Gerar Slides e PDF',exact:true}).click();
    await page.waitForFunction(()=>!esUI.ocupado);
    assert.match(await page.locator('#es-status').innerText(),/Vincule itens/);
    await page.locator('#es-grupos > .es-grupo').nth(1).getByRole('button',{name:'Remover',exact:true}).click();
    await page.locator('#es-objetivo').fill('<img src=x onerror=alert(1)> é texto digitado.');
    await page.getByRole('button',{name:'Salvar rascunho',exact:true}).click();
    await page.waitForFunction(()=>!esUI.ocupado);
    assert.deepEqual(errors,[]);
    if(process.env.ESCOPO_SCREENSHOT)await page.screenshot({path:process.env.ESCOPO_SCREENSHOT,fullPage:true});
    await page.setViewportSize({width:390,height:844});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'formulário cabe no celular');
    // Integração com a página real: avaliar o include como HtmlService faz,
    // mantendo todo o CSS e JavaScript do aplicativo existente.
    const integrado=fs.readFileSync('app/Interface.html','utf8')
      .replace("<?!= HtmlService.createHtmlOutputFromFile('EscopoInterface').getContent(); ?>",fs.readFileSync('app/EscopoInterface.html','utf8'))
      .replace(/<\?= pagina \?>/g,'escopos').replace(/<\?= (eq|editar|cnpj|urlBase) \?>/g,'')
      .replace('<head>','<head><script>'+mock+'</script>');
    await page.setViewportSize({width:1280,height:900});
    await page.setContent(integrado,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>esUI.carregado&&!esUI.ocupado);
    assert(await page.locator('#v-escopos').isVisible());
    await page.locator('#ab-consulta').click();assert(!(await page.locator('#v-escopos').isVisible()));
    await page.locator('#ab-escopos').click();assert(await page.locator('#v-escopos').isVisible());
    await page.getByRole('button',{name:'Novo escopo',exact:true}).click();
    assert.deepEqual(errors,[],'sem erros de JavaScript na página integrada');
    console.log('Browser: cadastro, fotos, cobertura, salvamento, reabertura, geração, erros e largura móvel OK.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
