// ═════════════ DESIGN SYSTEM EDITORIAL · vídeos longos do Jacaré ═════════════
// Documentação e regras de uso: longos/DESIGN-SYSTEM.md (criado em 28/09/2026).
// O gerar.py injeta este arquivo em todo player, antes das cenas. Um projeto usa se quiser;
// nada aqui desenha sozinho, exceto SOBREPOR (apresentador + rótulos de canto), que só age
// em cenas que declaram `tema`.

const ED = {
  f: {
    sans: '"Geist","Montserrat",system-ui,sans-serif',
    serif: '"Instrument Serif",Georgia,serif',
    mono: '"Geist Mono",ui-monospace,Consolas,monospace',
    maquina: '"Special Elite","Courier New",monospace',  // formato dossiê
    mao: '"Patrick Hand","Comic Sans MS",cursive',  // letra de mão (formato rabisco)
  },
  // Escala de tipo, em px de 1920×1080. A serifa itálica sai 15% maior que a sans do mesmo nível
  // (a Instrument Serif tem olho pequeno e parece menor).
  tam: { gigante: 210, xl: 124, l: 104, m: 72, s: 56, corpo: 40, sobre: 26, canto: 21 },
  serifa: 1.15,
  margem: 150,   // margem esquerda do texto
  canto: 44,     // distância dos rótulos de canto até a borda
  raio: 28,      // canto dos cartões
  celula: 3,     // tamanho do "pixel" do pontilhado, em px. Igual em tudo: personagem, fotos e vídeos
};

// Um tema por capítulo (ou por cena). `destaque` é a cor da serifa itálica, do anel do apresentador
// e dos dados; `claro` é o destaque diluído (áreas de gráfico).
const TEMAS = {
  papel:  { fundo: '#F3F3EF', ponto: 'rgba(21,25,29,0.08)', tinta: '#15191D', mudo: '#70767C', destaque: '#2F7A45',
            claro: '#D9EADC', cartao: '#FFFFFF', borda: 'rgba(21,25,29,0.10)' },
  agua:   { fundo: '#D8ECE7', ponto: 'rgba(14,90,82,0.11)', tinta: '#11221F', mudo: '#557069', destaque: '#0E6B62',
            claro: '#BFE0D9', cartao: '#FFFFFF', borda: 'rgba(14,107,98,0.16)' },
  terra:  { fundo: '#F1E5D5', ponto: 'rgba(120,70,20,0.10)', tinta: '#231A12', mudo: '#7D6A55', destaque: '#A4531D',
            claro: '#EBD3B6', cartao: '#FFFFFF', borda: 'rgba(164,83,29,0.16)' },
  rocha:  { fundo: '#E1E5EC', ponto: 'rgba(40,60,100,0.10)', tinta: '#161B24', mudo: '#646F80', destaque: '#34528A',
            claro: '#C8D2E4', cartao: '#FFFFFF', borda: 'rgba(52,82,138,0.16)' },
  alerta: { fundo: '#F2DFDB', ponto: 'rgba(140,40,30,0.10)', tinta: '#241513', mudo: '#7E5E58', destaque: '#A53A2E',
            claro: '#EBC5BE', cartao: '#FFFFFF', borda: 'rgba(165,58,46,0.16)' },
  vivo:   { fundo: '#2A55D6', ponto: 'rgba(255,255,255,0.10)', tinta: '#FFFFFF', mudo: 'rgba(255,255,255,0.72)', destaque: '#FFD84D',
            claro: '#3D68E3', cartao: '#FFFFFF', borda: 'rgba(255,255,255,0.20)' },
  noite:  { fundo: '#0D1012', ponto: 'rgba(255,255,255,0.07)', tinta: '#F0F1EC', mudo: '#858B90', destaque: '#8BD068',
            claro: '#1D2A1F', cartao: '#171B1E', borda: 'rgba(255,255,255,0.10)' },
};
const edTema = t => typeof t === 'string' ? TEMAS[t] : (t || TEMAS.papel);

// ───────── tipografia ─────────
function edFonte(f, tam, peso) {
  return `${f === 'serif' ? 'italic ' : ''}${peso ?? (f === 'serif' || f === 'maquina' || f === 'mao' ? 400 : f === 'mono' ? 500 : 600)} ${tam}px ${ED.f[f]}`;
}
const edLs = (f, tam) => f === 'sans' ? -tam * 0.035 : f === 'mono' ? tam * 0.02 : f === 'maquina' || f === 'mao' ? 0 : -tam * 0.01;
function edTxt(s, x, y, f, tam, cor, o = {}) {
  ctx.font = edFonte(f, tam, o.peso);
  ctx.letterSpacing = (o.ls ?? edLs(f, tam)) + 'px';
  ctx.fillStyle = cor; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
  const w = ctx.measureText(s).width;
  ctx.letterSpacing = '0px';
  return w;
}
function edMedir(s, f, tam, o = {}) {
  ctx.font = edFonte(f, tam, o.peso); ctx.letterSpacing = (o.ls ?? edLs(f, tam)) + 'px';
  const w = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return w;
}

