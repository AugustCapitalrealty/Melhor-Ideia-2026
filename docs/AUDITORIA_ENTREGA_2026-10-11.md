# Parecer independente — Gestão de Contratações

Data: 11/10/2026, horário de Brasília. Auditoria por inspeção documental, visual e de código. Não é nota da banca nem certificação jurídica.

## Veredito

**Passa no corte de 15/10? Não está pronto para ser protocolado. A elegibilidade precisa ser esclarecida antes.** [Regulamento, §4 e §7; evidências E1/E2 abaixo; telas dos slides pendentes.]
**Ganha em novembro? As provas atuais não sustentam essa conclusão. Há software útil, mas resultado ainda insuficiente.** [Seção A; slides de tempo, uso e depoimentos.]
**Maior risco: Capital Fornecedores pode estar fora das primeiras inscrições válidas; em seguida vêm exposição comercial e ausência de aprovação comprovada.** [Regulamento, §4 e §5.2; E1–E3; consulta GitHub descrita abaixo.]

## Base e rastreabilidade

Foram lidos os documentos na ordem solicitada, incluindo o regulamento inteiro e suas imagens. Foram abertos individualmente todos os PNGs de `relatorio/rascunho/saida/slide-01.png` a `slide-15.png`. Os alterados durante a auditoria foram revistos. Foram examinados o gerador, código do app, testes, capturas, cenas, folha da prévia, documentos antigos e mensagens originais do Gmail.

O repositório mudou por atividade externa durante esta auditoria. O recorte principal de conteúdo é o commit **`667ce3bef66445fdbea962017408bc53ec149a86`**. A nova abertura sobre casos reais está incluída neste parecer. As referências de linha ao gerador usam esse commit. Durante a gravação surgiu **`589a34502445d6f70a424d84882080689c2cd430`**, com logos, sons e registro do plano Creator. O delta foi lido, os PNGs de capa e encerramento foram reabertos e a ressalva de licença foi atualizada. Não há render final novo demonstrado. `git fetch` foi executado; `main..origin/main` estava vazio. Na última conferência, HEAD e origin/main apontavam para `589a345`; somente este parecer aparecia como arquivo novo. As mudanças desde o código testado não alteraram `app/`, `tests/` nem `package.json`, conforme os diffs Git inspecionados.

Fontes externas efetivamente abertas, que mudam o diagnóstico:

