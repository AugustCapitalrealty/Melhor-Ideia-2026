/** Ilustrações vetoriais editáveis e mockups de alta fidelidade das telas do sistema. */
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
function _cvApoio_(s,x,y,w,t,cor) {
  _cnParagrafo_(s,x,y,w,Math.min(44,398-y),t,{fs:13,fsMin:13,cor:cor||DS_CN.colors.textBody,align:'C',espac:110});
}

/** Frame de janela de aplicativo SaaS com barra de controle */
function _cvMockupJanela_(s, x, y, w, h, titulo, badge) {
  const c = DS_CN.colors;
  const janela = s.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, x, y, w, h);
  janela.getFill().setSolidFill(c.white);
  janela.getBorder().setWeight(1.5).getLineFill().setSolidFill(c.lineStrong);

  const headerH = 24;
  const header = s.insertShape(SlidesApp.ShapeType.RECTANGLE, x, y, w, headerH);
  header.getFill().setSolidFill(c.brandDark);
  header.getBorder().setTransparent();

  [8, 18, 28].forEach(function(px, i) {
    const dot = s.insertShape(SlidesApp.ShapeType.ELLIPSE, x + px, y + 8, 7, 7);
    dot.getFill().setSolidFill(['#FF5F56', '#FFBD2E', '#27C93F'][i]);
    dot.getBorder().setTransparent();
  });

  _cnUmaLinha_(s, x + 44, y + 3, w - 210, 18, titulo,
    { fs: 8.5, fsMin: 7, bold: true, cor: c.white, align: 'L' });

  if (badge) {
    const bw = 140;
    _cnPill_(s, x + w - bw - 8, y + 4, bw, 16, badge, c.brandLight, c.white, 6.8);
  }
  return y + headerH;
}