// Rótulo mono ("// rio-niterói · 1974"). o = {p (0..1 entrada), tam, cor, align}
function edMono(s, x, y, tema, o = {}) {
  const T = edTema(tema), p = o.p ?? 1; if (p <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.5);
  edTxt(s, x + (1 - E.outCubic(p)) * -12, y, 'mono', o.tam || ED.tam.sobre, o.cor || T.mudo, { align: o.align });
  ctx.restore();
}

// Frase editorial: cada palavra entra no instante em que é dita (sobe um pouco e sai do desfoque).
// linhas = [[seg, seg...], ...]; seg = {t, f: 'sans'|'serif', tam, cor, em: 'palavra falada', k}
//   - `em` prende o segmento a outra palavra da fala (ex.: "1.138" → em: 'mil')
// o = {tema, tam (sans), entre (altura da linha, em múltiplos do tam), agora (ignora a fala: tudo já na tela)}
function edFrase(linhas, x, y, lt, S, o = {}) {
  const T = edTema(o.tema), base = o.tam || ED.tam.l, vistos = {};
  let yy = y;
  linhas.forEach((linha, li) => {
    let xx = x, maior = 0;
    linha.forEach(seg => {
      const f = seg.f || 'sans', tam = (seg.tam || base) * (f === 'serif' ? ED.serifa : 1);
      const cor = seg.cor || (f === 'serif' ? T.destaque : T.tinta);
      maior = Math.max(maior, tam);
      const pals = seg.t.split(/(\s+)/);
      let n = 0;
      for (const w of pals) {
        if (!w) continue;
        if (/^\s+$/.test(w)) { xx += edMedir(w, f, tam); continue; }
        let tw;
        if (o.agora) tw = -1;
        else if (seg.em) tw = S.w(seg.em, seg.k || 0) + n * 0.09;
        else { const k = norm(w); vistos[k] = (vistos[k] ?? -1) + 1; tw = S.w(w, vistos[k]); }
        n++;
        const e = E.outCubic(prog(lt, tw - 0.1, tw + 0.32));
        if (e > 0) {
          ctx.save();
          ctx.globalAlpha *= e;
          if (e < 1) ctx.filter = `blur(${((1 - e) * 9).toFixed(1)}px)`;
          edTxt(w, xx, yy + (1 - e) * tam * 0.16, f, tam, cor);
          ctx.restore();
        }
        xx += edMedir(w, f, tam);
      }
    });
    yy += (li < linhas.length - 1 ? 1 : 0) * Math.max(base, maior) * (o.entre || 1.06);
  });
}

// Número que conta, com dígitos em casas de largura fixa (não "dança" enquanto sobe)
function edContador(valor, x, y, tam, p, o = {}) {
  if (p <= 0) return;
  const T = edTema(o.tema), cor = o.cor || T.tinta;
  const s = fmtN(valor * E.outCubic(clamp(p))), casa = edMedir('0', 'sans', tam, { ls: 0, peso: 600 });
  ctx.save(); ctx.globalAlpha *= clamp(p * 4);
  let xx = x;
  for (const ch of s) {
    const dig = /\d/.test(ch), w = dig ? casa : edMedir(ch, 'sans', tam, { ls: 0, peso: 600 });
    edTxt(ch, xx + (dig ? casa / 2 : 0), y, 'sans', tam, cor, { ls: 0, peso: 600, align: dig ? 'center' : 'left' });
    xx += w - tam * 0.02;
  }
  ctx.restore();
}

// ───────── superfícies ─────────
// Fundo do tema com a grade de pontos (a "folha quadriculada" do estilo)
function edFundo(tema, o = {}) {
  const T = edTema(tema);
  ctx.fillStyle = T.fundo; ctx.fillRect(0, 0, W, H);
  if (o.grade === false) return;
  ctx.fillStyle = T.ponto;
  const e = 44;
  for (let y = e / 2; y < H; y += e) for (let x = e / 2; x < W; x += e) ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
}
// Cartão: entra subindo. desenhar(b) recebe a caixa já deslocada e com recorte nos cantos arredondados.
function edCartao(box, tema, p, desenhar) {
  if (p <= 0) return;
  const T = edTema(tema), e = E.outCubic(clamp(p));
  const b = { x: box.x, y: box.y + (1 - e) * 36, w: box.w, h: box.h };
  ctx.save(); ctx.globalAlpha *= clamp(p * 2);
  ctx.shadowColor = 'rgba(10,20,20,0.10)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  rr(b.x, b.y, b.w, b.h, ED.raio, T.cartao);
  ctx.shadowColor = 'transparent';
  rr(b.x, b.y, b.w, b.h, ED.raio, null, T.borda, 2);
  if (desenhar) {
    ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, ED.raio); ctx.clip();
    desenhar(b);
  }
  ctx.restore();
}

