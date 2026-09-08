# Plano de execução — o que falta, em ordem de valor

Escrito em 07/09/2026, depois da terceira auditoria (nota 7,3) e dos
commits `0209b93` e `f3cec5e`.

A lista de oito itens da auditoria está toda contemplada aqui, mas ela
mudou de forma depois que os números foram medidos em vez de estimados.
Três itens já fecharam, um estava mal especificado e não pode ser feito
como estava escrito, e os números de dois outros estavam desatualizados.

---

## 1. O que já fechou

| Item da auditoria | Onde |
|---|---|
| Persistir `VALOR_PROPOSTA_INICIAL` no importador | `0209b93` · `Persistencia.gs:299-300` |
| Apagar a linha morta em `Interface.html:7087` + terceira regra na varredura | `0209b93` · e a **quarta** regra em `f3cec5e` |
| Marcar o fallback `CRIADO_POR` na quebra "quem negociou" | `0209b93` · `Equalizacao.gs` |
| `taxaVitoria` `'0%'` → `'—'` | `0209b93` · `Interface.html` |
| Rótulo visível e legenda do `Exportar.gs` | `f3cec5e` |
| Corrigir o slide `:629` do deck do Conselho | `0209b93` |
| Corrigir o `README.md` | `f3cec5e` |

### Uma correção de rota sobre o que a auditoria disse

A auditoria afirmou que `teste-exportacao-benchmark-iqf.cjs:262-263`
**trancava o rótulo errado**. Não trancava: o fixture daquele teste tem
`vencedora: true`, e ali a palavra "compra" estava correta.

O defeito era outro, e maior: o teste **nunca exercitava o outro ramo** —
que é justamente o ramo do acervo real — enquanto o cabeçalho da linha e
a legenda no `Exportar.gs` diziam "última compra" incondicionalmente. Um
documento assinado que vai à Diretoria afirmava uma compra onde só houve
cotação. Corrigido no código, e o ramo que faltava agora é exercitado.

---

## 2. Persistir `VENCEDORA` no importador — **não é possível como estava escrito**

A auditoria estimou "2-3 h, código". Não é trabalho de código: **o dado
não existe na origem**. O parser (`Import.gs:30-49`) reconhece vinte
rótulos do documento, e nenhum deles diz quem venceu — porque a planilha
EQU não registra a decisão, só as propostas.

Inventar um vencedor por heurística (o menor preço, o que bate com o
valor final) seria fabricar um fato de negócio dentro de um indicador
que a Diretoria vai ler. É a mesma classe dos números que já tiramos das
telas executivas em `11b6e1d`.

**O que foi feito em vez disso:** o painel passou a **contar e dizer** o
acervo sem decisão (`cfPanoramaSaving_` → `semDecisao`). Antes o gestor
lia "não há dado"; agora lê "há N equalizações com propostas e valor
inicial, esperando marcar o vencedor". A ação que enche a tela deixou de
ser invisível.

**O que falta, e é o item de maior valor da lista inteira:**

> ### 🅐 Tela de marcar vencedor em lote — 3-4 h
>
> Hoje marcar o vencedor exige abrir cada equalização. Com 50 no acervo,
> ninguém faz. Uma lista com as importadas, o menor preço já destacado e
> um clique por linha transforma o acervo inteiro em série histórica de
> saving numa tarde — sem esperar compra nova.
>
> É a diferença entre o painel do concurso mostrar **um mês** ou mostrar
> **o histórico inteiro** no dia da apresentação.

---

## 3. As 8 tabelas mortas — medidas, e são exatamente estas

Zero referências em todo o `app/` fora da declaração no `Config.gs`:

`Categorias` · `Catalogo` · `Presets` · `PresetItens` · `Baselines` ·
`Notas` · `Ajustes` · `Clausulas`

A decisão não é uniforme — duas delas resolvem um defeito conhecido:

> ### 🅑 Implementar `Presets` + `PresetItens` — 3-4 h
>
> Os presets de EAP moram hoje no `localStorage`. Isso significa que um
> colega **não enxerga o preset do outro**: cada pessoa reconstrói a
> mesma lista de itens do zero, que é exatamente o retrabalho que o
> projeto existe para acabar. As duas tabelas já estão desenhadas e
> versionadas para isso.

