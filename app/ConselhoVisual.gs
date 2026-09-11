/** Ilustrações vetoriais editáveis. A explicação completa fica nas notas. */
function _cvForma_(s,t,x,y,w,h,cor,borda) {
  const f=s.insertShape(SlidesApp.ShapeType[t],x,y,w,h);
  f.getFill().setSolidFill(cor);
  if(borda) f.getBorder().setWeight(1.5).getLineFill().setSolidFill(borda);
  else f.getBorder().setTransparent();
  return f;
}
function _cvTexto_(s,x,y,w,h,t,fs,cor,centro) {
  return _cnParagrafo_(s,x,y,w,h,t,{fs:fs||18,fsMin:fs||18,bold:true,cor:cor||DS_CN.colors.textMain,align:centro?'C':'L',espac:100});
}
function _cvSeta_(s,x,y,w,cor) {
  _cvForma_(s,'RIGHT_ARROW',x,y,w,16,cor||DS_CN.colors.brandLight);
}
function _cvDoc_(s,x,y,k,cor,modo) {
  const c=DS_CN.colors;
  _cvForma_(s,'ROUND_RECTANGLE',x+5*k,y+6*k,90*k,116*k,c.line);
  _cvForma_(s,'ROUND_RECTANGLE',x,y,90*k,116*k,c.white,cor);
  _cvForma_(s,'RECTANGLE',x+13*k,y+15*k,37*k,6*k,cor);
  for(let i=0;i<3;i++) {
    _cvForma_(s,'ROUND_RECTANGLE',x+13*k,y+(36+i*22)*k,9*k,9*k,modo==='omissao'&&i===1?c.redBg:cor);
    _cvForma_(s,'RECTANGLE',x+30*k,y+(38+i*22)*k,(modo==='irregular'?[32,15,41][i]:42)*k,4*k,c.lineStrong);
  }
  if(modo==='preco')_cvTexto_(s,x+47*k,y+88*k,40*k,20*k,'R$',13*k,cor,true);
  if(modo==='omissao')_cvTexto_(s,x+8*k,y+51*k,23*k,19*k,'?',12*k,c.redInk,true);
}
function _cvPessoa_(s,x,y,k,cor) {
  _cvForma_(s,'ELLIPSE',x+17*k,y,30*k,30*k,cor);
  _cvForma_(s,'ROUND_RECTANGLE',x,y+37*k,64*k,52*k,cor);
  _cvForma_(s,'RECTANGLE',x+10*k,y+73*k,17*k,35*k,cor);
  _cvForma_(s,'RECTANGLE',x+37*k,y+73*k,17*k,35*k,cor);
}
function _cvPredio_(s,x,y,cor) {
  _cvForma_(s,'RECTANGLE',x,y+15,110,57,cor);
  _cvForma_(s,'RECTANGLE',x-5,y+8,120,8,DS_CN.colors.brandDark);
  for(let i=0;i<4;i++)_cvForma_(s,'RECTANGLE',x+10+i*24,y+30,15,27,'#FFFFFF');
}
function _cvIcone_(s,t,x,y,cor) {
  const c=DS_CN.colors;
  if(t==='pessoa'){_cvPessoa_(s,x+11,y,0.75,cor);return;}
  if(t==='doc'){_cvDoc_(s,x+12,y,.65,cor);return;}
  if(t==='foto'){
    _cvForma_(s,'ROUND_RECTANGLE',x,y+10,80,59,cor);
    _cvForma_(s,'RECTANGLE',x+14,y,27,15,cor);
    _cvForma_(s,'ELLIPSE',x+24,y+22,32,32,c.white);
    _cvForma_(s,'ELLIPSE',x+31,y+29,18,18,cor);return;
  }
  if(t==='tempo'){
    _cvForma_(s,'ELLIPSE',x+3,y+3,70,70,c.white,cor);
    _cvForma_(s,'RECTANGLE',x+36,y+17,4,23,cor);
    _cvForma_(s,'RECTANGLE',x+36,y+37,22,4,cor);return;
  }
  if(t==='historico'){
    [30,48,65].forEach(function(h,i){_cvForma_(s,'ROUND_RECTANGLE',x+i*27,y+72-h,19,h,cor);});return;
  }
  if(t==='base'){
    [0,22,44].forEach(function(d){_cvForma_(s,'ROUND_RECTANGLE',x,y+d,80,17,cor);_cvForma_(s,'ELLIPSE',x+8,y+d+5,6,6,c.white);});return;
  }
  if(t==='check'){
    _cvForma_(s,'ELLIPSE',x,y,78,78,cor);
    _cvTexto_(s,x+4,y+16,70,48,'✓',32,c.white,true);return;
  }
  _cvDoc_(s,x+12,y,.65,cor);
}