// Rótulos dos cantos: "// 01 — rio-niterói" e "O JACARÉ 00:01:12:04" (timecode do vídeo)
function edTimecode(t) {
  const f = Math.floor((t % 1) * FPS), s = Math.floor(t) % 60, m = Math.floor(t / 60) % 60, h = Math.floor(t / 3600);
  return [h, m, s, f].map(v => String(v).padStart(2, '0')).join(':');
}
function edCantos(t, s, tema) {
  const T = edTema(tema), def = CENAS[s.id], y = ED.canto + 12;
  ctx.save(); ctx.globalAlpha = 0.9;
  if (def.rotulo) edTxt(`// ${String(s.cap).padStart(2, '0')} — ${def.rotulo}`, ED.canto, y, 'mono', ED.tam.canto, T.mudo);
  edTxt(`O JACARÉ   ${edTimecode(t)}`, W - ED.canto, y, 'mono', ED.tam.canto, T.mudo, { align: 'right' });
  ctx.restore();
}

// ───────── pontilhado (dither ordenado Bayer 8×8) ─────────
const BAYER8 = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21];
const _PT = {};
const edRgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
// Desenha em baixa resolução (w×h = tamanho final / ED.celula), converte para 2 cores e devolve o canvas.
// o = {tinta, papel (null = transparente no claro), contraste, brilho, gama, mapa, sombra, inverter}.
// Com `mapa(g, w, h)` (o mesmo desenho em cor chapada): ponto claro = a cor do mapa, ponto escuro = a cor
// escurecida (misturada com a tinta na proporção `sombra`, 0,62). O que for transparente continua transparente.
function pontilhar(id, w, h, desenhar, o = {}) {
  w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
  let P = _PT[id];
  if (!P) {
    P = _PT[id] = { src: document.createElement('canvas'), out: document.createElement('canvas') };
    P.sg = P.src.getContext('2d', { willReadFrequently: true }); P.og = P.out.getContext('2d');
    P.map = document.createElement('canvas'); P.mg = P.map.getContext('2d', { willReadFrequently: true });
  }
  if (P.src.width !== w || P.src.height !== h) {
    P.src.width = P.out.width = P.map.width = w; P.src.height = P.out.height = P.map.height = h;
  }
  let md = null;
  if (o.mapa) {
    P.mg.setTransform(1, 0, 0, 1, 0, 0); P.mg.clearRect(0, 0, w, h);
    P.mg.save(); o.mapa(P.mg, w, h); P.mg.restore();
    md = P.mg.getImageData(0, 0, w, h).data;
  }
  const sm = o.sombra ?? 0.62;
  P.sg.setTransform(1, 0, 0, 1, 0, 0); P.sg.clearRect(0, 0, w, h);
  P.sg.save(); desenhar(P.sg, w, h); P.sg.restore();
  const img = P.sg.getImageData(0, 0, w, h), d = img.data;
  const ti = edRgb(o.tinta || '#121416'), pa = o.papel ? edRgb(o.papel) : null;
  const c = o.contraste ?? 1.2, br = o.brilho ?? 0, gm = o.gama ?? 1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (d[i + 3] < 110) { d[i + 3] = 0; continue; }
    let L = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
    L = clamp((L - 0.5) * c + 0.5 + br); if (gm !== 1) L = Math.pow(L, gm);
    if (o.inverter) L = 1 - L;
    const escuro = L < (BAYER8[(y & 7) * 8 + (x & 7)] + 0.5) / 64;
    if (md) {
      const k = escuro ? sm : 0;
      d[i] = md[i] * (1 - k) + ti[0] * k; d[i + 1] = md[i + 1] * (1 - k) + ti[1] * k; d[i + 2] = md[i + 2] * (1 - k) + ti[2] * k;
      d[i + 3] = 255; continue;
    }
    const cor = escuro ? ti : pa;
    if (!cor) { d[i + 3] = 0; continue; }
    d[i] = cor[0]; d[i + 1] = cor[1]; d[i + 2] = cor[2]; d[i + 3] = 255;
  }
  P.og.putImageData(img, 0, 0);
  return P.out;
}
function edPixelado(cv, x, y, w, h) {
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(cv, x, y, w, h); ctx.restore();
}
// Foto ou vídeo pontilhado dentro de uma caixa, nas cores do tema (tinta sobre cartão).
// o = {zoom, x, y (ponto focal 0..1), tl (tempo do vídeo), tinta, papel, contraste, brilho, suave (desfoque em px antes, 0.6)}
function edMidiaPontilhada(pref, box, tema, o = {}) {
  const T = edTema(tema), n = M(pref), m = MANIFESTO[n];
  if (m.tipo === 'video' && COLETA) { COLETA.push([n, clamp(o.tl || 0, 0, m.dur - 0.05)]); return; }
  const src = m.tipo === 'video' ? VIDS[n] : IMGS[n];
  if (!src || (m.tipo === 'foto' && !src.complete) || (m.tipo === 'video' && src.readyState < 2)) return;
  const sw = m.tipo === 'video' ? 1920 : src.naturalWidth, sh = m.tipo === 'video' ? 1080 : src.naturalHeight;
  const cv = pontilhar('m:' + (o.id || pref), box.w / ED.celula, box.h / ED.celula, (g, w, h) => {
    const s = Math.max(w / sw, h / sh) * (o.zoom || 1), dw = sw * s, dh = sh * s;
    if (o.suave !== 0) g.filter = `blur(${o.suave ?? 0.6}px)`;  // tira o grão da foto antes de pontilhar
    g.drawImage(src, (w - dw) * (o.x ?? 0.5), (h - dh) * (o.y ?? 0.5), dw, dh);
  }, { tinta: o.tinta || T.destaque, papel: o.papel || T.cartao, contraste: o.contraste ?? 1.25, brilho: o.brilho ?? 0.04 });
  edPixelado(cv, box.x, box.y, box.w, box.h);
}