> ### 🅒 Remover as outras 6 do schema — 1 h
>
> `Categorias`, `Catalogo`, `Baselines`, `Notas`, `Ajustes`, `Clausulas`.
> Tabela declarada e nunca escrita é promessa pendurada: quem abre a
> planilha vê seis abas vazias e conclui que o sistema está pela metade.
>
> Remover **da declaração**; aba que já exista na planilha instalada fica
> onde está e não é apagada. `cfGarantirAba_` só acrescenta, nunca
> destrói — e é assim que tem que continuar.
>
> As seis voltam quando tiverem uso. `Clausulas` e `Ajustes` são as
> primeiras candidatas quando o escopo de contrato entrar.

---

## 4. Testes de comportamento para `Apresentacao_Conselho.gs` — 4-6 h

718 linhas, nenhum teste. É o arquivo que gera o material que vai ao
Conselho, e o único hoje cuja falha só apareceria na frente deles.

Vale lembrar que foi exatamente ali que estava a frase "o dado existe na
base; falta somar" — **falsa** — e ela sobreviveu porque nada a testava.

Alvo mínimo: cada slide gera sem lançar; nenhum número aparece sem
origem; o aviso de falha por slide funciona; texto que não cabe é medido
antes de ser desenhado.

---

## 5. As asserções sobre texto-fonte — **101**, não 89

O número da auditoria estava desatualizado, e sete das novas são minhas,
das duas últimas sessões. Distribuição real:

```
  17  ciclo-completo.cjs
  17  teste-marcas-opcional.cjs
  13  teste-categoria-e-logo.cjs
  11  teste-catalogo-e-config.cjs
  11  teste-equalizacoes-executiva.cjs
   9  teste-presets-eap.cjs
   7  teste-ficha-fornecedor-executiva.cjs
   4  teste-caminho-do-saving.cjs
   4  validar-correcoes.cjs
   3  teste-tela-saving.cjs
   2  teste-iqf-ponderado.cjs
   2  teste-nome-curto-proponente.cjs
   1  teste-marca-onthefly.cjs
```

Uma asserção que procura uma **string no código-fonte** passa mesmo com
o recurso desligado. Foi assim que o selo de IQF ficou morto por cinco
commits: a string existia, o teste passava, o selo não aparecia.

> ### 🅓 Converter, por arquivo, começando pelos que guardam recurso vivo — 6-10 h
>
> Ordem: `teste-marcas-opcional` → `teste-categoria-e-logo` →
> `teste-equalizacoes-executiva` → `teste-catalogo-e-config` →
> `teste-presets-eap` → `teste-ficha-fornecedor-executiva`.
>
> Não é para fazer de uma vez. A regra prática: **todo arquivo de teste
> que for tocado por outro motivo sai convertido.** O padrão já existe em
> `teste-laco-avaliacao.cjs` — monta o DOM, roda a função, afirma sobre o
> HTML que sai.

---

## 6. Ordem sugerida

| | O quê | Esforço | Por que nessa ordem |
|---|---|---|---|
| 1 | 🅐 Marcar vencedor em lote | 3-4 h | Libera a série histórica inteira do saving. Nada mais na lista muda o que a Diretoria vê tanto quanto isso |
| 2 | 🅑 `Presets` + `PresetItens` | 3-4 h | Acaba com o preset preso ao `localStorage` de uma pessoa |
| 3 | 🅒 Remover as 6 tabelas mortas | 1 h | Barato, e tira seis abas vazias da vista de quem abre a planilha |
| 4 | Testes do `Apresentacao_Conselho` | 4-6 h | Único arquivo cuja falha aparece na frente do Conselho |
| 5 | 🅓 Asserções de texto-fonte | 6-10 h | Contínuo, à medida que cada arquivo for tocado |

**Total: 17-25 h de código.**

---

## 7. E o que não é código

Isto continua sendo ~80% da nota, e não mudou desde a primeira auditoria:

- [ ] `setupBaseDeDados()` — schema v7
- [ ] `semearCadastrosBase()`
- [ ] `migrarParaSchemaV4()`
- [ ] `diagnosticarDivergenciasAltas()` + `corrigirEmpresaDasEqualizacoes()`
- [ ] Preencher `Config.EMAIL_AVALIACOES`
- [ ] **Cronometrar 3 equalizações feitas no Excel** — janela irreversível: depois que o time migrar, não há como voltar a medir o antes
- [ ] Reimportar o acervo (agora a proposta inicial é gravada) e marcar os vencedores
- [ ] Piloto de 8-12 equalizações reais

A cronometragem é a única tarefa da lista inteira que **deixa de ser
possível** se ficar para depois. Todo o resto espera.
