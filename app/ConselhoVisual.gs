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

function _cnRenderVisual_(deck,p,indice) {
  const c=DS_CN.colors, s=_cnNovoSlide_(deck);
  const titulos=['Gestão de Contratações','O retrabalho começa antes','Três Megas. Uma base comum.','O escopo dá clareza ao pedido','Do escopo à próxima contratação','A mesma EAP, do início ao fim','Mais contexto para decidir','Cada contratação deixa memória','O que já temos. O que vem depois.','O ganho está no processo inteiro','Começar melhor. Contratar melhor.'];
  if(indice===0||indice===10) {
    s.getBackground().setSolidFill(c.brandDark);
    _cvTexto_(s,32,28,620,26,indice===0?'PRODUTIVIDADE NO PROCESSO DE CONTRATAÇÃO':'GESTÃO DE CONTRATAÇÕES',12,c.brandSoft);
  } else {
    _cnHeader_(s,720,titulos[indice],[]);
  }
  if(indice===0) {
    _cvTexto_(s,32,94,430,116,'Gestão de\nContratações',36,c.white);
    _cvTexto_(s,34,228,375,66,'Um bom processo começa\ncom um escopo claro.',21,c.brandSoft);
    _cvForma_(s,'ELLIPSE',460,99,205,205,c.brandMed);
    _cvDoc_(s,510,126,1.12,c.brandLight);
    _cvForma_(s,'ELLIPSE',584,233,57,57,c.greenSolid);
    _cvTexto_(s,589,243,47,39,'✓',26,c.white,true);
    _cvTexto_(s,34,349,620,22,'Guilherme Marques · Melhor Ideia 2026',11,c.brandSoft);
  }
  if(indice===1) {
    _cvDoc_(s,66,115,1.08,c.brandLight,'irregular');
    _cvDoc_(s,258,115,1.08,c.amberSolid,'omissao');
    _cvDoc_(s,450,115,1.08,c.redSolid,'preco');
    ['Detalhado','Item faltando','Preço global'].forEach(function(t,i){_cvTexto_(s,38+i*192,258,163,30,t,17,null,true);});
    _cvTexto_(s,583,151,84,65,'?',45,c.redSolid,true);
    _cvTexto_(s,60,323,600,40,'O mesmo pedido. Três interpretações.',24,c.brandMed,true);
  }
  if(indice===2) {
    ['Curitiba','Esteio','Itajaí'].forEach(function(t,i){
      _cvPredio_(s,65+i*232,107,[c.brandLight,c.brandMed,c.brandLight][i]);
      _cvTexto_(s,40+i*232,191,160,26,t,16,null,true);
      _cvForma_(s,'RECTANGLE',118+i*232,227,3,29,c.lineStrong);
    });
    _cvForma_(s,'ROUND_RECTANGLE',65,261,590,66,c.brandSoft);
    _cvTexto_(s,80,280,560,35,'Local  +  serviços  +  fotos  +  itens',23,c.brandMed,true);
    _cvTexto_(s,65,352,590,24,'Facilities e Propriedades',12,c.textBody,true);
  }
  if(indice===3) {
    _cvDoc_(s,306,153,1.15,c.brandLight);
    const a=[['foto','Fotos',73,114],['doc','Itens / EAP',540,114],['pessoa','Local e serviços',73,251],['check','Condições',540,251]];
    a.forEach(function(v){_cvIcone_(s,v[0],v[2]+15,v[3],c.brandMed);_cvTexto_(s,v[2]-40,v[3]+81,190,27,v[1],16,null,true);});
    _cvSeta_(s,224,168,56);_cvSeta_(s,440,168,56);
    _cvTexto_(s,267,302,190,28,'ESCOPO CLARO',16,c.brandMed,true);
  }
  if(indice===4) {
    const nomes=['Escopo','Cotação','Resposta','Equalização','Decisão','Memória'];
    nomes.forEach(function(t,i){
      const x=35+i*113;
      _cvForma_(s,'ELLIPSE',x+7,153,82,82,i===0?c.brandLight:c.brandSoft);
      if(i===0)_cvDoc_(s,x+29,167,.43,c.brandLight);
      else _cvIcone_(s,['doc','doc','doc','historico','check','base'][i],x+10,156,c.brandMed);
      _cvTexto_(s,x-10,252,116,30,t,13,null,true);
      if(i<5)_cvSeta_(s,x+94,187,19,c.lineStrong);
    });
    _cvTexto_(s,50,91,620,34,'Uma estrutura acompanha todo o ciclo',25,c.brandMed,true);
    _cvTexto_(s,50,337,620,30,'Excel: envio e retorno externos · Preços inseridos pela equipe',12,c.textBody,true);
  }
  if(indice===5) {
    const rotulos=['Escopo','Fornecedor','Equalização'];
    rotulos.forEach(function(t,i){
      _cvDoc_(s,88+i*226,133,1.28,c.brandLight,i===0?'padrao':'preco');
      _cvTexto_(s,48+i*226, 90,190,28,t,19,c.brandMed,true);
      if(i<2)_cvSeta_(s,233+i*226,190,49);
    });
    _cvTexto_(s,72,321,576,39,'Os itens seguem. Os preços entram.',26,c.brandMed,true);
  }
  if(indice===6) {
    _cvPessoa_(s,322,185,1.15,c.brandMed);
    [['doc','EAP e marcas',89,107],['historico','Preços anteriores',531,107],['check','IQF',89,260],['doc','Parecer e negociação',531,260]].forEach(function(v){
      _cvIcone_(s,v[0],v[2],v[3],c.brandLight);
      _cvTexto_(s,v[2]-56,v[3]+81,192,25,v[1],14,null,true);
    });
    _cvTexto_(s,257,126,210,35,'Quem avalia',22,c.brandMed,true);
    _cvSeta_(s,228,218,48,c.lineStrong);_cvSeta_(s,443,218,48,c.lineStrong);
  }
  if(indice===7) {
    _cvForma_(s,'ROUND_RECTANGLE',254,143,212,163,c.brandSoft);
    _cvIcone_(s,'base',320,173,c.brandMed);
    _cvTexto_(s,268,260,185,26,'Memória comum',18,c.brandMed,true);
    [['Escopos',65,132],['Equalizações',505,132],['Preços',65,274],['Fornecedores / CNPJ',480,274]].forEach(function(v){
      _cvDoc_(s,v[1]+31,v[2]-21,.55,c.brandLight);
      _cvTexto_(s,v[1]-18,v[2]+52,192,25,v[0],14,null,true);
    });
    _cvTexto_(s,70,348,580,29,'O próximo projeto aproveita o que já aprendemos.',21,c.brandMed,true);
  }
  if(indice===8) {
    _cvForma_(s,'ROUND_RECTANGLE',38,97,311,256,c.brandSoft);
    _cvForma_(s,'ROUND_RECTANGLE',371,97,311,256,c.white,c.lineStrong);
    _cvTexto_(s,57,116,270,34,'Hoje',27,c.brandMed);
    _cvTexto_(s,390,116,270,34,'Próximos passos',25,c.textBody);
    _cvIcone_(s,'check',150,168,c.brandLight);_cvIcone_(s,'doc',485,168,c.textMuted);
    _cvTexto_(s,51,266,285,69,'Escopo → Excel → Equalização\nHistórico · CNPJ · IQF',16,c.brandMed,true);
    _cvTexto_(s,380,266,295,69,'Convites · Portal\nImportação automática',17,c.textBody,true);
    _cvTexto_(s,48,367,624,22,'Evoluções a priorizar e validar com as equipes',11,c.textBody,true);
  }
  if(indice===9) {
    [['tempo','Tempo total'],['doc','Revisões'],['pessoa','Uso pelas equipes']].forEach(function(v,i){
      _cvForma_(s,'ELLIPSE',69+i*223,135,135,135,c.brandSoft);
      _cvIcone_(s,v[0],96+i*223,164,c.brandMed);
      _cvTexto_(s,37+i*223,284,200,33,v[1],19,c.brandMed,true);
    });
    _cvTexto_(s,52, 90,616,30,'Mais atenção no início. Menos retrabalho depois.',22,c.brandMed,true);
    _cvTexto_(s,70,354,580,24,'Hipótese a validar em contratações comparáveis',13,c.textBody,true);
  }
  if(indice===10) {
    _cvTexto_(s,35,83,650,94,'Começar melhor.\nContratar melhor.',34,c.white);
    ['Preparar','Comprar','Decidir'].forEach(function(t,i){
      _cvPessoa_(s,100+i*235,213,.8,i===1?c.brandLight:c.brandSoft);
      _cvTexto_(s,46+i*235,315,166,30,t,20,c.white,true);
      if(i<2)_cvSeta_(s,195+i*235,251,54,c.brandLight);
    });
    _cvTexto_(s,38,373,640,20,'Próximo passo: aplicar nos três Megas e medir o retrabalho',11,c.brandSoft);
  }
  if(indice!==0&&indice!==10)_cvTexto_(s,666,382,35,15,String(indice+1).padStart(2,'0'),9,c.textMuted,true);
  s.getNotesPage().getSpeakerNotesShape().getText().setText(p.fala+'\n\nApoio à fala: '+p.chamada+'\n'+p.rodape);
  return s;
}