// ───────── o apresentador: o jacaré ─────────
// Caixa de 1000×1000: corpo de frente, cabeça em 3/4 com o focinho apontando para a esquerda (para o texto).
// Desenhado duas vezes com a mesma geometria: `cor = false` pinta a luz (cinzas, decide onde cai o ponto escuro)
// e `cor = true` pinta as regiões em cor chapada (JCOR). O pontilhado junta as duas: ponto claro = a cor da
// região, ponto escuro = a mesma cor escurecida. e = {boca, piscar, olhar {x,y}, sobr, aceno, fase}
const cz = v => { const k = Math.round(clamp(v) * 255); return `rgb(${k},${k},${k})`; };
const JCOR = {
  pele: '#5FAE4E', escama: '#3F7F35', escamaLuz: '#93D072', focinhoLuz: '#98D677', barriga: '#D8E59C',
  camisa: '#F07A2A', bolso: '#B4501A', gola: '#C95E1E', boca: '#4A1A1C', lingua: '#E46F7C',
  escuro: '#0F1411', branco: '#FFFFFF', dentesLinha: '#9AA59A', sobr: '#1E3A1A',
  capacete: '#F2C230', capaceteSombra: '#C9961B', lanterna: '#FFF6C8', chapeu: '#5A4636', fita: '#241C16',
};
const JAC = { cx: 470, cy: 390 };  // centro visual da cabeça (é ele que vai para o centro do círculo)
function desenhaJacare(g, e, cor = false) {
  const boca = clamp(e.boca || 0), ang = boca * 0.3, ol = e.olhar || { x: 0, y: 0 };
  const radial = (x, y, r, a, b, k) => {
    if (cor) return JCOR[k];
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, cz(a)); gr.addColorStop(1, cz(b)); return gr;
  };
  const tom = (v, k) => cor ? JCOR[k] : cz(v);
  const elipse = (x, y, rx, ry) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); };
  const HX = 660, HY = 470;                                  // dobradiça da mandíbula
  const rot = (x, y) => {  // gira um ponto junto com a mandíbula (sentido anti-horário = a ponta desce)
    const dx = x - HX, dy = y - HY, c = Math.cos(-ang), sn = Math.sin(-ang);
    return [HX + dx * c - dy * sn, HY + dx * sn + dy * c];
  };
  const qb = (a, c, b, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
  const linhaBoca = t => [qb(650, 430, 205, t), qb(470, 512, 484, t)];  // borda de baixo do focinho
  const pele = radial(500, 290, 560, 0.86, 0.44, 'pele');

  // corpo: camiseta com bolso
  elipse(500, 1010, 390, 300); g.fillStyle = radial(420, 780, 520, 0.66, 0.38, 'camisa'); g.fill();
  g.strokeStyle = tom(0.2, 'bolso'); g.lineWidth = 9; g.strokeRect(590, 850, 105, 95);
  // braço que acena (lado direito da tela; o focinho ocupa o esquerdo): ombro → cotovelo → mão, o antebraço balança
  if (e.aceno > 0) {
    const a = E.outCubic(clamp(e.aceno)), w = Math.sin(e.fase * 9) * 0.32 * a;
    const ox = 730, oy = 820, ex = lerp(760, 850, a), ey = lerp(1000, 735, a);
    const fx = lerp(760, 0, a) + a * (ex + Math.sin(w) * 165), fy = lerp(1150, 0, a) + a * (ey - Math.cos(w) * 165);
    g.strokeStyle = tom(0.52, 'camisa'); g.lineWidth = 74; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(ox, oy); g.lineTo(ex, ey); g.lineTo(fx, fy); g.stroke();
    g.fillStyle = radial(fx - 15, fy - 15, 80, 0.85, 0.55, 'pele');
    elipse(fx, fy - 20, 50, 54); g.fill();
    for (let k = -1; k <= 1; k++) { elipse(fx + k * 29, fy - 70 + Math.abs(k) * 12, 16, 21); g.fill(); }
  }
  // pescoço e gola
  g.fillStyle = tom(0.55, 'pele'); g.fillRect(450, 560, 200, 190);
  elipse(520, 742, 175, 42); g.fillStyle = tom(0.3, 'gola'); g.fill();

  // crânio e escamas da nuca
  elipse(600, 395, 205, 190); g.fillStyle = pele; g.fill();
  for (const [x, y, r] of [[690, 245, 22], [742, 292, 21], [775, 350, 19], [785, 410, 16]]) {
    elipse(x, y, r, r * 0.82); g.fillStyle = tom(0.5, 'escama'); g.fill();
    elipse(x - r * 0.25, y - r * 0.3, r * 0.4, r * 0.3); g.fillStyle = tom(0.84, 'escamaLuz'); g.fill();
  }
  // boca aberta: cavidade escura entre a borda do focinho e a mandíbula girada
  if (boca > 0.02) {
    g.save(); g.beginPath();
    for (let k = 0; k <= 12; k++) { const [x, y] = linhaBoca(k / 12); k ? g.lineTo(x, y) : g.moveTo(x, y); }
    for (let k = 12; k >= 0; k--) { const [x, y] = rot(...linhaBoca(k / 12)); g.lineTo(x, y + 2); }
    g.closePath(); g.fillStyle = tom(0.06, 'boca'); g.fill(); g.clip();
    const [lx, ly] = rot(420, 520); elipse(lx, ly, 150, 34); g.fillStyle = tom(0.55, 'lingua'); g.fill();  // língua
    g.restore();
  }
  // mandíbula (gira na dobradiça)
  g.save(); g.translate(HX, HY); g.rotate(-ang); g.translate(-HX, -HY);
  g.beginPath(); g.moveTo(655, 468); g.quadraticCurveTo(430, 512, 205, 486);
  g.bezierCurveTo(176, 492, 172, 532, 214, 548); g.quadraticCurveTo(440, 604, 650, 585); g.closePath();
  g.fillStyle = radial(420, 520, 300, 0.8, 0.5, 'barriga'); g.fill();
  g.restore();
  elipse(668, 505, 64, 98); g.fillStyle = pele; g.fill();  // bochecha: esconde a dobradiça quando a boca abre
  // focinho (parte de cima), na mesma pele do crânio para não aparecer emenda
  g.beginPath(); g.moveTo(720, 320);
  g.bezierCurveTo(560, 300, 390, 328, 250, 348);
  g.bezierCurveTo(172, 358, 128, 400, 138, 440);
  g.bezierCurveTo(143, 468, 168, 484, 205, 484);
  g.quadraticCurveTo(430, 512, 650, 470); g.lineTo(740, 430); g.closePath();
  g.fillStyle = pele; g.fill();
  // calombos no focinho e a narina na ponta
  for (const [x, y, r] of [[300, 350, 13], [352, 342, 11], [405, 336, 10]]) { elipse(x, y, r, r * 0.7); g.fillStyle = tom(0.9, 'focinhoLuz'); g.fill(); }
  elipse(182, 376, 34, 24); g.fillStyle = radial(172, 366, 40, 0.95, 0.65, 'focinhoLuz'); g.fill();
  elipse(178, 373, 10, 6); g.fillStyle = tom(0.1, 'escuro'); g.fill();
  // sorriso: a linha da boca sobe na bochecha
  g.strokeStyle = tom(0.1, 'escuro'); g.lineWidth = 10; g.lineCap = 'round';
  g.beginPath(); g.moveTo(205, 484); g.quadraticCurveTo(430, 512, 650, 470); g.quadraticCurveTo(690, 455, 700, 425); g.stroke();
  // dentes em zigue-zague: de cima para baixo e de baixo para cima
  g.fillStyle = tom(1, 'branco'); g.strokeStyle = tom(0.35, 'dentesLinha'); g.lineWidth = 3;
  for (const t of [0.22, 0.38, 0.54, 0.7, 0.86]) {
    const [x, y] = linhaBoca(t);
    g.beginPath(); g.moveTo(x - 11, y - 3); g.lineTo(x + 11, y - 3); g.lineTo(x, y + 22); g.closePath(); g.fill(); g.stroke();
  }
  for (const t of [0.3, 0.46, 0.62, 0.78]) {
    const [x, y] = rot(...linhaBoca(t));
    g.beginPath(); g.moveTo(x - 10, y + 4); g.lineTo(x + 10, y + 4); g.lineTo(x, y - 18); g.closePath(); g.fill(); g.stroke();
  }
  // olhos em domos: o de trás menor
  for (const [x, y, r, sx, sy] of [[438, 282, 64, 40, 48], [578, 258, 86, 56, 62]]) {
    elipse(x, y, r, r * 0.96); g.fillStyle = radial(x - r * 0.3, y - r * 0.4, r * 1.5, 0.9, 0.52, 'pele'); g.fill();
    elipse(x, y + 6, sx, sy); g.fillStyle = tom(1, 'branco'); g.fill();
    const px = x - sx * 0.22 + ol.x * sx * 0.35, py = y + 10 + ol.y * sy * 0.25;
    elipse(px, py, sx * 0.56, sy * 0.58); g.fillStyle = tom(0.04, 'escuro'); g.fill();
    elipse(px - sx * 0.2, py - sy * 0.22, sx * 0.18, sx * 0.18); g.fillStyle = tom(1, 'branco'); g.fill();
    const fecha = Math.max(e.piscar || 0, (e.dor || 0) * 0.58);  // dor = olhos apertados
    if (fecha > 0) {
      g.save(); elipse(x, y + 6, sx + 2, sy + 2); g.clip();
      g.fillStyle = tom(0.62, 'pele'); g.fillRect(x - sx - 4, y + 6 - sy - 4, 2 * sx + 8, (2 * sy + 8) * clamp(fecha));
      g.restore();
    }
  }
  // sobrancelhas
  const sb = (e.sobr || 0) * 18, dr = (e.dor || 0) * 30;  // na dor, as pontas de dentro descem (franzido)
  g.strokeStyle = tom(0.12, 'sobr'); g.lineWidth = 20; g.lineCap = 'round';
  g.beginPath(); g.moveTo(395, 212 - sb - dr * 0.3); g.quadraticCurveTo(430, 196 - sb * 1.2, 468, 204 - sb + dr); g.stroke();
  g.beginPath(); g.moveTo(522, 172 - sb + dr); g.quadraticCurveTo(575, 150 - sb * 1.2, 632, 166 - sb - dr * 0.3); g.stroke();
  // chapéus (e.chapeu): capacete de obra ou chapéu de detetive
  if (e.chapeu === 'capacete') {
    g.save(); g.beginPath(); g.rect(0, 0, 1000, 168); g.clip();
    elipse(615, 172, 205, 128); g.fillStyle = radial(560, 90, 260, 0.92, 0.6, 'capacete'); g.fill();
    g.restore();
    g.strokeStyle = tom(0.55, 'capaceteSombra'); g.lineWidth = 16;
    g.beginPath(); g.moveTo(615, 50); g.lineTo(615, 165); g.stroke();
    elipse(600, 172, 262, 30); g.fillStyle = radial(560, 160, 280, 0.85, 0.55, 'capacete'); g.fill();
    elipse(440, 112, 34, 30); g.fillStyle = tom(1, 'lanterna'); g.fill();
  } else if (e.chapeu === 'detetive') {
    g.beginPath(); g.moveTo(470, 168); g.lineTo(500, 56); g.quadraticCurveTo(610, 30, 720, 56); g.lineTo(752, 168); g.closePath();
    g.fillStyle = radial(560, 70, 260, 0.5, 0.25, 'chapeu'); g.fill();
    g.fillStyle = tom(0.1, 'fita'); g.fillRect(476, 128, 272, 34);
    elipse(610, 172, 300, 34); g.fillStyle = radial(560, 165, 300, 0.45, 0.22, 'chapeu'); g.fill();
  }
}

