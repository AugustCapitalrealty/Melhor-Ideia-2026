const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert/strict');
const root = path.resolve(__dirname, '..');
const clone = x => JSON.parse(JSON.stringify(x));
function ambiente() {
  const db = { Escopos: [], EscopoArquivos: [], EscopoImagens: [], EscopoMegas: [], Empreendimentos: [
    { ID: 'ctba', NOME: 'Mega Curitiba', ATIVO: true }, { ID: 'esteio', NOME: 'Mega Esteio', ATIVO: true }
  ] };
  const arquivos = {}, decks = [], planilhas = []; let seq = 0, falharPdf = false, falharRender = false;
  function planilha(nome) {
    const celulas = {}, estilos = [];
    const aba = { setName() {}, setColumnWidth() {}, setFrozenRows() {}, getRange(l,c,n=1,m=1) {
      const faixa = {
        setValues(valores) { assert.equal(valores.length,n);valores.forEach((row,i)=>{assert.equal(row.length,m);row.forEach((v,j)=>{celulas[(l+i)+','+(c+j)]=v;});});return this; },
        setValue(v) {celulas[l+','+c]=v;return this;},
        merge() {for(let i=0;i<n;i++)for(let j=0;j<m;j++)if(i||j)delete celulas[(l+i)+','+(c+j)];return this;}
      };
      for(const metodo of ['setFontFamily','setFontSize','setWrap','setVerticalAlignment','setBackground','setFontColor','setFontWeight','setNumberFormat'])faixa[metodo]=function(v){estilos.push({metodo,v,l,c,n,m});return this;};
      return faixa;
    }};
    const p = {id:'sheet-'+(++seq),nome,celulas,estilos,getId(){return this.id;},getUrl(){return 'https://docs.google.com/spreadsheets/d/'+this.id+'/edit';},getSheets:()=>[aba],setSpreadsheetLocale(){}};
    file(p.id);planilhas.push(p);return p;
  }
  const blob = name => ({ name, getBytes: () => new Array(4000).fill(1), getContentType: () => 'image/png', setName() { return this; } });
  function file(id) {
    return arquivos[id] || (arquivos[id] = { id, trashed: false, getId: () => id, getBlob: () => blob(id),
      isTrashed() { return this.trashed; }, setTrashed(v) { this.trashed = v; }, moveTo() {},
      getAs() { if (falharPdf) throw Error('PDF indisponível'); return blob(id); }
    });
  }
  function deck() {
    const d = { id: 'deck-' + (++seq), pages: [], getId() { return this.id; }, getSlides() { return this.pages.slice(); },
      getPageWidth: () => 720, getPageHeight: () => 405, saveAndClose() {}, appendSlide() {
        if (falharRender) throw Error('Imagem não pode ser renderizada');
        const s = { elements: [], getBackground: () => ({ setSolidFill() {} }), remove() { d.pages.splice(d.pages.indexOf(s), 1); },
          insertImage(blob, x, y, w, h) { s.elements.push({ image: blob.name, x, y, w, h }); },
          insertShape(type, x, y, w, h) {
            const e = { text: '', x, y, w, h }; s.elements.push(e);
            const style = { setFontFamily(v) { e.font = v; return this; }, setFontSize(v) { e.fs = v; return this; }, setForegroundColor(v) { e.color = v; return this; }, setBold(v) { e.bold = v; return this; } };
            const par = { setParagraphAlignment(v) { e.align = v; return this; }, setLineSpacing() { return this; }, setSpaceAbove() { return this; }, setSpaceBelow() { return this; } };
            const t = { setText(v) { e.text = v; }, getTextStyle: () => style, getParagraphStyle: () => par,
              getParagraphs: () => e.text.split('\n').map(texto => ({ getRange: () => ({ asString: () => texto, getParagraphStyle: () => ({
                setIndentStart(v) { (e.recuos = e.recuos || []).push({ texto, v }); return this; }, setIndentFirstLine() { return this; } }) }) })) };
            const border = { setTransparent() { return this; }, setWeight(w) { e.borderW = w; return this; }, getLineFill: () => ({ setSolidFill(c) { e.borderColor = c; return this; } }) };
            return { getBorder: () => border, getFill: () => ({ setSolidFill(v) { e.fill = v; }, setTransparent() {} }), setContentAlignment() {}, getText: () => t };
          }
        }; d.pages.push(s); return s;
      }
    }; file(d.id); decks.push(d); return d;
  }
  const ctx = vm.createContext({ console, Date, CF_PASTA_ID: 'folder',
    Utilities: { getUuid: () => '00000000-0000-0000-0000-' + String(++seq).padStart(12,'0'),
      base64Decode: s => Array.from(Buffer.from(s, 'base64')), base64Encode: b => Buffer.from(b).toString('base64'), newBlob: (b,m,n) => blob(n) },
    HtmlService: { createHtmlOutputFromFile: () => ({ getContent: () => fs.readFileSync(path.join(root,'app/EscopoAssets.html'),'utf8') }) },
    DriveApp: { getFileById: file, getFolderById: () => ({ createFile: () => file('file-' + (++seq)) }) },
    SlidesApp: { create: deck, ShapeType: { RECTANGLE: 'rect' }, ContentAlignment: { TOP: 'top', MIDDLE: 'middle' }, ParagraphAlignment: { START: 'start', CENTER: 'center', JUSTIFIED: 'justified' }, PredefinedLayout: { BLANK: 'blank' } },
    SpreadsheetApp: { create: planilha, flush() {} },
  });
  for (const name of ['Util.gs','Apresentacao_Conselho.gs','Escopos.gs','EscopoSlides.gs','EscopoPlanilha.gs']) vm.runInContext(fs.readFileSync(path.join(root,'app',name),'utf8'),ctx);
  ctx.cfExigeAutorizacao_ = () => 'teste@capitalrealty.com.br';
  ctx.cfEmpresaDoMega_ = () => ({nome:'Demercado'});
  ctx.esPreparar_ = () => {};
  ctx.cfComTrava_ = fn => fn();
  ctx.cfLerTudo_ = name => clone(db[name]).map((x,i) => ({...x, _linha: i+2}));
  ctx.cfInserir_ = (name, rows) => db[name].push(...clone(rows));
  ctx.cfAtualizarLinha_ = (name, line, fields) => Object.assign(db[name][line-2],clone(fields));
  return { ctx, db, arquivos, decks, planilhas, falharPdf: v => falharPdf=v, falharRender: v => falharRender=v };
}
function exemplo() { return { titulo: 'Adequações elétricas', megaId: 'ctba', megaNome: 'Mega Curitiba', imagem: 'padrao:curitiba', endereco: 'Endereço de referência',
  objetivo: 'Corrigir instalações existentes.', vistoria: 'Fiações expostas.', responsavel:'Comprador', visita:true,
  grupos: [{id:'g1',titulo:'Módulo 01 — térreo',servicos:'Instalar diagrama unifilar\nOrganizar fios\nTestar circuitos'}],
  itens: [{descricao:'Organização do quadro, identificação e testes',quantidade:'1,5',unidade:'vb',referencia:'',grupos:['g1']}], fotos: [],
  inclusoes:'Materiais, testes e limpeza.',exclusoes:'Obras civis.',criteriosAceite:'Testes aprovados e relatório entregue.',consideracoes:'Limpeza final.' }; }