/** Frase de apoio sem competir com a ilustração. */
function _cvApoio_(s,x,y,w,t,cor) {
  _cnParagrafo_(s,x,y,w,Math.min(44,398-y),t,{fs:13,fsMin:13,cor:cor||DS_CN.colors.textBody,align:'C',espac:110});
}
function _cnRenderVisual_(deck,p,indice) {
  const c=DS_CN.colors,s=_cnNovoSlide_(deck),escuro=indice===0||indice===10;
  if(escuro) {
    s.getBackground().setSolidFill(c.brandDark);
    _cvTexto_(s,32,28,640,26,'PRODUTIVIDADE NO PROCESSO DE CONTRATAÇÃO',12,c.brandSoft);
  } else _cnHeader_(s,720,p.titulo,[]);
  if(indice===0) {
    _cvTexto_(s,32,92,430,116,'Gestão de\nContratações',36,c.white);
    _cvTexto_(s,34,225,390,90,'Por que uma contratação\nexige tantas idas e vindas?',22,c.brandSoft);
    _cvForma_(s,'ELLIPSE',460,99,205,205,c.brandMed);
    _cvDoc_(s,510,126,1.12,c.brandLight);
    _cvForma_(s,'ELLIPSE',584,233,57,57,c.amberSolid);
    _cvTexto_(s,589,243,47,39,'?',26,c.brandDark,true);
    _cvTexto_(s,34,354,620,22,'Guilherme Marques · Melhor Ideia 2026',11,c.brandSoft);
  }
  if(indice===1) {
    ['Curitiba','Esteio','Itajaí'].forEach(function(t,i){
      _cvPredio_(s,65+i*232,89,c.brandMed);
      _cvTexto_(s,40+i*232,166,160,26,t,16,null,true);
    });
    _cvApoio_(s,60,202,600,'O detalhamento varia entre texto, fotos e quem prepara.');
    _cvDoc_(s,88,253,.65,c.brandLight,'irregular');
    _cvTexto_(s,163,258,190,28,'Slides / PowerPoint',16,c.brandMed);
    _cvApoio_(s,153,289,195,'Escopo em apresentação');
    _cvDoc_(s,408,253,.65,c.amberSolid);
    _cvTexto_(s,483,258,197,28,'EAP em planilha',16,c.brandMed);
    _cvApoio_(s,469,289,215,'Sem validadores ou conexão\ncom a base de dados');
    _cvTexto_(s,55,362,610,24,'Arquivos separados. Conferência manual.',17,c.brandMed,true);
  }
  if(indice===2) {
    [c.brandLight,c.amberSolid,c.redSolid].forEach(function(cor,i){
      _cvDoc_(s,89+i*223,98,.92,cor,['irregular','omissao','preco'][i]);
    });
    ['Detalhado','Item faltando','Preço global'].forEach(function(t,i){
      _cvTexto_(s,40+i*223,223,193,28,t,18,null,true);
    });
    ['O que está incluído?','A quantidade é a mesma?','Material e instalação?'].forEach(function(t,i){
      _cvApoio_(s,38+i*223,262,196,t);
    });
    _cvTexto_(s,50,328,620,32,'Antes de comparar, é preciso investigar.',23,c.brandMed,true);
    _cvApoio_(s,50,365,620,'Quem cotou precisa abrir cada proposta e esclarecer as diferenças.');
  }
  if(indice===3) {
    const itens=[['doc','Cotação'],['historico','Equalização'],['pessoa','Aprovação']];
    itens.forEach(function(v,i){
      _cvIcone_(s,v[0],98+i*229,119,i===2?c.redSolid:c.brandMed);
      _cvTexto_(s,45+i*229,208,190,27,v[1],18,null,true);
      if(i<2)_cvSeta_(s,223+i*229,154,57,c.lineStrong);
    });
    _cvForma_(s,'RECTANGLE',131,255,463,3,c.redSolid);
    _cvForma_(s,'RECTANGLE',592,241,3,17,c.redSolid);
    _cvTexto_(s,90,244,58,32,'←',23,c.redSolid,true);
    _cvTexto_(s,192,270,376,32,'Dúvidas na aprovação → devolução',18,c.redInk,true);
    _cvApoio_(s,48,316,624,'Quem cotou volta aos fornecedores, explora as propostas,\nrevisa a equalização e reenvia para aprovação.');
    _cvTexto_(s,57,372,606,21,'Mais correção + mais espera + nova conferência',14,c.redInk,true);
  }
  if(indice===4) {
    const dados=[['doc','1. Definir o pedido','Serviços, fotos, quantidades\ne condições claras.','Menos omissões'],
      ['doc','2. Padronizar retorno','Os mesmos itens para\ntodos os fornecedores.','Menos redigitação'],
      ['check','3. Apoiar a aprovação','Comparação com referências\ne justificativa.','Menos devoluções']];
    dados.forEach(function(v,i){
      const x=38+i*223;
      _cvForma_(s,'ELLIPSE',x+48,106,100,100,c.brandSoft);
      _cvIcone_(s,v[0],x+60,116,c.brandMed);
      _cvTexto_(s,x,221,198,29,v[1],17,c.brandMed,true);
      _cvApoio_(s,x,264,198,v[2]);
      _cvTexto_(s,x,335,198,29,v[3],16,c.brandMed,true);
    });
  }
  if(indice===5) {
    _cvForma_(s,'ROUND_RECTANGLE',32,86,318,277,'#FFF4ED');
    _cvForma_(s,'ROUND_RECTANGLE',370,86,318,277,c.brandSoft);
    _cvDoc_(s,52,105,.56,c.amberSolid,'irregular');
    _cvIcone_(s,'base',389,104,c.brandMed);
    _cvTexto_(s,120,115,213,32,'Hoje na empresa',20,c.textMain);
    _cvTexto_(s,477,115,194,32,'Com a solução',20,c.brandMed);
    _cnParagrafo_(s,45,187,291,164,'Slides / PowerPoint + planilha\nSem validadores ou base conectada\nCópia, redigitação e conferência\nRisco em fórmulas, itens e unidades\nVersões e histórico dispersos',
      {fs:14,fsMin:14,cor:c.textBody,espac:140});
    _cnParagrafo_(s,383,187,291,164,'Escopo e EAP conectados\nCampos e validações\nItens reaproveitados na equalização\nCadastros e histórico centralizados\nInformação para analisar e aprovar',
      {fs:14,fsMin:14,cor:c.brandMed,espac:140});
    _cvApoio_(s,35,372,650,'Centralizar para reduzir retrabalho e facilitar a conferência.');
  }
  if(indice===6) {
    ['Escopo','Fornecedor','Equalização'].forEach(function(t,i){
      _cvDoc_(s,91+i*223,125,1.05,c.brandLight,i===0?'padrao':'preco');
      _cvTexto_(s,45+i*223,84,190,28,t,19,c.brandMed,true);
      if(i<2)_cvSeta_(s,229+i*223,172,48);
    });
    ['Itens, unidades e marcas','Excel com preços em branco','Mesma revisão + preços'].forEach(function(t,i){
      _cvApoio_(s,38+i*223,267,198,t);
    });
    _cvTexto_(s,52,326,616,30,'A lista nasce uma vez e acompanha a cotação.',22,c.brandMed,true);
    _cvApoio_(s,42,368,636,'Excel enviado externamente; a equipe informa ou cola os preços.');
  }
  if(indice===7) {
    _cvPessoa_(s,322,174,1.1,c.brandMed);
    [['doc','EAP e marcas',89,92],['historico','Preços anteriores',531,92],
      ['check','Indicadores',89,242],['doc','Parecer e negociação',531,242]].forEach(function(v){
      _cvIcone_(s,v[0],v[2],v[3],c.brandLight);
      _cvTexto_(s,v[2]-56,v[3]+81,192,25,v[1],14,null,true);
    });
    _cvTexto_(s,257,121,210,30,'Quem aprova',22,c.brandMed,true);
    _cvApoio_(s,231,302,260,'O que inclui?\nPor que esta proposta?');
    _cvApoio_(s,40,371,640,'Mais contexto para decidir e menos dúvidas evitáveis na aprovação.');
  }
  if(indice===8) {
    _cvForma_(s,'ROUND_RECTANGLE',254,129,212,171,c.brandSoft);
    _cvIcone_(s,'base',320,158,c.brandMed);
    _cvTexto_(s,267,249,187,30,'Histórico comum',18,c.brandMed,true);
    [['Escopos',65,119],['Equalizações',505,119],['Preços',65,263],['Fornecedores / CNPJ',480,263]].forEach(function(v){
      _cvDoc_(s,v[1]+31,v[2]-21,.55,c.brandLight);
      _cvTexto_(s,v[1]-18,v[2]+52,192,25,v[0],14,null,true);
    });
    _cvApoio_(s,44,358,632,'Localizar a revisão, consultar referências e reaproveitar o trabalho.\nMenos dependência de arquivos espalhados.');
  }
  if(indice===9) {
    [['tempo','Menos tempo gasto','Menos espera e reconstrução\nda informação.'],
      ['doc','Menos retrabalho','Menos revisões e retornos\nda aprovação.'],
      ['pessoa','Mais análise','Mais atenção às diferenças\ne à negociação.']].forEach(function(v,i){
      _cvForma_(s,'ELLIPSE',69+i*223,105,135,135,c.brandSoft);
      _cvIcone_(s,v[0],96+i*223,134,c.brandMed);
      _cvTexto_(s,37+i*223,255,200,30,v[1],18,c.brandMed,true);
      _cvApoio_(s,37+i*223,296,200,v[2]);
    });
    _cvApoio_(s,45,365,630,'Benefícios esperados: medir tempo, revisões e devoluções em casos comparáveis.');
  }
  if(indice===10) {
    _cvTexto_(s,35,82,650,94,'Começar melhor.\nContratar melhor.',34,c.white);
    ['Preparar','Cotar','Aprovar'].forEach(function(t,i){
      _cvPessoa_(s,100+i*235,206,.75,i===1?c.brandLight:c.brandSoft);
      _cvTexto_(s,46+i*235,296,166,28,t,20,c.white,true);
      if(i<2)_cvSeta_(s,195+i*235,244,54,c.brandLight);
    });
    _cvApoio_(s,40,345,640,'Clareza no pedido, consistência na comparação e contexto na decisão.',c.brandSoft);
  }
  if(!escuro)_cvTexto_(s,666,390,35,13,String(indice+1).padStart(2,'0'),8,c.textMuted,true);
  s.getNotesPage().getSpeakerNotesShape().getText().setText(p.fala+'\n\nApoio à fala: '+p.chamada+'\n'+p.rodape);
  return s;
}