- **E1 — [Inscrição anterior, e-mail enviado ao RH](https://mail.google.com/mail/u/?authuser=guilherme.marques%40capitalrealty.com.br#all/19c2a0bfc5770454)**. Em **04/02/2026**, o autor informa ter preenchido o formulário e submetido **três propostas**: Conveniência Logística, Capital Knowledge e Capital Mentors. Fonte: corpo e cabeçalho dessa mensagem.
- **E2 — [Inscrição Capital Fornecedores, e-mail enviado ao RH](https://mail.google.com/mail/u/?authuser=guilherme.marques%40capitalrealty.com.br#all/19dda4d5f7b8efd7)**. Em **29/04/2026**, informa formulário preenchido para avaliação periódica de prestadores, integrada à modelagem dos Megas e às OCs do Fluig. Fonte: corpo e cabeçalho dessa mensagem.
- **E3 — [Retorno original do RH](https://mail.google.com/mail/u/?authuser=guilherme.marques%40capitalrealty.com.br#all/19e41cdd3964b5fe)**. Em **19/05/2026**, pede detalhamento integral porque parte do processo já existe no Fluig. Pede critérios, automação após OC, indicadores, histórico e aplicação à decisão. **Não contém aprovação nem pesos dos critérios.** Fonte: corpo dessa mensagem.
- **[Repositório GitHub](https://github.com/AugustCapitalrealty/Melhor-Ideia-2026)**: consulta ao conector `github_get_repo`, nesta auditoria, retornou `visibility: public` e proprietário `owner.type: User`. Isso confirma publicidade; não prova quem controla institucionalmente a conta nem autorização da empresa.

As referências `arquivo:linha` abaixo são relativas à raiz do projeto. “Tela Sxx” significa o PNG do slide correspondente, aberto nesta auditoria. Custos, notas, probabilidades qualitativas e tempos sugeridos são **estimativas do auditor**, não medições do projeto.

## Achados, do mais grave para o menos grave

| Gravidade | Onde | O que está errado | Correção proposta | Custo estimado pelo auditor |
|---|---|---|---|---|
| 🔴 Elegibilidade | Regulamento §4, p.2; E1 e E2 | O regulamento considera as primeiras **três ideias pela data do formulário**. A sequência dos e-mails indica que Capital Fornecedores pode ser a inscrição excedente. Uma análise posterior do comitê não resolve automaticamente essa regra. | Guilherme obter do RH a ordem dos formulários e manifestação expressa sobre elegibilidade. Registrar eventual substituição, cancelamento ou decisão aplicável. Não inventar exceção. | 30–60 min de preparação; resposta externa sem prazo garantido |
| 🔴 Exposição comercial | GitHub público; `dados/historico_orcamentos.csv:1`, `dados/README.md:3`, `:5`, `:26`; `app/DadosFabesul.gs`; `.gitignore` | Dados reais de fornecedores, CNPJs, cotações e vínculos documentais estão versionados publicamente. Ignorar capturas não protege essas outras bases. | Guilherme acionar TI/responsável pela informação para restringir acesso e avaliar histórico, cópias e autorização. Depois definir repositório corporativo e acervo privado. Não basta apagar a última versão. Não publicar este parecer antes dessa avaliação. | 30–60 min para contenção coordenada; saneamento pode levar horas |
| 🔴 Aprovação e escopo elegível | Tela S05; `gerar.cjs:113`; E3; Regulamento §5.2–5.3, p.3 | A data apresentada como aprovação é um pedido de complementação. A minuta do próprio autor é usada como prova do comitê. A mudança para escopos e as funções publicadas depois do prazo de implementação não têm enquadramento formal demonstrado. | Localizar parecer/ata real, formulário original e aceitação da evolução. Separar claramente o que existia até o prazo, o que veio depois e o que é proposta futura. | 1–2 h para organizar provas; depende do RH |
| 🔴 Afirmações contrariadas pelas fontes | Telas S04, S05, S10, S13; locução `:19`, `:23` | Unidades de serviços diferentes viraram unidades do mesmo serviço; planilha foi atribuída a toda revisão; entrada em produção foi deslocada; “um clique” não corresponde à interface; sustentação e ausência de base paralela são afirmadas sem lastro. | Corrigir cada frase conforme a conferência numérica na seção B. Fazer o Checador antes de gravar voz. | 1–2 h |
| 🔴 Resultados e versão final incompletos | Telas S07, S09, S10, S11, S13; `ESTRATEGIA_NOTA_MAXIMA.md:82`–`:85` | Antes/depois, tempo e satisfação estão vazios. Uso agregado não tem memória de contagem completa. A segunda pessoa está indefinida. É um rascunho assumido, não uma entrega final demonstrativa de resultados. | Medir, coletar, contar e anexar prova. Se algo não existir até o fechamento, declarar a limitação e retirar a promessa de ganho. | 4–6 h de campo, mais 1–2 h de consolidação |
| 🔴 Prévia incompatível com a entrega | `video/01-previa-20s/cenas/01-previa.js:160`–`:186`; folha `build/revisao/folha-cap0.png` | A cena de fornecedores expõe nomes, CNPJ e valores reais. A navegação inicial também mostra módulos que a decisão atual manda ocultar. O selo de integração futura não elimina a exposição. | Retirar a cena e refazer capturas no modo escopo. Inspecionar o vídeo final inteiro, quadro a quadro nos trechos de tela. | 1–3 h, fora eventual render demorado |
| 🟡 Protocolo e pacote | Regulamento §5.1 e §7; pasta `relatorio/rascunho/`; `video/02-relatorio/` | Não foi encontrada confirmação do formato, horário limite, destinatário operacional do relatório e tratamento do vídeo. O gerador produz HTML/PNG, não o arquivo final de apresentação. A pasta do vídeo final contém roteiro e locução, sem render. | Confirmar com RH; preparar arquivo aceito, versão estática legível, anexos e comprovante de recebimento. | 1–2 h; depende de resposta externa |
| 🟡 Produção ainda não validada | `HISTORICO.md:430`–`:432`; `tests/teste-modo-escopo.cjs` | Publicação registrada, mas conferência no navegador segue pendente. Testes locais não comprovam a implantação ativa. | Abrir o link publicado autenticado; testar entrada, links antigos, geração, revisão e permissões com outra conta autorizada. | 30–60 min |
| 🟡 Foto e operação ao vivo | `HISTORICO.md:292`–`:298`; `app/EscopoInterface.html:177`–`:206` | Foto grande/HEIC recusa; lote para no primeiro erro; mover foto pode cruzar grupos; campo obrigatório não aparece na saída; status fica longe do botão. | Preparar mídia aceita e ensaio. Planejar correções como melhorias posteriores, com enquadramento do concurso esclarecido. | 30–60 min de prevenção; 3–6 h de correções e validação |
| 🟡 Sustentação frágil | `README.md:129`–`:137`; `package.json:11`; `HISTORICO.md:306` | O caminho de publicação destacado falha no ambiente atual e confunde enviar código com atualizar a implantação. Sem operador substituto demonstrado. | Consolidar procedimento atual e fazer outro operador reproduzir publicação/retorno em ambiente seguro. | 2–3 h |
| 🟡 Licenças a documentar | `video/02-relatorio/LOCUCAO-elevenlabs.md:8`; `HISTORICO.md:466`; `video/MUSICAS/`; fontes oficiais na seção D | Atualização externa informa Creator e geração de trilha própria. Isso reduz a dúvida sobre voz grátis, mas faltam comprovante do assinante/período e enquadramento nos termos específicos de música. Licenças das faixas antigas não foram demonstradas. | Guardar plano e data de geração; documentar os direitos da faixa escolhida. Usar voz própria ou dispensar trilha continua possível. | 30–60 min de conferência; regravação se necessária |
| 🟡 Documentos se contradizem | `AUDITORIA_NOTA_2026-09-08.md:1`–`:15`; `DEFESA_DA_MELHOR_IDEIA_MACBOOK.md:28`; `README.md:91`–`:92` | Simulação antiga é chamada de nota oficial/da banca. Ganho nunca medido permanece em material ainda vinculado. | Marcar como histórico invalidado e tirar do pacote e dos links de defesa. Manter fonte única atual. | 20–40 min |
| 🟡 Legibilidade e método | Telas S06, S08, S12, S13; `gerar.cjs:258`–`:266` | Capturas pequenas; fontes de rodapé claras; algumas frases absolutas. Referência ao arquivo não substitui memória de cálculo. | Ampliar a prova relevante, incluir unidade/amostra/data/limitação, testar na projeção real. | 1–2 h |
| ⚪ Ritmo | Telas S02, S03, S15 | Checklist interno e sumário consomem atenção; encerramento não oferece caminho para evidências. | Checklist fora da versão final quando resolvido; sumário pode ser abreviado na fala; fechamento com autor e anexos. | 15–30 min |

## A. A nota

Método: julgamento independente sobre prova disponível e consistência da entrega. Não é medição, previsão estatística nem avaliação oficial. A fórmula e os pesos vêm do **Regulamento §6, pp.3–4**. A elegibilidade é uma condição anterior à nota; nenhum cálculo abaixo sana inscrição inválida.

| Critério | Nota do auditor hoje | Motivos e prova |
|---|---:|---|
| Viabilidade e sustentabilidade | **6,5** | Há implementação sobre Workspace e saída real: `app/appsscript.json`, tela do histórico PPCI e `EscopoPlanilha.gs:39`. A sustentação depende do autor: tela S13, `README.md:133` versus `HISTORICO.md:306`. Permissões, custo operacional, sucessor e governança do repositório não estão demonstrados: consulta GitHub e S13. |
| Inovação | **6,5** | Cadastro reaproveitável e geração de documentos atacam prática manual interna: `Escopos.gs:175`–`:185`, `EscopoInterface.html:59`. O comitê já apontava funcionalidade de avaliação existente no Fluig: E3. Não há comparação que prove novidade no setor, nem integração operacional nova com Fluig/RM: S05/S14 dizem futuro. |
| Qualidade da implementação | **6,0** | A bateria local passou e há histórico real de emissão: `package.json:7`, resultado registrado na seção C, tela E05. Persistem falhas de operação e falta de verificação da versão publicada: `HISTORICO.md:292`–`:298`, `:432`. A qualidade do relatório cai por fatos incorretos e provas pendentes: telas S04/S05/S07/S10/S13. |
| Impacto | **4,0** | Há artefatos utilizáveis e resposta a pedidos de usuário: tela E05 e `HISTORICO.md:224`–`:249`. Tempo e satisfação não foram apurados: telas S09/S11 e `ESTRATEGIA_NOTA_MAXIMA.md:82`, `:84`. Emissão não prova envio, adoção, redução de erro ou benefício empresarial: S10 sem contagem auditável de usuários/entregas. O regulamento também reconhece potencial; por isso a ausência de medição não zera o critério. |

| Cenário, julgamento do auditor | V | I | Q | E | Conta e resultado |
|---|---:|---:|---:|---:|---|
| Entregar o rascunho como está | 6,5 | 6,5 | 6,0 | 4,0 | 1,30 + 1,30 + 1,80 + 1,20 = **5,60** |
| Medição válida e depoimentos autênticos preenchidos; demais achados permanecem | 6,5 | 6,5 | 6,0 | 6,5 | 1,30 + 1,30 + 1,80 + 1,95 = **6,35** |
| Comitê entende que a proposta aprovada foi trocada, mas ainda decide pontuar | 6,5 | 5,0 | 3,0 | 4,0 | 1,30 + 1,00 + 0,90 + 1,20 = **4,40** |

Fonte das contas: notas atribuídas pelo auditor na tabela anterior e pesos do Regulamento §6. No cenário de medição, a elevação de Impacto pressupõe benefício observado, comparação justa e depoimentos livres. Preencher espaços com resultado desfavorável não produz essa elevação. A rejeição por regra pode significar exclusão, não nota baixa.

A simulação da estratégia está registrada em `HISTORICO.md:441`: **6,3 hoje; 7,7 com a estratégia; 8,65 em novembro; 6,8 se lida como troca**. Discordo do ponto de partida porque ela não incorpora a sequência das inscrições, o teor real da devolutiva, publicidade dos dados e os erros do deck. Preencher somente medição e falas não equivale a cumprir a estratégia inteira. A projeção de novembro exige mais uso, sustentação e prova do vínculo com a inscrição. O cenário de troca subestima justamente a aderência ao resultado proposto. Não há dado de concorrentes ou distribuição das notas para prometer vitória.

Impacto e Qualidade desempatarão nessa ordem: **Regulamento §12, p.6**. Priorizar evidências desses critérios faz sentido. Multiplicar funcionalidades ou exibir volume histórico de compras não substitui resultado da ideia.

## B. A apresentação — relatório do prazo final

### Inspeção visual de cada slide

Todos foram abertos. Não identifiquei corte acidental ou sobreposição que inutilize os PNGs. Isso não comprova legibilidade no projetor. O rodapé usa **18 px** e a trilha **17 px**, em tom claro: `gerar.cjs:258`–`:263`. Nas capturas reduzidas, os dados servem mais como ilustração que como prova legível.

Na tabela, numeração é localização, não indicador de desempenho. As fontes apontadas nos rodapés foram abertas; divergências seguem logo abaixo.

| Tela | Título conclui? / protagonista | Número, fonte e leitura |
|---|---|---|
| S01 | A frase de apoio conclui; o título identifica. Nome do projeto domina. | Data de entrega é agenda, sustentada pelo Regulamento §7. Visual limpo. Falta autor e vínculo explícito com o nome inscrito. Fonte visual: `slide-01.png`. |
| S02 | Sim, como checklist interno. A tabela domina. | **Quatro pendências** correspondem às linhas, mas não cobrem todos os bloqueios. A referência do antes/depois aponta S06, embora esteja em S07: `gerar.cjs:71`–`:78`. Quantidades de coleta são planos, não resultados. Retirar do pacote quando resolvidas. |
| S03 | A frase conclui; a organização é clara. | As faixas de slides conferem com o conteúdo: `gerar.cjs:88`–`:92`. A expressão de custo repete a ressalva de S13. Não há método de benefício aqui. Pode ser abreviado na fala. |
| S04 | Sim. Os casos disputam atenção, sem um protagonista único. | Visitas e preço agregado têm referência interna; unidades foram fundidas indevidamente. Fonte genérica demais para defender a inferência. O indicador de unidades quebra em linhas, mas cabe. Ver conferência abaixo e tela `slide-04.png`. |
| S05 | Sim, mas a conclusão não prova continuidade formal. Linha do tempo domina. | Aprovação, ata/pesos, entrada em produção e ordenação das datas precisam correção. O selo de Fluig/RM futuro está claro. Título extenso cabe. Fonte: `gerar.cjs:109`–`:119`, E3 e tela E05. |
| S06 | Sim. Fluxo tem boa sequência, mas as telas estão pequenas. | As saídas existem. EAP e revisão precisam conferência por artefato. A captura é **R9 de 22/09/2026**, conforme tela E05 e `P-arquivos.json:38`–`:39`. O rodapé informa a captura posterior corretamente. Sem contato pessoal visível no recorte inspecionado. |
| S07 | Propõe um padrão, mas o subtítulo apresenta adoção ampla como fato. O “depois” domina; o “antes” está vazio. | A amostra antiga ainda não existe no slide. A revisão exibida confere com a capa real. Empresa inteira é expansão proposta, não adoção demonstrada: `HISTORICO.md:453`–`:455`. Fonte visual: `slide-07.png`. |
| S08 | “Começa pronto” exagera: muitos dados ainda devem ser preenchidos. Os blocos copiados dominam. | **Nove blocos** são uma contagem editorial dos chips, coerente com os grupos de dados, mas a categoria também é copiada: `Escopos.gs:182`–`:185`. Explicar o agrupamento; não chamar de total exato de campos. Captura pequena para auditar. |
| S09 | Seria uma conclusão, hoje é lacuna. Os tempos vazios dominam. | O plano de **dois ou três casos** está em `ESTRATEGIA_NOTA_MAXIMA.md:82`; não existe resultado. Método precisa equiparar entregáveis e controlar familiaridade. Não há mediana calculável. Fonte visual: `slide-09.png`. |
| S10 | Sim, mas uso e alcance precisam prova. Os indicadores têm pesos visuais semelhantes. | Quantidade real/teste é registro interno; revisões têm prova; planilhas por revisão não conferem. “Dias” não tem convenção. Falta memória de contagem de usuários e emissões. Fonte: `gerar.cjs:178`–`:185`, tela C01/E05 e JSON de arquivos. |
| S11 | Título é assunto, não conclusão. Cartões vazios dominam. | Os depoimentos são placeholders. Não há satisfação observada nem autorização coletada. Fonte: `slide-11.png`, `ESTRATEGIA_NOTA_MAXIMA.md:84`. Trocar o título pela conclusão que as falas reais permitirem. |
| S12 | Sim. Linha do tempo é protagonista. | Contagem de testes confere; redução tipográfica tem registro de simulação; retorno à versão anterior não foi ensaiado por substituto. Pedidos estão parafraseados, embora rodapé sugira reprodução literal. Conteúdo denso para projeção. Fonte: `package.json:7`, `HISTORICO.md:226`–`:249`, `:265`–`:270`. |
| S13 | Sim, mas afirma mais que a prova. Cartões disputam atenção. | “Zero”, ausência de sistema paralelo e independência pessoal precisam qualificação. O próprio cartão mostra sustentador indefinido. Fonte: `slide-13.png`, `Codigo.gs:540`–`:547`, `README.md:133`. Texto pequeno e denso nos cartões. |
| S14 | É assunto/decisão solicitada. O pedido ao comitê domina bem. | Limite de foto confere no código. Agenda até novembro mistura melhoria local com integração dependente de TI; não é cronograma aprovado. A proposta de expansão empresarial está corretamente apresentada como pedido. Fonte: `EscopoInterface.html:177`–`:180`, `gerar.cjs:224`–`:240`. |
| S15 | Mensagem de fechamento, não resultado. Frase domina. | Sem indicador. Limpo. Falta acesso ao relatório, evidências e eventual vídeo, além do crédito do autor. Fonte visual: `slide-15.png`. |

### Conferência numérica e factual contra as fontes

- **S04, visitas:** **2, 3 e 12 visitas/ano**, com **1,00 VB**, aparecem em `BASE_DE_CONHECIMENTO.md:394`–`:401`. É evidência textual consolidada; o mapa original não foi reaberto nesta auditoria. Não transformar a amostra em frequência geral de falhas.
- **S04, unidades:** **VB/KG** aparecem no posicionamento de armadura; **VB/M³** aparecem no bota-fora. São itens distintos em `BASE_DE_CONHECIMENTO.md:548`–`:549`. Logo **“3 unidades para o mesmo serviço” não confere**. Usar um item real e suas unidades, sem somar linhas diferentes.
- **S04, preço agregado:** a fonte mostra **um preço no pai e filhos descritivos sem valores**: `BASE_DE_CONHECIMENTO.md:1340`–`:1349`. Ela chama isso de verba com escopo detalhado. O slide transforma ausência de decomposição monetária em desconhecimento do que foi considerado. Essa conclusão não decorre da fonte. Explicar o risco de comparação entre decomposições, sem acusar omissão do serviço.
- **S04, obrigação legal:** a [Lei de manutenção de climatização, art.1º](https://planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13589.htm), exige PMOC nas situações previstas. Isso não basta para concluir, só pela observação de uma proposta, descumprimento legal de fornecedor. Preferir o fato documental: “a proposta informa que não emite laudo PMOC”. Atribuição de infração exigiria análise técnica específica.
- **S05, aprovação:** a data **19/05/2026** em `gerar.cjs:113` confere com E3, mas o evento está errado: houve complementação, não aprovação expressa. `RESPOSTA_AO_COMITE.md:1`–`:5` identifica o arquivo como minuta do autor. Não é a resposta recebida nem uma ata.
- **S05, critérios/pesos:** os **cinco critérios** e os pesos **30/25/20/15/10** estão em `RESPOSTA_AO_COMITE.md:40`–`:46`, como proposta. Não estão em E3. “Pesos da ata” precisa de ata efetiva. Automação após homologação interna não comprova integração com OC real do Fluig.
- **S05, pesquisa:** **28 documentos** estão declarados em `HISTORICO.md:35`–`:38`. O número tem lastro no registro, mas não foi reconciliado a um manifesto dos originais. Não o apresentar como contagem independente deste auditor.
- **S05, cronologia:** a etapa “setembro” aparece antes de **05/09**, sem data que sustente a ordem. “Escopo entra em produção em outubro” contraria emissões **R4 em 15/09** e **R5–R9 em 22/09**: `video/capturas/2026-10-11/escopo-ppci/P-arquivos.json:8`–`:39`. Outubro deve descrever evolução, não estreia do módulo.
- **S06 e locução:** há **três tipos de saída**, mas **dois comandos de geração**: `EscopoInterface.html:59`, `:209`, `:262`–`:269`. A locução `video/02-relatorio/LOCUCAO-elevenlabs.md:23` promete “um clique”. Corrigir para “um cadastro alimenta as saídas”. Não há uma operação atômica única que emita todo o pacote.
- **S08:** os **nove blocos** correspondem ao agrupamento visual, não a todos os campos copiados: `gerar.cjs:152`–`:155` e `Escopos.gs:182`–`:185`. A origem usa última emitida, com fallback para última revisão: `Escopos.gs:178`. Evitar a afirmação absoluta quando não houve emissão.
- **S10, uso:** **oito registros, seis reais e dois testes em três Megas** constam de `CONHECIMENTO_VIDEO_E_RELATORIO.md:228` e `ESTRATEGIA_NOTA_MAXIMA.md:83`. A captura C01 mostra o total e parte da lista; não permite confirmar sozinha toda classificação, Esteio, usuários nem envio a fornecedores. Recontar por ID, Mega, autor, data e artefato; separar rascunho, emitido e efetivamente enviado.
- **S10, revisões:** **seis pares Slides/PDF, R4–R9**, conferem em `P-arquivos.json:4`–`:41` e na tela E05. Há **somente uma planilha, R9**, no array `:42`–`:49`. Portanto “cada uma com deck, PDF e planilha” está errado. R9 é um identificador; não prova nove emissões no sistema.
- **S10, dias:** entre **02/10 e 11/10** há **nove dias decorridos** ou **dez datas inclusivas**. Cálculo do auditor sobre datas de `HISTORICO.md:222` e `:420`–`:430`. Trocar o indicador por intervalo explícito ou declarar a convenção. Não confundir versões com dias de uso independente.
- **S12, testes:** **34 scripts** compõem `package.json:7` e passaram nesta auditoria. A estratégia diz **35** em `ESTRATEGIA_NOTA_MAXIMA.md:100`; corrigir a estratégia. O comando não inclui o teste de navegador. Ter o script de testes não comprova execução antes de absolutamente toda publicação; a afirmação exige registros por publicação.
- **S12, tipografia e retorno:** **sete tamanhos para um tamanho de corpo** têm registro em `HISTORICO.md:230`–`:237`, numa análise com Google simulado. Há exceção da EAP e rótulos. **“Um passo” para voltar** é simplificação do procedimento `HISTORICO.md:265`–`:270`, não recuperação operacional cronometrada. Usar “publicação versionada permite retorno”, com procedimento disponível.
- **S13, custo:** “zero” só é defensável como ausência identificada de licença/servidor adicional sobre Workspace existente. Não cobre horas, sustentação, quotas, voz, trilha ou integração. “Nenhum sistema paralelo” não descreve o estado atual: código e dados de preço/fornecedor persistem, por decisão explícita em `Codigo.gs:540`–`:547`. Migração é intenção, não resultado entregue.

As datas de coleta dos slides pendentes são metas editoriais, sustentadas por `gerar.cjs:75`–`:78`, `:174`, `:185`, `:192`. Não são medições realizadas. Numeração de seções, passos e slides é estrutura, sem significado de impacto.

**Cumprimento do §7:** parcial. Há explicação do funcionamento e histórico de melhorias. Faltam resultados apurados e conexão demonstrada com o objeto inscrito. O regulamento pede implementação e resultados até o momento, não economia financeira obrigatória. Um relatório honesto com resultado limitado pode cumprir o conteúdo; o atual ainda contém espaços vazios e conclusões maiores que suas fontes.

**Vazamento nos PNGs:** não identifiquei preços preenchidos, CNPJ, fornecedor comercial, telefone ou foto de perfil nos recortes exibidos. Há rótulos monetários na planilha, sem valores; isso não é vazamento de preço. As capturas originais contêm contato nominativo, telefone e perfil e precisam permanecer restritas. Conferi a capa original `escopo-ppci-docs/D02-slides-y0.png`, a planilha `D90-planilha-fornecedor.png` e os recortes de S06/S07. A prévia de vídeo tem problema distinto, tratado na seção D.

**O que falta:** um quadro “inscrito/pedido pelo comitê → entregue até o prazo → posterior/futuro”, apoiado em aprovação real; memória de resultados; responsável pela sustentação; link de evidências e limitações. Pode caber na revisão de slides existentes ou em anexo. Não precisa aumentar o deck. O checklist interno e o sumário podem sair da fala; a ponte com a inscrição não pode sair.

## C. O projeto e o app publicado

### Testes executados

`npm test` foi executado com Node portátil em `%LOCALAPPDATA%\node`, versão **v24.21.0** verificada no terminal. **Resultado: exit code 0; os 34 scripts do comando terminaram com sucesso.** Fonte: execução desta auditoria e enumeração de `package.json:7`. A comparação Git citada na base confirma que app, testes e comando permaneceram iguais no recorte final.

Isso valida lógica local com serviços Google simulados e algumas verificações estruturais. Não valida permissões reais, quotas, sessões corporativas, legibilidade das saídas atuais ou comportamento completo de navegador. `tests/teste-modo-escopo.cjs` simula `doGet` e verifica regras da interface. `tests/teste-escopos-browser.cjs` não está no comando executado. Não reexecutei testes de mutação, não gerei arquivos no Google nem fiz implantação.

### O modo escopo oculta a navegação, não os dados

`cfModoEscopo_` liga por padrão e só desliga com a propriedade textual `nao`: `Codigo.gs:549`–`:555`. `doGet` redireciona qualquer página inicial diferente de escopos: `:11`–`:24`. A interface oculta Consulta, Mapa, Fornecedores e Nova e bloqueia a troca normal para essas abas: `Interface.html:3506`–`:3507`, `:5726`–`:5727`, `:10132`–`:10139`.

Consequências:

- Links antigos ao **web app**, incluindo `?page=ficha`, `?page=avaliacao`, parâmetros `eq` e `editar`, caem em Escopos no código inspecionado. Não encontrei reabertura normal de preço por essa rota. Isso também interrompe o uso normal dos antigos links de avaliação; o ciclo original não deve ser vendido como experiência operacional atual.
- PDF, planilha ou Slides já exportados são arquivos independentes no Drive. Seus links diretos não passam por `doGet` e conservam seu conteúdo e permissões. A chave de tela não os censura.
- As APIs antigas continuam respondendo, sem guarda de modo escopo: `Codigo.gs:46`, `:216`, `:228`, e comentário explícito `:546`–`:547`. Um usuário autorizado com acesso à página pode chamar funções pelo navegador ou alterar a variável da interface. Isso não foi explorado na produção nesta auditoria.
- O manifesto declara acesso de domínio e execução como implantador: `appsscript.json:23`–`:25`. A guarda de escrita aceita domínio corporativo, não um papel específico de mantenedor: `Codigo.gs:518`–`:529`. A configuração efetiva de implantação e compartilhamento não foi inspecionada no console.

Risco na banca, julgamento do auditor: **baixo no percurso ensaiado; médio se abrirem arquivos antigos ou explorarem a aplicação; alto para a promessa de confidencialidade se a ocultação for confundida com autorização**. Não há evidência aqui de acesso anônimo ao app. O GitHub público é uma exposição separada, já confirmada.

A versão **@77** foi registrada como publicada em `HISTORICO.md:430`, mas `:432` ainda pede conferência no navegador. Não consegui acessar uma sessão autenticada de produção. Assim, confirmei a intenção no código e nos testes, não o comportamento ao vivo da implantação.

### Chances de falha numa demonstração em novembro

Classificação qualitativa do auditor, condicionada ao roteiro usado:

| Chance | Situação | Evidência e prevenção |
|---|---|---|
| Alta se usarem foto espontânea de celular | HEIC e arquivo acima do limite são recusados. | PNG/JPEG e limite de **5 MiB** no código `EscopoInterface.html:177`–`:180`; tela escreve “5 MB”. Preparar imagens aceitas. Não prometer conversão já existente. |
| Alta se compararem saídas repetidamente | Não há prévia sem emissão; planilha é criada novamente em cada chamada, podendo multiplicar arquivos. | Botões `EscopoInterface.html:59`, `:209`, `:262`; `EscopoPlanilha.gs:48`, `:78`. Emitir antes e conferir a revisão dos arquivos que serão abertos. |
| Média com lote de fotos | Para no primeiro erro; status pode ficar fora da área de atenção. | `EscopoInterface.html:206`, `:209`; `HISTORICO.md:295`, `:297`. Usar lote validado e conferir o que entrou. |
| Média se reorganizarem imagens | A movimentação usa a lista global e pode trocar entre grupos, parecendo não agir. | `EscopoInterface.html:190`; `HISTORICO.md:298`. Não improvisar esse passo; validar vínculo após mover. |
| Média ao editar legenda/emitir manualmente | Campo de uma linha e corte de legenda; título exigido mesmo sem aparecer na saída. | `EscopoInterface.html:201`; `Escopos.gs:353`–`:357`; `HISTORICO.md:293`–`:294`. Usar legenda curta e preencher o campo. |
| Média, sem frequência medida | Autenticação, latência e dependência de Google/Drive podem interromper a emissão. | Chamadas reais dependem dos serviços em `EscopoInterface.html:209`, `EscopoPlanilha.gs:48`–`:78`. Sem teste de carga/recuperação auditado. Preparar arquivos locais e vídeo. |
| Baixa no roteiro preparado, não eliminada | Orientação EXIF de fotos na renderização real pode divergir da simulação. | `HISTORICO.md:284`, `:292`. Conferir a saída real previamente. |

As pendências acima continuam reconhecíveis no código atual. Não confundir relatos antigos já resolvidos de fonte/layout com defeitos ainda presentes. Também não tratar uma melhoria futura como condição obrigatória para enviar o relatório: documentar o limite atual e a prevenção é possível.

### Outra pessoa consegue manter?

Ainda não demonstrado. Há documentação abundante, mas o caminho de entrada está contraditório. `README.md:133` recomenda `npm run push`; `package.json:11` usa `npx clasp`; `HISTORICO.md:306` informa que esse comando falha e orienta `npx @google/clasp`. O envio atualiza HEAD; a implantação versionada exige passo próprio, explicado em `HISTORICO.md:265`–`:270`. O slide afirma independência pessoal enquanto deixa a segunda pessoa indefinida.

O procedimento único precisa reunir: ambiente portátil; recuperação de login; identidade e permissões corporativas; projeto e implantação; propriedades de configuração; pasta/base e seus acessos; testes; versão publicada; verificação no navegador; retorno à versão anterior; backup e restauração. Um operador designado deve executá-lo em ambiente seguro. Código no GitHub não assegura acesso às bases, às credenciais e à implantação se o autor sair.

## D. O vídeo

Foram lidos `video/LEIA-ME.md`, roteiro e cenas da prévia, fontes de captura, roteiro/locução atualizados do relatório e aberta a folha `video/01-previa-20s/build/revisao/folha-cap0.png`.

**A prévia antiga não deve acompanhar a entrega atual.** Na primeira captura, a navegação de preço/equalização/fornecedores ainda aparece. No trecho de fornecedores, a folha mostra cartões com nomes, CNPJs e valores; o enquadramento corresponde a `cenas/01-previa.js:160`–`:186`. A cena usa o destaque **“318 fornecedores”**, em `:170`: mesmo que a contagem estivesse correta, está fora do foco autorizado para as peças.

Não identifiquei uma cena ativa da página Consulta de preço nem do Mapa de Equalizações; identifiquei os rótulos de navegação. Não vi **“R$ R$”** nos quadros da folha inspecionada. O **IQF corporativo 76,9 com uma avaliação** existe na captura original E06 e no registro `CONHECIMENTO_VIDEO_E_RELATORIO.md:234`–`:236`, mas o enquadramento da cena corta o indicador superior. Os cartões ainda mostram IQF individual e contagem pequena; portanto a solução não é apenas cortar o indicador geral. Não assisti nem validei todos os quadros do MP4 final; não certifico ausência do defeito no restante do arquivo.

Os recortes de planilha e slides vistos na folha não mostraram o telefone da responsável. A captura bruta da planilha contém esse contato e perfil; manter a distinção entre original privado e peça tratada. A cena de fornecedores já basta para reprovar esta prévia para o pacote.

O novo `video/02-relatorio/` contém roteiro e texto para voz; na atualização `589a345`, também recebeu gerador de sons e amostra de áudio. Não foi encontrado vídeo final. Melhorou a separação entre escopo atual e Fluig/RM futuro. Ainda repete aprovação sem documento (`LOCUCAO-elevenlabs.md:19`), emissão com “um clique” (`:23`) e alcance inicial não recontado (`:31`). A abertura (`:15`) também precisa da correção de interpretação dos casos reais indicada na seção B. Não gerar voz antes da checagem factual.

### Aceitação e direitos de uso

O **Regulamento §7, p.5**, exige relatório/apresentação. Não autoriza expressamente nem proíbe vídeo; também não o torna substituto do relatório. Preparar deck autossuficiente. Oferecer link corporativo restrito como complemento, testar com o destinatário e confirmar com RH se anexo/link será considerado. Conservar o mesmo conteúdo em arquivo local para a apresentação presencial.

A [política oficial da ElevenLabs sobre publicação](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform), aberta nesta auditoria, não concede licença comercial à voz gerada gratuitamente; geração de voz em plano pago tem condições e não regulariza retroativamente a geração gratuita. Há restrições adicionais a serviços Beta. A atualização `589a345`, em `HISTORICO.md:466` em diante, informa **Creator**, autorização para gastar créditos e geração de sons/trilha. O script `video/02-relatorio/sons/gerar_sons.py` foi lido e o MP3 `video/MUSICAS/elevenlabs/musica_contratacoes.mp3` foi encontrado. Isso é evidência nova a favor da regularidade; não cabe afirmar que a conta usa plano grátis. Não consultei diretamente a assinatura nem a origem de cada voz. Guardar prova do plano e do período de geração. Alternativa: locução própria autorizada.

A trilha nova exige análise dos [termos específicos de Eleven Music, especialmente o anexo de direitos](https://elevenlabs.io/music-terms), também abertos. O anexo permite uso comercial online/offline nas condições listadas, mas enquadra Creator como uso individual e diferencia outras categorias de cliente. Confirmar quem é o licenciado e o enquadramento da produção para a empresa; não concluir proibição automática apenas porque o vídeo é corporativo. Não aplicar indiscriminadamente à música a regra da voz gratuita. O prompt musical lido não pede imitação de artista ou faixa. O registro de geração não substitui o registro da licença aplicável.

`video/MUSICAS/` contém faixas de Casa Rosa, Simon Herody e The Grey Room / Density & Time. Não encontrei certificado ou texto de licença ao lado dos MP3. `video/LEIA-ME.md:13` os atribui à biblioteca do YouTube. A [orientação oficial da Biblioteca de áudio](https://support.google.com/youtube/answer/3376882?hl=pt-BR), aberta nesta auditoria, distingue faixas com atribuição e licença padrão; não é prova de licença individual para este uso fora da plataforma. Guardar a ficha e os termos da faixa efetivamente utilizada, ou substituí-la por material com direitos demonstrados. Nome do artista no arquivo não basta.

### Estrutura sugerida, sem roteiro completo

Proposta do auditor para **2–3 minutos**, não limite do regulamento:

| Duração sugerida pelo auditor | Conteúdo | Prova exigida |
|---|---|---|
| 0:00–0:20 | Problema em um caso real, anonimizado | Recorte original que sustente a comparação; sem preço ou acusação legal não verificada |
| 0:20–0:40 | Nome inscrito e evolução do objeto | Formulação compatível com o parecer real do comitê; não fabricar aprovação |
| 0:40–1:20 | Cadastro, serviços/fotos, EAP e saídas | Capturas no modo escopo, sem dado pessoal; geração descrita conforme os comandos existentes |
| 1:20–1:40 | Reaproveitamento e revisão rastreável | Um caso real com origem e arquivos coerentes |
| 1:40–2:15 | Tempo medido, uso e fala de usuário | Amostra, período, método e limitação; se não houver resultado, declarar sem números inventados |
| 2:15–2:35 | Sustentação e pedido de expansão | Separar operação atual, dependência de TI e proposta Fluig/RM futura |

O texto falado atual tem **391 palavras**, por contagem do auditor dos parágrafos em `LOCUCAO-elevenlabs.md:15`, `:19`, `:23`, `:27`, `:31`, `:35`, `:39`, `:43`, separadas por espaços e incluindo X/Y/N. O histórico ainda estima **~320 palavras e ~2min10s** em `HISTORICO.md:457`. A ampliação da abertura tornou essa estimativa obsoleta. Cronometrar o áudio e encurtar conforme necessário. Não acelerar para esconder excesso de conteúdo.

## E. O que pode ter sido esquecido

**Inscrição antes de pontuação.** O limite e a prioridade das primeiras **três** estão no **Regulamento §4, p.2**, e a repetição do limite em §11, p.6. E1 e E2 são um indício forte de inscrição excedente. A regra usa data do formulário, não data do e-mail. Sem exportação/protocolo dos formulários, não concluo desclassificação. Também não encontro prova de substituição ou exceção formal. Este assunto precede a defesa visual e a coleta de depoimentos.

**O que foi efetivamente autorizado.** A aprovação da estratégia por Guilherme em `HISTORICO.md:436` não equivale à aprovação do objeto pelo comitê. E3 é complementação. O convite de reunião encontrado no Gmail não é ata, presença nem deferimento. O quadro de continuidade deve responder a cada solicitação original: critérios, gatilho, indicadores, histórico e uso na decisão. Mostrar o que foi construído, o que está oculto e o que depende de integração. “A ideia cresceu” é argumento; não é autorização.

**Prazo de implementação versus relatório.** Implementação termina em **10/10/2026**, pelo **Regulamento §5.3, p.3**. Relatório é até **15/10/2026**, seleção até **30/10**, apresentação em novembro e escolha até **05/12**, pelo **§7, p.5**. Recursos de disclaimer/base/modo escopo foram registrados como publicados em **11/10**, em `HISTORICO.md:310`–`:339`, `:420`–`:430`. O app de escopos já emitia antes, conforme JSON e tela E05. Portanto não se conclui que todo o projeto seja tardio; deve-se separar o núcleo implementado no prazo das evoluções posteriores e obter enquadramento do RH/comitê. O mesmo vale para propostas de melhoria até novembro.

**Protocolo operacional.** O endereço `rh@capitalrealty.com.br` é expresso para inscrição no **§5.1, p.2**, e foi usado em E1/E2. O §7 não define formato de arquivo, horário limite, tamanho, assinatura, formulário adicional, pessoa responsável pelo recebimento ou submissão do vídeo. Não presumir que um link pessoal acessível ao autor seja entrega recebida. Confirmar esses pontos, anexar versão estática no formato aceito, identificar autor e nome inscrito, testar acesso e guardar confirmação. A apresentação deve funcionar sem o vídeo.

**Autoria e créditos.** E2 identifica Guilherme como remetente, mas o formulário completo não foi obtido. Não confirmei coautores ou composição de equipe. O **Regulamento §11, p.6**, permite ajuda de outras pessoas e vincula o prêmio ao autor da ideia enviada. Separar autoria, colaboração e solicitação de melhoria. Jonatas já aparece em S12; confirmar autorização para citação e testemunho. Não atribuir falas de “usuários” literalmente quando houve paráfrase: comparar `gerar.cjs:199` com `HISTORICO.md:226`–`:228`. A capa e o fechamento precisam identificar o autor.

**Titularidade e sigilo.** O **Regulamento §10, pp.5–6**, atribui a ideia à empresa. A obrigação expressa de sigilo em **§11, p.6**, é do comitê; não a transformo numa proibição textual genérica de GitHub para o autor. A exposição pública de bases reais, contudo, existe e exige decisão corporativa independentemente dessa interpretação. `owner.type: User` não prova que o GitHub seja pessoal ou não autorizado. Não foi encontrada autorização para publicar dados comerciais. Cópias no Drive local não comprovam ACLs corporativas adequadas.

**Contatos e privacidade.** Há nome e telefone da responsável nos arquivos de escopo e capturas, além de foto de perfil em captura de planilha. Não repito esses dados neste parecer. Minimizar e mascarar antes de circulação; conferir PDFs, anexos e links, não só o slide. Encaminhar ao responsável corporativo por privacidade a avaliação de finalidade, acesso e retenção. CNPJ, por si só, não é a justificativa para chamar toda exposição comercial de violação de LGPD. Não foi feita conclusão jurídica de infração.

**Medição que resista à pergunta difícil.** Usar os mesmos casos e insumos nos dois métodos. O desenho de **dois ou três casos** é o plano de `ESTRATEGIA_NOTA_MAXIMA.md:82`, não amostra representativa. Se o resultado prometido é o pacote completo, comparar pacote completo; se medir só PDF, rotular só PDF. Registrar operador, familiaridade, ordem, interrupções e tempo de geração. Evitar que o segundo método se beneficie sempre do aprendizado do primeiro. Guardar observações pareadas e apresentar mediana por método e, quando houver ganho percentual, denominador e fórmula. Não substituir cronômetro pelo `TotalTime` do PowerPoint: limitações em `HISTORICO.md:447`–`:451`. Não extrapolar para toda a empresa sem volume e premissas explícitas.

**Plano B e ensaio.** Guardar PDF/apresentação, vídeo e evidências essenciais no Drive e em cópia disponível offline. Abrir em outro computador, sem internet, com fontes e codec disponíveis. Levar um escopo já emitido e imagens compatíveis. O app ao vivo deve complementar a defesa. Confirmar o tempo permitido com RH; o regulamento não o define. Ensaiar com perguntas de `ESTRATEGIA_NOTA_MAXIMA.md:153`–`:162` e acrescentar: inscrição excedente; aprovação real; objeto original; depois do prazo; quem mantém; acesso aos dados; alcance real; qual benefício foi observado; que parte depende de Fluig/RM.

**Memória antiga perigosa.** `AUDITORIA_NOTA_2026-09-08.md:1`–`:15` chama estimativa de “oficial” e “nota da banca” e declara posição no ranking sem ata. A tabela usa acervo de compras como impacto. A estratégia a invalida explicitamente em `ESTRATEGIA_NOTA_MAXIMA.md:90`–`:92`. `DEFESA_DA_MELHOR_IDEIA_MACBOOK.md:28` ainda promete **~50 para menos de 15 minutos**, sem cronometragem, e `README.md:92` ainda o vincula. Manter esses arquivos fora da defesa e sinalizar sua obsolescência. `BALANCO_EXECUCAO.md` e a apresentação de setembro descrevem o ciclo antigo; não devem ser anexados como retrato sem ressalvas do modo escopo atual.

**Persistência e recuperação.** Na conferência Git citada na base, os commits estavam alinhados com origin/main. Capturas, renders, músicas e mídia do rascunho são ignorados por `.gitignore` e não estão protegidos pelo push. Estão acessíveis neste workspace do Drive, mas não confirmei sincronização remota integral nem restauração em outra máquina. O histórico registra dependência anterior de scratchpad externo para navegador (`HISTORICO.md:274`–`:282`) e mudança do ambiente portátil (`:306`, `:422`–`:427`). `video/LEIA-ME.md:29`–`:32` pressupõe Python; não validei a reprodução completa desse ambiente. A atualização de sons depende também de módulo/credencial externo em H:, indicado em `video/02-relatorio/sons/gerar_sons.py`; não abri a credencial. Inventariar dependências, fontes, autorização de voz e modelos locais. O C: com Deep Freeze não pode ser a única cópia de algo necessário.

**Outras condições regulamentares.** Não confirmei vínculo com metas anuais, originalidade formal perante outras inscrições, condição funcional no momento da premiação ou versão posterior do regulamento. As condições estão em **§5.3 e §11**. Não há prova de problema nessas condições, apenas ausência de verificação. Os achados de inscrição e aprovação, ao contrário, têm documentos concretos.

## Fazer até o prazo — ordem de prioridade

Datas e dias seguem o calendário solicitado. Donos abaixo são propostas do auditor. Nenhuma ação externa foi executada nesta auditoria.

| Ordem | Dono | Dia | Entrega verificável |
|---|---|---|---|
| Prioridade máxima | Guilherme | seg 12 | Solicitação ao RH com E1/E2/E3: ordem dos formulários, elegibilidade, aprovação efetiva, aceitação da evolução e tratamento de melhorias posteriores. Confirmar formato, destinatário, horário e vídeo. Não aguardar essa resposta para corrigir fatos verificáveis. |
| Imediata | Guilherme | seg 12 | Contenção coordenada com TI do GitHub público e avaliação dos dados/histórico. Decidir armazenamento corporativo e autorização de uso das evidências. |
| Antes da voz | Claude | seg 12 | Lista de correções aplicada ao deck/roteiro: unidades por item, preço agregado, cronologia, aprovação, planilhas por revisão, geração separada, alcance como proposta e custo qualificado. Verificação factual independente concluída antes de nova locução. |
| Campo | Guilherme | ter 13 | Medição pareada com registro bruto, arquivos antigos, falas autorizadas e evidência de uso. Começar cedo para poder repetir um caso inválido. Registrar resultado desfavorável também. |
| Prova técnica | Claude | ter 13 | Recontagem por ID/Mega/autor/data/estado; revisão dos artefatos; ensaio autenticado da implantação e links antigos. Preparar quadro do entregue no prazo e do futuro. |
| Sustentação e direitos | Guilherme | ter 13 | Nome do substituto e acesso corporativo; evidência das licenças de voz/trilha ou decisão de usar voz própria/material autorizado. Validar créditos e uso das capturas. |
| Fechamento editorial | Claude | qua 14 | Integrar somente resultados comprovados, inserir limitações, eliminar placeholders e anexar memória. Gerar arquivo aceito e vídeo corrigido; conferir imagem, áudio, recortes, links e correspondência entre as versões. |
| Ensaio final | Guilherme | qua 14 | Revisão do pacote inteiro e teste offline em outra máquina. Validar formato com RH e preparar resposta aos pontos de elegibilidade/continuidade. Se faltar dado, aprovar formulação explícita da limitação. |
| Protocolo | Guilherme | qui 15 | Enviar a versão congelada pelo canal confirmado, dentro do horário informado pelo RH, e guardar recebimento. Não depender da inclusão do vídeo. |
| Arquivo da entrega | Claude | qui 15 | Registrar nome, hash e conteúdo exato dos arquivos enviados, versão do código citada e limitações remanescentes. Preservar cópia corporativa e offline. Não incorporar dado posterior como se já existisse no protocolo. |

Se a elegibilidade não for confirmada a tempo, o pacote pode ser preparado e encaminhado com ressalva para manifestação do RH; este auditor não o declarará elegível por silêncio. Se a medição não existir, retirar a promessa de redução e reportar apenas os resultados verificáveis. Vídeo opcional não deve impedir o protocolo do relatório.

## O que não consegui verificar

- **Formulários originais e sua ordem:** os e-mails foram abertos; a prioridade oficial depende das datas do sistema de inscrição. Não obtive exportação, cancelamento/substituição ou decisão excepcional.
- **Aprovação efetiva e ata:** a devolutiva original não aprova. Não foi localizada na busca realizada uma aprovação posterior que resolva objeto, pesos ou prazo. Busca sem resultado não prova inexistência.
- **Produção e permissões reais:** sem sessão autenticada acessível para a auditoria. Não executei APIs contra o Google, pois chamadas aparentemente de leitura podem preparar/migrar estrutura. Não validei ACLs de Drive nem configuração efetiva do deployment.
- **Contagem integral de uso e envio:** capturas e JSON sustentam emissão do caso examinado, não todo o universo, usuários distintos, destinatários ou efetivo uso pelo fornecedor.
- **Originais de toda a pesquisa de contratação:** conferi o consolidado citado e seus exemplos, mas não reabri todos os documentos primários. Erros que já aparecem na comparação entre slide e consolidado são suficientes para os achados indicados.
- **Ganho de produtividade e satisfação:** os campos permanecem vazios. Não há coleta independente nesta auditoria.
- **Vídeo completo e reprodução técnica:** inspectei roteiro, cenas, capturas e folha. Não executei render, transcrição ou medição audiovisual, nem assisti integralmente a um arquivo final novo. Relatórios técnicos salvos não equivalem a teste repetido nesta sessão.
- **Licenças efetivas:** políticas oficiais de voz, Biblioteca de áudio e Eleven Music foram abertas. O histórico passou a informar Creator e geração de trilha nova. Não verifiquei diretamente assinatura, licenciado/período, origem de cada voz ou licenças das faixas antigas.
- **Governança, privacidade e segredos históricos:** publicidade e dados comerciais foram confirmados. Não fiz varredura forense de todo o histórico, análise jurídica de LGPD ou certificação de ausência de credenciais. IDs de arquivos e scripts não foram tratados como senhas.
- **Recuperação, segundo operador e offline:** documentação inspecionada, sem exercício completo de restauração, transferência de manutenção ou projeção na sala.
- **Regulamento posterior e chances de vitória:** o PDF local foi lido inteiro. Não confirmei atualização posterior, formato/hora de protocolo nem notas dos concorrentes.

Única gravação autorizada por esta auditoria: este parecer. Não houve edição do app ou das peças, envio de mensagem, alteração de permissão, publicação, commit ou push.