const a = ambiente(), c = a.ctx;
assert.equal(c.apiEscoposListar().megas[1].imagem,'');
const n = c.esNormalizar_({...exemplo(), preco: 900, itens:[{...exemplo().itens[0],valor:900}]});
assert.equal(n.itens[0].quantidade,1.5); assert(!('valor' in n.itens[0])); assert(!('preco' in n));
for (const quantidade of [-1,0,'abc',Infinity]) assert.throws(() => c.esNormalizar_({...exemplo(),itens:[{...exemplo().itens[0],quantidade}]}));
assert.throws(() => c.esNormalizar_({...exemplo(),grupos:[{id:"x');alert(1)//",titulo:'x',servicos:'x'}]}));
assert.throws(() => c.esNormalizar_({...exemplo(),fotos:[{imagem:'private-drive-id',grupos:['g1']}]}));
assert.throws(() => c.esNormalizar_({...exemplo(),itens:[{...exemplo().itens[0],grupos:['ausente']}]}));
assert.equal(c.apiEscopoSalvar('',0,{...exemplo(),megaId:'esteio'}).ok,false);
let salvo=c.apiEscopoSalvar('',0,exemplo()); assert(salvo.ok); assert.equal(salvo.revisao,1); assert(salvo.carimbo);
assert.equal(c.apiEscopoSalvar(salvo.id,1,exemplo(),salvo.carimbo).revisao,1,'mesmo conteúdo não cria revisão');
let alterado={...exemplo(),objetivo:'Novo objetivo'};
// Rascunho nunca emitido é regravado na mesma revisão: tentativas corrigidas não viram R2, R3, R4.
const rascunho=c.apiEscopoSalvar(salvo.id,1,alterado,salvo.carimbo);assert.equal(rascunho.revisao,1);
assert.equal(a.db.Escopos.length,1,'rascunho não cria linha nova');assert.equal(JSON.parse(a.db.Escopos[0].CONTEUDO).objetivo,'Novo objetivo');
assert.equal(c.apiEscopoSalvar(salvo.id,1,exemplo(),salvo.carimbo).ok,false,'concorrência não sobrescreve rascunho');
assert.equal(JSON.parse(a.db.Escopos[0].CONTEUDO).objetivo,'Novo objetivo');
salvo=c.apiEscopoSalvar(salvo.id,1,exemplo(),rascunho.carimbo);assert.equal(salvo.revisao,1);
// Validação antes de salvar: erro de preenchimento não grava nada.
const invalido=c.apiEscopoValidar({...exemplo(),objetivo:''});assert(!invalido.ok);assert.match(invalido.erro,/objetivo/);
assert.equal(a.db.Escopos.length,1);assert(c.apiEscopoValidar(exemplo()).ok);
assert(!c.apiEscopoValidar({...exemplo(),itens:[]},'planilha').ok);
assert(c.apiEscopoSalvarMega('ctba','Novo endereço','padrao:curitiba').ok);
assert.equal(JSON.parse(a.db.Escopos[0].CONTEUDO).endereco,exemplo().endereco,'cadastro não altera snapshots');
const result=c.apiEscopoGerar(salvo.id,1); assert(result.ok,result.erro);
assert.equal(a.decks.length,1); assert.equal(a.db.EscopoArquivos[0].STATUS,'concluido');
assert(c.apiEscopoGerar(salvo.id,1).ok);assert.equal(a.decks.length,1,'geração repetida reutiliza documento');
// Revisão emitida fica congelada: a próxima alteração abre R2.
salvo=c.apiEscopoSalvar(salvo.id,1,alterado,salvo.carimbo);assert.equal(salvo.revisao,2);
assert.equal(JSON.parse(a.db.Escopos[0].CONTEUDO).objetivo,exemplo().objetivo,'revisão emitida não muda');
const textos=a.decks[0].pages.flatMap(s=>s.elements.map(e=>e.text||''));
const escritos=a.decks[0].pages.flatMap(s=>s.elements).filter(e=>e.text);
assert(escritos.some(e=>e.font==='Montserrat'&&e.bold),'títulos com a fonte institucional');
assert(escritos.some(e=>e.font==='Open Sans'),'corpo com a fonte institucional');
assert(!escritos.some(e=>e.font==='Arial'),'sem tipografia paralela à identidade compartilhada');
assert(textos.some(t=>t.includes('Corrigir instalações')));assert(!textos.some(t=>t.includes('Novo objetivo')));
assert(!textos.some(t=>t.includes('Valores a preencher pelo fornecedor')));assert(!textos.some(t=>t.includes('R$ 0')));
assert.equal(c.apiEscopoAbrir(salvo.id).arquivos.length,1);
a.falharPdf(true);const falha=c.apiEscopoGerar(salvo.id,2);assert(!falha.ok);assert.equal(a.db.EscopoArquivos[1].STATUS,'falhou');assert(a.arquivos[a.decks[1].id].trashed);
assert(!a.arquivos[a.decks[0].id].trashed,'documento anterior preservado');
// Falha não congela: corrigir e salvar continua na R2.
salvo=c.apiEscopoSalvar(salvo.id,2,{...alterado,prazo:'30 dias'},salvo.carimbo);assert.equal(salvo.revisao,2,'geração que falhou não gera nova revisão');
a.falharPdf(false);assert(c.apiEscopoGerar(salvo.id,2).ok,'nova tentativa após falha');
assert.equal(a.db.EscopoArquivos.length,2,'nova tentativa reaproveita o registro da falha');assert.equal(a.db.EscopoArquivos[1].STATUS,'concluido');
// Execução morta no limite de 6 min: 'gerando' recente bloqueia; expirado é reaproveitado e o deck parcial vai para a lixeira.
salvo=c.apiEscopoSalvar(salvo.id,2,{...alterado,prazo:'45 dias'},salvo.carimbo);assert.equal(salvo.revisao,3);
const parcial=a.ctx.SlidesApp.create('parcial');
a.db.EscopoArquivos.push({ID:'ESL2-morto',ID_ESCOPO:salvo.id,REVISAO:3,STATUS:'gerando',SLIDES_ID:parcial.id,PDF_ID:'',CRIADO_EM:new Date().toISOString()});
assert.match(c.apiEscopoGerar(salvo.id,3).erro,/sendo gerada/);
a.db.EscopoArquivos.at(-1).CRIADO_EM=new Date(Date.now()-8*60*1000).toISOString();
const qtdArquivos=a.db.EscopoArquivos.length;
assert(c.apiEscopoGerar(salvo.id,3).ok,'geração presa expira');
assert.equal(a.db.EscopoArquivos.length,qtdArquivos,'sem registro duplicado');assert(a.arquivos[parcial.id].trashed,'deck órfão removido');
// Estouro de tempo vira falha controlada, registrada e limpa.
const lento=a.ctx.SlidesApp.create('lento');
assert.throws(()=>c.esDesenharSlides_(lento,c.esPlanejarSlides_(c.esNormalizar_(exemplo())),{},{revisao:1,data:'x',limite:Date.now()-1}),/tempo/);
assert.throws(()=>c.esValidarGeracao_(c.esNormalizar_({...exemplo(),grupos:[...exemplo().grupos,{id:'g2',titulo:'Outro',servicos:'Outro'}]})),/Vincule/);
assert.throws(()=>c.esValidarGeracao_(c.esNormalizar_({...exemplo(),imagem:''})),/imagem/);
assert.throws(()=>c.esValidarGeracao_(c.esNormalizar_({...exemplo(),itens:[{...exemplo().itens[0],quantidade:''}]})),/quantidade/);
const imgId='IMG-11111111-1111-1111-1111-111111111111';
const fotos=Array.from({length:9},(_,i)=>({imagem:imgId,titulo:'QD Módulo 01',legenda:i===0?'Legenda extensa '.repeat(10):'',grupos:['g1']}));
const longo=c.esNormalizar_({...exemplo(),fotos,objetivo:'PALAVRA '.repeat(600),itens:[{...exemplo().itens[0],descricao:'Descrição comprida '.repeat(120)}]});
const plano=c.esPlanejarSlides_(longo);
// Nove fotos de um grupo: os serviços vêm sozinhos e as fotos logo em seguida, até 4 por slide.
assert.deepEqual(Array.from(plano.filter(p=>(p.fotos||[]).length),p=>p.tipo+':'+p.fotos.length),['fotos:4','fotos:4','fotos:1']);
assert.equal(plano[plano.findIndex(p=>p.tipo==='fotos')-1].tipo,'servicos','fotos logo depois do texto do grupo');
assert.deepEqual(Array.from(plano.flatMap(p=>p.fotos||[]),f=>f.numero),[1,2,3,4,5,6,7,8,9],'numeração contínua dentro do grupo');
const objetivo=plano.filter(p=>p.titulo==='Objetivo').flatMap(p=>Array.from(p.linhas)).join(' ');
assert.equal((objetivo.match(/PALAVRA/g)||[]).length,600,'paginação não perde texto');
assert(plano.some(p=>p.tipo==='eap'),'EAP resumida também orienta quem lê o deck');
assert.equal(plano.filter(p=>p.tipo==='tabela').length,0,'sem tabela comercial com preços no deck');
assert(!plano.some(p=>p.tipo==='capa-secao'&&p.titulo==='Proposta'),'sem divisória vazia de proposta');
assert(plano.some(p=>p.tipo==='limites-aceite'),'inclusões, exclusões e aceite recebem página própria');
const visual=a.ctx.SlidesApp.create('longo');c.esDesenharSlides_(visual,plano,{logo:{name:'logo'},logoPreta:{name:'logoPreta'},logoAbreviada:{name:'logoAbreviada'},fundo:{name:'fundo'},'padrao:curitiba':{name:'curitiba'},[imgId]:{name:'foto'}},{revisao:1,data:'2026-09-09'});
for(const page of visual.pages)for(const e of page.elements){assert(e.y+e.h<=405.01,JSON.stringify(e));assert(e.x+e.w<=720.01);}
// A descrição da foto sai no mesmo slide da foto, logo abaixo dela — nunca num slide separado.
assert(!plano.some(p=>/Legendas/.test(p.titulo)),'sem slide separado de legendas');
const idxFotos=plano.findIndex(p=>(p.fotos||[]).length),slideFoto=visual.pages[idxFotos].elements;
const imgFoto=slideFoto.find(e=>e.image==='foto'),legFoto=slideFoto.find(e=>(e.text||'').includes('Legenda extensa'));
assert(legFoto,'legenda renderizada junto da foto');assert(legFoto.y>=imgFoto.y+imgFoto.h,'legenda abaixo da foto');
assert(Math.abs(legFoto.x-imgFoto.x)<12,'legenda alinhada à própria foto');
const legendasLongas=c.esPlanejarSlides_(c.esNormalizar_({...exemplo(),fotos:Array.from({length:4},()=>({imagem:imgId,titulo:'QD',legenda:'MWMWMWMWM '.repeat(18).trim(),grupos:['g1']}))}));
const visualLeg=a.ctx.SlidesApp.create('legendas');c.esDesenharSlides_(visualLeg,legendasLongas,{logo:{name:'logo'},logoPreta:{name:'logoPreta'},'padrao:curitiba':{name:'curitiba'},[imgId]:{name:'foto'}},{revisao:1,data:'2026-09-09'});
for(const page of visualLeg.pages)for(const e of page.elements.filter(e=>e.y<382)){assert(e.y+e.h<=382,'legenda máxima não invade o rodapé: '+JSON.stringify(e));}
assert.equal(legendasLongas.reduce((n,p)=>n+(p.fotos||[]).length,0),4,'nenhuma foto perdida');
// Retorno dos usuários em 02/10/2026: foto junto da descrição do serviço, letra e cor iguais em todo o deck,
// e conteúdo curto sem ficar preso num canto.
const ES_FS=vm.runInContext('ES_FS',c),tinta={corpo:'#46516B',destaque:'#16213E'};
const grupos3=c.esNormalizar_({...exemplo(),
  grupos:[{id:'g1',titulo:'Módulo 01',servicos:'Instalar diagrama\nOrganizar fios\nTestar'},{id:'g2',titulo:'Módulo 02',servicos:'Trocar disjuntor'},{id:'g3',titulo:'Shaft',servicos:'Vedar shaft'}],
  itens:[{...exemplo().itens[0],grupos:['g1','g2','g3']}],
  fotos:[{imagem:imgId,titulo:'x',legenda:'Quadro do módulo 02',grupos:['g2']},{imagem:imgId,titulo:'x',legenda:'Quadro do módulo 01',grupos:['g1']},{imagem:imgId,titulo:'x',legenda:'',grupos:['g1','g2']}]});