// A pose do instante t: boca pela fala, piscada, balanço. o = {olhar, aceno (0..1), chapeu, dor (0..1), boca (força)}
function edPoseJacare(t, o = {}) {
  const boca = o.boca ?? edBoca(t);
  return { boca, piscar: edPiscar(t), olhar: o.olhar || { x: 0, y: 0 }, sobr: 0.25 + boca * 0.35, aceno: o.aceno || 0,
    fase: t, chapeu: o.chapeu, dor: o.dor || 0 };
}
// Desenha o jacaré pontilhado numa caixa quadrada (x, y, tam). est = {id, pb, tinta, papel, inverter}
// (OPCOES.jacarePB = true volta à versão preto e branco em todo o vídeo)
function edJacare(x, y, tam, ej, est = {}) {
  const pose = cor => (gg, w) => {
    gg.scale(w / 1000, w / 1000);
    gg.translate(500, 1000); gg.rotate(Math.sin(ej.fase * 0.9) * 0.018 + ej.boca * 0.01); gg.translate(-500, -1000);
    desenhaJacare(gg, ej, cor);
  };
  const pb = est.pb ?? OPCOES.jacarePB;
  const cv = pontilhar(est.id || 'jac', tam / ED.celula, tam / ED.celula, pose(false), {
    tinta: est.tinta || '#121416', papel: est.papel === undefined ? '#FFFFFF' : est.papel, contraste: 1.3,
    inverter: est.inverter, mapa: pb ? null : pose(true) });
  edPixelado(cv, x, y, tam, tam);
}

