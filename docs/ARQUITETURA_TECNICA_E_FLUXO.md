# Arquitetura Técnica e Fluxos do Sistema
## Capital Fornecedores — Solução Digital Integrada

---

## 1. Visão Geral da Arquitetura

O sistema foi arquitetado como uma aplicação web nativa no ecossistema **Google Workspace**, garantindo custo zero de infraestrutura, alta disponibilidade e governança de dados.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      INTERFACE DO USUÁRIO (WEB APP SPA)                    │
│   • Apple Design System (Liquid Glass, Frosted Blur, Segmented Controls)    │
│   • Identidade Visual Capital Realty (#151E49, #003D7B, #065CA9)            │
│   • Módulos: Equalização Dinâmica | Avaliação Pós-OC | Scorecard & BI       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Chamadas assíncronas (google.script.run)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND: GOOGLE APPS SCRIPT (Code.gs)                    │
│   • Roteador & Controlador de Requisições                                   │
│   • Motor de Cálculo Dinâmico da EAP (Somas, Subtotais e Saving)            │
│   • Conector REST UrlFetchApp                                               │
└───────────────────────┬───────────────────────────────┬─────────────────────┘
                        │                               │
       Consulta Externa │                               │ Leitura / Gravação
       REST HTTPS       ▼                               ▼ Relacional
┌──────────────────────────────┐        ┌─────────────────────────────────────┐
│          BRASIL API          │        │        GOOGLE SHEETS (BANCO)        │
│ • Consulta pública de CNPJ   │        │  • Aba "Fornecedores" (Cad. Híbrido)│
│ • CNPJ, Razão Social, CNAE,  │        │  • Aba "Equalizacoes" (Cabeçalho)   │
│   UF, Município, Situação    │        │  • Aba "Itens_EAP" (Detalhamento)   │
│ • Comunitária, sem SLA       │        │  • Aba "Avaliacoes" (Notas e SLA)   │
└──────────────────────────────┘        └──────────────────┬──────────────────┘
                                                           │
                                        Integração Futura  ▼
                                        ┌─────────────────────────────────────┐
                                        │        TOTVS FLUIG / MEGA ERP       │
                                        │  • Ordens de Compra & Medições      │
                                        │  • Gatilho de disparo de avaliação  │
                                        └─────────────────────────────────────┘
```

---

## 2. O Modelo Híbrido de Dados de Fornecedores

A proposta combina a **consulta pública de CNPJ (BrasilAPI)** com a **memória operacional interna da Capital Realty**.

> **Sobre a BrasilAPI:** é um serviço comunitário e gratuito, mantido por voluntários, que republica dados públicos de CNPJ. **Não é um canal oficial da Receita Federal e não oferece SLA.** Por isso ela é o último recurso na cadeia de resolução — atrás do cadastro interno e de um cache de 24 horas — e a sua indisponibilidade nunca bloqueia a cotação: o comprador digita o nome à mão e segue.


```
[ Usuário digita CNPJ no Web App ]
                 │
                 ▼
    [ Consulta Base Interna Sheets ]
                 │
         ┌───────┴───────┐
         │ Existe?       │
       SIM               NÃO
         │                │
         │                ▼
         │       [ Consulta BrasilAPI ]
         │       • Razão Social oficial
         │       • Cidade / Estado
         │       • CNAE Principal
         │       • Situação Cadastral (Ativa/Inapta)
         │                │
         ▼                ▼
   [ Preenche Dados Cadastrais no Formulário ]
   • Se já existia: preenche Contato, E-mail, Telefone e Nota IQF
   • Se é novo: usuário digita Contato/Telefone/Email uma única vez
                 │
                 ▼
   [ Ao Salvar Equalização ]
   • Salva/Atualiza automaticamente o cadastro do fornecedor
   • Histórico fica disponível para sempre para todos os Megas
```

---

## 3. Modelo Relacional no Google Sheets

Para manter os dados estruturados e auditáveis, o Google Sheets atua com 4 abas relacionais:

### Aba 1: `Fornecedores` (Cadastro & Reputação)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `ID_FORNECEDOR` | Text (PK) | CNPJ limpo (apenas números) |
| `RAZAO_SOCIAL` | Text | Nome oficial da empresa (BrasilAPI) |
| `NOME_FANTASIA`| Text | Nome comercial (BrasilAPI) |
| `CIDADE_UF` | Text | Município e Estado (BrasilAPI) |
| `SITUACAO_CNPJ`| Text | Situação cadastral do CNPJ (ex: ATIVA) |
| `CONTATO_NOME` | Text | Nome do representante / vendedor |
| `CONTATO_TEL` | Text | Telefone comercial / WhatsApp |
| `CONTATO_EMAIL`| Text | E-mail para envio de OCs e cotações |
| `IQF_MEDIO` | Decimal | Média ponderada de todas as avaliações pós-OC |
| `TOTAL_OCS` | Integer | Quantidade de serviços executados nos Megas |
| `STATUS_HOMOLOG`| Text | Aprovado (Classe A) / Regular (Classe B) / Bloqueado (Classe C) |

### Aba 2: `Equalizacoes` (Cabeçalho da Cotação)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `ID_EQUALIZACAO` | Text (PK) | Código gerado (ex: `EQU-202604-001`) |
| `DATA_CRIACAO` | Date | Data da equalização |
| `EMPRESA` | Text | Capital Realty ou Demercado |
| `EMPREENDIMENTO` | Text | Mega Curitiba, Mega Itajaí, Mega Esteio, etc. |
| `PROJETO` | Text | Escopo do serviço (ex: Manutenção Preventiva Subestação) |
| `CENTRO_CUSTO` | Text | Código e nome do Centro de Custo |
| `PROPONENTES_JSON`| Text | Metadados dos fornecedores cotados |
| `FORNECEDOR_VENCEDOR`| Text | CNPJ do fornecedor escolhido |
| `VALOR_FINAL` | Decimal | Valor homologado contratado |
| `SAVING_TOTAL_RS`| Decimal | Economia alcançada (Proposta Inicial - Valor Final) |
| `SAVING_PERCENTUAL`| Decimal | Percentual de redução obtido na negociação |
| `PARECER_TECNICO`| Text | Justificativa técnica da escolha ("Favorável por...") |

### Aba 3: `Itens_EAP` (Estrutura Analítica da Proposta)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `ID_ITEM` | Text (PK) | Identificador único do item |
| `ID_EQUALIZACAO`| Text (FK) | Vínculo com a cotação |
| `COD_ETAPA` | Text | Ex: 1., 1.1, 1.1.1 |
| `DESCRICAO` | Text | Descrição do serviço / atividade |
| `VALORES_JSON` | Text | Mapa de preços por fornecedor cotado |

### Aba 4: `Avaliacoes_Pos_OC` (Scorecard Pós-Serviço)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `ID_AVALIACAO` | Text (PK) | Identificador da avaliação |
| `NUMERO_OC` | Text | Número da Ordem de Compra no Fluig |
| `CNPJ_FORNECEDOR`| Text (FK) | Fornecedor avaliado |
| `EMPREENDIMENTO`| Text | Mega onde o serviço foi executado |
| `NOTA_QUALIDADE`| Decimal (0-10) | Peso 30% |
| `NOTA_PONTUALIDADE`| Decimal (0-10) | Peso 25% |
| `NOTA_SST` | Decimal (0-10) | Peso 20% |
| `NOTA_POSTURA` | Decimal (0-10) | Peso 15% |
| `NOTA_LIMPEZA` | Decimal (0-10) | Peso 10% |
| `IQF_NOTA_FINAL`| Decimal (0-100) | Nota ponderada calculada |
| `AVALIADOR` | Text | Gestor de Facilities responsável |
| `OBSERVACOES` | Text | Comentários e ocorrências registradas |

---

## 4. Diretrizes de Design & Usabilidade (Apple + Capital Realty)

A interface foi desenhada para encantar o comitê pela sobriedade, modernidade e facilidade de uso:

- **Efeito Liquid Glass**: Cards com fundo translúcido `rgba(255, 255, 255, 0.85)`, borda sutil `rgba(255, 255, 255, 0.4)` e desfoque de fundo `backdrop-filter: blur(12px)`.
- **Cores Oficiais da Capital Realty**:
  - `Azul Noturno`: `#151E49` (Estrutura, títulos e cabeçalhos escuros)
  - `Azul Royal`: `#003D7B` (Botões de ação primária e destaques)
  - `Azul Ação`: `#065CA9` (Interações, links e estados hover)
- **Segmented Control do macOS**: Abas fluidas para transição instantânea entre cotação, avaliação e dashboard sem recarregamento de página.
- **Microinterações Táteis**: Feedback visual imediato na validação de CNPJ, cálculos de somas ao digitar e barras de progresso do IQF com cores semânticas (Verde, Laranja e Vermelho).

