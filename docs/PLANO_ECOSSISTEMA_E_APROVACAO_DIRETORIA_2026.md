# PLANO DIRETOR: ECOSSISTEMA DE FORNECEDORES & DOSSIÊ EXECUTIVO C-LEVEL 2026
**Capital Realty & Demercado — Concurso Melhor Ideia 2026**  
**Documento de Arquitetura, Mapeamento e Roadmap de Implementação Futura**  
**Versão:** 1.0.0 · **Data:** Setembro de 2026  
**Status:** Mapeado para Implementação Futura  

---

## 0. Nota de revisão — 06/09/2026

Este plano passou por parecer técnico independente antes de virar trabalho. O parecer aprovou as Fases 1 e 2 com ressalvas e **reprovou as Fases 3 e 4 para o ciclo 2026**. O documento fica no acervo como escrito, com as correções abaixo registradas em vez de apagadas.

**Escopo revisado:**

| Fase | Veredito | Motivo |
| :--- | :--- | :--- |
| 1 — Dossiê de Diretoria | **Executar**, com escopo cortado | É o único entregável que o comitê enxerga. Requer correção prévia de dados (ver abaixo). |
| 2 — Ergonomia | **Executar 3 dos 6 itens** | Cabeçalho fixo, menor preço ao vivo e rascunho por rodada. Colagem bidimensional fica para depois. |
| 3 — Catálogo em escala | **Ciclo 2027** | Resolve um problema que ainda não existe. |
| 4 — Ecossistema 360° | **Ciclo 2027** | Depende de dados que ainda não foram produzidos. |

O regulamento, §5.3, prevê exatamente isso: *"Ideias validadas que não forem concluídas devido a limitações de orçamento ou tempo permanecerão elegíveis para execução no próximo ciclo anual."*

**Correções de fato apuradas no parecer:**

1. **Os volumes citados na Fase 3 são hipotéticos.** A base tem **4 equalizações**, não "100+". Os contadores do exemplo de *Category Pills* (§3.3) — `Todas (142)`, `Mat. Consumo (48)` — são ilustrativos, não medições. Leia-os como maquete de tela.
2. **Três das sete macro-categorias propostas (§3.2) não têm um único registro no acervo:** Obras & Reformas, Equipamentos & Locação, Tecnologia & Segurança. As categorias reais são Material de consumo (156 registros), Material de manutenção (75), Material de construção (28), Material de escritório (12) e Serviço de limpeza de piso (3).
3. **O win-rate da Fase 4 (§4.3) não é calculável hoje.** Os 274 registros do acervo são todos orçamentos avulsos; nenhum é disputa com vencedor apurado. E a tabela `Convites`, que seria o denominador de "concorrências convocadas", está vazia por motivo conhecido: Engenharia registra convites, Facilities não. Um índice sobre essa amostra seria ruído apresentado como inteligência.
4. **As três colunas novas propostas para `Fornecedores` (§4.1) são desnecessárias.** `TOTAL_CONTRATADO` em especial é cache de algo já derivável de `Equalizacoes.VALOR_FINAL`, e divergiria na primeira homologação corrigida.
5. **O trecho de `setRichTextValue` da §1.4 não funciona como escrito.** Verificado em spike (06/09): o link aplicado antes do `setValues` da linha 344 do `Exportar.gs` é apagado por ele. A regra correta é uma só — **rich text depois do `setValues`**. Ao contrário do que o parecer supunha, `setFontSize` e `setBorder` **não** achatam os runs, e o range de duas células mescladas funciona.
6. **O link sobrevive ao PDF — confirmado, não suposto.** O mesmo spike gerou o PDF pelo caminho real (`cfPdfDaPlanilha_`, endpoint `?format=pdf` com token OAuth) e encontrou `/Annots` e `/URI` com a URL. A Fase 1 pode incluir `LINK_PROPOSTA`.
7. **Subir `CF_SCHEMA_VERSAO` de 3 para 4 exige congelar a migração atual primeiro.** `migrarParaSchemaV3()` deriva a versão da constante em vez de usar literais: bumpar a constante faria ela carimbar "migrado para v4" sem executar nenhum passo de v4.
8. **Pré-requisito da Fase 1 — três divergências de dados.** O Scorecard executivo publica o Valor Homologado no topo do documento que vai à Diretoria. Antes disso: as 4 equalizações estão sem CNPJ da empresa; uma tem totais declarados equivalentes a 12× o calculado (mensalidade lida como anual); e Eletrobarras aparece com mão de obra duplicada em duas colunas.

