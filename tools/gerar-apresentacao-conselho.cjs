/** Exporta o mesmo desenho do Apps Script para PPTX e uma prévia HTML.
 * Requer pptxgenjs instalado separadamente (PPTXGENJS_MODULE pode indicar o caminho).
 */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function montar() {
  const paginas=[];let seq=0;
  const deck={getPageWidth:()=>720,getPageHeight:()=>405,getSlides:()=>paginas.slice(),getUrl:()=> 'https://docs.google.com/presentation/d/12mfzC9cx86QOmeJFLW8ZmB4crj6fkfSJyiEhP7bbJBg/edit',setName(){},saveAndClose(){},appendSlide(){
    const id='slide-'+(++seq);
    const p={background:'#fff',elementos:[],notas:'',getObjectId:()=>id,remove(){paginas.splice(paginas.indexOf(p),1);},getBackground:()=>({setSolidFill(c){p.background=c;}}),
      insertLine(type,x,y,x2,y2){const e={type:'rect',x,y,w:x2-x,h:1};p.elementos.push(e);return {getLineFill:()=>({setSolidFill(v){e.fill=v;}}),setWeight(v){e.h=v;}};},
      getNotesPage:()=>({getSpeakerNotesShape:()=>({getText:()=>({setText(t){p.notas=t;}})})}),
      insertImage(blob,x,y,w,h){p.elementos.push({type:'image',blob,x,y,w,h});},
      insertShape(type,x,y,w,h){
        const e={type,x,y,w,h,text:'',fs:10,font:'Open Sans',color:'#16213E',align:'start',vertical:'top',spacing:122};p.elementos.push(e);
        const style={};
        for(const [method,key] of Object.entries({setFontSize:'fs',setBold:'bold',setItalic:'italic',setForegroundColor:'color',setFontFamily:'font'}))style[method]=v=>{e[key]=v;return style;};
        const para={setParagraphAlignment(v){e.align=v;return this;},setLineSpacing(v){e.spacing=v;return this;}};
        const text={setText(v){e.text=v;return this;},getTextStyle:()=>style,getParagraphStyle:()=>para};
        const fill={setSolidFill(v){e.fill=v;return this;},setTransparent(){e.fill=null;return this;}};
        const border={setTransparent(){e.border=null;return this;},setWeight(v){e.borderWidth=v;return this;},getLineFill:()=>({setSolidFill(v){e.border=v;}})};
        return {getText:()=>text,getFill:()=>fill,getBorder:()=>border,setContentAlignment(v){e.vertical=v;}};
      }
    };paginas.push(p);return p;
  }};
  const context=vm.createContext({console,Logger:{log(){}},DriveApp:{getFileById:()=>({getBlob:()=> 'logoPreta'})},SlidesApp:{openById:()=>deck,LineCategory:{STRAIGHT:'straight'},ShapeType:{TEXT_BOX:'text',RECTANGLE:'rect',ROUND_RECTANGLE:'roundRect',ELLIPSE:'ellipse',RIGHT_ARROW:'rightArrow'},ContentAlignment:{MIDDLE:'middle'},ParagraphAlignment:{CENTER:'center',START:'start'},PredefinedLayout:{BLANK:'blank'}}});
  for(const f of ['Apresentacao_Conselho.gs','ConselhoNarrativa.gs','ConselhoVisual.gs'])vm.runInContext(fs.readFileSync(path.join(root,'app',f),'utf8'),context);
  context.gerarApresentacaoConselho();
  const roteiro=vm.runInContext('CN_ROTEIRO',context);
  assert.equal(paginas.length,roteiro.length);
  for(const [i,p] of paginas.entries()){
    assert(p.notas.length>100,'slide '+(i+1)+' tem roteiro de fala');
    for(const e of p.elementos){assert(e.x>=0&&e.y>=0&&e.x+e.w<=720.1&&e.y+e.h<=405.1,'elemento fora do slide '+(i+1));if(e.text)assert(e.fs>=6.5,'fonte ilegível');}
  }
  return {paginas,roteiro,context};
}
function escape(t){return String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function gerar(destino) {
  const PptxGenJS=require(process.env.PPTXGENJS_MODULE||'pptxgenjs');
  const {paginas,roteiro}=montar(),pptx=new PptxGenJS();
  pptx.defineLayout({name:'CONSELHO',width:10,height:5.625});pptx.layout='CONSELHO';
  pptx.author='Guilherme Marques';pptx.subject='Produtividade no processo de contratação';pptx.title='Gestão de Contratações';pptx.company='Capital Realty & Demercado';pptx.lang='pt-BR';
  const assets=JSON.parse(fs.readFileSync(path.join(root,'app/EscopoAssets.html'),'utf8'));
  const html=[];
  for(const [i,p] of paginas.entries()){
    const slide=pptx.addSlide();slide.background={color:p.background.replace('#','')};slide.addNotes(p.notas);
    const preview=[];
    for(const e of p.elementos){
      const pos={x:e.x/72,y:e.y/72,w:e.w/72,h:e.h/72};
      const css='position:absolute;box-sizing:border-box;left:'+e.x+'px;top:'+e.y+'px;width:'+e.w+'px;height:'+e.h+'px;';
      if(e.type==='image'){
        const a=assets[e.blob],data='data:image/png;base64,'+a.base64;
        slide.addImage({data,...pos});preview.push('<img src="'+data+'" style="'+css+'">');
      }else if(e.type==='text'){
        slide.addText(e.text,{...pos,fontFace:e.font,fontSize:e.fs,bold:e.bold,italic:e.italic,color:e.color.replace('#',''),align:e.align==='center'?'center':'left',valign:e.vertical==='middle'?'mid':'top',margin:[0,7,0,7],breakLine:false,paraSpaceAfter:0,lineSpacingMultiple:e.spacing/100});
        preview.push('<div class="texto" style="'+css+'padding:0 7px;white-space:pre-wrap;font-family:'+e.font+',Arial;font-size:'+e.fs+'px;font-weight:'+(e.bold?700:400)+';font-style:'+(e.italic?'italic':'normal')+';color:'+e.color+';text-align:'+(e.align==='center'?'center':'left')+';line-height:'+(e.spacing/100)+';'+(e.vertical==='middle'?'display:flex;align-items:center;justify-content:'+(e.align==='center'?'center':'flex-start')+';':'')+'">'+escape(e.text)+'</div>');
      }else{
        slide.addShape(pptx.ShapeType[e.type]||pptx.ShapeType.rect,{...pos,rectRadius:.1,fill:e.fill?{color:e.fill.replace('#','')}:{color:'FFFFFF',transparency:100},line:e.border?{color:e.border.replace('#',''),width:e.borderWidth||1}:{color:'FFFFFF',transparency:100}});
        preview.push('<div style="'+css+'background:'+(e.fill||'transparent')+';border:'+(e.border?'1px solid '+e.border:'0')+';border-radius:'+(e.type==='roundRect'?'8px':e.type==='ellipse'?'50%':'0')+(e.type==='rightArrow'?';clip-path:polygon(0 25%,60% 25%,60% 0,100% 50%,60% 100%,60% 75%,0 75%)':'')+'"></div>');
      }
    }
    html.push('<section class="slide" id="slide-'+(i+1)+'" style="background:'+p.background+'">'+preview.join('')+'</section>');
  }
  fs.mkdirSync(destino,{recursive:true});
  await pptx.writeFile({fileName:path.join(destino,'Gestao-de-Contratacoes.pptx')});
  fs.writeFileSync(path.join(destino,'previa.html'),'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Gestão de Contratações</title><style>body{background:#e1e7ef;margin:24px}.slide{width:720px;height:405px;position:relative;margin:24px auto;box-shadow:0 3px 18px #0002}</style>'+html.join('\n')+'</html>');
  const md=['# Gestão de Contratações — roteiro ao Conselho','', 'Atualizado em 10/09/2026. Apresentação fixa: https://docs.google.com/presentation/d/12mfzC9cx86QOmeJFLW8ZmB4crj6fkfSJyiEhP7bbJBg/edit','', 'Foco: produtividade no processo de contratação, começando pela qualidade do escopo. Funcionalidades descritas a partir do código; ganho de tempo ainda a medir.',''];
  roteiro.forEach((p,i)=>{md.push('## '+(i+1)+'. '+p.titulo,'',p.chamada,'');if(p.cards)p.cards.forEach(c=>md.push('- **'+c[0]+':** '+c[1].replaceAll('\n',' ')));md.push('','**Fala sugerida:** '+p.fala,'','**Observação do slide:** '+p.rodape,'');});
  fs.writeFileSync(path.join(root,'docs/ROTEIRO_CONSELHO_2026-09-10.md'),md.join('\n'));
  console.log(JSON.stringify({slides:paginas.length,arquivo:path.join(destino,'Gestao-de-Contratacoes.pptx')}));
}
if(require.main===module)gerar(path.resolve(process.argv[2]||path.join(root,'docs/apresentacoes'))).catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={montar,gerar};
