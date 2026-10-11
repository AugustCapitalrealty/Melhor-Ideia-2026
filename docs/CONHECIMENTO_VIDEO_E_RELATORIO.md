# Vídeo e relatório final: o que já sabemos fazer

Escrito em 11/10/2026 (domingo), depois de ler três lugares a pedido do Guilherme:

| Fonte | Caminho | O que é |
| :--- | :--- | :--- |
| Este projeto | `G:\Meu Drive\PROJETOS\Melhor-Ideia-2026` | Gestão de Contratações, inscrito no Melhor Ideia 2026 |
| A "empresa" do YouTube | `H:\Meu Drive\Youtube` (Drive **pessoal**) | Canais dele, com 6 áreas, portões e um motor que faz vídeo narrado em código |
| O orçamento | `G:\Drives compartilhados\08.000 - Business Analysis\APRESENTAÇÃO ORÇAMENTO` | Deck do Orçamento 2027 do Facilities (Megas), gerado por Apps Script |

**Objetivo:** fechar o projeto com dois entregáveis, **um relatório e um vídeo**. Este arquivo junta o que serve dos três lugares para
fazer os dois sem redescobrir nada. Ele não substitui os documentos de origem: aponta para eles.

> O C: tem Deep Freeze e a memória do Claude some no reinício. **O que precisa sobreviver fica aqui no repositório.**

---

## 1. O que o regulamento pede (PDF na raiz, versão 01 de 12/12/2025)

- **§7:** "relatório final **(apresentação)** até **15/10/2026**, detalhando como a ideia foi implementada e quais foram os resultados
  obtidos até o momento". Protocolo junto ao RH. Ou seja, o relatório é um **deck**, não um documento corrido.
- Seleção para a fase presencial até **30/10**; **apresentação presencial em novembro**; vencedor até **05/12** (MacBook na festa).
- A nota final é atribuída **ao relatório e à apresentação**:
  `Nota = V×0,20 + I×0,20 + Q×0,30 + E×0,30`
  (Viabilidade, Inovação, Qualidade da implementação, Impacto). **Desempate: 1º Impacto, 2º Qualidade.** 60% da nota está em E e Q.
- O regulamento **não fala em vídeo**. O vídeo é anexo nosso: reforça o relatório (link no deck) e pode abrir a apresentação de novembro.
  Confirmar com o RH se aceitam link de vídeo junto do protocolo.
- §10: as ideias passam a ser da Capital Realty. §11: o comitê trata tudo com sigilo.

## 2. O que o relatório pode afirmar (e o que não pode)

A regra da casa, desde 06/09: **nenhum número sem método ao lado; nenhum ganho afirmado antes de medido.** O comitê é de gestores e
pede a fonte.

| Já existe, com lastro | Onde está | Cuidado |
| :--- | :--- | :--- |
| 4 fases do plano construídas e publicadas | `BALANCO_EXECUCAO.md` | — |
| ~30–40 h de desenvolvimento inferidas dos commits (método e sensibilidade) | `METRICAS_TEMPO_E_AVALIACAO_2026-09-09.md`, `node tools/metricas-tempo-projeto.cjs` | É estimativa pelos commits, não cronômetro. Atualizar: há commits até 11/10 |
| 26 equalizações, 7 homologações, 3 avaliações, 4 usuários, 13 medições de tempo; 3 equalizações de outras pessoas em 9min10s, 11min32s e 13min35s (mediana 11min32s) | `ROTEIRO_CONSELHO_2026-09-09.md` | Número de 09/09, lido do roteiro. **Consultar a base de produção de novo** antes de pôr no relatório |
| 179 fornecedores e 738 contratações importados da plataforma | commit de 08/09 | É acervo importado, não economia gerada |
| Suíte de testes que reprova (37 defeitos com teste de regressão em 06/09) | `npm test`, `PLANO_DE_CORRECOES.md` | Recontar no dia |
| Escopos: avaliação simulada do comprador, nota 6,5/10; ~20 min no sistema × ~30–35 min no PowerPoint (escopo simples) | `docs/avaliacao-escopo-2026-10-02/` (ainda fora do git) | **Tempo estimado por contagem de cliques**, não medido com gente. Escrever assim |

> **Atualizado em 11/10 (noite):** o foco passou a ser o escopo (§8). A linha de base agora é **montar escopo no PowerPoint × no
> sistema**; o parágrafo abaixo fica como registro.

