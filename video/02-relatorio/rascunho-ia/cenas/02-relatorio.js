// Gestão de Contratações · vídeo do relatório · RASCUNHO com voz de IA (edge-tts), 11/10/2026
// Pedido do Guilherme: "vamos fazer o vídeo já, mesmo com voz de IA, para eu ver como ficou". Sem o capítulo 7 (tempo não medido).
// Regras (ROTEIRO.md v3 e pareceres): telas reais do app só em janela "TELA REAL", recortadas sem a barra de abas antiga
// (y < 60), sem a caixa de responsável do deck (D02: só até y 350) e sem a barra do Google e a linha 25 da planilha (D90: y 160–930).
// Casos do capítulo 1 e linha do tempo são CARTÕES de texto: não imitam captura. Visual corporativo: marca Capital Realty.

const CR = { noite: '#151E49', royal: '#003D7B', dest: '#065CA9', claro: '#7FB2E5', branco: '#FFFFFF', mudo: 'rgba(255,255,255,0.66)',
  tinta: '#151E49', cinza: '#5B6578', linha: '#E3E8EF', lar: '#E07B24', larF: '#FFF1E3', verde: '#2E8B57' };

OPCOES.depois = 0.45;
OPCOES.cauda = 0.8;
OPCOES.camViva = 0.004;
OPCOES.transCena = 'mistura';
OPCOES.somTransicao = { som: 'relatorio/transicao', vol: 0.35, pularSe: 0.35 };
TRILHA = [{ de: 0, arq: 'elevenlabs/musica_contratacoes.mp3', vol: 0.10 }];

// ───────── peças ─────────
function crFundo() {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#151E49'); g.addColorStop(1, '#0E1638');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.07; ctx.strokeStyle = '#7FB2E5'; ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 96) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  ctx.restore();
}
function rotulo(cap, titulo, p) {  // canto superior: "01 · O PROBLEMA" + assunto da cena
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.5);
  txt(cap, 150, 92, 20, 800, CR.claro, { ls: 4 });
  if (titulo) txt(titulo, 150, 140, 40, 800, CR.branco);
  ctx.restore();
}
function rodape(s) { ctx.save(); ctx.globalAlpha *= 0.55; txt(s, 150, 1040, 17, 600, CR.branco, { ls: 1 }); ctx.restore(); }
function selo() { ctx.save(); ctx.globalAlpha *= 0.5; txt('RASCUNHO · VOZ DE IA', 1860, 1040, 16, 700, CR.branco, { align: 'right', ls: 2 }); ctx.restore(); }
function comCartao(p, fn) {  // entra subindo e aparecendo
  if (p <= 0) return;
  const e = E.outCubic(clamp(p));
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.4); ctx.translate(0, (1 - e) * 36); fn(); ctx.restore();
}
function cartao(x, y, w, h, o = {}) {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.38)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
  rr(x, y, w, h, 20, o.fill || CR.branco); ctx.restore();
  if (o.borda) rr(x, y, w, h, 20, null, o.borda, o.lw || 4);
}
function pilula(s, x, y, cor, corTxt, size = 20) {
  const w = measure(s, size, 800, 1) + 36;
  rr(x, y, w, size + 22, (size + 22) / 2, cor); txt(s, x + 18, y + size + 5, size, 800, corTxt, { ls: 1 }); return w;
}
function linhas(arr, x, y, size, weight, color, gap = 1.3) { arr.forEach((s, i) => txt(s, x, y + i * size * gap, size, weight, color)); }