function _cnRenderVisual_(deck,p,indice) {
  const c=DS_CN.colors,s=_cnNovoSlide_(deck),escuro=indice===0||indice===13;
  if(escuro) {
    s.getBackground().setSolidFill(c.brandDark);
    _cvTexto_(s,32,28,640,26,'GESTÃO INTELIGENTE DE CONTRATAÇÕES · CAPITAL REALTY',12,c.brandSoft);
  } else _cnHeader_(s,720,p.titulo,[]);

  // 0. CAPA
  if(indice===0) {
    _cvTexto_(s,32,92,430,116,'Gestão\nInteligente de\nContratações',32,c.white);
    _cvTexto_(s,34,235,390,75,'Da especificação técnica à aprovação:\num ecossistema conectado nos Megas',19,c.brandSoft);
    _cvForma_(s,'ELLIPSE',460,99,205,205,c.brandMed);
    _cvDoc_(s,510,126,1.12,c.brandLight);
    _cvForma_(s,'ELLIPSE',584,233,57,57,c.amberSolid);
    _cvTexto_(s,589,243,47,39,'★',26,c.brandDark,true);
    _cvTexto_(s,34,354,620,22,'Concurso Melhor Ideia 2026 · Facilities e Engenharia',11,c.brandSoft);
  }

  // 1. DESAFIO ATUAL
  if(indice===1) {
    ['Mega Curitiba','Mega Esteio','Mega Itajaí'].forEach(function(t,i){
      _cvPredio_(s,65+i*232,89,c.brandMed);
      _cvTexto_(s,40+i*232,166,160,26,t,16,null,true);
    });
    _cvApoio_(s,60,202,600,'Fluxos manuais e arquivos dispersos entre os parques logísticos.');
    _cvDoc_(s,88,253,.65,c.brandLight,'irregular');
    _cvTexto_(s,163,258,190,28,'Slides / PowerPoint',16,c.brandMed);
    _cvApoio_(s,153,289,195,'Escopo descritivo isolado');
    _cvDoc_(s,408,253,.65,c.amberSolid);
    _cvTexto_(s,483,258,197,28,'EAP em planilha solta',16,c.brandMed);
    _cvApoio_(s,469,289,215,'Fórmulas manuais sujeitas a quebra\ne sem conexão com o histórico');
    _cvTexto_(s,55,362,610,24,'Múltiplos arquivos sem rastreabilidade unificada.',17,c.brandMed,true);
  }

  // 2. O MESMO PEDIDO, RESPOSTAS DIFERENTES
  if(indice===2) {
    [c.brandLight,c.amberSolid,c.redSolid].forEach(function(cor,i){
      _cvDoc_(s,89+i*223,98,.92,cor,['irregular','omissao','preco'][i]);
    });
    ['Proposta Detalhada','Proposta com Omissões','Preço Global Fechado'].forEach(function(t,i){
      _cvTexto_(s,40+i*223,223,193,28,t,16,null,true);
    });
    ['Material e mão de obra abertos','Itens essenciais excluídos','Impossível saber o que inclui'].forEach(function(t,i){
      _cvApoio_(s,38+i*223,262,196,t);
    });
    _cvTexto_(s,50,328,620,32,'Antes de comparar preços, é preciso investigar propostas.',21,c.brandMed,true);
    _cvApoio_(s,50,365,620,'O comprador perde dias decifrando escopos divergentes antes de negociar.');
  }

  // 3. NA APROVAÇÃO, A DÚVIDA FAZ TUDO VOLTAR
  if(indice===3) {
    const itens=[['doc','1. Cotação Mercado'],['historico','2. Equalização'],['pessoa','3. Aprovação Executiva']];
    itens.forEach(function(v,i){
      _cvIcone_(s,v[0],98+i*229,119,i===2?c.redSolid:c.brandMed);
      _cvTexto_(s,45+i*229,208,190,27,v[1],16,null,true);
      if(i<2)_cvSeta_(s,223+i*229,154,57,c.lineStrong);
    });
    _cvForma_(s,'RECTANGLE',131,255,463,3,c.redSolid);
    _cvForma_(s,'RECTANGLE',592,241,3,17,c.redSolid);
    _cvTexto_(s,90,244,58,32,'←',23,c.redSolid,true);
    _cvTexto_(s,192,270,376,32,'Dúvidas na aprovação → devolução do processo',17,c.redInk,true);
    _cvApoio_(s,48,316,624,'Sem contexto e sem histórico, a diretoria questiona divergências.\nO processo volta para reabertura de cotações e remontagem da planilha.');
    _cvTexto_(s,57,372,606,21,'Mais atraso na obra + mais reuniões + retrabalho repetitivo',14,c.redInk,true);
  }

  // 4. A SOLUÇÃO: UM PROCESSO ÚNICO E CONECTADO
  if(indice===4) {
    _cvForma_(s,'ROUND_RECTANGLE',32,86,318,266,'#FFF4ED');
    _cvForma_(s,'ROUND_RECTANGLE',370,86,318,266,c.brandSoft);
    _cvDoc_(s,52,105,.56,c.amberSolid,'irregular');
    _cvIcone_(s,'base',389,104,c.brandMed);
    _cvTexto_(s,120,115,213,32,'Hoje na empresa',19,c.textMain);
    _cvTexto_(s,477,115,194,32,'Com a Solução Integrada',19,c.brandMed);
    _cnParagrafo_(s,45,178,291,164,
      '• Slides avulsos + planilhas descentralizadas\n' +
      '• Sem validações ou banco de dados conectado\n' +
      '• Cópia e colagem sujeita a quebra de fórmulas\n' +
      '• Risco em quantidades, unidades e marcas\n' +
      '• Histórico de preços disperso e inacessível',
      {fs:12.5,fsMin:11,cor:c.textBody,espac:135});
    _cnParagrafo_(s,383,178,291,164,
      '• Escopo técnico com fotos e memorial integrados\n' +
      '• EAP padronizada exportando planilha oficial\n' +
      '• Cockpit de equalização com menores preços\n' +
      '• Banco de dados com memória de compras por Mega\n' +
      '• Avaliação do fornecedor viva para a próxima cotação',
      {fs:12.5,fsMin:11,cor:c.brandMed,espac:135});
    _cvApoio_(s,35,364,650,'Centralizar e conectar para transformar compras em inteligência estratégica.');
  }

  // 5. DEMO 1: ESCOPO COM FOTOS E MEMORIAL
  if(indice===5) {
    const yTop = 80;
    _cvMockupJanela_(s, 32, yTop, 656, 268, 'CAPITAL EQUALIZA · Módulo de Escopos Técnicos e Vistoria', '✓ ESCOPO APROVADO');

    _cvForma_(s, 'ROUND_RECTANGLE', 46, yTop + 32, 628, 28, c.brandSoft);
    _cnUmaLinha_(s, 56, yTop + 36, 440, 20, 'Mega Curitiba · Bloco 02 — Reforma de Piso Industrial e Docas 12 a 16', { fs: 9.5, bold: true, cor: c.brandDark });
    _cnPill_(s, 520, yTop + 36, 144, 20, 'CATEGORIA: ENGENHARIA', c.brandMed, c.white, 7);

    // Esquerda: Memorial e Grupos
    _cvForma_(s, 'ROUND_RECTANGLE', 46, yTop + 68, 380, 150, '#FAFCFF', c.line);
    _cnUmaLinha_(s, 58, yTop + 74, 350, 16, 'MEMORIAL DESCRITIVO E DIRETRIZES TÉCNICAS', { fs: 8.5, bold: true, cor: c.brandMed });
    _cnParagrafo_(s, 58, yTop + 92, 356, 75,
      '• Fresagem mecânica de 50mm em área degradada com aspiração de resíduos.\n' +
      '• Reconstituição de lábios poliméricos com argamassa estrutural (Fck ≥ 40 MPa).\n' +
      '• Diretrizes: Operação exclusivamente noturna, contenção de poeira e NR-35.',
      { fs: 8.5, fsMin: 7, cor: c.textBody, espac: 120 });

    _cnPill_(s, 58, yTop + 186, 95, 20, '1.0 Demolições', c.brandDark, c.white, 7.5);
    _cnPill_(s, 160, yTop + 186, 110, 20, '2.0 Concretagem', c.brandDark, c.white, 7.5);
    _cnPill_(s, 278, yTop + 186, 125, 20, '3.0 Juntas e Resina', c.brandDark, c.white, 7.5);

    // Direita: Fotos de Vistoria
    _cvForma_(s, 'ROUND_RECTANGLE', 438, yTop + 68, 236, 150, '#F1F5F9', c.line);
    _cnUmaLinha_(s, 448, yTop + 74, 216, 16, 'REGISTRO FOTOGRÁFICO DE CAMPO', { fs: 8.5, bold: true, cor: c.brandMed, align: 'C' });

    _cvForma_(s, 'ROUND_RECTANGLE', 448, yTop + 94, 105, 78, c.white, c.lineStrong);
    _cvIcone_(s, 'foto', 460, yTop + 100, c.brandLight);
    _cnUmaLinha_(s, 450, yTop + 152, 101, 16, 'Doca 14: Fissuras', { fs: 7.5, bold: true, align: 'C', cor: c.textMain });

    _cvForma_(s, 'ROUND_RECTANGLE', 559, yTop + 94, 105, 78, c.white, c.lineStrong);
    _cvIcone_(s, 'foto', 571, yTop + 100, c.brandLight);
    _cnUmaLinha_(s, 561, yTop + 152, 101, 16, 'Doca 16: Desnível', { fs: 7.5, bold: true, align: 'C', cor: c.textMain });

    _cvForma_(s, 'ROUND_RECTANGLE', 448, yTop + 182, 216, 26, c.greenBg);
    _cnUmaLinha_(s, 450, yTop + 185, 212, 20, '✓ Evidências reais anexadas ao escopo', { fs: 8, bold: true, cor: c.greenInk, align: 'C' });

    _cvApoio_(s, 40, 360, 640, 'O prestador orça sobre condições reais documentadas. Fim de surpresas e aditivos durante a obra.');
  }

  // 6. DEMO 2: EAP E PLANILHA DE COTAÇÃO
  if(indice===6) {
    const yTop = 80;
    _cvMockupJanela_(s, 32, yTop, 656, 268, 'MATRIZ EAP · Estrutura Analítica do Projeto e Cotação Padronizada', '✓ MODELO OFICIAL');

    const thY = yTop + 32;
    _cvForma_(s, 'RECTANGLE', 46, thY, 628, 22, c.brandMed);
    _cnUmaLinha_(s, 54, thY, 60, 22, 'ITEM', { fs: 8, bold: true, cor: c.white });
    _cnUmaLinha_(s, 118, thY, 260, 22, 'DESCRIÇÃO DOS SERVIÇOS', { fs: 8, bold: true, cor: c.white });
    _cnUmaLinha_(s, 384, thY, 55, 22, 'QTD', { fs: 8, bold: true, cor: c.white, align: 'C' });
    _cnUmaLinha_(s, 444, thY, 55, 22, 'UNID', { fs: 8, bold: true, cor: c.white, align: 'C' });
    _cnUmaLinha_(s, 504, thY, 160, 22, 'MARCA / REFERÊNCIA TÉCNICA', { fs: 8, bold: true, cor: c.white });

    const linhas = [
      ['1.0', 'Demolições e Preparo de Superfície', '—', '—', 'Grupo da EAP', true],
      ['1.1', 'Fresagem mecânica e regularização de piso', '850', 'm²', 'Norma ABNT NBR 14050', false],
      ['1.2', 'Limpeza técnica e aplicação de primer aderente', '850', 'm²', 'Sikadur 32 ou equivalente', false],
      ['2.0', 'Pavimentação de Alta Resistência', '—', '—', 'Grupo da EAP', true],
      ['2.1', 'Lançamento de concreto nivelado Fck 35 MPa', '850', 'm²', 'Votoran / Holcim / Cortesia', false],
      ['2.2', 'Tratamento e selamento de juntas dilatadas', '340', 'm', 'Sikaflex Pro 3 Poliuretano', false]
    ];

    linhas.forEach(function(r, i) {
      const ly = thY + 22 + i * 20;
      const bg = r[5] ? '#E8EEF7' : (i % 2 === 0 ? '#FFFFFF' : '#F8FAFC');
      _cvForma_(s, 'RECTANGLE', 46, ly, 628, 20, bg, c.line);
      _cnUmaLinha_(s, 54, ly, 60, 20, r[0], { fs: 8, bold: r[5], cor: r[5] ? c.brandMed : c.textMain });
      _cnUmaLinha_(s, r[5] ? 118 : 130, ly, 250, 20, r[1], { fs: 8, bold: r[5], cor: r[5] ? c.brandMed : c.textBody });
      _cnUmaLinha_(s, 384, ly, 55, 20, r[2], { fs: 8, bold: r[5], cor: c.textMain, align: 'C' });
      _cnUmaLinha_(s, 444, ly, 55, 20, r[3], { fs: 8, bold: r[5], cor: c.textMain, align: 'C' });
      _cnUmaLinha_(s, 504, ly, 160, 20, r[4], { fs: 7.8, italic: !r[5], bold: r[5], cor: r[5] ? c.brandMed : c.textMuted });
    });

    const btnY = thY + 22 + 6 * 20 + 8;
    _cvForma_(s, 'ROUND_RECTANGLE', 46, btnY, 340, 26, c.brandDark);
    _cnUmaLinha_(s, 50, btnY, 332, 26, '⬇ EXPORTAR PLANILHA EXCEL PADRONIZADA DE COTAÇÃO', { fs: 8, bold: true, cor: c.white, align: 'C' });

    _cvForma_(s, 'ROUND_RECTANGLE', 396, btnY, 278, 26, c.greenBg);
    _cnUmaLinha_(s, 400, btnY, 270, 26, '✓ Todos os fornecedores orçam na mesma estrutura', { fs: 8, bold: true, cor: c.greenInk, align: 'C' });

    _cvApoio_(s, 40, 360, 640, 'Numeração e quantitativos travados: o mercado responde sem inventar formatos nem quebrar fórmulas.');
  }

  // 7. DEMO 3: COCKPIT DE EQUALIZAÇÃO
  if(indice===7) {
    const yTop = 80;
    _cvMockupJanela_(s, 32, yTop, 656, 268, 'EQUALIZAÇÃO INTELIGENTE · Cockpit Multiproponentes & Alçadas', '★ DECISÃO EM SEGUNDOS');

    const cards = [
      ['Construtora Alfa', 'R$ 142.500', '★ MENOR PREÇO GERAL', c.greenBg, c.greenInk, c.greenSolid],
      ['Pavimentadora Beta', 'R$ 158.200', '+11,0% vs vencedor', c.white, c.brandMed, c.lineStrong],
      ['Engenharia Gama', 'R$ 164.800', '+15,6% vs vencedor', c.white, c.textMuted, c.lineStrong]
    ];
    cards.forEach(function(cd, i) {
      const cx = 46 + i * 212;
      _cvForma_(s, 'ROUND_RECTANGLE', cx, yTop + 32, 204, 46, cd[3], cd[5]);
      _cnUmaLinha_(s, cx + 10, yTop + 35, 184, 16, cd[0], { fs: 9, bold: true, cor: c.textMain });
      _cnUmaLinha_(s, cx + 10, yTop + 51, 100, 24, cd[1], { fs: 13.5, bold: true, cor: cd[4] });
      _cnPill_(s, cx + 106, yTop + 54, 90, 16, cd[2], cd[3] === c.greenBg ? c.greenSolid : '#F1F5F9', cd[3] === c.greenBg ? c.white : c.textBody, 6.5);
    });

    const thY = yTop + 84;
    _cvForma_(s, 'RECTANGLE', 46, thY, 628, 20, c.brandDark);
    _cnUmaLinha_(s, 54, thY, 240, 20, 'ITENS DA EAP', { fs: 7.8, bold: true, cor: c.white });
    _cnUmaLinha_(s, 300, thY, 115, 20, 'ALFA (VENCEDOR)', { fs: 7.8, bold: true, cor: c.white, align: 'C' });
    _cnUmaLinha_(s, 425, thY, 115, 20, 'BETA', { fs: 7.8, bold: true, cor: c.white, align: 'C' });
    _cnUmaLinha_(s, 550, thY, 115, 20, 'GAMA', { fs: 7.8, bold: true, cor: c.white, align: 'C' });

    const itensEq = [
      ['1.1 Fresagem de piso (850 m²)', 'R$ 38.250', 'R$ 42.500', 'R$ 45.050'],
      ['2.1 Concreto Fck 35 (850 m²)', 'R$ 89.250', 'R$ 97.750', 'R$ 101.150'],
      ['2.2 Selamento de juntas (340 m)', 'R$ 15.000', 'R$ 17.950', 'R$ 18.600 ⚠️']
    ];
    itensEq.forEach(function(r, i) {
      const ly = thY + 20 + i * 20;
      _cvForma_(s, 'RECTANGLE', 46, ly, 628, 20, i % 2 === 0 ? '#FFFFFF' : '#F8FAFC', c.line);
      _cnUmaLinha_(s, 54, ly, 240, 20, r[0], { fs: 8, bold: false, cor: c.textMain });
      _cvForma_(s, 'ROUND_RECTANGLE', 320, ly + 2, 75, 16, c.greenBg);
      _cnUmaLinha_(s, 320, ly + 2, 75, 16, r[1], { fs: 8, bold: true, cor: c.greenInk, align: 'C' });
      _cnUmaLinha_(s, 425, ly, 115, 20, r[2], { fs: 8, cor: c.textBody, align: 'C' });
      _cnUmaLinha_(s, 550, ly, 115, 20, r[3], { fs: 8, cor: r[3].indexOf('⚠️') >= 0 ? c.redInk : c.textBody, bold: r[3].indexOf('⚠️') >= 0, align: 'C' });
    });

    const govY = thY + 84;
    _cvForma_(s, 'ROUND_RECTANGLE', 46, govY, 628, 28, c.brandSoft);
    _cnUmaLinha_(s, 56, govY, 260, 28, 'Alçada Identificada: DIRETORIA EXECUTIVA', { fs: 8.5, bold: true, cor: c.brandDark });
    _cnUmaLinha_(s, 320, govY, 180, 28, 'Saving Gerado: R$ 22.300', { fs: 8.5, bold: true, cor: c.greenInk });
    _cnPill_(s, 510, govY + 5, 150, 18, '✓ JUSTIFICATIVA REGISTRADA', c.brandLight, c.white, 7);

    _cvApoio_(s, 40, 360, 640, 'Visão transparente e auditável: comparativo item a item com alçadas automáticas de governança.');
  }

  // 8. DEMO 4: INTELIGÊNCIA DE PREÇOS
  if(indice===8) {
    const yTop = 80;
    _cvMockupJanela_(s, 32, yTop, 656, 268, 'MEMÓRIA DE PREÇOS · Inteligência e Radar de Custos por Parque', '🔍 BANCO DE REFERÊNCIAS');

    _cvForma_(s, 'ROUND_RECTANGLE', 46, yTop + 32, 628, 28, '#FFFFFF', c.brandLight);
    _cnUmaLinha_(s, 58, yTop + 36, 480, 20, '🔍 Fresagem mecânica e regularização de piso industrial (NBR 14050)', { fs: 9, cor: c.textMain });
    _cnPill_(s, 550, yTop + 36, 114, 20, 'PAVIMENTAÇÃO', c.brandDark, c.white, 7.5);

    const parques = [
      ['Mega Curitiba (PR)', 'R$ 42,00 / m²', 'Última compra: Julho/2026', 'Fornecedor: Construtora Alfa', c.brandSoft],
      ['Mega Esteio (RS)', 'R$ 45,50 / m²', 'Última compra: Maio/2026', 'Fornecedor: SulPav Engenharia', c.brandSoft],
      ['Mega Itajaí (SC)', 'R$ 41,80 / m²', 'Última compra: Agosto/2026', 'Fornecedor: Catarinense Obras', c.brandSoft]
    ];
    parques.forEach(function(pq, i) {
      const cx = 46 + i * 212;
      _cvForma_(s, 'ROUND_RECTANGLE', cx, yTop + 68, 204, 82, pq[4], c.lineStrong);
      _cnUmaLinha_(s, cx + 12, yTop + 74, 180, 16, pq[0], { fs: 9, bold: true, cor: c.brandDark });
      _cnUmaLinha_(s, cx + 12, yTop + 92, 180, 24, pq[1], { fs: 14, bold: true, cor: c.brandMed });
      _cnUmaLinha_(s, cx + 12, yTop + 118, 180, 14, pq[2], { fs: 7.5, cor: c.textMuted });
      _cnUmaLinha_(s, cx + 12, yTop + 132, 180, 14, pq[3], { fs: 7.5, italic: true, cor: c.textBody });
    });

    _cvForma_(s, 'ROUND_RECTANGLE', 46, yTop + 158, 628, 48, c.white, c.brandMed);
    _cnUmaLinha_(s, 58, yTop + 164, 280, 18, 'RADAR DE MERCADO & PREÇO-ALVO', { fs: 9, bold: true, cor: c.brandMed });
    _cnUmaLinha_(s, 58, yTop + 184, 300, 18, 'Preço Médio de Referência: R$ 43,10 / m²', { fs: 10, bold: true, cor: c.textMain });
    _cnUmaLinha_(s, 380, yTop + 164, 280, 18, 'FAIXA DE ACEITABILIDADE TÉCNICA', { fs: 8.5, bold: true, cor: c.textMuted });
    _cnUmaLinha_(s, 380, yTop + 184, 280, 18, 'Teto Sugerido: R$ 47,00 / m²  ·  Piso: R$ 39,00 / m²', { fs: 9.5, bold: true, cor: c.greenInk });

    _cvApoio_(s, 40, 360, 640, 'Memória corporativa contínua: a empresa nunca mais negocia sem conhecer a referência do grupo.');
  }

  // 9. DEMO 5: BASE DE FORNECEDORES E SRM
  if(indice===9) {
    const yTop = 80;
    _cvMockupJanela_(s, 32, yTop, 656, 268, 'GESTÃO DE FORNECEDORES (SRM) · Qualificação e IQF de Campo', '✓ BASE HOMOLOGADA');

    _cvForma_(s, 'ROUND_RECTANGLE', 46, yTop + 32, 300, 180, '#FAFCFF', c.lineStrong);
    _cnUmaLinha_(s, 58, yTop + 38, 280, 20, 'MegaPav Pavimentações e Obras Ltda', { fs: 10.5, bold: true, cor: c.brandDark });
    _cnUmaLinha_(s, 58, yTop + 60, 280, 14, 'CNPJ: 12.345.678/0001-90 · Consulta Fiscal: ATIVA', { fs: 8, cor: c.textMuted });
    _cnPill_(s, 58, yTop + 80, 150, 18, '✓ FORNECEDOR HOMOLOGADO', c.greenBg, c.greenInk, 7);

    _cnParagrafo_(s, 58, yTop + 106, 280, 60,
      '• Especialidade: Pavimentação e Concreto Industrial\n' +
      '• Atuação: Megas Curitiba, Esteio e Itajaí\n' +
      '• Participações: 6 cotações · 4 contratos entregues',
      { fs: 8.5, cor: c.textBody, espac: 125 });

    _cvForma_(s, 'ROUND_RECTANGLE', 356, yTop + 32, 318, 180, c.white, c.brandMed);
    _cvForma_(s, 'ROUND_RECTANGLE', 368, yTop + 40, 110, 44, c.brandDark);
    _cnUmaLinha_(s, 368, yTop + 44, 110, 14, 'IQF GERAL', { fs: 7.5, bold: true, cor: c.brandSoft, align: 'C' });
    _cnUmaLinha_(s, 368, yTop + 56, 110, 26, '9,4 / 10', { fs: 15, bold: true, cor: c.white, align: 'C' });

    _cnParagrafo_(s, 490, yTop + 44, 170, 36, 'Avaliação consolidada das entregas nos parques', { fs: 8.5, cor: c.textBody });

    const criterios = [
      ['Pontualidade no Prazo', '9,6', c.greenSolid],
      ['Qualidade Técnica do Serviço', '9,2', c.greenSolid],
      ['Segurança e Normas (EPI/DDS)', '9,8', c.greenSolid],
      ['Atendimento e Pós-Obra', '9,0', c.brandLight]
    ];
    criterios.forEach(function(cr, i) {
      const cy = yTop + 92 + i * 19;
      _cnUmaLinha_(s, 370, cy, 175, 18, cr[0], { fs: 8, cor: c.textMain });
      _cvForma_(s, 'ROUND_RECTANGLE', 545, cy + 2, 70, 14, c.brandSoft);
      _cvForma_(s, 'ROUND_RECTANGLE', 545, cy + 2, 70 * 0.94, 14, cr[2]);
      _cnUmaLinha_(s, 620, cy, 35, 18, cr[1], { fs: 8, bold: true, cor: c.textMain, align: 'C' });
    });

    _cvForma_(s, 'ROUND_RECTANGLE', 368, yTop + 176, 294, 24, '#F8FAFC');
    _cnUmaLinha_(s, 374, yTop + 179, 282, 18, '💬 "Equipe ágil, entregou as docas antes do prazo sem intercorrências."', { fs: 7.2, italic: true, cor: c.textBody });

    _cvApoio_(s, 40, 360, 640, 'A nota do gestor do parque volta para quem compra. Excelência é recompensada e riscos são barrados.');
  }

  // 10. DEMO 6: O ECOSSISTEMA CONECTADO
  if(indice===10) {
    const yTop = 84;
    const etapas = [
      ['1. Escopo com Fotos', 'Vistoria e memorial\nsem dúvidas técnicas', c.brandDark],
      ['2. EAP Padronizada', 'Mesma estrutura para\ntodos os concorrentes', c.brandMed],
      ['3. Equalização', 'Cockpit item a item e\nalçadas executivas', c.brandLight],
      ['4. Memória de Preços', 'Histórico institucional\npor parque logístico', c.greenSolid],
      ['5. SRM & IQF Vivo', 'Avaliação de campo que\nretorna na próxima compra', c.amberSolid]
    ];

    const cw = 118, ch = 96, gap = 16;
    etapas.forEach(function(et, i) {
      const cx = 36 + i * (cw + gap);
      _cvForma_(s, 'ROUND_RECTANGLE', cx, yTop + 24, cw, ch, c.white, et[2]);
      _cvForma_(s, 'ROUND_RECTANGLE', cx, yTop + 24, cw, 22, et[2]);
      _cnUmaLinha_(s, cx + 4, yTop + 26, cw - 8, 18, et[0], { fs: 7.5, bold: true, cor: c.white, align: 'C' });
      _cnParagrafo_(s, cx + 8, yTop + 50, cw - 16, 65, et[1], { fs: 7.8, cor: c.textBody, align: 'C', espac: 110 });

      if (i < 4) {
        _cvSeta_(s, cx + cw + 2, yTop + 66, 12, c.brandMed);
      }
    });

    _cvForma_(s, 'RECTANGLE', 95, yTop + 148, 526, 3, c.greenSolid);
    _cvForma_(s, 'RECTANGLE', 621, yTop + 125, 3, 26, c.greenSolid);
    _cvForma_(s, 'RECTANGLE', 95, yTop + 125, 3, 26, c.greenSolid);
    _cvTexto_(s, 75, yTop + 115, 30, 20, '▲', 12, c.greenSolid, true);

    _cvForma_(s, 'ROUND_RECTANGLE', 180, yTop + 138, 360, 24, c.greenBg);
    _cnUmaLinha_(s, 180, yTop + 141, 360, 18, '⟲ CICLO FECHADO: O aprendizado de uma compra protege a próxima', { fs: 8.5, bold: true, cor: c.greenInk, align: 'C' });

    _cvForma_(s, 'ROUND_RECTANGLE', 46, yTop + 176, 628, 66, c.brandSoft);
    _cnParagrafo_(s, 60, yTop + 182, 600, 54,
      '• Dados digitados apenas uma vez: o escopo vira cotação, que vira equalização, que vira histórico.\n' +
      '• Rastreabilidade ponta a ponta: do problema apontado na doca ao valor homologado pelo Conselho.\n' +
      '• Efeito de rede: quanto mais os Megas utilizam a plataforma, mais precisa e segura a contratação se torna.',
      { fs: 8.8, bold: false, cor: c.brandDark, espac: 125 });

    _cvApoio_(s, 40, 360, 640, 'Não são planilhas isoladas: é uma plataforma integrada de gestão de suprimentos e contratos.');
  }

  // 11. IMPACTO ESTRATÉGICO
  if(indice===11) {
    const yTop = 86;
    const pilares = [
      ['AGILIDADE OPERACIONAL', c.brandLight,
       '• Redução drástica do tempo de ciclo de contratação.\n' +
       '• Eliminação de idas e vindas com fornecedores.\n' +
       '• Menos tempo montando planilhas, mais tempo analisando.'],
      ['GOVERNANÇA & COMPLIANCE', c.brandDark,
       '• Alçadas executivas automáticas e inegociáveis.\n' +
       '• Registro formal de justificativas e disputas.\n' +
       '• Rastreabilidade 100% auditável para o Conselho.'],
      ['SAVING REAL & SUSTENTÁVEL', c.greenSolid,
       '• Concorrência em paridade técnica absoluta.\n' +
       '• Preços balizados pelo histórico real do grupo.\n' +
       '• Qualificação que prioriza parceiros de alta performance.']
    ];

    const cw = 204;
    pilares.forEach(function(pl, i) {
      const cx = 46 + i * 216;
      _cvForma_(s, 'ROUND_RECTANGLE', cx, yTop + 10, cw, 175, c.white, pl[1]);
      _cvForma_(s, 'ROUND_RECTANGLE', cx, yTop + 10, cw, 28, pl[1]);
      _cnUmaLinha_(s, cx + 8, yTop + 15, cw - 16, 18, pl[0], { fs: 8.5, bold: true, cor: c.white, align: 'C' });
      _cnParagrafo_(s, cx + 14, yTop + 48, cw - 28, 125, pl[2], { fs: 9, cor: c.textBody, espac: 135 });
    });

    _cvForma_(s, 'ROUND_RECTANGLE', 46, yTop + 200, 628, 40, c.brandSoft);
    _cnUmaLinha_(s, 56, yTop + 210, 608, 20, 'O valor gerado está na combinação entre velocidade na ponta e controle no topo.', { fs: 10, bold: true, cor: c.brandMed, align: 'C' });

    _cvApoio_(s, 40, 360, 640, 'Eficiência para quem executa nos condomínios e total segurança para a diretoria.');
  }

  // 12. VISÃO DE FUTURO
  if(indice===12) {
    const yTop = 86;
    const roadmap = [
      ['MOBILIDADE NO CANTEIRO', 'Chatbot WhatsApp', 'Vistorias com envio de fotos direto do celular e checklist de recebimento de obras pelo gestor na doca.'],
      ['INTEGRAÇÃO COM ERP', 'Automação de Contratos', 'Geração automática de Ordens de Compra e contratos assim que a equalização for homologada.'],
      ['ESCALABILIDADE CORPORATIVA', 'Multi-Ativos', 'Expansão da plataforma para novos empreendimentos e projetos de expansão do grupo Capital Realty.']
    ];

    roadmap.forEach(function(rm, i) {
      const cy = yTop + 10 + i * 66;
      _cvForma_(s, 'ROUND_RECTANGLE', 46, cy, 628, 56, c.white, c.lineStrong);
      _cvForma_(s, 'ROUND_RECTANGLE', 56, cy + 10, 36, 36, c.brandSoft);
      _cvTexto_(s, 56, cy + 14, 36, 28, String(i + 1), 16, c.brandMed, true);
      _cnUmaLinha_(s, 106, cy + 10, 220, 18, rm[0], { fs: 9.5, bold: true, cor: c.brandDark });
      _cnPill_(s, 330, cy + 10, 130, 18, rm[1], c.brandLight, c.white, 7);
      _cnParagrafo_(s, 106, cy + 28, 550, 24, rm[2], { fs: 8.5, cor: c.textBody });
    });

    _cvApoio_(s, 40, 360, 640, 'Arquitetura modular desenhada para crescer junto com a expansão da Capital Realty.');
  }

  // 13. CONCLUSÃO E PRÓXIMOS PASSOS
  if(indice===13) {
    _cvTexto_(s, 35, 78, 650, 60, 'Começar Melhor.\nContratar Melhor.', 32, c.white);
    _cvTexto_(s, 35, 150, 650, 30, 'A proposta de implementação para a Capital Realty', 15, c.brandSoft);

    const passos = [
      ['1. Homologação do Piloto', 'Megas Curitiba e Esteio em Facilities'],
      ['2. Capacitação das Equipes', 'Alinhamento rápido com compradores e gestores'],
      ['3. Consolidação dos Resultados', 'Relatório executivo de ganhos e expansão']
    ];
    passos.forEach(function(ps, i) {
      const cx = 46 + i * 216;
      _cvForma_(s, 'ROUND_RECTANGLE', cx, 200, 204, 80, '#1E2A5A');
      _cvTexto_(s, cx + 12, 210, 180, 24, ps[0], 12, c.white);
      _cnParagrafo_(s, cx + 12, 236, 180, 40, ps[1], { fs: 9, cor: c.brandSoft });
    });

    _cvApoio_(s, 40, 325, 640, 'Muito obrigado. Fico à disposição do Conselho para perguntas e demonstração ao vivo.', c.brandSoft);
  }

  if(!escuro)_cvTexto_(s,666,390,35,13,String(indice+1).padStart(2,'0'),8,c.textMuted,true);
  s.getNotesPage().getSpeakerNotesShape().getText().setText(p.fala+'\n\nApoio à fala: '+p.chamada+'\n'+p.rodape);
  return s;
}