**O que o plano não previu e virou prioridade:** medir. Impacto vale 30% da nota e é o primeiro critério de desempate, e não há uma única medição de tempo apurada. A instrumentação via `cfLog_` e um piloto com cotações reais valem mais, para o concurso, que as Fases 3 e 4 somadas.

---

## 1. Visão Geral e Propósito

Este documento consolida a auditoria profunda realizada por três agentes especializados (UX/UI & Performance, Governança/Diretoria & Exportação, e Arquitetura de Ecossistema) e define o **Plano Diretor** para transformar o sistema **Capital Fornecedores** em uma plataforma estratégica corporativa.

### Os Quatro Pilares da Transformação:
1. **Dossiê Executivo de Aprovação C-Level:** Documento de deliberação imediata para a Diretoria (Scorecard de decisão em 3 segundos, Spread % entre concorrentes, Saving real de negociação e **Hyperlink dinâmico direto para a Proposta Oficial do fornecedor no Google Drive**).
2. **Escalabilidade da Gestão de Cotações (100+ Equalizações):** Fim da lista linear monolítica. Introdução de taxonomia corporativa padronizada, Hub de Categorias (*Category Pills*), acordeão expansível e alternador entre visualização em Cards e Tabela Densa executiva.
3. **Ecossistema de Fornecedores 360°:** Navegação bidirecional por Categoria (ex: *"Quero fornecedores de Material de Consumo → lista todos os que já cotaram, suas taxas de sucesso e histórico"*), Ficha 360° do Fornecedor em gaveta lateral deslizante (*Drawer*) e scorecard de inteligência de compras.
4. **Ergonomia e Performance de Alta Velocidade:** Grade de itens com cabeçalho congelado verticalmente, colagem em lote do Excel (linhas e colunas), navegação universal por teclado (`Enter`/setas) e rascunho seguro para rodadas de renegociação.

---

## 2. Estrutura de Fases do Plano

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  FASE 1: Dossiê de Diretoria & Link da Proposta Oficial Clicável                 │
│  • Campo LINK_PROPOSTA no formulário e no schema (Drive/URL)                     │
│  • Hyperlink nativo clicável no Google Sheets e no PDF (sem fórmulas)            │
│  • Scorecard executivo no topo da exportação (Vencedor, Valor, Saving, Prazo)    │
│  • Linha de variação percentual (Spread %) vs. menor valor                       │
│  • Quadro formal de alçadas de homologação (Comprador, Gestor, Diretoria)        │
├──────────────────────────────────────────────────────────────────────────────────┤
│  FASE 2: Ergonomia de Preenchimento, Teclado & Performance UX                    │
│  • Cabeçalho congelado vertical (thead sticky top: 0) na grade de edição         │
│  • Navegação universal por Enter e setas em Descrição, Qtd e Preços              │
│  • Suporte a colagem bidimensional do Excel (linhas e colunas tabuladas)         │
│  • Destaque em tempo real do menor preço linha a linha (eh-menor-linha)          │
│  • Rascunho isolado e protegido para modo Edição/Renegociação (R01/R02)          │
│  • Autocomplete de CNPJ com navegação por teclado e fechamento ao clicar fora    │
├──────────────────────────────────────────────────────────────────────────────────┤
│  FASE 3: Catálogo de Equalizações em Escala & Categorização (100+ Cotações)      │
│  • Taxonomia canônica: Mat. Consumo, Mat. Construção, Obras, Facilities, etc.   │
│  • Hub superior de categorias com contadores dinâmicos (Category Pills)          │
│  • Agrupamento em acordeão por categoria na tela de Equalizações                 │
│  • Alternador de exibição: Modo Cards Executivos vs. Modo Tabela Densa           │
│  • Filtros facetados combinados (Mega, Categoria, Status, Ano/Mês)               │
├──────────────────────────────────────────────────────────────────────────────────┤
│  FASE 4: Ecossistema de Fornecedores 360° & Inteligência de Compras              │
│  • Nova aba dedicada no menu principal: [ Fornecedores ]                         │
│  • Módulo "Fornecedores por Categoria" com win-rate e histórico contratado       │
│  • Ficha 360° do Fornecedor em gaveta lateral deslizante (Drawer Apple Style)    │
│  • Conexão bidirecional: clique no fornecedor em qualquer mapa abre Ficha 360°   │
│  • Histórico de itens cotados e preços praticados por fornecedor                 │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detalhamento Técnico das Fases

### FASE 1: Dossiê de Diretoria & Link da Proposta Oficial Clicável