**O buraco que continua aberto:** a linha de base de tempo **no Excel** nunca foi cronometrada (`BALANCO_EXECUCAO.md` §6). Sem ela,
Impacto (30%, desempate 1) vira afirmação. O relatório precisa dizer isso com franqueza ou trazer a medição. Uma saída honesta:
cronometrar 2 ou 3 equalizações na planilha antes de 15/10 e apresentar como amostra pequena.

**Não usar:** o "~50 min → menos de 15 min" e o "saving comprovado" do `DEFESA_DA_MELHOR_IDEIA_MACBOOK.md`. Nunca foram medidos e
contradizem o `README.md` e o `BALANCO_EXECUCAO.md`.

## 3. O jeito de trabalhar da "empresa" (YouTube), aplicado aqui

Fonte: `H:\Meu Drive\Youtube\GERAL\AREAS\LEIA-ME.md` e os arquivos `1-` a `6-` da mesma pasta. A ideia que vale levar é a **cadeia com
portões**: cada etapa tem dono, entrada, saída e um "ok" antes da próxima. Para os nossos dois entregáveis:

| Etapa | Saída | Portão (quem fecha) |
| :--- | :--- | :--- |
| Direção | plano curto: o que é, por quê, número que apoia, custo em horas, data | **PLANO OK** (Guilherme) |
| Pauta e roteiro (Roteirista) | `ROTEIRO.md` do vídeo e o texto do relatório | — |
| Checador (outra sessão) | tabela de fatos: cada número com a fonte aberta (arquivo, base, commit) | **ROTEIRO OK** (Checador + Guilherme) |
| Voz | MP3 por capítulo em `voz/` | **VOZ OK**: o Guilherme gera no site do ElevenLabs; o Claude nunca gera voz |
| Produção | cenas, folha de quadros, rascunho do deck | **FOLHA PRONTA** |
| Qualidade (Auditor, outra sessão) | `CRITICA-AUDITOR-N.md`: veredito, 🔴 bloqueios / 🟡 importantes / ⚪ opcionais com instante e correção | parecer **sem 🔴** antes do render final |
| Produção | render, medição, pacote | **PRONTO** |
| Guilherme | revisão | **REVISADO** → protocolo no RH |

Regras da casa que valem igual aqui:
- **Checador antes da voz, Auditor na folha antes do render.** Em 08/10, 14 de 19 vídeos foram refeitos porque o auditor vinha depois do
  render. Corrigir na folha custa minutos; depois do render custa a voz.
- **Quem escreve não confere.** Checador e Auditor são outra sessão ou subagente. O Auditor não pergunta nada ao Guilherme: as ressalvas
  vão no parecer.
- **Fonte que não abriu não vale.** Link 404 ou página inicial reprova.
- **Fato errado descoberto depois da voz:** frase a mais = cortar no silêncio; frase errada = o Guilherme gera só aquela frase e emenda.
- **Registro sempre** (aqui: `HISTORICO.md`). Decisão revertida fica riscada, com o motivo.

## 4. O vídeo: como o motor faz

Tudo em `H:\Meu Drive\Youtube\MOTOR\` (`README.md`, `QUALIDADE-VIDEO.md`, `DESIGN-SYSTEM.md`). Exemplo completo e recente de projeto:
`H:\Meu Drive\Youtube\GUILHERME-AUGUST\longos\03-monstros-do-brasil\` (PAUTA, ROTEIRO, LOCUCAO, projeto.json, cenas, folhas, parecer do Auditor, pacote).

### Peças do projeto de vídeo
| Arquivo | O que é |
| :--- | :--- |
| `ROTEIRO.md` | fonte da verdade: `## N · TÍTULO` = capítulo; `**N.M · …**` = cena (descrição do que a tela mostra); linhas `> ` = fala. Refs `[n]` não são faladas |
| `LOCUCAO-elevenlabs.md` | o texto para o Guilherme colar no site, um MP3 por capítulo (`voz/N-nome.mp3`) |
| `projeto.json` | título, `estilos`, `"locucao": "voz"` (ElevenLabs) ou voz do edge-tts (`pt-BR-AntonioNeural`) para rascunho, pronúncias |
| `cenas/*.js` | `CENAS['N.M'] = { fn(lt, S) {…} }`; `S.w('palavra')` dá o instante em que a palavra é dita |
| `midia/real/` + `FONTES.txt` | imagens e vídeos reais. **Aqui: gravações de tela do app** |

