# Capital Fornecedores
### Sistema de Equalização Inteligente e Avaliação Contínua de Prestadores de Serviço
**Projeto Inscrito no Concurso da Melhor Ideia 2026 — Capital Realty & Demercado**

![Status](https://img.shields.io/badge/Status-Em%20desenvolvimento-065CA9)
![Plataforma](https://img.shields.io/badge/Plataforma-Google%20Apps%20Script%20Web%20App-003D7B)
![Design](https://img.shields.io/badge/Design%20System-Apple%20Liquid%20Glass-151E49)
![Custo](https://img.shields.io/badge/Custo%20Infra-R$%200%2C00-34C759)

---

## 🎯 Sobre o Projeto

O **Capital Fornecedores** substitui a planilha `EQU_AAAAMMDD-MEGA_PROJETO_ÁREA.xlsx`, usada hoje pelo departamento de **Facilities nos Megas** da **Capital Realty** e da **Demercado** para equalizar cotações de fornecedores.

A planilha equaliza, mas não lembra. Cada arquivo nasce isolado: o preço cotado em abril não conversa com o de setembro, o fornecedor que atendeu Curitiba não aparece quando Esteio cota o mesmo item, e a fórmula quebra quando alguém insere uma linha. O que este projeto acrescenta é **memória** — cada equalização feita aqui alimenta um histórico consultável de preços por item, por fornecedor e por Mega.

**O que o sistema faz hoje:**
- Web App com criação, edição e consulta de equalizações, com N proponentes (sem limite de colunas)
- Histórico de preços por item, com variação entre a cotação atual, a anterior e a primeira
- Identificação de fornecedor por CNPJ ou por nome, com cadastro interno na frente da consulta externa
- Empresa contratante derivada do Mega, não escolhida à mão (Curitiba → Demercado; Esteio e Itajaí → Capital Realty)
- Código da EAP derivado da hierarquia, não digitado
- Homologação da proposta vencedora com parecer registrado
- Exportação no layout da EQU, em planilha e PDF, com unitário e total, resumo executivo no topo, variação percentual entre propostas, quadro de alçadas e link clicável para a proposta original
- Catálogo de equalizações por categoria, deduzida dos itens, em cartões ou tabela densa
- Ficha 360° do fornecedor: cadastro, contatos, disputas e histórico de preço por item ao longo do tempo
- Colagem de bloco do Excel na grade e navegação completa por teclado
- Tempo por equalização medido automaticamente, do primeiro campo até a gravação

**O que ainda não existe** — e está declarado aqui de propósito, para que o escopo entregue seja verificável:
- Avaliação pós-Ordem de Compra e Índice de Qualificação do Fornecedor (IQF), diretriz do comitê: mapeada, sem código
- **Linha de base de tempo na planilha**: a instrumentação existe dos dois lados, mas ninguém cronometrou ainda uma equalização feita no Excel. Sem ela não há comparação, e o ganho continua sendo afirmação
- **Piloto com cotações reais**: as equalizações da base são de teste e do acervo importado
- Taxa de vitória por fornecedor: calculada, mas ainda sem disputas homologadas suficientes para virar percentual (a tela mostra a fração crua até lá)

---

## 📊 Estado da base (auditado em 05/09/2026)

| | |
| :--- | ---: |
| Equalizações na base | 4 |
| Propostas registradas | 12 |
| Linhas de preço | 78 |
| Acervo histórico importado (documentos) | 21 |
| Registros no acervo | 274 |
| Fornecedores distintos | 7 |

O acervo de 274 registros é composto **integralmente de orçamentos avulsos** — documentos de fornecedor importados para formar o histórico de preços. Ele alimenta a consulta de preço; não são disputas com vencedor apurado.

---

## 💎 A Fusão Visual: Apple Design System + Brandbook Capital Realty

Seguindo as diretrizes do Brandbook oficial da Capital Realty e o catálogo do **Apple Design System**:
- **Paleta Oficial**:
  - `#151E49` — Azul Noturno (Base estrutural)
  - `#003D7B` — Azul Royal (Ações primárias e destaques)
  - `#065CA9` — Azul Destaque (Elementos interativos e hover)
- **Experiência do Usuário**:
  - Estética **Liquid Glass** com superfícies translúcidas e efeito de vidro fosco (`backdrop-blur`).
  - **Segmented Controls** estilo macOS para navegação fluida e sem recarregamentos.
  - Indicadores semânticos de desempenho (Verde `#34C759`, Laranja `#FF9500`, Vermelho `#FF3B30`).

---

## 🔌 Consulta de CNPJ — o que é e o que não é

O sistema consulta CNPJ pela **BrasilAPI**, um serviço **comunitário e gratuito**, mantido por voluntários, que republica dados públicos de CNPJ. **Não é um canal oficial da Receita Federal e não tem SLA.**

Isso é dito aqui porque muda o desenho: a consulta externa é o **último** recurso, atrás do cadastro interno e de um cache de 24 horas, e nunca bloqueia a cotação — se ela falhar, o comprador digita o nome à mão e segue. Uma dependência sem SLA pode ficar fora do ar; o processo, não.

---

## 📚 Documentos do Projeto

| Documento | Descrição |
| :--- | :--- |
| [Plano Diretor de Ecossistema e Aprovação de Diretoria](docs/PLANO_ECOSSISTEMA_E_APROVACAO_DIRETORIA_2026.md) | Roadmap em 4 fases, todas construídas. A nota de abertura registra o que mudou em relação ao texto original e por quê. |
| [Plano Estratégico do Projeto](docs/PLANO_ESTRATEGICO_PROJETO.md) | Marcos, entregáveis e matriz de KPIs. |
| [Arquitetura Técnica e Fluxos de Dados](docs/ARQUITETURA_TECNICA_E_FLUXO.md) | Backend (Apps Script), frontend, modelo relacional do Google Sheets e integrações. |
| [Plano de Correções](docs/PLANO_DE_CORRECOES.md) | Defeitos encontrados, correção aplicada e teste que impede o retorno. |
| [Histórico](docs/HISTORICO.md) | Registro cronológico das decisões técnicas. |
| [Resposta ao Comitê](docs/RESPOSTA_AO_COMITE.md) | Texto formal em resposta à devolutiva do comitê. |
| [O Playbook da Vitória](docs/DEFESA_DA_MELHOR_IDEIA_MACBOOK.md) | Leitura dos critérios do concurso. |

---

## 🏆 Alinhamento aos Critérios do Regulamento

| Critério Oficial | Peso | Situação |
| :--- | :---: | :--- |
| **Impacto para a Empresa** *(Desempate 1)* | **30%** | O ganho pretendido é tempo por equalização e visibilidade de preço entre Megas. O tempo já é medido automaticamente; **falta a linha de base da planilha e o piloto real**. Nenhum número será afirmado antes de ser apurado. |
| **Qualidade da Implementação** *(Desempate 2)* | **30%** | Aplicação web funcional, implantada e em uso de teste, com suíte de testes automatizados que reprova de fato: cada defeito corrigido tem um teste que falha se ele voltar. |
| **Viabilidade e Sustentabilidade** | **20%** | Custo zero de servidores (Google Apps Script sobre o Workspace já contratado). A dependência externa é a BrasilAPI, comunitária e sem SLA, com degradação prevista: o processo continua sem ela. |
| **Inovação** | **20%** | O histórico de preço entre equalizações — o que a planilha, por ser um arquivo por cotação, não tem como fazer. |

---

## 🗓️ Cronograma (regulamento, §13)

- **01/06/2026**: Encerramento das inscrições e alinhamento com o Comitê.
- **30/09/2026**: Encerramento do período de consultoria do Comitê.
- **10/10/2026**: Conclusão do período de implementação prática.
- **15/10/2026**: Protocolo do **Relatório Final de Resultados** junto ao RH.
- **Novembro/2026**: Apresentação presencial à Presidência e ao Comitê Avaliador.
- **Dezembro/2026**: Premiação na Festa de Final de Ano.

---

## 🛠️ Como rodar

```bash
npm test          # suíte completa: ciclo de dados + regressões
npm run push      # roda os testes e publica no Apps Script (clasp)
npm run status    # o que está sincronizado com o Apps Script
```

Requer Node ≥ 20 e `clasp` autenticado. O `push` só publica se os testes passarem — foi assim que o Apps Script deixou de ficar à frente do que está versionado.