#### 1.1 Objetivo
Permitir que um Diretor aprove a contratação com total segurança jurídica e clareza de saving em menos de 10 segundos, com acesso em um clique ao PDF original assinado pelo fornecedor.

#### 1.2 Mapeamento no Schema (`app/Config.gs`)
Adicionar de forma estritamente aditiva (no final da tabela `Propostas`):
```javascript
{ campo: 'LINK_PROPOSTA', tipo: 'texto', largura: 280, nota: 'URL Google Drive ou externa da proposta comercial oficial' }
```

#### 1.3 Captura no Web App (`app/Interface.html`)
No bloco de detalhes de cada proponente:
* Campo: `Link da Proposta Oficial (URL do Google Drive ou documento)`.
* Botão embutido: `[ ↗ Testar link ]` que abre a URL em nova aba para conferência do comprador.
* Tratamento automático de ID do Google Drive (ex: `1AbC...` vira `https://drive.google.com/file/d/1AbC.../view`).
* No mapa comparativo da web: exibição do botão `[ 📄 Ver Proposta Original ↗ ]`.

#### 1.4 Hyperlink Nativo no Google Sheets e PDF (`app/Exportar.gs`)
Para atender à regra de **documento estático sem fórmulas** e garantir que o link seja clicável no PDF:
```javascript
if (p.linkProposta) {
  const richText = SpreadsheetApp.newRichTextValue()
    .setText('📄 Ver Proposta Oficial')
    .setLinkUrl(p.linkProposta)
    .build();
  aba.getRange(linhaNum, colDe(i), 1, 2).setRichTextValue(richText);
} else {
  aba.getRange(linhaNum, colDe(i), 1, 2).setValue('—');
}
```
*O motor de exportação do Google Sheets converte `setLinkUrl` em uma anotação nativa de link (`/Subtype /Link`) no PDF. O Diretor clica no PDF em qualquer dispositivo e abre a proposta original.*

#### 1.5 Scorecard Executivo no Topo da Planilha/PDF
Substituição do bloco puramente cadastral por um painel de impacto executivo:
* **Proposta Vencedora Recomendada** (Razão Social + CNPJ).
* **Valor Homologado** (R$).
* **Saving Conquistado** (R$ e % de redução sobre a primeira proposta).
* **Prazo de Início e Condição de Pagamento**.

#### 1.6 Linha de Spread % no Comparativo de Totais
Abaixo da linha de `VALOR TOTAL CALCULADO`, adição da linha de dispersão percentual:
* Vencedor: `0,0% (Base - Menor Preço)`
* 2º Colocado: `+X,X%`
* 3º Colocado: `+Y,Y%`

#### 1.7 Quadro Formal de Homologação e Alçadas
Bloco de rodapé para compliance e auditoria:
1. *Elaborado por (Comprador / Suprimentos)*: Nome, Data e Assinatura.
2. *Parecer Técnico (Gestor da Área Solicitante)*: Escopo validado, Data e Assinatura.
3. *Homologação Diretoria Executiva*: `[ ] Aprovado  [ ] Aprovado com Ressalvas  [ ] Rejeitado`, Data e Assinatura.

---

### FASE 2: Ergonomia de Preenchimento, Teclado & Performance UX

#### 2.1 Objetivo
Eliminar qualquer perda de tempo ou atrito no processo de transcrição de orçamentos, permitindo colar dezenas de itens do Excel de uma vez e navegar 100% pelo teclado.

#### 2.2 Cabeçalho Vertical Congelado (`thead sticky`)
Na grade de edição de `Nova cotação`:
```css
.grade-rolo {
  max-height: 65vh;
  overflow: auto;
}
table.grade thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--noturno) !important;
  color: #fff !important;
}
```
*Ao rolar 30 itens para baixo, os nomes dos fornecedores permanecem fixos no topo, impedindo digitação na coluna errada.*

#### 2.3 Navegação Universal por Teclado (`Enter` e Setas)
* Ativação de `Enter` e setas direcionais nos campos de **Descrição** e **Quantidade**.
* Ao atingir o último item e pressionar `Enter`, um novo item é inserido silenciosamente mantendo o cursor exatamente na coluna em que o comprador estava digitando.

#### 2.4 Colagem Bidimensional do Excel (Matriz Linhas x Colunas)
* Leitura de quebras de linha (`\n`) e tabulações (`\t`).
* Criação de todas as linhas necessárias em lote no array de memória antes de renderizar.
* Renderização única no DOM após a colagem (substitui 30 reflows destrutivos por 1 atualização atômica).