// janela de navegador com a tela real (16:9); cam = [x, y, largura] na captura
const JAN = { x: 150, y: 200, w: 1620, h: 811 };
function crTela(pref, cam, alpha = 1) {
  const n = M(pref), im = IMGS[n]; if (!im || !im.complete) return;
  const [cx, cy, cw] = cam, ch = cw * JAN.h / JAN.w;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.beginPath(); ctx.roundRect(JAN.x, JAN.y, JAN.w, JAN.h, [0, 0, 18, 18]); ctx.clip();
  ctx.drawImage(im, cx, cy, cw, ch, JAN.x, JAN.y, JAN.w, JAN.h);
  ctx.restore();
}
function crJanela(rot) {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
  rr(JAN.x, JAN.y - 40, JAN.w, JAN.h + 40, 18, '#F8FAFC'); ctx.restore();
  rr(JAN.x, JAN.y - 40, JAN.w, 40, [18, 18, 0, 0], '#E2E8F0');
  ['#FF5F57', '#FEBC2E', '#28C840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(JAN.x + 26 + i * 22, JAN.y - 20, 7, 0, TAU); ctx.fill(); });
  rr(JAN.x + 110, JAN.y - 31, 560, 22, 11, '#FFFFFF');
  txt('Gestão de Contratações · ' + rot, JAN.x + 126, JAN.y - 15, 14, 600, '#64748B');
  rr(JAN.x + JAN.w - 150, JAN.y - 33, 134, 26, 13, CR.dest);
  txt('TELA REAL', JAN.x + JAN.w - 83, JAN.y - 15, 14, 800, CR.branco, { align: 'center', ls: 2 });
}
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
  ctx.beginPath(); ctx.roundRect(x - pad, y - pad, w + pad * 2, h + pad * 2, 14); ctx.stroke();
  ctx.restore();
  if (nota) {
    const q = E.outBack(clamp(p * 1.4 - 0.3)); if (q <= 0) return;
    const tw = measure(nota, 24, 800, 1) + 40, nx = Math.min(Math.max(x - pad, JAN.x + 20), JAN.x + JAN.w - tw - 20);
    const ny = Math.max(y - pad - 56, JAN.y + 16);
    ctx.save(); ctx.globalAlpha *= clamp(q); ctx.translate(0, (1 - q) * 14);
    rr(nx, ny, tw, 44, 22, CR.dest); txt(nota, nx + 20, ny + 30, 24, 800, CR.branco, { ls: 1 });
    ctx.restore();
  }
}
// recorte de uma captura num cartão (fora do 16:9): mostra [sx, sy, sw, sh] em (dx, dy) com largura dw
function recorte(pref, sx, sy, sw, sh, dx, dy, dw) {
  const n = M(pref), im = IMGS[n]; if (!im || !im.complete) return 0;
  const dh = dw * sh / sw;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 14; rr(dx, dy, dw, dh, 12, '#FFFFFF'); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, 12); ctx.clip(); ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh); ctx.restore();
  return dh;
}
const ent = lt => E.outCubic(prog(lt, -0.6, 0.3));

