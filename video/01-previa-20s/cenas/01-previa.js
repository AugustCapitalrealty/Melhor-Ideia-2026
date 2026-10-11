// Gestão de Contratações · prévia de 20 s · v2: TELAS REAIS e foco no ESCOPO (11/10/2026)
// Pedido do Guilherme: "o vídeo tem que usar imagem do script mesmo, real, não simulado". Toda imagem é captura do app em
// produção (midia/real/E0*.png, 1920×1080). Aqui só há moldura, câmera e destaque por cima da tela real; nada é redesenhado.

const CR = { noite: '#151E49', royal: '#003D7B', dest: '#065CA9', claro: '#7FB2E5', branco: '#FFFFFF', mudo: 'rgba(255,255,255,0.62)' };

OPCOES.depois = 0.3;
OPCOES.cauda = 0.5;
OPCOES.camViva = 0;          // a câmera de cada cena é a da tela (crTela); o empurrão automático borraria o texto da tela
OPCOES.transCena = 'mistura';
OPCOES.somTransicao = { som: 'whoosh_curto', vol: 0.35, pularSe: 0.35 };
TRILHA = [{ de: 0, arq: 'Como Vamos_ - Casa Rosa.mp3', vol: 0.12 }];

// A janela onde a tela real aparece (16:9), com uma barra de navegador fina em cima
const JAN = { x: 150, y: 128, w: 1620, h: 911 };
// a altura mostrada é largura × 911/1620: a câmera nunca pode passar de y + altura > 1080 (a captura tem 1080)

