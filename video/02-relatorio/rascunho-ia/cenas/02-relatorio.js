// Gestão de Contratações · vídeo do relatório · v4, 15/10/2026 (voz ElevenLabs; trilha corporativa; sem efeitos de canal)
// Pedidos do Guilherme (15/10): contexto antes do problema, escopos sem padrão, sem melhorias futuras, sem testes automatizados, testes reais.
// Regras (ROTEIRO.md v3 e pareceres): telas reais do app só em janela "TELA REAL", recortadas sem a barra de abas antiga
// (y < 60), sem a caixa de responsável do deck (D02: só até y 350) e sem a barra do Google e a linha 25 da planilha (D90: y 160–930).
// Casos do capítulo 1 e linha do tempo são CARTÕES de texto: não imitam captura. Visual corporativo: marca Capital Realty.

const CR = { noite: '#151E49', royal: '#003D7B', dest: '#065CA9', claro: '#7FB2E5', branco: '#FFFFFF', mudo: 'rgba(255,255,255,0.66)',
  tinta: '#151E49', cinza: '#5B6578', linha: '#E3E8EF', lar: '#E07B24', larF: '#FFF1E3', verde: '#2E8B57' };

OPCOES.depois = 0.45;
OPCOES.cauda = 0.8;
OPCOES.camViva = 0.004;
OPCOES.transCena = 'mistura';
OPCOES.somTransicao = null;  // 15/10: "os efeitos sonoros e sonoplastia não tavam corporativos"
TRILHA = [{ de: 0, arq: 'elevenlabs/musica_corporativa.mp3', vol: 0.09 }];

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
function selo() {}  // v4: voz final pelo ElevenLabs; sem o selo de rascunho
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