// ═════════ 1 · O PROBLEMA ═════════
const PROP = [{ n: 'A', v: '2' }, { n: 'B', v: '3' }, { n: 'C', v: '12' }];
function cartoesPMOC(lt, tV, tVerba, tLaudo) {
  PROP.forEach((pp, i) => {
    const x = 210 + i * 530, y = 300;
    comCartao(prog(lt, 0.1 + i * 0.15, 0.6 + i * 0.15), () => {
      const alerta = i === 0 && tLaudo !== null ? E.outCubic(prog(lt, tLaudo - 0.3, tLaudo + 0.3)) : 0;
      cartao(x, y, 440, 520, alerta > 0 ? { borda: CR.lar, lw: 6 * alerta } : {});
      txt('PROPOSTA ' + pp.n, x + 40, y + 70, 22, 800, CR.cinza, { ls: 3 });
      const qv = tVerba !== null ? prog(lt, tVerba - 0.3, tVerba + 0.3) : 1;
      rr(x + 40, y + 100, 300, 50, 25, qv > 0.5 ? '#E8F1FB' : '#F1F4F8');
      txt('1 verba anual', x + 64, y + 135, 24, 800, CR.royal);
      const pv = E.outBack(clamp(prog(lt, tV[i] - 0.25, tV[i] + 0.35)));
      if (pv > 0) {
        ctx.save(); ctx.globalAlpha *= clamp(pv);
        txt(pp.v, x + 40, y + 330 + (1 - pv) * 30, 170, 900, CR.tinta);
        txt('visitas por ano', x + 44, y + 400, 28, 700, CR.cinza);
        ctx.restore();
      }
      if (alerta > 0) {
        ctx.save(); ctx.globalAlpha *= alerta;
        rr(x + 30, y + 432, 380, 66, 14, CR.larF);
        txt('sem o laudo PMOC com ART', x + 48, y + 462, 22, 800, CR.lar);
        txt('previsto no pedido', x + 48, y + 488, 20, 600, CR.lar);
        ctx.restore();
      }
    });
  });
}
CENAS['1.1'] = {
  marca: false,
  sons: S => [{ t: S.w('Duas'), som: 'relatorio/destaque', vol: 0.45 }, { t: S.w('tres', 1), som: 'relatorio/destaque', vol: 0.45 }, { t: S.w('doze'), som: 'relatorio/destaque', vol: 0.45 }],
  fn(lt, S) {
    crFundo();
    rotulo('01 · O PROBLEMA', 'Manutenção do ar-condicionado: três propostas', prog(lt, 0, 0.5));
    cartoesPMOC(lt, [S.w('Duas'), S.w('tres', 1), S.w('doze')], S.w('verba'), null);
    rodape('Mapa de equalização real (Facilities). São ofertas, não serviços executados. Sem nomes nem valores.'); selo();
  },
};
CENAS['1.2'] = {
  marca: false,
  sons: S => [{ t: S.w('laudo'), som: 'relatorio/destaque', vol: 0.45 }],
  fn(lt, S) {
    crFundo();
    rotulo('01 · O PROBLEMA', 'Manutenção do ar-condicionado: três propostas', 1);
    cartoesPMOC(lt + 5, [0, 0, 0], null, S.w('laudo') + 5);
    rodape('Mapa de equalização real (Facilities). São ofertas, não serviços executados. Sem nomes nem valores.'); selo();
  },
};
CENAS['1.3'] = {
  marca: false,
  sons: S => [{ t: S.w('preco'), som: 'relatorio/destaque', vol: 0.45 }],
  fn(lt, S) {
    crFundo();
    rotulo('01 · O PROBLEMA', 'Outro caso: a mão de obra com um preço só', prog(lt, 0, 0.5));
    const tP = S.w('preco'), tI = S.w('Infraestrutura'), tPa = S.w('passagem'), tIn = S.w('instalacao'), tSe = S.w('separados');
    comCartao(prog(lt, 0.1, 0.6), () => {
      cartao(300, 260, 1320, 150);
      txt('Mão de obra', 350, 350, 44, 800, CR.tinta);
      const q = E.outBack(clamp(prog(lt, tP - 0.3, tP + 0.3)));
      if (q > 0) { ctx.save(); ctx.globalAlpha *= clamp(q); rr(1180, 300, 380, 70, 14, '#E8F1FB'); txt('1 preço', 1220, 350, 40, 900, CR.royal); ctx.restore(); }
    });
    [['Infraestrutura', tI], ['Passagem de cabos', tPa], ['Instalação do painel', tIn]].forEach(([s, t], i) => {
      comCartao(prog(lt, t - 0.3, t + 0.2), () => {
        const y = 450 + i * 140;
        ctx.fillStyle = CR.claro; ctx.fillRect(360, 410, 4, y + 50 - 410); ctx.fillRect(360, y + 48, 60, 4);
        cartao(440, y, 1180, 110);
        txt(s, 480, y + 68, 34, 700, CR.tinta);
        rr(1180, y + 26, 380, 58, 12, '#F1F4F8');
        const v = prog(lt, tSe - 0.3, tSe + 0.3);
        txt(v > 0.5 ? 'sem preço separado' : '—', 1210, y + 66, 26, 800, v > 0.5 ? CR.lar : CR.cinza);
      });
    });
    rodape('Documento real analisado em 05/09/2026: os itens estão descritos; o preço só aparece no total.'); selo();
  },
};
CENAS['1.4'] = {
  marca: false,
  sons: S => [{ t: S.w('verba'), som: 'relatorio/destaque', vol: 0.45 }, { t: S.w('quilos'), som: 'relatorio/destaque', vol: 0.45 }],
  fn(lt, S) {
    crFundo();
    rotulo('01 · O PROBLEMA', 'Obra de fundação da Engenharia', prog(lt, 0, 0.5));
    const tVb = S.w('verba'), tKg = S.w('quilos');
    comCartao(prog(lt, 0.1, 0.6), () => {
      cartao(200, 300, 1520, 520);
      txt('O MESMO ITEM', 260, 380, 22, 800, CR.cinza, { ls: 3 });
      txt('Posicionamento da armadura', 260, 450, 54, 800, CR.tinta);
      ['VB', 'KG', 'VB', 'KG'].forEach((u, i) => {
        const x = 260 + i * 360, ehVb = u === 'VB', t = ehVb ? tVb : tKg;
        const q = E.outBack(clamp(prog(lt, t - 0.25, t + 0.35)));
        txt('Proposta ' + (i + 1), x, 560, 24, 700, CR.cinza);
        rr(x, 590, 300, 160, 18, q > 0 ? (ehVb ? '#E8F1FB' : CR.larF) : '#F1F4F8');
        if (q > 0) { ctx.save(); ctx.globalAlpha *= clamp(q); txt(u, x + 150, 700, 84, 900, ehVb ? CR.royal : CR.lar, { align: 'center' }); ctx.restore(); }
      });
    });
    rodape('Concorrência real de fundação (Engenharia, Mega Curitiba, fase 7): verba em duas propostas, quilos em outras duas.'); selo();
  },
};
CENAS['1.5'] = {
  marca: false,
  sons: S => [{ t: S.w('explicito'), som: 'relatorio/destaque', vol: 0.4 }],
  fn(lt, S) {
    crFundo();
    rotulo('01 · O PROBLEMA', '', 1);
    const t = S.w('explicito');
    reveal('O escopo precisa deixar', 960, 470, 800, 76, CR.branco, E.outCubic(prog(lt, 0.1, 0.8)), { align: 'center' });
    reveal('explícito o que se compara.', 960, 570, 800, 76, CR.claro, E.outCubic(prog(lt, t - 0.4, t + 0.3)), { align: 'center' });
    const l = E.inOutCubic(prog(lt, t + 0.2, t + 0.9)); if (l > 0) { ctx.fillStyle = CR.dest; ctx.fillRect(960 - 300 * l, 625, 600 * l, 5); }
    selo();
  },
};