function crFundo() {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#151E49'); g.addColorStop(1, '#0E1638');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// cam = [x, y, largura] da região da tela real mostrada na janela (a altura sai do 16:9)
function crTela(pref, cam, alpha = 1) {
  const n = M(pref), im = IMGS[n]; if (!im || !im.complete) return;
  const [cx, cy, cw] = cam, ch = cw * JAN.h / JAN.w;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.beginPath(); ctx.roundRect(JAN.x, JAN.y, JAN.w, JAN.h, [0, 0, 18, 18]); ctx.clip();
  ctx.drawImage(im, cx, cy, cw, ch, JAN.x, JAN.y, JAN.w, JAN.h);
  ctx.restore();
}

function crJanela(rotulo, p) {
  // sombra e barra do navegador
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
  rr(JAN.x, JAN.y - 40, JAN.w, JAN.h + 40, 18, '#F8FAFC'); ctx.restore();
  rr(JAN.x, JAN.y - 40, JAN.w, 40, [18, 18, 0, 0], '#E2E8F0');
  ['#FF5F57', '#FEBC2E', '#28C840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(JAN.x + 26 + i * 22, JAN.y - 20, 7, 0, TAU); ctx.fill(); });
  rr(JAN.x + 110, JAN.y - 31, 560, 22, 11, '#FFFFFF');
  txt('script.google.com · Gestão de Contratações', JAN.x + 126, JAN.y - 15, 14, 600, '#64748B');
  // rótulo da cena, acima da janela
  if (p > 0) {
    ctx.save(); ctx.globalAlpha *= clamp(p * 1.5);
    rr(JAN.x, 34, 138, 34, 17, CR.dest);
    txt('TELA REAL', JAN.x + 69, 57, 15, 800, CR.branco, { align: 'center', ls: 2 });
    txt(rotulo, JAN.x + 156, 58, 20, 700, CR.branco, { ls: 2 });
    ctx.restore();
  }
}

// Destaque de uma região da tela real (coordenadas da captura): contorno azul que se fecha + véu escuro fora dele
function crDestaque(cam, reg, p, nota) {
  if (p <= 0) return;
  const [cx, cy, cw] = cam, k = JAN.w / cw;
  const x = JAN.x + (reg[0] - cx) * k, y = JAN.y + (reg[1] - cy) * k, w = (reg[2] - reg[0]) * k, h = (reg[3] - reg[1]) * k;
  const e = E.outCubic(clamp(p)), pad = 10 + (1 - e) * 26;
  ctx.save();
  ctx.beginPath(); ctx.roundRect(JAN.x, JAN.y, JAN.w, JAN.h, [0, 0, 18, 18]); ctx.clip();
  ctx.fillStyle = `rgba(14,22,56,${0.38 * e})`;
  ctx.beginPath(); ctx.rect(JAN.x, JAN.y, JAN.w, JAN.h); ctx.roundRect(x - pad, y - pad, w + pad * 2, h + pad * 2, 14); ctx.fill('evenodd');
  ctx.strokeStyle = CR.dest; ctx.lineWidth = 5; ctx.globalAlpha *= e;
  ctx.shadowColor = 'rgba(6,92,169,0.6)'; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.roundRect(x - pad, y - pad, w + pad * 2, h + pad * 2, 14); ctx.stroke();
  ctx.restore();
  if (nota) {
    const q = E.outBack(clamp(p * 1.4 - 0.3));
    if (q <= 0) return;
    const tw = measure(nota, 24, 800, 1) + 40, nx = Math.min(x - pad, JAN.x + JAN.w - tw - 20), ny = y - pad - 56;
    ctx.save(); ctx.globalAlpha *= clamp(q); ctx.translate(0, (1 - q) * 14);
    ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 16; rr(nx, ny, tw, 44, 22, CR.dest); ctx.shadowColor = 'transparent';
    txt(nota, nx + 20, ny + 30, 24, 800, CR.branco, { ls: 1 });
    ctx.restore();
  }
}

// a janela entra subindo no começo de cada cena
function crEntrada(lt) { return E.outCubic(prog(lt, -0.6, 0.3)); }

// 0.1 · Tudo começa pelo escopo: serviços e fotos de cada local.
//   Tela real: o escopo do PPCI aberto. Destaque nos serviços do grupo em "servicos" e nas plantas anexadas em "fotos".
CENAS['0.1'] = {
  marca: false,
  sons: S => [{ t: S.w('servicos'), som: 'pop', vol: 0.5 }, { t: S.w('fotos'), som: 'pop', vol: 0.5 }],
  fn(lt, S) {
    const tSe = S.w('servicos'), tFo = S.w('fotos');
    crFundo();
    ctx.save(); const e = crEntrada(lt); ctx.translate(0, (1 - e) * 60); ctx.globalAlpha *= e;
    crJanela('ESCOPO · PPCI PRÉDIO DE APOIO · MEGA ITAJAÍ', prog(lt, 0, 0.5));
    const cam = [keys(lt, [[0, 0], [tSe, 240], [tFo, 240]]), keys(lt, [[0, 0], [tSe, 100], [tFo, 230]]), keys(lt, [[0, 1920], [tSe, 1500]])];
    crTela('E01', cam);
    crDestaque(cam, [296, 150, 1608, 354], prog(lt, tSe - 0.3, tSe + 0.3) * (1 - prog(lt, tFo - 0.4, tFo)), 'SERVIÇOS POR GRUPO');
    crDestaque(cam, [297, 478, 1608, 760], prog(lt, tFo - 0.3, tFo + 0.3), 'FOTOS NO GRUPO');
    ctx.restore();
  },
};

// 0.2 · A EAP é montada uma vez, com quantidade, unidade e marca de referência.
//   Tela real: os itens 1.2–1.7 da EAP do PPCI. Destaque nas linhas em "EAP", na quantidade e unidade, e na marca.
CENAS['0.2'] = {
  marca: false,
  sons: S => [{ t: S.w('EAP'), som: 'pop', vol: 0.5 }, { t: S.w('marca'), som: 'tick', vol: 0.7 }],
  fn(lt, S) {
    const tEa = S.w('EAP'), tQu = S.w('quantidade'), tMa = S.w('marca');
    crFundo();
    ctx.save(); const e = crEntrada(lt); ctx.translate(0, (1 - e) * 60); ctx.globalAlpha *= e;
    crJanela('ESCOPO · ITENS PARA COTAÇÃO (EAP)', prog(lt, 0, 0.5));
    const cam = [keys(lt, [[0, 0], [tEa, 240], [tMa, 520]]), keys(lt, [[0, 0], [tEa, 60], [tMa, 60]]), keys(lt, [[0, 1920], [tEa, 1500], [tMa, 1200]])];
    crTela('E02', cam);
    crDestaque(cam, [280, 84, 1625, 586], prog(lt, tEa - 0.3, tEa + 0.3) * (1 - prog(lt, tQu - 0.4, tQu)), 'EAP');
    crDestaque(cam, [1203, 84, 1366, 586], prog(lt, tQu - 0.3, tQu + 0.3) * (1 - prog(lt, tMa - 0.4, tMa)), 'QUANTIDADE E UNIDADE');
    crDestaque(cam, [1374, 84, 1522, 586], prog(lt, tMa - 0.3, tMa + 0.3), 'MARCA DE REFERÊNCIA');
    ctx.restore();
  },
};

// 0.3 · Do escopo saem a apresentação e a planilha de cotação para o fornecedor.
//   Telas reais: o slide de registro fotográfico do deck gerado (E03); em "planilha", a planilha de cotação (E04), com as
//   colunas amarelas que o fornecedor preenche destacadas em "fornecedor". Enquadramento sem a foto de perfil (y < 110) e
//   sem o telefone da responsável (linha 25, y ≈ 988).
CENAS['0.3'] = {
  marca: false,
  sons: S => [{ t: S.w('planilha') - 0.15, som: 'whoosh', vol: 0.45 }, { t: S.w('fornecedor'), som: 'pop', vol: 0.5 }],
  fn(lt, S) {
    const tAp = S.w('apresentacao'), tPl = S.w('planilha'), tFo = S.w('fornecedor');
    crFundo();
    ctx.save(); const e = crEntrada(lt); ctx.translate(0, (1 - e) * 60); ctx.globalAlpha *= e;
    const troca = prog(lt, tPl - 0.15, tPl + 0.1);  /* troca rápida: a mistura longa embaralhava slide e planilha */
    crJanela(troca < 0.5 ? 'APRESENTAÇÃO GERADA · GOOGLE SLIDES' : 'PLANILHA DE COTAÇÃO · GOOGLE PLANILHAS', prog(lt, 0, 0.5));
    const camA = [keys(lt, [[0, 440], [tAp, 462]]), keys(lt, [[0, 150], [tAp, 172]]), keys(lt, [[0, 1030], [tAp, 980]])];  /* só o slide, sem o preto do htmlpresent */
    const camB = [keys(lt, [[tPl, 40], [tFo, 300]]), keys(lt, [[tPl, 150], [tFo, 150]]), keys(lt, [[tPl, 1400], [tFo, 1350]])];
    if (troca < 1) crTela('E03', camA, 1);
    if (troca > 0) crTela('E04', camB, troca);
    crDestaque(camA, [472, 180, 1433, 720], prog(lt, tAp - 0.3, tAp + 0.3) * (1 - troca), 'GERADA DO ESCOPO');
    crDestaque(camB, [936, 440, 1610, 935], prog(lt, tFo - 0.3, tFo + 0.3), 'O FORNECEDOR PREENCHE');
    ctx.restore();
  },
};

// 0.4 · Cada revisão fica registrada.
//   Tela real: "Arquivos emitidos" do PPCI, revisões 4 a 9, com Slides, PDF e planilha.
CENAS['0.4'] = {
  marca: false,
  sons: S => [{ t: S.w('registrada'), som: 'tick', vol: 0.7 }],
  fn(lt, S) {
    const tRe = S.w('revisao'), tRg = S.w('registrada');
    crFundo();
    ctx.save(); const e = crEntrada(lt); ctx.translate(0, (1 - e) * 60); ctx.globalAlpha *= e;
    crJanela('ESCOPO · ARQUIVOS EMITIDOS', prog(lt, 0, 0.5));
    const cam = [keys(lt, [[0, 200], [tRg, 230]]), keys(lt, [[0, 230], [tRg, 400]]), keys(lt, [[0, 1500], [tRg, 1200]])];
    crTela('E05', cam);
    crDestaque(cam, [298, 606, 715, 890], prog(lt, tRe - 0.2, tRg), 'REVISÕES 4 A 9');
    ctx.restore();
  },
};

// 0.5 · Próximo passo: ligar a base de fornecedores ao Fluig e ao RM.
//   Tela real: os cartões da Base de Fornecedores (sem os indicadores do topo). A integração NÃO existe ainda: a nota
//   "PRÓXIMO PASSO" fica por cima da moldura, fora da tela do app, para não parecer função pronta.
CENAS['0.5'] = {
  marca: false,
  sons: S => [{ t: S.w('Fluig'), som: 'brilho', vol: 0.45 }],
  fn(lt, S) {
    const tBa = S.w('base'), tFl = S.w('Fluig'), tRm = S.w('RM');
    crFundo();
    ctx.save(); const e = crEntrada(lt); ctx.translate(0, (1 - e) * 60); ctx.globalAlpha *= e;
    crJanela('BASE DE FORNECEDORES', prog(lt, 0, 0.5));
    const cam = [keys(lt, [[0, 230], [tFl, 250]]), keys(lt, [[0, 420], [tFl, 425]]), keys(lt, [[0, 1150], [tFl, 1100]])];
    crTela('E06', cam);
    crDestaque(cam, [238, 441, 1668, 1000], prog(lt, tBa - 0.3, tBa + 0.3), '318 FORNECEDORES NA BASE');
    ctx.restore();
    const q = E.outBack(clamp(prog(lt, tFl - 0.4, tFl + 0.3)));
    if (q > 0) {
      ctx.save(); ctx.globalAlpha *= clamp(q); ctx.translate(0, (1 - q) * 20);
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; rr(1110, 760, 620, 200, 22, CR.noite); ctx.shadowColor = 'transparent';
      rr(1110, 760, 620, 200, 22, null, CR.dest, 3);
      txt('PRÓXIMO PASSO', 1150, 812, 22, 800, CR.claro, { ls: 3 });
      txt('Integração com', 1150, 866, 34, 700, CR.branco);
      const r = prog(lt, tRm - 0.3, tRm + 0.2);
      txt('Fluig' + (r > 0.5 ? ' e RM' : ''), 1150, 916, 44, 800, CR.branco);
      ctx.strokeStyle = CR.claro; ctx.lineWidth = 3; ctx.setLineDash([8, 10]); ctx.lineDashOffset = -lt * 30;
      ctx.beginPath(); ctx.moveTo(1110, 860); ctx.lineTo(1110 - 160 * clamp(q), 860); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
    }
  },
};

// 0.6 · Começar melhor. Contratar melhor.
//   Fecho em azul noturno: as duas frases sobem, a linha se estende e a assinatura entra.
CENAS['0.6'] = {
  marca: false, depois: 1.3,
  sons: S => [{ t: S.w('Contratar'), som: 'plim', vol: 0.45 }],
  fn(lt, S) {
    const tCo = S.w('Comecar'), tCt = S.w('Contratar');
    crFundo();
    ctx.save(); ctx.globalAlpha = 0.16; ctx.strokeStyle = CR.dest; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(1700, 980, 240 + i * 120 + lt * 12, 0, TAU); ctx.stroke(); }
    ctx.restore();
    reveal('Começar melhor.', 960, 470, 800, 104, CR.branco, E.outCubic(prog(lt, tCo - 0.4, tCo + 0.2)), { align: 'center' });
    reveal('Contratar melhor.', 960, 600, 800, 104, CR.claro, E.outCubic(prog(lt, tCt - 0.4, tCt + 0.2)), { align: 'center' });
    const l = E.inOutCubic(prog(lt, tCt + 0.2, tCt + 0.9));
    if (l > 0) { ctx.fillStyle = CR.dest; ctx.fillRect(960 - 260 * l, 665, 520 * l, 4); }
    const a = prog(lt, tCt + 0.4, tCt + 0.9);
    if (a > 0) {
      ctx.save(); ctx.globalAlpha *= a;
      txt('GESTÃO DE CONTRATAÇÕES', 960, 750, 30, 800, CR.branco, { align: 'center', ls: 6 });
      txt('Melhor Ideia 2026 · Capital Realty · Facilities', 960, 800, 24, 500, CR.mudo, { align: 'center', ls: 1 });
      txt('Telas reais do sistema em produção · 11/10/2026', 960, 850, 20, 500, CR.mudo, { align: 'center', ls: 1 });
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha *= 0.55;
    txt('PRÉVIA · VOZ PROVISÓRIA', 1860, 1040, 16, 700, CR.branco, { align: 'right', ls: 2 }); ctx.restore();
  },
};