#### 2.5 Destaque em Tempo Real do Menor Preço Linha a Linha
* Enquanto o comprador digita os valores na grade de edição, o menor preço de cada linha recebe a classe `.eh-menor-linha` (verde suave institucional), indicando instantaneamente o líder provisório daquele item.

#### 2.6 Rascunho Seguro em Edição / Renegociação
* Separação de chaves no LocalStorage:
  * Criação: `cf_rascunho_nova_v2`
  * Edição/Renegociação: `cf_rascunho_edicao_EQU-2026-XXXX`
* Proteção contra perda de dados durante rodadas longas de renegociação de preços.

#### 2.7 Autocomplete Acessível
* Navegação nas sugestões de fornecedor por setas (`ArrowDown`/`ArrowUp`) e seleção com `Enter`.
* Fechamento automático ao clicar fora (`click outside listener`).

---

### FASE 3: Catálogo de Equalizações em Escala & Categorização (100+ Cotações)

#### 3.1 Objetivo
Organizar o acervo corporativo de equalizações para que a busca e análise de centenas de concorrências seja visualmente limpa, rápida e intuitiva.

#### 3.2 Taxonomia Corporativa Padronizada
Criação dos campos `CATEGORIA` e `SUBCATEGORIA` no schema de `Equalizacoes`:

| Macro-Categoria | Ícone | Subcategorias Típicas |
| :--- | :---: | :--- |
| **Material de Consumo** | ☕ | Copa & Cozinha, Higiene & Limpeza, Papelaria, Toners, EPIs Descartáveis |
| **Material de Construção** | 🧱 | Alvenaria, Elétrica & Iluminação, Hidráulica, Coberturas, Tintas |
| **Obras & Reformas** | 🏗️ | Pisos Industriais & Juntas, Pavimentação, Galpões, Mezaninos, Terraplenagem |
| **Serviços & Facilities** | 🧹 | Limpeza Predial, Portaria & Acesso, Jardinagem, Pragas, Gestão de Resíduos |
| **Manutenção Predial & Eng.**| ⚡ | Subestações, Geradores, Docas & Niveladoras, Sprinklers, Climatização |
| **Equipamentos & Locação** | 🚜 | Plataformas Elevatórias, Geradores Móveis, Munck, Equipamentos de Carga |
| **Tecnologia & Segurança** | 💻 | CFTV Perimetral, Catracas & Biometria, Cabeamento Estruturado |

#### 3.3 Hub Superior de Categorias (Category Pills)
* Carrossel de botões em pílula com contagem real:
  `[ Todas (142) ] [ ☕ Mat. Consumo (48) ] [ 🧱 Mat. Construção (31) ] [ 🏗️ Obras & Reformas (22) ] [ 🧹 Facilities (27) ]`
* Clique no chip filtra a tela instantaneamente sem reload.

#### 3.4 Acordeão Agrupado por Categoria
* As equalizações são renderizadas agrupadas por sua categoria:
  * Barra do grupo com ícone, nome, contagem de concorrências e montante financeiro total (R$).
  * Botão de acesso rápido: `[ Ver fornecedores desta categoria → ]`.

#### 3.5 Alternador de Modos de Exibição
* **Modo Cards:** Cards visuais refinados com badges de status, proponentes e valores.
* **Modo Tabela Densa:** Linhas compactas estilo planilha executiva com colunas: *ID, Data, Projeto, Categoria, Mega, Menor Preço, Fornecedor Líder, Situação, Ações*.

---

### FASE 4: Ecossistema de Fornecedores 360° & Inteligência de Compras

#### 4.1 Objetivo
Concretizar a visão do ecossistema: permitir que o comprador filtre por segmento (ex: *Material de Consumo*) e encontre imediatamente todos os fornecedores homologados, suas taxas de sucesso, preços históricos e cotações vinculadas.

#### 4.2 Aba Dedicada no Menu Principal: `[ Fornecedores ]`
A barra de navegação passa a contar com 4 áreas:
`[ Consulta de Preço ]  [ Equalizações ]  [ Fornecedores ]  [ + Nova Cotação ]`