// ═════════ 2 · A APROVAÇÃO ═════════
const PAR = [['29/04/2026', 'A inscrição', 'Capital Fornecedores: avaliação', 'de prestadores de serviço'],
  ['19/05/2026', 'O comitê pede detalhes', 'Parte do processo já existe', 'no Fluig'],
  ['11/09/2026', 'O comitê aprova o caminho', 'Seguir começando', 'pelo escopo'],
  ['set/2026', 'Escopo em produção', 'Revisões emitidas', 'em 15/09 e 22/09']];
function linhaTempo(lt, ts) {
  const x0 = 230, dx = 420, y = 470;
  ctx.fillStyle = 'rgba(127,178,229,0.3)'; ctx.fillRect(x0, y, dx * 3, 4);
  PAR.forEach((p, i) => {
    const q = E.outBack(clamp(prog(lt, ts[i] - 0.3, ts[i] + 0.3))); if (q <= 0) return;
    const x = x0 + i * dx;
    ctx.save(); ctx.globalAlpha *= clamp(q);
    ctx.fillStyle = i === 2 ? CR.claro : CR.dest; ctx.beginPath(); ctx.arc(x, y + 2, 26 * q, 0, TAU); ctx.fill();
    txt(String(i + 1), x, y + 12, 28, 900, i === 2 ? CR.noite : CR.branco, { align: 'center' });
    txt(p[0], x - 30, y + 90, 24, 800, CR.claro);
    txt(p[1], x - 30, y + 136, 30, 800, CR.branco);
    txt(p[2], x - 30, y + 180, 22, 500, CR.mudo); txt(p[3], x - 30, y + 210, 22, 500, CR.mudo);
    ctx.restore();
  });
}
CENAS['2.1'] = {
  marca: false,
  fn(lt, S) {
    crFundo(); rotulo('02 · A APROVAÇÃO', 'A ideia inscrita foi aprovada', prog(lt, 0, 0.5));
    linhaTempo(lt, [S.w('inscrita'), S.w('detalhes'), 999, 999]);
    rodape('Fontes: e-mail de inscrição (29/04/2026) e e-mail do comitê (19/05/2026).'); selo();
  },
};
CENAS['2.2'] = {
  marca: false,
  fn(lt, S) {
    crFundo(); rotulo('02 · A APROVAÇÃO', 'O que os documentos reais mostraram', 1);
    linhaTempo(lt + 9, [0, 0, 999, 999]);
    const t = S.w('diferencas');
    ['2 · 3 · 12 visitas', '1 preço só', 'VB × KG'].forEach((s, i) => {
      comCartao(prog(lt, t - 0.3 + i * 0.25, t + 0.3 + i * 0.25), () => { cartao(330 + i * 440, 780, 380, 110); txt(s, 520 + i * 440, 850, 34, 900, CR.tinta, { align: 'center' }); });
    });
    selo();
  },
};
CENAS['2.3'] = {
  marca: false,
  sons: S => [{ t: S.w('escopo'), som: 'relatorio/destaque', vol: 0.45 }],
  fn(lt, S) {
    crFundo(); rotulo('02 · A APROVAÇÃO', 'O comitê aprovou começar pelo escopo', 1);
    linhaTempo(lt + 9, [0, 0, S.w('reuniao') + 9, S.w('escopo') + 9]);
    const tF = S.w('futuro');
    comCartao(prog(lt, tF - 0.4, tF + 0.2), () => {
      ctx.save(); ctx.setLineDash([12, 10]); rr(330, 770, 1260, 140, 20, 'rgba(255,255,255,0.06)', CR.claro, 3); ctx.restore();
      txt('PROJETO FUTURO COM A TI', 380, 830, 22, 800, CR.claro, { ls: 3 });
      txt('Fornecedor e preço no Fluig/RM', 380, 882, 38, 800, CR.branco);
    });
    rodape('Reunião "Comitê: Concurso Melhor Ideia", 11/09/2026.'); selo();
  },
};