// Estados do apresentador. Cada cena declara `apres: 'grande' | 'circulo' | 'fora'`;
// na troca de cena ele viaja de um estado para o outro (0,9 s).
const APRES = {
  grande: { cx: 1400, topo: 70, tam: 1040 },
  circulo: { cx: 222, cy: 878, r: 146, tam: 372 },
};
function edGeomApres(nome) {
  if (nome === 'grande') {
    const a = APRES.grande, s = a.tam / 1000;
    return { x: a.cx - JAC.cx * s, y: a.topo, tam: a.tam, ccx: a.cx, ccy: a.topo + JAC.cy * s, r: 1400, disco: 0, alfa: 1 };
  }
  const a = APRES.circulo;
  return { x: a.cx - JAC.cx * a.tam / 1000, y: a.cy + 16 - JAC.cy * a.tam / 1000, tam: a.tam, ccx: a.cx, ccy: a.cy, r: nome === 'fora' ? 1 : a.r,
    disco: 1, alfa: nome === 'fora' ? 0 : 1 };
}
let _ED_PAL = null;
function edBoca(t) {  // abre e fecha por sílaba enquanto uma palavra é dita
  if (!_ED_PAL) _ED_PAL = LINHA.flatMap(s => s.pal);
  for (const p of _ED_PAL) {
    if (t < p.g - 0.02) break;
    if (t <= p.g + p.d + 0.02) {
      const n = Math.max(1, Math.round(norm(p.w).length / 2.6)), x = clamp((t - p.g) / Math.max(p.d, 0.08)) * n;
      return Math.pow(Math.sin(Math.PI * (x % 1)), 0.8) * (0.55 + 0.45 * edRnd(Math.floor(p.g * 10) + Math.floor(x)));
    }
  }
  return 0;
}
function edRnd(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function edPiscar(t) {
  const P = 3.4, k = Math.floor(t / P), l = t - k * P - (0.6 + edRnd(k) * 2.2);
  return l >= 0 && l < 0.17 ? Math.sin(Math.PI * l / 0.17) : 0;
}
function edApresentador(t, i) {
  const est = j => CENAS[LINHA[j].id].apres || 'fora', s = LINHA[i], nx = LINHA[i + 1], D = 0.45;
  let de = est(i), para = de, p = 0;
  if (i > 0 && t < s.a + D && est(i - 1) !== de) { para = de; de = est(i - 1); p = prog(t, s.a - D, s.a + D); }
  else if (nx && t > nx.a - D && est(i + 1) !== de) { para = est(i + 1); p = prog(t, nx.a - D, nx.a + D); }
  if (de === 'fora' && para === 'fora') return;
  const A = edGeomApres(de), B = edGeomApres(para), e = E.inOutCubic(p), L = k => lerp(A[k], B[k], e);
  const g = { x: L('x'), y: L('y'), tam: L('tam'), ccx: L('ccx'), ccy: L('ccy'), disco: Math.pow(L('disco'), 3), alfa: L('alfa'),
    r: Math.exp(lerp(Math.log(A.r), Math.log(B.r), e)) };
  if (g.alfa <= 0.01) return;
  const def = CENAS[s.id], T = edTema(def.tema), lt = t - s.a;
  const boca = edBoca(t), k = g.tam / 1000;
  const ac = def.aceno ? prog(lt, def.aceno[0], def.aceno[0] + 0.35) * (1 - prog(lt, def.aceno[1] - 0.35, def.aceno[1])) : 0;
  const olhar = para === 'circulo' && e > 0.5 ? { x: 0.35, y: 0.1 } : (def.olhar || { x: 0, y: 0 });
  const bob = (Math.sin(t * 1.7) * 6 - boca * 7) * k;
  const ej = edPoseJacare(t, { olhar, aceno: ac, chapeu: def.chapeu });
  ctx.save(); ctx.globalAlpha *= g.alfa;
  if (g.disco > 0) {
    ctx.save(); ctx.globalAlpha *= g.disco;
    ctx.beginPath(); ctx.arc(g.ccx, g.ccy, g.r, 0, TAU); ctx.fillStyle = T.claro; ctx.fill();
    ctx.restore();
  }
  ctx.save(); ctx.beginPath(); ctx.arc(g.ccx, g.ccy, g.r, 0, TAU); ctx.clip();
  edJacare(g.x, g.y + bob, g.tam, ej, { id: 'apres' });
  ctx.restore();
  if (g.disco > 0) {  // anel no destaque do tema, com a bolinha "ao vivo"
    ctx.globalAlpha *= g.disco;
    ctx.strokeStyle = T.destaque; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(g.ccx, g.ccy, g.r + 9, 0, TAU); ctx.stroke();
    const a = -Math.PI / 4, bx = g.ccx + Math.cos(a) * (g.r + 9), by = g.ccy + Math.sin(a) * (g.r + 9);
    ctx.beginPath(); ctx.arc(bx, by, 11, 0, TAU); ctx.fillStyle = T.fundo; ctx.fill(); ctx.lineWidth = 4; ctx.stroke();
  }
  ctx.restore();
}

// ───────── papel recortado (aprovado em 28/09 para os Shorts de todas as idades) ─────────
// Peça de papel: papel(() => { ...caminho... }, cor, {sombra, sb (desfoque da sombra), so (deslocamento)})
let _ruidoPapel = null;
function ruidoPapel() {
  if (_ruidoPapel) return _ruidoPapel;
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const im = g.createImageData(256, 256);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (edRnd(i * 0.37) - 0.5) * 90; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 30; }
  g.putImageData(im, 0, 0); _ruidoPapel = ctx.createPattern(c, 'repeat'); return _ruidoPapel;
}
// uma peça de papel: caminho(ctx) monta o formato; sombra deslocada para baixo e à direita, textura por cima
function papel(caminho, cor, o = {}) {
  ctx.save(); ctx.shadowColor = `rgba(80,40,12,${o.sombra ?? 0.34})`; ctx.shadowBlur = o.sb ?? 18; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = o.so ?? 9;
  ctx.beginPath(); caminho(); ctx.fillStyle = cor; ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); caminho(); ctx.clip();
  ctx.fillStyle = ruidoPapel(); ctx.fillRect(-200, -200, W + 400, H + 400);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3; ctx.beginPath(); caminho(); ctx.stroke();
  ctx.restore();
}
// círculo de papel com a borda levemente irregular (fixa, não treme)
function bolha(x, y, r, s) { for (let k = 0; k <= 30; k++) { const a = k / 30 * TAU, rr = r * (1 + (edRnd(s + k) - 0.5) * 0.06); k ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); }
function retang(x, y, w, h, r = 6) { ctx.roundRect(x, y, w, h, r); }
function morro(y0, amp, fase, s) { ctx.moveTo(-50, H + 900); for (let x = -50; x <= W + 50; x += 30) ctx.lineTo(x, y0 + Math.sin(x / 260 + fase) * amp + (edRnd(s + x) - 0.5) * 4); ctx.lineTo(W + 50, H + 900); ctx.closePath(); }
const pula = (lt, t) => { const p = prog(lt, t - 0.05, t + 0.45); return p > 0 && p < 1 ? Math.sin(p * Math.PI) * (1 - p) * 1.6 : 0; };


