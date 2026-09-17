const assert=require('node:assert/strict');
const {montar}=require('../tools/gerar-apresentacao-conselho.cjs');
const {paginas,roteiro,context}=montar();
assert.equal(paginas.length,14);
const conteudo=paginas.flatMap(p=>p.elementos.map(e=>e.text||'')).join('\n');
const conteudoNormalizado=conteudo.replace(/\s+/g,' ').toLocaleLowerCase('pt-BR');
assert(conteudoNormalizado.includes('gestão inteligente de contratações'));
assert(conteudoNormalizado.includes('na aprovação, a dúvida faz tudo voltar'));
assert(!conteudo.includes('cinco grafias'));
assert(conteudo.includes('Hoje na empresa'));
assert(conteudo.includes('Cockpit de Equalização Inteligente'));
assert(conteudo.includes('Inteligência de Preços'));
assert(conteudo.includes('Base de Fornecedores'));
for(const p of paginas) {
  const palavras=p.elementos.map(e=>e.text||'').join(' ').trim().split(/\s+/).length;
  assert(palavras<=140,'slide visual mantém densidade controlada e detalhes nas notas');
}
assert(roteiro[3].fala.includes('processo é devolvido'));
assert(roteiro[4].titulo.includes('A Solução'));
context.gerarApresentacaoConselho();
assert.equal(paginas.length,14,'regerar substitui slides, sem duplicar');
const ids=paginas.map(p=>p.getObjectId()),render=context._cnRenderNarrativa_;
context._cnRenderNarrativa_=(deck,p,i)=>{render(deck,p,i);if(i===2)throw Error('Falha simulada');};
assert.throws(()=>context.gerarApresentacaoConselho(),/Falha simulada/);
assert.deepEqual(paginas.map(p=>p.getObjectId()),ids,'falha preserva a apresentação anterior');
console.log('Apresentação: narrativa, notas, dimensões, regeneração e recuperação OK.');