// ═════════ 3 · A SOLUÇÃO (telas reais) ═════════
CENAS['3.1'] = {
  marca: false, camViva: 0,
  fn(lt, S) {
    const t = S.w('servicos');
    crFundo(); rotulo('03 · A SOLUÇÃO', 'O escopo é montado no sistema', prog(lt, 0, 0.5));
    ctx.save(); const e = ent(lt); ctx.translate(0, (1 - e) * 60); ctx.globalAlpha *= e;
    crJanela('Escopo · PPCI do prédio de apoio · Mega Itajaí');
    const cam = [keys(lt, [[0, 260], [t, 270]]), keys(lt, [[0, 60], [t, 100]]), keys(lt, [[0, 1420], [t, 1380]])];
    crTela('E01', cam);
    crDestaque(cam, [296, 150, 1608, 354], prog(lt, t - 0.3, t + 0.3), 'SERVIÇOS POR LOCAL');
    ctx.restore(); selo();
  },
};
CENAS['3.2'] = {
  marca: false, camViva: 0,
  fn(lt, S) {
    const t = S.w('imagens');
    crFundo(); rotulo('03 · A SOLUÇÃO', 'As imagens ficam vinculadas ao serviço', 1);
    crJanela('Escopo · PPCI do prédio de apoio · Mega Itajaí');
    const cam = [keys(lt, [[0, 270], [t, 270]]), keys(lt, [[0, 100], [t, 230]]), keys(lt, [[0, 1380], [t, 1380]])];
    crTela('E01', cam);
    crDestaque(cam, [297, 478, 1608, 760], prog(lt, t - 0.2, t + 0.4), 'IMAGENS DO GRUPO');
    selo();
  },
};
CENAS['3.3'] = {
  marca: false, camViva: 0,
  fn(lt, S) {
    const tL = S.w('lista'), tQ = S.w('quantidade'), tM = S.w('marca');
    crFundo(); rotulo('03 · A SOLUÇÃO', 'A lista de itens (EAP)', prog(lt, 0, 0.5));
    crJanela('Escopo · lista de itens para cotação');
    const cam = [keys(lt, [[0, 260], [tQ, 380], [tM, 520]]), 60, keys(lt, [[0, 1400], [tQ, 1280], [tM, 1120]])];
    crTela('E02', cam);
    crDestaque(cam, [280, 84, 1625, 586], prog(lt, tL - 0.3, tL + 0.3) * (1 - prog(lt, tQ - 0.4, tQ)), 'ITENS');
    crDestaque(cam, [1203, 84, 1366, 586], prog(lt, tQ - 0.3, tQ + 0.3) * (1 - prog(lt, tM - 0.4, tM)), 'QUANTIDADE E UNIDADE');
    crDestaque(cam, [1374, 84, 1522, 586], prog(lt, tM - 0.3, tM + 0.3), 'MARCA DE REFERÊNCIA');
    selo();
  },
};
CENAS['3.4'] = {
  marca: false,
  sons: S => [{ t: S.w('apresentacao'), som: 'relatorio/documento', vol: 0.4 }, { t: S.w('PDF'), som: 'relatorio/documento', vol: 0.4 },
    { t: S.w('planilha'), som: 'relatorio/documento', vol: 0.4 }, { t: S.w('duas'), som: 'relatorio/clique', vol: 0.5 }],
  fn(lt, S) {
    const tA = S.w('apresentacao'), tP = S.w('PDF'), tPl = S.w('planilha'), tD = S.w('duas');
    crFundo(); rotulo('03 · A SOLUÇÃO', 'Do mesmo cadastro saem três documentos', prog(lt, 0, 0.5));
    comCartao(prog(lt, tA - 0.3, tA + 0.3), () => { txt('APRESENTAÇÃO', 150, 250, 20, 800, CR.claro, { ls: 3 }); recorte('D02', 473, 20, 960, 330, 150, 270, 520); });
    comCartao(prog(lt, tP - 0.3, tP + 0.3), () => { txt('PDF', 700, 250, 20, 800, CR.claro, { ls: 3 }); recorte('E03', 473, 180, 960, 470, 700, 270, 520); });
    comCartao(prog(lt, tPl - 0.3, tPl + 0.3), () => { txt('PLANILHA PARA O FORNECEDOR', 1250, 250, 20, 800, CR.claro, { ls: 3 }); recorte('D90', 44, 160, 1566, 770, 1250, 270, 520); });
    comCartao(prog(lt, tD - 0.4, tD + 0.2), () => {
      txt('EM DUAS ETAPAS', 150, 760, 20, 800, CR.claro, { ls: 3 });
      const w1 = pilula('1 · Gerar Slides e PDF', 150, 790, CR.dest, CR.branco, 26);
      pilula('2 · Gerar planilha para fornecedor', 150 + w1 + 24, 790, CR.branco, CR.royal, 26);
    });
    rodape('Documentos reais gerados pelo sistema: PPCI do prédio de apoio, Mega Itajaí, revisão 9 (22/09/2026).'); selo();
  },
};

