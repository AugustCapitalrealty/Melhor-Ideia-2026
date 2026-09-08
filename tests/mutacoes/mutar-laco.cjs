const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const arq = {
  eq: path.join(raiz, 'app', 'Equalizacao.gs'),
  ui: path.join(raiz, 'app', 'Interface.html'),
  cod: path.join(raiz, 'app', 'Codigo.gs')
};
const orig = {
  eq: fs.readFileSync(arq.eq, 'utf8'),
  ui: fs.readFileSync(arq.ui, 'utf8'),
  cod: fs.readFileSync(arq.cod, 'utf8')
};

const laco = path.join(raiz, 'tests', 'teste-laco-avaliacao.cjs');
const marca = path.join(raiz, 'tests', 'teste-marca-onthefly.cjs');

const mutacoes = [
  { a: 'eq', t: laco, nome: 'o servidor para de mandar o IQF junto do proponente',
    de: "        iqf: iqfs[cnpj] || null,\r\n", para: "" },
  { a: 'eq', t: laco, nome: 'quem nao tem avaliacao passa a vir com nota zero',
    de: "        iqf: iqfs[cnpj] || null,", para: "        iqf: iqfs[cnpj] || { nota: 0, avaliacoes: 0 }," },
  { a: 'ui', t: laco, nome: 'o cabecalho da tabela para de desenhar o selo',
    de: "           seloIqfColuna(p.iqf) + '</th>';", para: "           '</th>';" },
  { a: 'ui', t: laco, nome: 'o selo esconde que a nota e preliminar',
    de: "    (iqf.preliminar ? '<span class=\"iqf-col-prelim\">prelim.</span>' : '') + '</small>';",
    para: "    '</small>';" },
  { a: 'ui', t: laco, nome: 'sem avaliacao volta a sumir em vez de dizer "sem nota"',
    de: "    return '<small class=\"iqf-col vazio\" title=\"Nenhuma avaliação pós-serviço registrada\">sem nota</small>';",
    para: "    return '';" },
  { a: 'cod', t: marca, nome: 'a marca volta a nao ser gravada (sucesso silencioso)',
    de: "    props.setProperty('CF_CATALOGO_CONFIG', JSON.stringify(cfg));\r\n", para: "" },
  { a: 'cod', t: marca, nome: 'marca repetida em outra caixa vira uma segunda marca',
    de: "    if (!jaExiste) cfg.marcas.push({ nome: marca, origem: 'digitada na cotação' });",
    para: "    cfg.marcas.push({ nome: marca, origem: 'digitada na cotação' });" },
  { a: 'cod', t: marca, nome: 'marca vazia passa a ser aceita',
    de: "    if (!marca) return { ok: false, erro: 'Nome de marca vazio.' };", para: "" }
];

let ok = true;
mutacoes.forEach(function (m) {
  const o = orig[m.a];
  const n = o.split(m.de).length - 1;
  if (n !== 1) { console.log('!! ancora com ' + n + ': ' + m.nome); ok = false; return; }
  fs.writeFileSync(arq[m.a], o.replace(m.de, m.para), 'utf8');
  let pegou = false;
  try { execFileSync(process.execPath, [m.t], { stdio: 'pipe' }); } catch (e) { pegou = true; }
  fs.writeFileSync(arq[m.a], o, 'utf8');
  console.log((pegou ? 'PEGOU  ' : 'PASSOU ') + ' · ' + m.nome);
  if (!pegou) ok = false;
});

[laco, marca].forEach(function (t) {
  try { execFileSync(process.execPath, [t], { stdio: 'pipe' }); }
  catch (e) { console.log('!! falha com o codigo integro: ' + path.basename(t)); ok = false; }
});
if (ok) console.log('PASSA   · os dois com o codigo integro');
process.exit(ok ? 0 : 1);