### Comandos (de `H:\Meu Drive\Youtube\MOTOR\_motor`)
```
python preparar.py <projeto>          # mídia → cache (também cria o manifesto; obrigatório mesmo sem mídia)
python gerar.py    <projeto>          # alinha a voz (Whisper) e monta o player
python checar.py   <projeto>          # erros de JavaScript por cena
python render.py   <projeto> --folha N   # folha de revisão do capítulo N (é ela que vai ao Auditor)
python render.py   <projeto>          # MP4 final (só depois do parecer)
python medir.py    <projeto>          # tempo parado, saltos, 1º quadro, volume
python conferir.py <projeto|mp4>      # codificação, cor BT.709, −14 ±2 LUFS, pico ≤ −1 dBTP
```
O `pronto.py` e o `pecas.py` são da esteira dos canais: não usar neste projeto.

### Régua de qualidade (QUALIDADE-VIDEO.md)
- Nada parado mais de ~0,6 s, salvo tempo de leitura: **letras ÷ 15 + 1,5 s**.
- Uma ideia por tela; uma linha de causa, não um monte de efeitos; todo quadro pausado é uma imagem composta.
- Coisa rígida continua rígida (tela de app, logo e texto andam inteiros, não entortam).
- Volume final −15 LUFS, pico ≤ −2 dBTP (o render já faz). Efeitos baixos (`volEfeitos` 0,12) e sem ruído de ambiente sob a voz.
- Abertura (regra D13 dos Shorts, boa para qualquer vídeo curto): 1ª frase = o fato mais forte, com número; voz no 0,0 s; quadro 0 já em ação.

### O que muda num vídeo corporativo (lição do orçamento, 07/10/2026)
O Guilherme reprovou o "jeito YouTube" num material da empresa: *"não ficou nada corporativo, ficou coisa de documentário; pense nas
grandes empresas de auditoria do mundo"* (`IDEIAS-DESIGN.md` do orçamento). Para o vídeo do concurso:
- **Fora:** jacaré, retícula, papel rasgado, carimbo, caneta, textura de papel, serifa itálica de efeito.
- **Dentro:** fundo branco ou na cor da marca, cartões limpos, número protagonista, títulos que já dizem a conclusão, gravação de tela real
  do app. Marca: `#151E49`, `#003D7B`, `#065CA9` (Brandbook na raiz). A referência mais próxima entre as inspirações dele é a da Loctax
  (cores chapadas e cartões de interface), mas sem as cores pastel.
- **Mostrar o processo, não só a tela:** dor (planilha que não lembra, idas e vindas na aprovação) → escopo → equalização → histórico.
  O roteiro de 10/09 (`ROTEIRO_CONSELHO_2026-09-10.md`) já tem a narrativa aprovada em 11 passos.

### Cuidados próprios deste vídeo
- **Dados reais na tela:** a base tem fornecedores, CNPJ e preços reais. Gravar com dados de teste ou borrar, e dizer isso.
- **Voz:** o Guilherme gera no site. O plano grátis do ElevenLabs não permite uso comercial (MOTOR/README); para vídeo interno, confirmar
  o plano antes. Rascunho pode sair com o edge-tts.