// ───────── legenda de Shorts ─────────
// Blocos de até 3 palavras; a palavra que está sendo dita acende em amarelo. Liga com OPCOES.legenda = {y, tam, max}.
// Zona segura dos Shorts: legenda em y ≈ 1330; nada importante à direita de x ≈ 960 entre y 1000 e 1700 (botões).
let _ED_GRUPOS = null;
function edLegenda(t, o = {}) {
  if (!_ED_PAL) _ED_PAL = LINHA.flatMap(s => s.pal);
  const P = _ED_PAL, max = o.max || 3;
  if (!_ED_GRUPOS) {
    _ED_GRUPOS = []; let g = [];
    P.forEach((w, k) => { g.push(k); const prox = P[k + 1];
      // 01/10/2026 (crítica do raio): não fecha o bloco num "não"/"nem"/"nunca" (lia "ATRAI O RAIO" sozinho, o contrário do que a voz diz)
      const neg = /^(n[aã]o|nem|nunca)[,.!?:;]*$/i.test(w.w);
      if (!prox || (!neg && (g.length >= max || prox.g - (w.g + w.d) > 0.1)) || g.length >= max + 1) { _ED_GRUPOS.push(g); g = []; } });  // quebra em qualquer pausa
  }
  let i = -1; for (let k = 0; k < P.length; k++) if (P[k].g <= t + 0.04) i = k;
  if (i < 0 || t > P[i].g + P[i].d + 0.5) return;
  const grupo = _ED_GRUPOS.find(g => g.includes(i)), tam = o.tam || 78, y = o.y || 1330;
  // 01/10/2026 (crítica 1 do avestruz): espaço maior (o contorno come ~12 px e a palavra que acende cresce) e largura
  // máxima de 860 px, para não grudar palavras nem entrar embaixo dos botões do Shorts/Reels/TikTok (x > 960)
  const pals = grupo.map(k => P[k].w.toUpperCase()), esp = tam * 0.42;
  let larg = pals.reduce((a, w) => a + edMedir(w, 'sans', tam, { peso: 800 }), 0) + esp * (pals.length - 1);
  const esc = Math.min(1, (o.larg || 860) / larg), tm = tam * esc; larg *= esc;
  let x = W / 2 - larg / 2;
  ctx.save(); ctx.lineJoin = 'round';
  grupo.forEach((k, j) => {
    const w = pals[j], ww = edMedir(w, 'sans', tm, { peso: 800 }), atual = k === i;
    const pop = atual ? 1 + 0.05 * (1 - clamp((t - P[k].g) / 0.15)) : 1;
    ctx.save(); ctx.translate(x + ww / 2, y); ctx.scale(pop, pop);
    ctx.font = edFonte('sans', tm, 800); ctx.letterSpacing = edLs('sans', tm) + 'px'; ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineWidth = tm * 0.16; ctx.strokeText(w, 0, 0);
    ctx.fillStyle = atual ? '#FFD84D' : '#FFFFFF'; ctx.fillText(w, 0, 0);
    ctx.letterSpacing = '0px'; ctx.restore();
    x += ww + esp * esc;
  });
  ctx.restore();
}