// foto em "cover" dentro de [x, y, w, h], escurecida de leve para o texto por cima ler bem
function foto(pref, x, y, w, h, escuro = 0.25, raio = 16) {
  const n = M(pref), im = IMGS[n]; if (!im || !im.complete) return;
  const k = Math.max(w / im.naturalWidth, h / im.naturalHeight), sw = w / k, sh = h / k;
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, raio); ctx.clip();
  ctx.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
  if (escuro) { ctx.fillStyle = `rgba(14,22,56,${escuro})`; ctx.fillRect(x, y, w, h); }
  ctx.restore();
}
// imagem inteira com largura w (capas de escopo)
function inteira(pref, x, y, w) {
  const n = M(pref), im = IMGS[n]; if (!im || !im.complete) return 0;
  const h = w * im.naturalHeight / im.naturalWidth;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 14; rr(x, y, w, h, 12, '#FFFFFF'); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.clip(); ctx.drawImage(im, x, y, w, h); ctx.restore();
  return h;
}
function numero(s, rotuloTxt, x, y, p, cor = CR.branco) {
  const q = E.outBack(clamp(p)); if (q <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(q);
  txt(s, x, y + (1 - q) * 24, 120, 900, cor);
  linhas(rotuloTxt, x, y + 56, 26, 700, CR.mudo, 1.3);
  ctx.restore();
}

// ═════════ 1 · O CONTEXTO ═════════
CENAS['1.0'] = {
  marca: false, depois: 0.9, camViva: 0,
  fn(lt, S) {
    crFundo();
    const tG = S.w('Gestao'), tA = tG + 1.0;
    // faixa de fotos dos Megas, bem escura, entrando devagar
    const f = clamp(lt / 1.2);
    ctx.save(); ctx.globalAlpha *= 0.28 * f;
    ['F01', 'F02', 'F03'].forEach((p, i) => foto(p, i * 640, 0, 640, 1080, 0.55, 0));
    ctx.restore();
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(21,30,73,0.35)'); g.addColorStop(1, 'rgba(14,22,56,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const a = E.outCubic(prog(lt, -0.2, 0.7));
    if (a > 0) { const n = M('L01'), im = IMGS[n]; if (im && im.complete) { ctx.save(); ctx.globalAlpha *= a; const w = 360, h = w * im.naturalHeight / im.naturalWidth; ctx.drawImage(im, 960 - w / 2, 300 + (1 - a) * 20, w, h); ctx.restore(); } }
    const k = E.outCubic(prog(lt, 0.3, 1.0));
    if (k > 0) { ctx.save(); ctx.globalAlpha *= k; txt('MELHOR IDEIA 2026', 960, 500, 24, 800, CR.claro, { align: 'center', ls: 8 }); ctx.restore(); }
    reveal('Gestão de Contratações', 960, 610, 800, 96, CR.branco, E.outCubic(prog(lt, tG - 0.4, tG + 0.3)), { align: 'center' });
    const l = E.inOutCubic(prog(lt, tG + 0.2, tG + 0.9)); if (l > 0) { ctx.fillStyle = CR.dest; ctx.fillRect(960 - 220 * l, 650, 440 * l, 5); }
    reveal('A contratação começa no escopo.', 960, 730, 600, 40, CR.claro, E.outCubic(prog(lt, tA - 0.5, tA + 0.2)), { align: 'center' });
  },
};

CENAS['1.1'] = {
  marca: false,
  fn(lt, S) {
    crFundo();
    const tE = S.w('escopo'), tD = S.w('documento');
    [['F01', 'MEGA CURITIBA'], ['F02', 'MEGA ITAJAÍ'], ['F03', 'MEGA ESTEIO']].forEach(([f, n], i) => {
      comCartao(prog(lt, -0.8 + i * 0.25, -0.2 + i * 0.25), () => {
        const x = 150 + i * 548, zoom = 1 + 0.03 * clamp(lt / 8);
        ctx.save(); ctx.translate(x + 256, 470); ctx.scale(zoom, zoom); ctx.translate(-(x + 256), -470);
        foto(f, x, 200, 512, 540, 0.15); ctx.restore();
        txt(n, x + 24, 712, 22, 800, CR.branco, { ls: 3 });
      });
    });
    reveal('Toda contratação começa por um escopo', 150, 860, 800, 52, CR.branco, E.outCubic(prog(lt, tE - 0.5, tE + 0.2)));
    reveal('o documento que o fornecedor recebe para cotar', 150, 930, 600, 34, CR.claro, E.outCubic(prog(lt, tD - 0.5, tD + 0.2)));
  },
};
CENAS['1.2'] = {
  marca: false,
  fn(lt, S) {
    crFundo(); rotulo('01 · O CONTEXTO', 'Como o escopo era feito nos Megas', prog(lt, 0, 0.5));
    const anos = [['2024', ['Muitos serviços', 'contratados sem escopo'], S.w('muitos')], ['2025', ['O escopo começa', 'a aparecer'], S.w('aparecer')],
      ['2026', ['Passa a ser', 'cumprido'], S.w('cumprido')]];
    anos.forEach(([a, l, t], i) => comCartao(prog(lt, t - 0.4, t + 0.2), () => {
      const x = 150 + i * 548; cartao(x, 280, 512, 380);
      txt(a, x + 44, 400, 84, 900, CR.dest); linhas(l, x + 44, 480, 32, 800, CR.tinta, 1.3);
    }));
    const tC = S.w('cada');
    comCartao(prog(lt, tC - 0.4, tC + 0.2), () => {
      rr(150, 730, 1620, 120, 20, 'rgba(224,123,36,0.16)', CR.lar, 3);
      txt('Mas cada Mega montava do seu jeito', 200, 808, 46, 800, CR.branco);
    });
    rodape('Relato escrito do gerente de Propriedades e Facilities, 14/10/2026.');
  },
};
CENAS['1.3'] = {
  marca: false, depois: 1.2,
  fn(lt, S) {
    crFundo(); rotulo('01 · O CONTEXTO', 'Escopos reais feitos sem o sistema', prog(lt, 0, 0.5));
    const tF = S.w('formatos'), tN = S.w('Nenhum'), tV = S.w('visita');
    [['A01', 'Itajaí'], ['A02', 'Esteio'], ['A03', 'Curitiba']].forEach(([a, m], i) => comCartao(prog(lt, 0.1 + i * 0.3, 0.6 + i * 0.3), () => {
      const x = 150 + i * 400, y = 250 + (i % 2) * 40;
      inteira(a, x, y, 360); txt('DOCUMENTO REAL · ' + m.toUpperCase(), x, y + 240, 17, 800, CR.claro, { ls: 2 });
    }));
    numero('3', ['formatos', 'de página'], 1380, 360, prog(lt, tF - 0.3, tF + 0.4));
    numero('0', ['com inclusões', 'e exclusões'], 1380, 600, prog(lt, tN - 0.3, tN + 0.4), CR.lar);
    numero('1', ['diz se a visita', 'é obrigatória'], 1380, 840, prog(lt, tV - 0.3, tV + 0.4), CR.lar);
    rodape('9 escopos reais (Itajaí 4, Esteio 2, Curitiba 3) reunidos em 15/10/2026; amostra escolhida pela área.');
  },
};

// ═════════ 2 · O PROBLEMA ═════════
CENAS['2.1'] = {
  marca: false, depois: 1.0,
  fn(lt, S) {
    crFundo(); rotulo('02 · O PROBLEMA', 'Nas propostas, as diferenças aparecem', prog(lt, 0, 0.5));
    const it = [['2 · 3 · 12', ['visitas por ano', 'no mesmo item'], S.w('Duas')], ['1 preço', ['para a mão de obra', 'inteira'], S.w('preco')],
      ['3,3×', ['lavagem do piso:', 'a mais cara × a mais barata'], S.w('lavagem')]];
    it.forEach(([n, l, t], i) => comCartao(prog(lt, t - 0.4, t + 0.2), () => {
      const x = 150 + i * 548; cartao(x, 300, 512, 440);
      txt(n, x + 44, 470, 88, 900, CR.tinta); linhas(l, x + 44, 560, 32, 700, CR.cinza, 1.35);
    }));
    rodape('Ofertas reais de manutenção: Facilities (ar-condicionado) e Propriedades (lavagem de piso, Mega Esteio). Sem nomes nem valores.');
  },
};
CENAS['2.2'] = {
  marca: false, depois: 1.2,
  fn(lt, S) {
    crFundo(); rotulo('02 · O PROBLEMA', '', 1);
    const t = S.w('explicito'), tS = S.w('setembro');
    reveal('O escopo precisa deixar', 960, 400, 800, 76, CR.branco, E.outCubic(prog(lt, 0.1, 0.8)), { align: 'center' });
    reveal('explícito o que se compara.', 960, 500, 800, 76, CR.claro, E.outCubic(prog(lt, t - 0.4, t + 0.3)), { align: 'center' });
    comCartao(prog(lt, tS - 0.4, tS + 0.2), () => {
      cartao(510, 640, 900, 150);
      txt('COMITÊ · 11/09/2026', 560, 700, 22, 800, CR.dest, { ls: 3 });
      txt('Aprovado: começar pelo escopo', 560, 755, 42, 800, CR.tinta);
    });
    rodape('Reunião "Comitê: Concurso Melhor Ideia", 11/09/2026.');
  },
};

// ═════════ 3 · A SOLUÇÃO (telas reais) ═════════
CENAS['3.1'] = {
  marca: false, camViva: 0,
  fn(lt, S) {
    const t = S.w('servicos');
    crFundo(); rotulo('03 · A SOLUÇÃO', 'Um caminho guiado no sistema', prog(lt, 0, 0.5));
    ctx.save(); const e = ent(lt); ctx.translate(0, (1 - e) * 60); ctx.globalAlpha *= e;
    crJanela('Escopo · PPCI do prédio de apoio · Mega Itajaí');
    const cam = [keys(lt, [[0, 260], [t, 270]]), keys(lt, [[0, 60], [t, 100]]), keys(lt, [[0, 1420], [t, 1380]])];
    crTela('E01', cam);
    crDestaque(cam, [296, 150, 1608, 354], prog(lt, t - 0.3, t + 0.3), 'SERVIÇOS POR LOCAL');
    ctx.restore();
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
  },
};
CENAS['3.4'] = {
  marca: false, depois: 1.0,
  fn(lt, S) {
    const tA = S.w('apresentacao'), tP = S.w('PDF'), tPl = S.w('planilha');
    crFundo(); rotulo('03 · A SOLUÇÃO', 'Do mesmo cadastro saem três documentos', prog(lt, 0, 0.5));
    comCartao(prog(lt, tA - 0.3, tA + 0.3), () => { txt('APRESENTAÇÃO', 150, 300, 20, 800, CR.claro, { ls: 3 }); recorte('D02', 473, 20, 960, 330, 150, 320, 520); });
    comCartao(prog(lt, tP - 0.3, tP + 0.3), () => { txt('PDF', 700, 300, 20, 800, CR.claro, { ls: 3 }); recorte('E03', 473, 180, 960, 470, 700, 320, 520); });
    comCartao(prog(lt, tPl - 0.3, tPl + 0.3), () => { txt('PLANILHA PARA O FORNECEDOR', 1250, 300, 20, 800, CR.claro, { ls: 3 }); recorte('D90', 44, 160, 1566, 770, 1250, 320, 520); });
    rodape('Documentos reais gerados pelo sistema: PPCI do prédio de apoio, Mega Itajaí, revisão 9 (22/09/2026).');
  },
};
CENAS['3.5'] = {
  marca: false, depois: 1.2,
  fn(lt, S) {
    crFundo(); rotulo('03 · A SOLUÇÃO', 'Todo escopo do sistema sai no mesmo padrão', prog(lt, 0, 0.5));
    const it = [['A mesma estrutura', S.w('estrutura')], ['Os prazos da proposta', S.w('prazos')], ['A revisão em cada página', S.w('revisao')]];
    it.forEach(([s, t], i) => comCartao(prog(lt, t - 0.4, t + 0.2), () => {
      const y = 290 + i * 190; cartao(150, y, 1620, 150);
      txt(s, 210, y + 95, 48, 800, CR.tinta);
      rr(1480, y + 40, 230, 70, 35, '#E8F1FB'); txt('4 de 4', 1595, y + 88, 36, 900, CR.dest, { align: 'center' });
    }));
    rodape('Leitura dos 4 escopos reais emitidos pelo sistema (PDFs), em 15/10/2026.');
  },
};

// ═════════ 4 · UM SÓ LUGAR ═════════
CENAS['4.1'] = {
  marca: false, camViva: 0,
  fn(lt, S) {
    const tL = S.w('lugar'), tP = S.w('pasta');
    crFundo(); rotulo('04 · UM SÓ LUGAR', 'Todos os escopos num só lugar', prog(lt, 0, 0.5));
    ctx.save(); const e = ent(lt); ctx.translate(0, (1 - e) * 60); ctx.globalAlpha *= e;
    crJanela('Escopos · início');
    const cam = [keys(lt, [[0, 254], [tL, 260]]), keys(lt, [[0, 224], [tL, 240]]), keys(lt, [[0, 1400], [tL, 1360]])];
    crTela('C01', cam);
    ctx.restore();
    comCartao(prog(lt, tP - 0.6, tP), () => {
      cartao(1020, 760, 760, 170, { fill: CR.larF });
      txt('ANTES', 1060, 815, 20, 800, CR.lar, { ls: 3 });
      txt('Esqueceu de salvar na pasta,', 1060, 862, 32, 800, CR.tinta); txt('o escopo se perdia.', 1060, 904, 32, 800, CR.tinta);
    });
  },
};
CENAS['4.2'] = {
  marca: false,
  fn(lt, S) {
    crFundo(); rotulo('04 · UM SÓ LUGAR', 'O próximo parte de um já emitido', 1);
    const vem = [['Serviços', S.w('servicos')], ['Lista de itens', S.w('lista')], ['Inclusões', S.w('inclusoes')], ['Exclusões', S.w('exclusoes')], ['Aceite', S.w('aceite')]];
    txt('VÊM DO ESCOPO BASE', 150, 420, 22, 800, CR.claro, { ls: 3 });
    let x = 150; vem.forEach(([s, t]) => { const q = E.outBack(clamp(prog(lt, t - 0.2, t + 0.3))); if (q > 0) { ctx.save(); ctx.globalAlpha *= clamp(q); x += pilula(s, x, 460, CR.branco, CR.royal, 34) + 22; ctx.restore(); } });
    rodape('Função "Usar como base" do sistema.');
  },
};

// ═════════ 5 · TESTES REAIS ═════════
CENAS['5.1'] = {
  marca: false,
  fn(lt, S) {
    const tFa = S.w('Facilities'), tPr = S.w('Propriedades');
    crFundo(); rotulo('05 · TESTES REAIS', 'Testado em escopos reais por duas áreas', prog(lt, 0, 0.5));
    [['Facilities', 'Mega Itajaí', '3', tFa, 'F02'], ['Propriedades', 'Mega Curitiba', '1', tPr, 'F01']].forEach(([a, b, n, t, f], i) => {
      comCartao(prog(lt, t - 0.4, t + 0.2), () => {
        const x = 150 + i * 830; cartao(x, 280, 790, 560);
        foto(f, x, 280, 790, 260, 0.2, 20);
        txt(n, x + 50, 690, 130, 900, CR.dest); txt(n === '1' ? 'escopo real' : 'escopos reais', x + 160, 680, 32, 700, CR.cinza);
        txt(a, x + 50, 780, 48, 900, CR.tinta); txt(b, x + 50, 822, 28, 600, CR.cinza);
      });
    });
    rodape('Tela Escopos em produção, recontada em 15/10/2026: 4 reais; os outros 4 da base foram teste ou exemplo.');
  },
};
CENAS['5.2'] = {
  marca: false, depois: 1.4,
  fn(lt, S) {
    crFundo(); rotulo('05 · TESTES REAIS', 'Facilities do Mega Itajaí, passada a adaptação', prog(lt, 0, 0.5));
    const tA = S.w('adaptacao'), tP = S.w('padronizado'), tM = S.w('medido');
    [['“No começo a gente se bateu… depois que', 'o pessoal pegar vai ser bem top.”', tA], ['“Fica muito mais padronizado. A gente não', 'precisa ficar configurando slide.”', tP]].forEach(([l1, l2, t], i) => {
      comCartao(prog(lt, t - 0.5, t + 0.1), () => {
        const y = 290 + i * 230; cartao(150, y, 1620, 190);
        txt(l1, 210, y + 85, 40, 700, CR.tinta); txt(l2, 210, y + 140, 40, 700, CR.tinta);
      });
    });
    comCartao(prog(lt, tM - 0.5, tM + 0.1), () => { pilula('percepção, não medição · tempo não cronometrado', 150, 790, CR.larF, CR.lar, 26); });
    rodape('Conversa com Facilities, Mega Itajaí, 14/10/2026 (transcrição do Google Meet); trechos literais, sem nome.');
  },
};

// ═════════ 6 · FECHO ═════════
CENAS['6.1'] = {
  marca: false, depois: 2.2, camViva: 0,
  fn(lt, S) {
    const tU = S.w('padrao'), tG = S.w('Gestao'), tCo = S.w('Comecar'), tCt = S.w('Contratar');
    crFundo();
    foto('F04', 1160, 0, 760, 1080, 0.35, 0);
    reveal('Um padrão de escopo', 150, 330, 800, 56, CR.branco, E.outCubic(prog(lt, tU - 0.6, tU + 0.1)));
    reveal('para a empresa toda.', 150, 400, 800, 56, CR.claro, E.outCubic(prog(lt, tU, tU + 0.6)));
    const a = prog(lt, tG - 0.4, tG + 0.4);
    if (a > 0) { const n = M('L01'), im = IMGS[n]; if (im && im.complete) { ctx.save(); ctx.globalAlpha *= a; const w = 380, h = w * im.naturalHeight / im.naturalWidth; ctx.drawImage(im, 150, 500, w, h); ctx.restore(); } }
    reveal('Começar melhor.', 150, 720, 800, 80, CR.branco, E.outCubic(prog(lt, tCo - 0.4, tCo + 0.2)));
    reveal('Contratar melhor.', 150, 820, 800, 80, CR.claro, E.outCubic(prog(lt, tCt - 0.4, tCt + 0.2)));
    const b = prog(lt, tCt + 0.3, tCt + 0.9);
    if (b > 0) { ctx.save(); ctx.globalAlpha *= b; txt('Guilherme August · Planejamento e Gestão · Capital Realty · Melhor Ideia 2026', 150, 920, 24, 500, CR.mudo); ctx.restore(); }
  },
};