- **Onde roda:** desde 11/10/2026 o núcleo do motor está **neste repositório**, em `video/motor/_motor` (o Guilherme: "salve o que
  precisa"). Como rodar: [`video/LEIA-ME.md`](../video/LEIA-ME.md). A pasta do YouTube deixou de ser necessária.
- **Horário:** na pasta do YouTube vale "seg–sex, 8h–18h, nada roda no terminal" (alerta do CrowdStrike, 08/10). Render longo de vídeo
  segue a mesma regra até ele dizer o contrário. Sábado e domingo é liberado.
- No máximo 3 renders juntos (tela azul com a RAM cheia); salvar no Drive antes de renderizar.

## 5. O relatório (deck): o que o orçamento ensina

Fontes: `Apresenta-o-Mensal-Megas-2026\orcamento-2027\` (`HANDOFF.md`, `README.md`, `IDEIAS-DESIGN.md`) e o `CLAUDE.md` da raiz
daquele repositório.

**Estrutura sugerida, seguindo os critérios e os pesos:**
1. Capa e uma frase-resumo.
2. A dor (antes), com o documento real (planilha `EQU_…`, idas e vindas da aprovação).
3. O que foi implementado (escopo → EAP → equalização → histórico → avaliação), com telas.
4. **Impacto (30%)**: resultados medidos, cada um com o método no rodapé, e o que ainda não foi medido, declarado.
5. **Qualidade da implementação (30%)**: plano × entregue, testes, publicação versionada, correções vindas do uso real.
6. Viabilidade (20%): custo zero de infraestrutura, Workspace já contratado, BrasilAPI sem SLA com degradação prevista, quem mantém.
7. Inovação (20%): memória entre cotações; o mesmo motor olhando proponentes, tempo e Megas.
8. Próximos passos (propostas registradas: convite com escopo, portal do fornecedor, custo real do MEI) e o pedido ao comitê.

**Regras de forma que já foram aprovadas lá:**
- **Título com a conclusão** ("Segurança sobe R$ 425 mil: posto 24h e drone"), não o nome do assunto.
- **Um gráfico, uma mensagem e a prova ao lado**; tabela não é peça principal (os 3 slides mais fortes do orçamento seguem isso).
- **Comparação honesta:** não concluir de um recorte de meses; projeção diz que é projeção; separar efeitos quando a base muda.
- **Alerta de pendência sempre ligado:** o que falta aparece no deck, nunca fica só no log.
- Convenção de cor: ▲ vermelho = custo sobe, ▼ verde = cai; "=" abaixo de 0,5%.
- Visual de Big Four: fundo branco, número grande, foto sem efeito, trilha das seções no pé.

**Técnica de Slides que já custou tempo nos dois repositórios:**
- Caixa de texto do Slides tem ~7 pt de recuo que não desliga e quebra antes do que a estimativa acha: medir antes de desenhar e dar
  folga (`_gUmaLinha_`, `_gParagrafo_` na `megas-mensal`; skill `.claude/skills/slides-caixa-texto-sem-quebra/` lá).
- Tabela com fonte única: texto que não cabe é encurtado de propósito, não encolhido só naquela linha.
- `setLineSpacing` abaixo de 100 dá erro.
- Este repositório já tem um gerador de deck: `app/Apresentacao_Conselho.gs` + `ConselhoNarrativa.gs` + `ConselhoVisual.gs`, com
  exportação para PPTX e prévia em HTML em `tools/gerar-apresentacao-conselho.cjs`. É o ponto de partida do relatório.

**Ciclo de aprovação visual (como ele gosta):** rascunho em PNG **aberto na tela dele** (`Start-Process`) → "rode um analista"
(um agente avalia e dá nota) → v2 → "aprovado" → código → teste → publicação.

## 6. Como o Guilherme trabalha (vale para os dois entregáveis)

- **Ideia nova: primeiro a estratégia, depois a produção.** Apresentar o plano e esperar o "sim" antes de criar arquivo ou script.
- "**Vai anotando**" = só anotar; nada de código até "**pode rodar**".
- Quer **números reais**, não teoria. Se dá para medir, medir.
- Escolha visual entre duas versões: quando der, testar em vez de perguntar.
- Ele corrige quando o Claude erra: refazer a análise inteira e registrar a correção.
- Sempre dizer **em qual arquivo** está a função que ele tem que rodar, e terminar com um passo a passo curto.
- Escreve em português, às vezes em maiúsculas e sem pontuação. Responder em português.

## 7. Ambiente

- Deep Freeze no C:: Node, Python, clasp e login somem no reinício. O repositório no G: e o GitHub sobrevivem. **Fim de sessão: commit e
  push** (há outra cópia do repositório que também envia commits: `git fetch` e conferir `main..origin/main` antes de mexer).
- Publicação do app: `npm run push` (testes + `clasp push`, atualiza o @HEAD) e `npx clasp deploy -i <id> -d "<descrição>"` para a
  implantação que os usuários abrem (`HISTORICO.md`, 02/10).
- `.gsheet` e `.gslides` no G: são atalhos: não dá para ler o conteúdo pelo disco.

## 8. Decisões do Guilherme (11/10/2026)

| Pergunta | Resposta |
| :--- | :--- |
| O vídeo vai junto do relatório em 15/10? | Sim (lido assim; confirmar se ele quis dizer outra coisa) |
| Duração | 2 a 3 min, para o comitê |
| Voz | ele gera no ElevenLabs |
| Motor do YouTube | "salve o que precisa" → copiado para `video/` |
| Linha de base no Excel | ele cronometra nesta semana |
| Prévia | "faça um vídeo de 20 segundos, uma prévia, mesmo com voz genérica; depois vamos melhorar; está tudo aprovado" → `video/01-previa-20s/` (20,2 s) |

| Imagens do vídeo | "tem que usar imagem do script mesmo, real, não simulado" → só capturas de tela do app em produção e dos documentos que ele gera |
| Foco | **"minha meta é focado no escopo; base de fornecedores vamos interligar com o que está no Fluig/RM"** → o vídeo e o relatório contam o escopo; a integração Fluig/RM entra como **próximo passo** (não existe ainda: nunca dizer que existe) |

| Entrega (11/10, noite) | **"vamos entregar essa semana; o foco é vender a montagem do Escopo; ocultar preços e base de fornecedores (vai ser integrado com FLUIG/RM)"** |
| O que ocultar | Consulta de preço, **Equalizações** e Base Fornecedores, **no app** (implantação em "modo escopo", reversível por chave) **e nas peças** |
| Linha de base | **Montar escopo no PowerPoint × no sistema** (2 ou 3 escopos). Substitui a do Excel |

**Estratégia completa (critério a critério, ponte com a ideia aprovada, roteiro do deck, semana):**
[ESTRATEGIA_NOTA_MAXIMA.md](ESTRATEGIA_NOTA_MAXIMA.md).

**Consequência para o relatório e o vídeo:** a história é só o escopo (dor → base e busca → grupos, fotos, EAP → deck padronizado,
planilha do fornecedor, revisões → número medido → Fluig/RM como próximo passo). A tabela do §2 vale só no que é escopo; os números de
equalização, consulta de preço, fornecedores e IQF **não entram**.

Ainda em aberto: os números de uso (equalizações, homologações, avaliações, tempos) precisam ser lidos de novo na base de produção.

## 9. Telas reais: como capturar e o que a base mostrou (11/10/2026)

**Como capturar** (`video/ferramentas/`): Chrome com `--remote-debugging-port=9222` e perfil novo em `%LOCALAPPDATA%\chrome-video-contratacoes`
(some no reinício), o Guilherme faz o login, o Playwright **conecta** (nunca lança). O app abre em
`script.google.com/a/macros/capitalrealty.com.br/s/<implantação>/exec` (implantação @76 em 11/10). O iframe do app só aparece para o
Playwright **depois de recarregar a página** com a conexão aberta. Scripts: `capturar_telas.py` (as 6 abas), `capturar_roteiro.py`
(consulta, equalizações, ficha do fornecedor), `capturar_escopo.py <id>` (um escopo aberto, de cima a baixo, e os links que ele gerou),
`capturar_documentos.py` (o deck no Slides pelo `/htmlpresent` e a planilha do fornecedor). Só usam funções de leitura.
As capturas ficam em `video/capturas/` (fora do git: dados reais).

**Privacidade nas telas:** a planilha do Google mostra a foto de perfil do Guilherme (canto superior direito) e o escopo, o deck e a
planilha trazem o telefone da responsável. Enquadrar a câmera para deixar os dois de fora.

**O que a base mostrou em 11/10/2026** (para o relatório, conferir de novo no dia):

| Tela | Número |
| :--- | :--- |
| Escopos | 8 escopos (6 reais emitidos nos 3 Megas + 2 de teste); o do PPCI de Itajaí está na R9, com 6 revisões geradas (R4–R9) e a planilha do fornecedor |
| Equalizações | 21 no acervo, 3 homologadas (R$ 52.029,31), 18 em aberto, nenhuma rodada de negociação registrada (saving "—") |
| Consulta de preço | 791 pontos de preço, 318 fornecedores, 3 empreendimentos, cotações de 19/12/2025 a 11/09/2026 |
| Fornecedores | 318 na base |

**Cuidados encontrados nas telas:**
- **Defeito real:** a Consulta de preço escreve **"R$ R$ 57,97"** (moeda duplicada nos cartões e na matriz). Corrigir antes da versão final
  do vídeo (precisa de publicação nova do app, com o ok do Guilherme).
- A tela de Fornecedores mostra **"IQF médio corporativo 76,9 / 100 · Classe B (Aprovado)"** com **1 avaliação** na base. Não usar esse
  indicador no vídeo nem no relatório como resultado.
- Há equalizações `::TESTE::` e escopos "Teste 01" na base de produção: não enquadrar.