// ───────── marca-d'água de Shorts (01/10/2026, padrão do August Explica) ─────────
// Só o @ do canal, centralizado logo abaixo da legenda (referência: Shorts do @gutoexplicaespiritismo; o Guilherme
// aprovou "só o @", sem ícone). Fica fixa o vídeo inteiro. Liga com OPCOES.marcaHandle = '@augustexplica'.
// Sem logo do YouTube de propósito: o mesmo arquivo vai para Instagram e TikTok, e logo de outra rede derruba a entrega lá.
function edMarcaHandle(s) {
  const L = OPCOES.legenda || {}, tamL = L.tam || 78, tam = Math.round(tamL * 0.44), y = (L.y || 1330) + tamL * 0.78;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 0.78;
  ctx.font = edFonte('sans', tam, 700); ctx.letterSpacing = '0.5px'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  // branco com contorno escuro fino: legível no papel claro e na cena escura
  ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = tam * 0.14; ctx.strokeText(s, W / 2, y);
  ctx.fillStyle = '#FFFFFF'; ctx.fillText(s, W / 2, y);
  ctx.letterSpacing = '0px'; ctx.restore();
}

// Chamado pelo motor depois de cada quadro: apresentador e rótulos de canto (só em cenas com `tema`) e a legenda
function SOBREPOR(t, i) {
  const s = LINHA[i], def = CENAS[s.id];
  if (def.tema) {
    if (def.cantos !== false) edCantos(t, s, def.tema);
    edApresentador(t, i);
  }
  if (OPCOES.legenda && def.legenda !== false) edLegenda(t, OPCOES.legenda);
  if (OPCOES.marcaHandle && def.marcaHandle !== false) edMarcaHandle(OPCOES.marcaHandle);
}