#### 4.3 Visão de Fornecedores por Categoria
Ao selecionar uma categoria na aba Fornecedores:
* Lista todos os fornecedores que já apresentaram propostas naquele segmento.
* Cards informativos com:
  * Razão Social, Nome Fantasia e CNPJ com selo de situação cadastral (`● ATIVA`), vindo da consulta pública.
  * Empreendimentos atendidos (Mega Curitiba, Esteio, Itajaí, Demercado).
  * **Métricas de Performance:**
    * *Participações*: total de concorrências convocadas.
    * *Taxa de Sucesso (Win-Rate)*: ex: *"Venceu 4 de 6 concorrências (67%)"*.
    * *Volume Total Contratado*: montante em R$ homologado com a Capital Realty.
    * *Principais Itens Cotados*: itens mais frequentes e menores valores.
  * Botões de Ação: `[ Ver Ficha 360° ]` e `[ Ver Equalizações Deste Fornecedor ]`.

#### 4.4 Ficha 360° do Fornecedor (Drawer Lateral Deslizante)
Componente flutuante no padrão visual Apple/Liquid Glass que desliza pela lateral direita sem fechar a tela de trabalho:
1. **Dados Oficiais & Compliance:** Razão Social, CNPJ, CNAE, Endereço, Código no ERP Mega/TOTVS.
2. **Contatos Comerciais Diretos:** Representante de contas, telefone com botão `[ WhatsApp ↗ ]` e e-mail.
3. **Scorecard Operacional:** Participações, vitórias, assertividade de cotação e IQF (Índice de Qualificação de Fornecedor pós-Ordem de Compra).
4. **Histórico de Equalizações:** Tabela clicável com todas as cotações que disputou, valor ofertado, se ganhou ou perdeu e link para abrir o mapa comparativo.
5. **Histórico de Preços Cotados:** Catálogo com todos os itens já cotados pelo fornecedor e histórico de variação temporal de preços.

#### 4.5 Conexão Total do Ecossistema
* No mapa de equalização, clicar no nome do fornecedor abre a Ficha 360°.
* Na consulta de preço, clicar na tag do fornecedor abre a Ficha 360°.
* Na Ficha 360°, um botão `[ Convidar para Nova Cotação ]` já abre o formulário de Nova Cotação com o fornecedor pré-preenchido.

---

## 4. Política de Zero Regressão e Evolução do Banco de Dados

### 4.1 Schema Versioning
* O `CF_SCHEMA_VERSAO` será incrementado de `3` para `4`.
* Nenhuma coluna existente será renomeada, removida ou trocada de ordem física.
* Novas colunas serão adicionadas estritamente no final de cada tabela no `Config.gs`:
  * Em `Equalizacoes`: `CATEGORIA` e `SUBCATEGORIA`.
  * Em `Propostas`: `LINK_PROPOSTA`.
  * Em `Fornecedores`: `CATEGORIAS_TAGS`, `STATUS_HOMOLOGACAO`, `TOTAL_CONTRATADO`.
* A função `setupBaseDeDados()` em `Schema.gs` aplicará as alterações de forma totalmente idempotente, sem apagar nenhum registro já salvo.

### 4.2 Compatibilidade de Testes Automatizados
* Toda a suíte existente de testes (`tests/validar-correcoes.cjs`, `tests/ciclo-completo.cjs`, `tests/reproduzir-defeitos.cjs`) permanecerá passando com 100% de sucesso, pois os contratos das APIs atuais serão preservados integralmente.

---

## 5. Resumo Executivo das Entregas por Fase

| Fase | Foco Principal | Entregáveis Chave | Impacto para a Operação |
| :---: | :--- | :--- | :--- |
| **1** | **Diretoria & Aprovação Executiva** | Link clicável da proposta oficial (Sheets/PDF), Scorecard de decisão, Spread %, % Saving, Quadro formal de homologação. | Decisão em menos de 10 segundos para o Diretor e compliance total de auditoria. |
| **2** | **UX/UI & Velocidade de Digitação** | `thead` fixo vertical na grade, colar do Excel bidimensional, navegação universal por teclado, destaque de menor preço linha a linha. | Redução drástica do tempo de preenchimento e eliminação de erros de digitação. |
| **3** | **Escalabilidade (100+ Cotações)** | Taxonomia de 7 categorias, Hub de pills, acordeão por categoria, alternador Cards vs Tabela Densa, busca multifacetada. | Organização impecável para centenas de equalizações sem tela poluída. |
| **4** | **Ecossistema de Fornecedores 360°** | Aba [Fornecedores], busca por categoria (quem atende), Ficha 360° em gaveta lateral, catálogo de preços por fornecedor. | Inteligência contínua de compras e saving acumulado entre todos os Megas. |

---

*Documento registrado no acervo técnico do projeto para guiar as futuras implementações com máxima segurança, conformidade e governança corporativa.*