// ═════════ 4 · REAPROVEITAR ═════════
CENAS['4.1'] = {
  marca: false, camViva: 0,
  sons: S => [{ t: S.w('emitido'), som: 'relatorio/clique', vol: 0.5 }],
  fn(lt, S) {
    const t = S.w('emitido');
    crFundo(); rotulo('04 · REAPROVEITAR', 'O próximo parte de um já emitido', prog(lt, 0, 0.5));
    ctx.save(); const e = ent(lt); ctx.translate(0, (1 - e) * 60); ctx.globalAlpha *= e;
    crJanela('Escopos · início');
    const cam = [keys(lt, [[0, 254], [t, 270]]), keys(lt, [[0, 224], [t, 300]]), keys(lt, [[0, 1400], [t, 1200]])];
    crTela('C01', cam);
    crDestaque(cam, [294, 631, 428, 672], prog(lt, t - 0.3, t + 0.3), 'USAR COMO BASE');
    ctx.restore(); selo();
  },
};
CENAS['4.2'] = {
  marca: false,
  sons: S => [{ t: S.w('servicos'), som: 'relatorio/documento', vol: 0.35 }],
  fn(lt, S) {
    crFundo(); rotulo('04 · REAPROVEITAR', 'O que vem e o que se preenche', 1);
    const vem = [['Serviços', S.w('servicos')], ['Lista de itens', S.w('lista')], ['Inclusões', S.w('inclusoes')], ['Exclusões', S.w('exclusoes')], ['Aceite', S.w('aceite')]];
    const tT = S.w('Titulo');
    const novo = [['Título', tT], ['Local', S.w('local')], ['Fotos', S.w('fotos')], ['Contato', S.w('contato')], ['Prazos', S.w('prazos')]];
    txt('VÊM DO ESCOPO BASE', 150, 300, 22, 800, CR.claro, { ls: 3 });
    let x = 150; vem.forEach(([s, t]) => { const q = E.outBack(clamp(prog(lt, t - 0.2, t + 0.3))); if (q > 0) { ctx.save(); ctx.globalAlpha *= clamp(q); x += pilula(s, x, 330, CR.branco, CR.royal, 30) + 20; ctx.restore(); } });
    comCartao(prog(lt, tT - 0.5, tT), () => txt('PREENCHE-SE PARA A NOVA CONTRATAÇÃO', 150, 560, 22, 800, CR.claro, { ls: 3 }));
    x = 150; novo.forEach(([s, t]) => { const q = E.outBack(clamp(prog(lt, t - 0.2, t + 0.3))); if (q > 0) { ctx.save(); ctx.globalAlpha *= clamp(q); ctx.setLineDash([8, 8]); const w = measure(s, 30, 800, 1) + 36; rr(x, 590, w, 52, 26, 'rgba(255,255,255,0.06)', CR.mudo, 2); ctx.setLineDash([]); txt(s, x + 18, 627, 30, 800, CR.mudo, { ls: 1 }); x += w + 20; ctx.restore(); } });
    rodape('Função "Usar como base" (publicada em 11/10/2026).'); selo();
  },
};