const planoG=c.esPlanejarSlides_(grupos3),servG=planoG.filter(p=>p.tipo==='servicos');
assert.deepEqual(clone(servG.map(p=>p.subtitulo)),['Módulo 01','Módulo 02','Shaft']);
// Pedido em 02/10: primeiro o slide só com o texto do grupo, no seguinte as fotos dele.
assert.deepEqual(clone(planoG.filter(p=>['servicos','fotos'].includes(p.tipo)).map(p=>p.tipo+':'+p.subtitulo+':'+(p.fotos||[]).map(f=>f.legenda).join('|'))),
  ['servicos:Módulo 01:','fotos:Módulo 01:Quadro do módulo 01|','servicos:Módulo 02:','fotos:Módulo 02:Quadro do módulo 02','servicos:Shaft:'],'cada foto logo depois do texto do seu grupo, sem repetir');
const fotosG=planoG.filter(p=>p.tipo==='fotos');
assert(!planoG.some(p=>p.tipo==='capa-secao'&&/Fotogr/.test(p.titulo)),'sem seção de fotos longe dos serviços');
const blobsT={logo:{name:'logo'},logoPreta:{name:'logoPreta'},'padrao:curitiba':{name:'curitiba'},[imgId]:{name:'foto'}};
const deckG=a.ctx.SlidesApp.create('grupos');c.esDesenharSlides_(deckG,planoG,blobsT,{revisao:1,data:'2026-09-09'});
const pagServ=deckG.pages[planoG.indexOf(servG[0])].elements;
assert(pagServ.some(e=>(e.text||'').includes('Instalar diagrama')),'serviços no slide');
assert.equal(pagServ.filter(e=>e.image).length,1,'slide de serviços só com o texto (e o logo)');
const pagFotosG=deckG.pages[planoG.indexOf(fotosG[0])].elements;
assert.equal(pagFotosG.filter(e=>e.image==='foto').length,2,'fotos do grupo no slide seguinte');
const cartaoShaft=deckG.pages[planoG.indexOf(servG[2])].elements.find(e=>e.fill==='#F6F8FC'&&e.w===672);
assert(Math.abs(cartaoShaft.y+cartaoShaft.h/2-(66+305/2))<1,'texto curto sem foto fica no centro, não no alto à esquerda');
// Textos longos de inclusões quebram na largura em que serão desenhados, não na da coluna estreita.
const limitesLongos=c.esPlanejarSlides_(c.esNormalizar_({...exemplo(),inclusoes:'Fornecimento de materiais e mão de obra '.repeat(30)}));
const inclusao=limitesLongos.find(p=>p.titulo==='Inclusões');
assert(Math.max(...inclusao.linhas.map(l=>c.esLarguraTexto_(l,ES_FS.corpo)))>500,'inclusões longas ocupam a largura do cartão');
const deckLim=a.ctx.SlidesApp.create('limites');c.esDesenharSlides_(deckLim,limitesLongos,blobsT,{revisao:1,data:'2026-09-09'});
const deckTL=a.ctx.SlidesApp.create('textos');c.esDesenharSlides_(deckTL,textosLongosPlano(),blobsT,{revisao:1,data:'2026-09-09'});
function textosLongosPlano(){return c.esPlanejarSlides_(c.esNormalizar_({...exemplo(),prazo:'Prazo detalhado '.repeat(24),aviso:'Diretriz importante '.repeat(120)}));}
const planoBase=c.esPlanejarSlides_(c.esNormalizar_(exemplo()));
const comCorpo=['local','contexto-duplo','card-texto','servicos','limites-aceite','encerramento'];
for(const [deckX,planoX] of [[a.decks[0],planoBase],[visual,plano],[deckG,planoG],[deckLim,limitesLongos],[deckTL,textosLongosPlano()],[visualLeg,legendasLongas]]){
  assert.equal(deckX.pages.length,planoX.length);
  planoX.forEach((p,i)=>{
    const els=deckX.pages[i].elements;
    for(const e of els.filter(e=>e.y>=56&&e.y<382))assert(e.y+e.h<=382.01,'conteúdo não invade o rodapé: '+p.tipo+' '+JSON.stringify(e));
    if(!comCorpo.includes(p.tipo))return;
    const textos=els.filter(e=>e.text&&e.y>=56&&e.y<382);
    for(const e of textos.filter(e=>e.font==='Open Sans'&&e.fs!==ES_FS.legenda)){
      assert.equal(e.fs,ES_FS.corpo,'corpo com tamanho único: '+p.tipo+' '+e.text.slice(0,30));
      assert.equal(e.color,tinta.corpo,'corpo com cor única: '+p.tipo+' '+e.text.slice(0,30));
      // Pedido em 02/10: corpo justificado. O parágrafo vai inteiro para o Slides quebrar e justificar.
      assert.equal(e.align,'justified','corpo justificado: '+p.tipo+' '+e.text.slice(0,30));
    }
    for(const e of els.filter(e=>e.text))assert(!e.text.includes('⁣'),'marca de continuação não vaza para o slide');
    for(const e of textos.filter(e=>e.font==='Montserrat'))assert.equal(e.fs,ES_FS.rotulo,'rótulo com tamanho único: '+p.tipo+' '+e.text);
  });
}
// Tamanho real da foto: a legenda encosta na imagem, inclusive em foto de celular tirada em pé (EXIF 6).
const bytesBlob=b=>({getBytes:()=>b.map(x=>x>127?x-256:x)});
const png=[137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,3,32,0,0,2,88,8,2,0,0,0];
assert.deepEqual(clone(c.esDimensoesImagem_(bytesBlob(png))),{w:800,h:600});
const exif=[0xFF,0xE1,0,34,0x45,0x78,0x69,0x66,0,0,0x49,0x49,0x2A,0,8,0,0,0,1,0,0x12,0x01,3,0,1,0,0,0,6,0,0,0,0,0,0,0];
const sof=[0xFF,0xC0,0,17,8,2,0x58,3,0x20,3,1,0x22,0,2,0x11,1,3,0x11,1,0xFF,0xDA,0,8,0,0,0,0,0,0];
assert.deepEqual(clone(c.esDimensoesImagem_(bytesBlob([0xFF,0xD8,...sof]))),{w:800,h:600});
assert.deepEqual(clone(c.esDimensoesImagem_(bytesBlob([0xFF,0xD8,...exif,...sof]))),{w:600,h:800},'foto de celular em pé');
assert.equal(c.esDimensoesImagem_(bytesBlob(new Array(40).fill(1))),null);assert.equal(c.esDimensoesImagem_(undefined),null);
const deckReal=a.ctx.SlidesApp.create('real');c.esDesenharSlides_(deckReal,planoG,{...blobsT,[imgId]:{name:'foto',...bytesBlob([0xFF,0xD8,...exif,...sof])}},{revisao:1,data:'2026-09-09'});
for(const img of deckReal.pages[planoG.indexOf(fotosG[0])].elements.filter(e=>e.image==='foto')){
  assert(Math.abs(img.w/img.h-600/800)<.001,'proporção da foto preservada');
  const legenda=deckReal.pages[planoG.indexOf(fotosG[0])].elements.find(e=>e.text&&e.text.startsWith('FOTO')&&Math.abs(e.y-(img.y+img.h+2))<.01);
  assert(legenda,'número da foto logo abaixo da imagem');
}
// Tópico longo: no slide é um parágrafo só (justificado inteiro) e a segunda linha recua até o texto do "•".
const topicoLongo='Fornecimento de 28 barreiras plásticas viárias, na cor laranja com refletivo branco, destinadas à sinalização e proteção das áreas indicadas no mapa anexo';
const planoTop=c.esPlanejarSlides_(c.esNormalizar_({...exemplo(),grupos:[{id:'g1',titulo:'Barreiras',servicos:topicoLongo+'\nTotal: 28 unidades'}]}));
const servTop=planoTop.find(p=>p.tipo==='servicos');assert(servTop.linhas.length>=3,'o tópico ocupa mais de uma linha na estimativa');
const deckTop=a.ctx.SlidesApp.create('topico');c.esDesenharSlides_(deckTop,planoTop,blobsT,{revisao:1,data:'2026-09-09'});
const caixaTop=deckTop.pages[planoTop.indexOf(servTop)].elements.find(e=>(e.text||'').includes('barreiras'));
assert.deepEqual(caixaTop.text.split('\n'),['• '+topicoLongo,'• Total: 28 unidades'],'um parágrafo por tópico, sem quebra manual');
assert.equal(caixaTop.recuos.length,2,'cada tópico com recuo de segunda linha');assert(caixaTop.recuos.every(r=>r.v>5&&r.v<12));
const tiposVistos=new Set([planoBase,plano,planoG,limitesLongos,textosLongosPlano()].flat().map(p=>p.tipo));
for(const t of comCorpo)assert(tiposVistos.has(t),'consistência conferida também em '+t);
const textosLongos=c.esPlanejarSlides_(c.esNormalizar_({...exemplo(),prazo:'Prazo detalhado '.repeat(24),aviso:'Diretriz importante '.repeat(120)}));
assert(textosLongos.some(p=>p.tipo==='card-texto'&&p.titulo==='Prazos'),'prazo longo recebe paginação própria');
assert(textosLongos.some(p=>p.tipo==='card-texto'&&p.titulo==='Diretrizes para cotação'),'aviso longo recebe paginação própria');
const textoScreenshot = [
  'A proposta deverá contemplar todos os custos envolvidos, incluindo fornecimento, transporte, instalação e eventuais acessórios necessários para pleno funcionamento dos equipamentos.',
  '',
  'Os equipamentos deverão ser entregues prontos para operação.',
  '',
  'Considerar equipamento com proteção IP 65',
  '',
  'Equipamento deve ser Bivolt com tecnologia LED para cancelas de alto fluxo.',
  '',
  'Condição de pagamento:',
  'Pagamento integral em até 28 dias após a entrega dos materiais'
].join('\n');
const planoScreenshot = c.esPlanejarSlides_(c.esNormalizar_({...exemplo(), inclusoes: textoScreenshot, exclusoes: '', criteriosAceite: ''}));
const slidesInclusoes = planoScreenshot.filter(p => p.titulo === 'Inclusões');
assert.equal(slidesInclusoes.length, 1, 'inclusões moderadas cabem em 1 slide único sem cisão');
assert(!planoScreenshot.some(p => p.titulo === 'Inclusões' && (p.subtitulo||'').includes('continuação')), 'sem slide órfão de continuação');
assert(slidesInclusoes[0].linhas[0].length > 60, 'linha de texto ocupa largura cheia do slide (>60 chars), sem estresse de 190pt');
const itensLongos = Array.from({length: 14}, (_, i) => `Item ${i + 1}: Descrição detalhada do fornecimento com especificação técnica completa.`);
const planoQuebraSemantica = c.esPlanejarSlides_(c.esNormalizar_({...exemplo(), inclusoes: itensLongos.join('\n\n')}));
const slidesQuebra = planoQuebraSemantica.filter(p => p.titulo === 'Inclusões');
assert(slidesQuebra.length > 1, 'texto extenso pagina corretamente');
slidesQuebra.forEach(s => {
  const ultimaLinha = s.linhas[s.linhas.length - 1];
  assert(/[.!?:]$/.test(ultimaLinha.trim()), 'slide nunca termina no meio de uma frase: ' + ultimaLinha);
});
// O card de página única é centralizado no lugar de crescer a letra: os usuários reclamaram (02/10) da fonte mudando de slide para slide.
assert.equal(slidesInclusoes[0].fs, ES_FS.corpo, 'card único mantém o corpo de todo o deck');
assert(slidesInclusoes[0].centralizar, 'card único sai centralizado na vertical');
assert.equal(c.esMostrarBadge_('Inclusões','INCLUSÕES'), false, 'badge não repete o título da página');
assert(c.esMostrarBadge_('Prazos','CRONOGRAMA'), 'badge que acrescenta informação continua visível');
// Já as páginas de continuação mantêm um corpo só, senão o texto mudaria de tamanho ao virar o slide.
slidesQuebra.forEach(s=>assert.equal(s.fs,ES_FS.corpo,'continuação mantém o mesmo corpo'));
assert(!slidesQuebra.some(s=>s.centralizar),'página de continuação começa no topo');
// Nenhuma linha pode passar da largura útil da caixa — o Slides reserva recuo interno dos dois lados.
const utilCard=c.esLarguraUtil_(644);
planoScreenshot.concat(planoQuebraSemantica).filter(p=>p.tipo==='card-texto').forEach(p=>{
  p.linhas.forEach(l=>assert(c.esLarguraTexto_(l,p.fs)<=utilCard,'linha cabe na caixa desenhada: '+l));
});
// Dois blocos que cabem lado a lado não são explodidos só porque o terceiro é longo.
const curtoLim='Fornecimento, transporte e instalação inclusos.\nGarantia de 12 meses.';
const longoLim=Array.from({length:22},(_,i)=>'• Requisito '+(i+1)+' com especificação técnica detalhada e extensa.').join('\n');
const planoMisto=c.esPlanejarSlides_(c.esNormalizar_({...exemplo(),inclusoes:curtoLim,exclusoes:curtoLim,criteriosAceite:longoLim}));
const duploLim=planoMisto.filter(p=>p.tipo==='limites-aceite');
assert.equal(duploLim.length,1,'os dois blocos curtos continuam em um slide só');
assert.equal(duploLim[0].blocos.length,2,'slide de limites fica com as duas colunas que cabem');
assert(planoMisto.some(p=>p.titulo==='Critérios de aceite'),'só o bloco longo ganha card próprio');
// Marcador de lista vale no início da linha; numeração no meio da frase não é lista.
assert(c.esEhMarcador_('1. Primeiro item')&&c.esEhMarcador_('• Item'),'marcador no início conta');
assert(!c.esEhMarcador_('Conforme NBR 5410. 2 vias exigidas'),'numeração no meio da frase não é lista');
assert.equal(c.apiEscopoEnviarImagem('x','text/html','AAAA').ok,false);
assert.equal(c.apiEscopoImagem('private-file').ok,false,'API não lê arquivos arbitrários do Drive');
// Render de todas as amostras para inspeção visual opcional em ferramentas locais.
if(process.env.ESCOPO_RENDER_JSON)fs.writeFileSync(process.env.ESCOPO_RENDER_JSON,JSON.stringify({normal:a.decks[0].pages,longo:visual.pages}));
console.log('Escopos: revisões, concorrência, imagens, cobertura, paginação, Slides/PDF e recuperação de falhas OK.');
// EAP antiga e hierarquia nova sobrevivem à gravação e geram preços vazios.
const b=ambiente(), antigo=b.ctx.esNormalizar_(exemplo());
assert.equal(antigo.itens[0].tipo,'item');assert.equal(antigo.itens[0].unidade,'vb');
const eap={...exemplo(),itens:[
  {tipo:'grupo',nivel:0,descricao:'Elétrica'},
  {...exemplo().itens[0],tipo:'item',nivel:1,referencia:'Tigre',preco:980,valor:1470},
  {tipo:'grupo',nivel:1,descricao:'Subgrupo'},
  {...exemplo().itens[0],tipo:'item',nivel:3,descricao:'=HYPERLINK("https://example.com")'}
]};
const eb=b.ctx.apiEscopoSalvar('',0,eap);assert(eb.ok,eb.erro);
const reaberto=b.ctx.apiEscopoAbrir(eb.id).dados;
assert.deepEqual(Array.from(reaberto.itens,it=>it.codigo),['1.0','1.1','1.2','1.2.1']);
assert.equal(reaberto.itens[3].nivel,2);assert(!('preco' in reaberto.itens[1]));
const importado=b.ctx.apiEscopoParaEqualizacao(eb.id,1);assert(importado.ok,importado.erro);
assert.equal(importado.itens[1].marcaReferencia,'Tigre');assert.equal(importado.itens[1].quantidade,1.5);
assert.equal(importado.itens[3].codigo,'1.2.1');assert(!('precos' in importado.itens[1]));
assert(importado.detalhamento.includes(eb.id)&&importado.detalhamento.includes('Revisão 1'));
assert(!b.ctx.apiEscopoParaEqualizacao(eb.id,999).ok);assert(!b.ctx.apiEscopoParaEqualizacao(eb.id,null).ok);
assert(b.ctx.apiEscopoGerarPlanilha(eb.id,1).ok,'planilha entregue congela a revisão');
const eb2=b.ctx.apiEscopoSalvar(eb.id,1,{...eap,titulo:'Escopo revisado'});assert.equal(eb2.revisao,2);
assert.equal(b.ctx.apiEscoposParaEqualizacao().escopos.length,2);
assert.equal(b.ctx.apiEscopoParaEqualizacao(eb.id,1).titulo,eap.titulo,'importa a versão enviada, não a última');
assert.throws(()=>b.ctx.esValidarItensCotacao_(b.ctx.esNormalizar_({...exemplo(),itens:[eap.itens[0]]})),/Cada item/);
const excel=b.ctx.apiEscopoGerarPlanilha(eb.id,1);assert(excel.ok,excel.erro);assert.match(excel.download,/\/export\?format=xlsx$/);
assert.equal(b.ctx.apiEscopoAbrir(eb.id).planilhas.length,2,'planilhas emitidas continuam visíveis ao reabrir');
const sheet=b.planilhas[0],v=sheet.celulas;
assert.equal(v['10,1'],'1.0');assert.equal(v['11,1'],'1.1');assert.equal(v['11,3'],1.5);assert.equal(v['11,4'],'vb');assert.equal(v['11,5'],'Tigre');
assert(v['13,2'].startsWith("'=HYPERLINK(\"https://example.com\")"),'texto não vira fórmula');
assert(v['11,2'].includes('Local: Módulo 01 — térreo'),'planilha preserva o local de execução');
for(let linha=10;linha<=13;linha++)for(let coluna=6;coluna<=9;coluna++)assert.equal(v[linha+','+coluna],'','campos do fornecedor em branco');
assert.equal(v['14,1'],'TOTAL DA PROPOSTA (R$)');assert.equal(v['14,8'],'');
assert.equal(v['10,3'],'','grupo não recebe quantidade');
assert(sheet.estilos.some(s=>s.metodo==='setBackground'&&s.v==='#fff2cc'),'campos de resposta destacados');
assert(!Object.values(v).some(x=>typeof x==='string'&&x.startsWith('=')),'sem fórmulas nem valores calculados na proposta vazia');
const previa=b.planilhas.length;
b.ctx.cfExigeAutorizacao_=()=>{throw Error('Não autorizado');};assert(!b.ctx.apiEscopoGerarPlanilha(eb.id,1).ok);assert.equal(b.planilhas.length,previa);
b.ctx.cfExigeAutorizacao_=()=>{};b.ctx.SpreadsheetApp.flush=()=>{throw Error('Falha simulada');};
assert(!b.ctx.apiEscopoGerarPlanilha(eb.id,1).ok);assert(b.arquivos[b.planilhas.at(-1).id].trashed,'falha remove só o arquivo incompleto');assert(!b.arquivos[sheet.id].trashed);
console.log('EAP e Excel: hierarquia, legado, revisão, preços vazios, autorização e recuperação OK.');
const legado=ambiente(),rl=legado.ctx.apiEscopoSalvar('',0,exemplo());
legado.db.EscopoArquivos.push({ID:'modelo-antigo',ID_ESCOPO:rl.id,REVISAO:1,STATUS:'concluido',SLIDES_ID:'slides-antigo',PDF_ID:'pdf-antigo'});
const atualizado=legado.ctx.apiEscopoGerar(rl.id,1);assert(atualizado.ok,atualizado.erro);
assert.equal(legado.decks.length,1,'modelo antigo é regenerado mesmo sem alteração no escopo');
assert.equal(legado.db.EscopoArquivos[0].SLIDES_ID,'slides-antigo','histórico anterior preservado');
legado.ctx.apiEscopoGerar(rl.id,1);assert.equal(legado.decks.length,1,'modelo novo é reutilizado');
module.exports={ambiente,exemplo};
