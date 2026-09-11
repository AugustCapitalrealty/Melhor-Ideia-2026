const assert=require('node:assert/strict');
const {montar}=require('../tools/gerar-apresentacao-conselho.cjs');
const {paginas,roteiro,context}=montar();
assert.equal(paginas.length,11);
const conteudo=paginas.flatMap(p=>p.elementos.map(e=>e.text||'')).join('\n');
assert(conteudo.replace(/\s+/g,' ').includes('Gestão de Contratações'));
assert(conteudo.includes('Na aprovação, a dúvida faz tudo voltar'));
assert(!conteudo.includes('cinco grafias'));
assert(conteudo.includes('Hoje na empresa'));
assert(conteudo.includes('Indicadores'));
assert(conteudo.includes('Histórico comum'));
assert(!/engenharia|\bIQF\b|memória|próximos passos|importação automática/i.test(conteudo+paginas.map(p=>p.notas).join(' ')));
for(const p of paginas) {
  const palavras=p.elementos.map(e=>e.text||'').join(' ').trim().split(/\s+/).length;
  assert(palavras<=85,'slide visual mantém texto breve e detalhes nas notas');
}
assert(roteiro[3].fala.includes('processo retorna para quem cotou'));
assert(roteiro[4].titulo.includes('Onde podemos atacar'));
context.gerarApresentacaoConselho();
assert.equal(paginas.length,11,'regerar substitui slides, sem duplicar');
const ids=paginas.map(p=>p.getObjectId()),render=context._cnRenderNarrativa_;
context._cnRenderNarrativa_=(deck,p,i)=>{render(deck,p,i);if(i===2)throw Error('Falha simulada');};
assert.throws(()=>context.gerarApresentacaoConselho(),/Falha simulada/);
assert.deepEqual(paginas.map(p=>p.getObjectId()),ids,'falha preserva a apresentação anterior');
console.log('Apresentação: narrativa, notas, dimensões, regeneração e recuperação OK.');