// ═════════ 5 · EM USO ═════════
CENAS['5.1'] = {
  marca: false,
  sons: S => [{ t: S.w('Facilities'), som: 'relatorio/destaque', vol: 0.45 }, { t: S.w('Propriedades'), som: 'relatorio/destaque', vol: 0.45 }, { t: S.w('registrada'), som: 'relatorio/destaque', vol: 0.45 }],
  fn(lt, S) {
    const tFa = S.w('Facilities'), tPr = S.w('Propriedades'), tPd = S.w('predio'), tNo = S.w('registrada'), tAj = S.w('ajuste'), tPa = S.w('padrao'), tEn = S.w('Engenharia');
    crFundo();
    const fase = lt < tPd - 0.3 ? 0 : lt < tPa - 0.3 ? 1 : 2;
    rotulo('05 · EM USO', ['Testado em escopos reais por duas áreas', 'Revisões registradas (exemplo)', 'O mesmo padrão para a empresa toda'][fase], 1);
    if (fase === 0) {
      [['Facilities', 'Mega Itajaí · 3 escopos', tFa], ['Propriedades', 'Mega Curitiba · casa de bombas', tPr]].forEach(([a, b, t], i) => {
        comCartao(prog(lt, t - 0.3, t + 0.3), () => {
          cartao(250 + i * 740, 340, 680, 360); txt('TESTOU', 300 + i * 740, 420, 22, 800, CR.verde, { ls: 3 });
          txt(a, 300 + i * 740, 520, 64, 900, CR.tinta); txt(b, 300 + i * 740, 600, 28, 600, CR.cinza);
        });
      });
    } else if (fase === 1) {
      const cam = [250, 440, keys(lt, [[tPd, 1100], [tNo, 1000]])];
      crJanela('Escopo · arquivos emitidos'); crTela('E05', cam);
      crDestaque(cam, [298, 606, 715, 890], prog(lt, tNo - 0.4, tNo + 0.2), 'EXEMPLO: CADA EMISSÃO É UMA REVISÃO');
      comCartao(prog(lt, tAj - 0.3, tAj + 0.3), () => { cartao(1010, 640, 700, 300); txt('PRÓXIMO PASSO', 1050, 700, 20, 800, CR.dest, { ls: 3 }); linhas(['Hoje até um ajuste pequeno', 'vira revisão nova.'], 1050, 755, 30, 700, CR.tinta); pilula('Corrigir', 1050, 850, '#E8F1FB', CR.royal, 24); pilula('Gerar nova revisão', 1210, 850, CR.dest, CR.branco, 24); });
    } else {
      [['Facilities', true], ['Propriedades', true], ['Engenharia', false], ['Demais áreas', false]].forEach(([s, ok], i) => {
        const t = i < 2 ? tPa : tEn + (i - 2) * 0.4;
        comCartao(prog(lt, t - 0.3 + i * 0.12, t + 0.3 + i * 0.12), () => {
          cartao(150 + i * 410, 420, 380, 220, ok ? {} : { fill: 'rgba(255,255,255,0.08)' });
          txt(s, 190 + i * 410, 530, 38, 800, ok ? CR.tinta : CR.branco);
          txt(ok ? 'já testou' : 'pode usar', 190 + i * 410, 590, 24, 700, ok ? CR.verde : CR.claro);
        });
      });
    }
    rodape('Escopos reais: Facilities (Mega Itajaí, 3) e Propriedades (1). Revisões: tela real do sistema.'); selo();
  },
};

