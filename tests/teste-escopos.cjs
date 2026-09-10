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
            const par = { setParagraphAlignment() { return this; }, setLineSpacing() { return this; }, setSpaceAbove() { return this; }, setSpaceBelow() { return this; } };
            const t = { setText(v) { e.text = v; }, getTextStyle: () => style, getParagraphStyle: () => par };
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
    SlidesApp: { create: deck, ShapeType: { RECTANGLE: 'rect' }, ContentAlignment: { TOP: 'top' }, ParagraphAlignment: { START: 'start' }, PredefinedLayout: { BLANK: 'blank' } },
    SpreadsheetApp: { create: planilha, flush() {} },
  });
  for (const name of ['Util.gs','Apresentacao_Conselho.gs','Escopos.gs','EscopoSlides.gs','EscopoPlanilha.gs']) vm.runInContext(fs.readFileSync(path.join(root,'app',name),'utf8'),ctx);
  ctx.cfExigeAutorizacao_ = () => 'teste@capitalrealty.com.br';
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
  itens: [{descricao:'Organização do quadro, identificação e testes',quantidade:'1,5',unidade:'vb',referencia:'',grupos:['g1']}], fotos: [], consideracoes:'Limpeza final.' }; }
const a = ambiente(), c = a.ctx;
assert.equal(c.apiEscoposListar().megas[1].imagem,'');
const n = c.esNormalizar_({...exemplo(), preco: 900, itens:[{...exemplo().itens[0],valor:900}]});
assert.equal(n.itens[0].quantidade,1.5); assert(!('valor' in n.itens[0])); assert(!('preco' in n));
for (const quantidade of [-1,0,'abc',Infinity]) assert.throws(() => c.esNormalizar_({...exemplo(),itens:[{...exemplo().itens[0],quantidade}]}));
assert.throws(() => c.esNormalizar_({...exemplo(),grupos:[{id:"x');alert(1)//",titulo:'x',servicos:'x'}]}));
assert.throws(() => c.esNormalizar_({...exemplo(),fotos:[{imagem:'private-drive-id',grupos:['g1']}]}));
assert.throws(() => c.esNormalizar_({...exemplo(),itens:[{...exemplo().itens[0],grupos:['ausente']}]}));
assert.equal(c.apiEscopoSalvar('',0,{...exemplo(),megaId:'esteio'}).ok,false);
let salvo=c.apiEscopoSalvar('',0,exemplo()); assert(salvo.ok); assert.equal(salvo.revisao,1);
assert.equal(c.apiEscopoSalvar(salvo.id,1,exemplo()).revisao,1,'mesmo conteúdo não cria revisão');
let alterado={...exemplo(),objetivo:'Novo objetivo'};
assert.equal(c.apiEscopoSalvar(salvo.id,1,alterado).revisao,2);
assert.equal(c.apiEscopoSalvar(salvo.id,1,exemplo()).ok,false,'concorrência não sobrescreve');
assert.equal(JSON.parse(a.db.Escopos[0].CONTEUDO).objetivo,exemplo().objetivo);
assert(c.apiEscopoSalvarMega('ctba','Novo endereço','padrao:curitiba').ok);
assert.equal(JSON.parse(a.db.Escopos[0].CONTEUDO).endereco,exemplo().endereco,'cadastro não altera snapshots');
const result=c.apiEscopoGerar(salvo.id,1); assert(result.ok,result.erro);
assert.equal(a.decks.length,1); assert.equal(a.db.EscopoArquivos[0].STATUS,'concluido');
assert(c.apiEscopoGerar(salvo.id,1).ok);assert.equal(a.decks.length,1,'geração repetida reutiliza documento');
const textos=a.decks[0].pages.flatMap(s=>s.elements.map(e=>e.text||''));
const escritos=a.decks[0].pages.flatMap(s=>s.elements).filter(e=>e.text);
assert(escritos.some(e=>e.font==='Montserrat'&&e.bold),'títulos com a fonte institucional');
assert(escritos.some(e=>e.font==='Open Sans'),'corpo com a fonte institucional');
assert(!escritos.some(e=>e.font==='Arial'),'sem tipografia paralela à identidade compartilhada');
assert(textos.some(t=>t.includes('Corrigir instalações')));assert(!textos.some(t=>t.includes('Novo objetivo')));
assert(textos.some(t=>t.includes('Valores a preencher pelo fornecedor')));assert(!textos.some(t=>t.includes('R$ 0')));
assert.equal(c.apiEscopoAbrir(salvo.id).arquivos.length,1);
a.falharPdf(true);const falha=c.apiEscopoGerar(salvo.id,2);assert(!falha.ok);assert.equal(a.db.EscopoArquivos[1].STATUS,'falhou');assert(a.arquivos[a.decks[1].id].trashed);
assert(!a.arquivos[a.decks[0].id].trashed,'documento anterior preservado');
a.falharPdf(false);assert(c.apiEscopoGerar(salvo.id,2).ok,'nova tentativa após falha');
assert.throws(()=>c.esValidarGeracao_(c.esNormalizar_({...exemplo(),grupos:[...exemplo().grupos,{id:'g2',titulo:'Outro',servicos:'Outro'}]})),/Vincule/);
assert.throws(()=>c.esValidarGeracao_(c.esNormalizar_({...exemplo(),imagem:''})),/imagem/);
assert.throws(()=>c.esValidarGeracao_(c.esNormalizar_({...exemplo(),itens:[{...exemplo().itens[0],quantidade:''}]})),/quantidade/);
const imgId='IMG-11111111-1111-1111-1111-111111111111';
const fotos=Array.from({length:9},(_,i)=>({imagem:imgId,titulo:'QD Módulo 01',legenda:i===0?'Legenda extensa '.repeat(10):'',grupos:['g1']}));
const longo=c.esNormalizar_({...exemplo(),fotos,objetivo:'PALAVRA '.repeat(600),itens:[{...exemplo().itens[0],descricao:'Descrição comprida '.repeat(120)}]});
const plano=c.esPlanejarSlides_(longo);
assert.deepEqual(Array.from(plano.filter(p=>p.tipo==='fotos'),p=>p.fotos.length),[4,4,1]);
const objetivo=plano.filter(p=>p.titulo==='Objetivo').flatMap(p=>Array.from(p.linhas)).join(' ');
assert.equal((objetivo.match(/PALAVRA/g)||[]).length,600,'paginação não perde texto');
assert(plano.filter(p=>p.tipo==='tabela').length>1);
assert.equal(plano.filter(p=>p.tipo==='tabela').flatMap(p=>Array.from(p.linhas)).filter(l=>l.quantidade).length,1,'continuação não duplica quantidade');
const visual=a.ctx.SlidesApp.create('longo');c.esDesenharSlides_(visual,plano,{logo:{name:'logo'},logoPreta:{name:'logoPreta'},logoAbreviada:{name:'logoAbreviada'},fundo:{name:'fundo'},'padrao:curitiba':{name:'curitiba'},[imgId]:{name:'foto'}},{revisao:1,data:'2026-09-09'});
for(const page of visual.pages)for(const e of page.elements){assert(e.y+e.h<=405.01,JSON.stringify(e));assert(e.x+e.w<=720.01);}
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
assert.throws(()=>b.ctx.esValidarItensCotacao_(b.ctx.esNormalizar_({...exemplo(),itens:[eap.itens[0]]})),/Cada item/);
const excel=b.ctx.apiEscopoGerarPlanilha(eb.id,1);assert(excel.ok,excel.erro);assert.match(excel.download,/\/export\?format=xlsx$/);
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
module.exports={ambiente,exemplo};