// ═════════ 6 · QUEM USA PEDE ═════════
CENAS['6.1'] = {
  marca: false,
  fn(lt, S) {
    crFundo(); rotulo('06 · QUEM USA PEDE, O SISTEMA MUDA', 'Pedidos de quem usa viraram versões', prog(lt, 0, 0.5));
    const it = [['Texto padronizado', '02/10 · v71', S.w('padronizado')], ['Imagens logo após o serviço', '02/10 · v72', S.w('imagens')],
      ['Texto justificado', '02/10 · v73', S.w('justificado')], ['Aviso padrão do Facilities', '11/10 · v74–v75', S.w('aviso')], ['Escopos base', '11/10 · v76', S.w('base')]];
    it.forEach(([s, v, t], i) => comCartao(prog(lt, t - 0.3, t + 0.2), () => {
      const y = 250 + i * 135; cartao(150, y, 1620, 110);
      txt(s, 200, y + 68, 38, 800, CR.tinta); txt(v, 1720, y + 68, 30, 800, CR.dest, { align: 'right' });
    }));
    rodape('Fonte: registro do projeto (HISTORICO.md) e datas das versões no Apps Script.'); selo();
  },
};
CENAS['6.2'] = {
  marca: false,
  sons: S => [{ t: S.w('testes'), som: 'relatorio/destaque', vol: 0.45 }],
  fn(lt, S) {
    crFundo(); rotulo('06 · QUEM USA PEDE, O SISTEMA MUDA', '', 1);
    const t = S.w('testes'), q = E.outBack(clamp(prog(lt, t - 0.3, t + 0.4)));
    if (q > 0) { ctx.save(); ctx.globalAlpha *= clamp(q); txt('34', 960, 560 + (1 - q) * 30, 260, 900, CR.branco, { align: 'center' }); ctx.restore(); }
    reveal('suítes de teste, rodadas antes de publicar', 960, 680, 700, 44, CR.claro, E.outCubic(prog(lt, S.w('publicar') - 0.5, S.w('publicar') + 0.2)), { align: 'center' });
    selo();
  },
};

// ═════════ 8 · O PRÓXIMO PASSO ═════════
CENAS['8.1'] = {
  marca: false,
  fn(lt, S) {
    crFundo(); rotulo('07 · O PRÓXIMO PASSO', 'Um projeto para a empresa toda', prog(lt, 0, 0.5));
    const ar = [['Facilities', S.w('Facilities')], ['Propriedades', S.w('Propriedades')], ['Engenharia', S.w('Engenharia')], ['Toda área que monta escopo', S.w('toda')]];
    let x = 150; ar.forEach(([s, t]) => { const q = E.outBack(clamp(prog(lt, t - 0.2, t + 0.3))); if (q > 0) { ctx.save(); ctx.globalAlpha *= clamp(q); x += pilula(s, x, 300, CR.branco, CR.royal, 34) + 22; ctx.restore(); } });
    const tF = S.w('futuro');
    comCartao(prog(lt, tF - 0.4, tF + 0.2), () => {
      ctx.save(); ctx.setLineDash([12, 10]); rr(150, 520, 1620, 260, 22, 'rgba(255,255,255,0.06)', CR.claro, 3); ctx.restore();
      txt('PROJETO FUTURO COM A TI', 210, 600, 24, 800, CR.claro, { ls: 3 });
      txt('Fornecedor e preço no Fluig e no RM', 210, 670, 50, 800, CR.branco);
      txt('a partir do cadastro oficial, sem base duplicada · ainda não integrado', 210, 730, 26, 600, CR.mudo);
    });
    selo();
  },
};
CENAS['8.2'] = {
  marca: false, depois: 1.6, camViva: 0,
  sons: S => [{ t: S.w('Gestao'), som: 'relatorio/fecho', vol: 0.5 }],
  fn(lt, S) {
    const tG = S.w('Gestao'), tCo = S.w('Comecar'), tCt = S.w('Contratar');
    crFundo();
    const a = prog(lt, tG - 0.4, tG + 0.4);
    if (a > 0) { const n = M('L01'), im = IMGS[n]; if (im && im.complete) { ctx.save(); ctx.globalAlpha *= a; const w = 520, h = w * im.naturalHeight / im.naturalWidth; ctx.drawImage(im, 960 - w / 2, 250, w, h); ctx.restore(); } }
    reveal('Começar melhor.', 960, 520, 800, 96, CR.branco, E.outCubic(prog(lt, tCo - 0.4, tCo + 0.2)), { align: 'center' });
    reveal('Contratar melhor.', 960, 640, 800, 96, CR.claro, E.outCubic(prog(lt, tCt - 0.4, tCt + 0.2)), { align: 'center' });
    const b = prog(lt, tCt + 0.3, tCt + 0.9);
    if (b > 0) {
      ctx.save(); ctx.globalAlpha *= b;
      txt('GESTÃO DE CONTRATAÇÕES', 960, 760, 30, 800, CR.branco, { align: 'center', ls: 6 });
      txt('Guilherme Marques · Facilities · Capital Realty · Melhor Ideia 2026', 960, 810, 24, 500, CR.mudo, { align: 'center' });
      ctx.restore();
    }
    selo();
  },
};
