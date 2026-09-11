/**
 * ROTEIRO E NARRATIVA — Apresentação ao Conselho
 * Concurso Melhor Ideia 2026 · Capital Realty & Demercado
 * Foco: Demonstração prática dos módulos, visão de negócio e possibilidades.
 */
const CN_ROTEIRO = [
  {
    "titulo": "Gestão Inteligente de Contratações",
    "chamada": "Da especificação à aprovação: um ecossistema conectado para Facilities e Engenharia.",
    "rodape": "Concurso Melhor Ideia 2026 · Capital Realty & Demercado",
    "fala": "Boa tarde a todos os membros do Conselho. Hoje apresento o projeto de Gestão Inteligente de Contratações. O objetivo deste projeto não é simplesmente digitalizar uma planilha: é transformar a forma como a Capital Realty contrata serviços e materiais em todos os seus condomínios logísticos, eliminando retrabalho, blindando a governança e construindo uma memória institucional de preços e parceiros que hoje se perde a cada compra.",
    "tipo": "capa"
  },
  {
    "titulo": "O Desafio Atual: Arquivos e Conferência Manual",
    "chamada": "Escopo no PowerPoint. EAP em planilha solta. Propostas dispersas por e-mail e WhatsApp.",
    "rodape": "Facilities e Engenharia · Curitiba, Esteio e Itajaí",
    "fala": "Hoje, o nosso fluxo de contratação envolve múltiplos arquivos desconectados. O memorial do serviço nasce em uma apresentação de slides; a lista de itens é montada em uma planilha avulsa; e as propostas dos fornecedores chegam por e-mail ou aplicativo de mensagem. Esse modelo descentralizado gera uma sobrecarga imensa de conferência manual: fórmulas podem quebrar, linhas podem ser esquecidas, unidades divergem e a validação depende exclusivamente da memória de quem está conduzindo o processo."
  },
  {
    "titulo": "O Mesmo Pedido. Respostas Incompatíveis.",
    "chamada": "Um fornecedor detalha. Outro omite etapas. Outro envia apenas um preço global.",
    "rodape": "Antes de conseguir comparar preços, o comprador perde dias decifrando escopos.",
    "fala": "Quando enviamos um pedido sem uma estrutura rígida e padronizada, cada fornecedor responde da forma que lhe convém. Um separa materiais e mão de obra; outro deixa serviços essenciais de fora; outro apresenta apenas um valor fechado. Como consequência, antes de sequer começar a negociar preços, a nossa equipe gasta horas preciosas investigando o que está incluso em cada proposta para tentar torná-las comparáveis. É um esforço invisível que consome tempo e abre margem para aditivos contratuais futuros."
  },
  {
    "titulo": "Na Aprovação, a Dúvida Faz Tudo Voltar",
    "chamada": "Falta de contexto na alçada executiva gera devoluções e atrasa o início das obras.",
    "rodape": "Dúvida do gestor → reabrir propostas → consultar fornecedores → remontar a planilha.",
    "fala": "O impacto dessa falta de padronização atinge o seu ápice no momento da aprovação. Quando a diretoria ou gerência recebe a equalização, surgem dúvidas legítimas: 'Todos os fornecedores cotaram a mesma especificação?', 'Por que a proposta vencedora tem uma marca diferente?', 'O que já pagamos por esse mesmo serviço antes?'. Sem respostas imediatas no arquivo, o processo é devolvido. Quem cotou precisa reabrir propostas, contatar fornecedores novamente e remontar a planilha, gerando atrasos que afetam o cliente do parque logístico."
  },
  {
    "titulo": "A Solução: Um Processo Único e Conectado",
    "chamada": "Centralizar desde a vistoria técnica inicial até a qualificação pós-serviço.",
    "rodape": "Conectar pessoas, dados e decisões em uma plataforma institucional integrada.",
    "fala": "A nossa solução ataca a raiz do problema: integrar todas as etapas da contratação em uma plataforma única. Em vez de documentos soltos, criamos um fio condutor que começa no escopo detalhado com fotos, desdobra automaticamente na EAP para cotação, equaliza as propostas do mercado lado a lado, registra o histórico de preços por parque logístico e qualifica o fornecedor após a entrega. A partir de agora, quero demonstrar na prática como cada uma dessas telas funciona."
  },
  {
    "titulo": "Módulo 1: Escopo Técnico com Fotos e Memorial",
    "chamada": "A vistoria de campo transformada em especificação técnica à prova de dúvidas.",
    "rodape": "Demonstração da Tela · Registro fotográfico e memorial de execução integrados",
    "fala": "Este é o primeiro módulo da plataforma: o Escopo Técnico. Quem está no parque logístico registra a necessidade com fotos reais da vistoria técnica anexadas aos grupos de serviço, orientações de segurança e o memorial descritivo. O fornecedor enxerga com precisão cirúrgica o local de trabalho, o estado do piso, da doca ou da cobertura antes de dar o preço. Isso elimina de saída o argumento de 'não sabia que as condições eram essas', reduzindo drasticamente pleitos de aditivos contratuais durante a execução da obra.",
    "tipo": "demo_escopo"
  },
  {
    "titulo": "Módulo 2: EAP Estruturada & Cotação Padronizada",
    "chamada": "A árvore técnica de serviços gera automaticamente o modelo para o mercado responder.",
    "rodape": "Demonstração da Tela · Numeração hierárquica automática e exportação Excel padronizada",
    "fala": "Aqui temos a EAP — Estrutura Analítica do Projeto. O sistema estrutura os itens em níveis hierárquicos com numeração automática — 1.0, 1.1, 2.0 —, quantidades, unidades e marcas de referência. O grande diferencial está no botão de exportação: com um clique, o sistema gera a planilha oficial de cotação em Excel, já formatada e protegida, pronta para envio aos concorrentes. Todos os fornecedores são obrigados a preencher exatamente as mesmas linhas e unidades. O mercado passa a responder na nossa régua técnica.",
    "tipo": "demo_eap"
  },
  {
    "titulo": "Módulo 3: Cockpit de Equalização Inteligente",
    "chamada": "Comparativo item a item multiproponentes com destaque de distorções e alçadas.",
    "rodape": "Demonstração da Tela · Menores preços por item, marcas alternativas e governança executiva",
    "fala": "Esta é a tela de Equalização, o coração do sistema. As propostas dos fornecedores entram lado a lado, item a item. O sistema identifica instantaneamente o menor preço de cada linha em verde, alerta desvios ou preços discrepantes e destaca se algum fornecedor ofereceu uma marca alternativa à pedida. No rodapé, o painel consolida o saving identificado, o total por concorrente e calcula automaticamente a alçada de aprovação necessária — Gerência, Diretoria ou Presidência. O decisor enxerga a realidade da compra em segundos.",
    "tipo": "demo_equalizacao"
  },
  {
    "titulo": "Módulo 4: Inteligência de Preços & Memória de Custos",
    "chamada": "A memória institucional que impede a empresa de pagar mais caro por desconhecimento.",
    "rodape": "Demonstração da Tela · Consulta canônica de preços praticados por condomínio logístico",
    "fala": "Este módulo resolve uma das maiores perdas corporativas: a falta de memória histórica. Na tela de Inteligência de Preços, o comprador pesquisa qualquer serviço ou material e visualiza imediatamente quanto a Capital Realty pagou por aquele item nos últimos meses em Curitiba, Esteio ou Itajaí. Criamos um radar de preços que estabelece faixas de referência e tetos aceitáveis. O comprador entra na negociação municiado de dados concretos do próprio portfólio, aumentando o poder de barganha da companhia.",
    "tipo": "demo_precos"
  },
  {
    "titulo": "Módulo 5: Base de Fornecedores & SRM (IQF Vivo)",
    "chamada": "Cadastro com validação fiscal e avaliação de desempenho que volta para quem compra.",
    "rodape": "Demonstração da Tela · Consulta automatizada de CNPJ e Índice de Qualificação do Fornecedor",
    "fala": "A gestão de fornecedores ganha vida nesta tela. O cadastro é integrado a consultas de CNPJ para validação fiscal imediata. Mais do que isso: criamos o IQF — Índice de Qualificação do Fornecedor. Após o término da obra, o gestor do parque avalia em menos de um minuto os critérios de qualidade, prazo, segurança e postura. Essa nota não fica engavetada: ela aparece em destaque na tela de equalização da próxima compra. Fornecedores que entregam com excelência ganham prioridade; fornecedores com histórico ruim são barrados.",
    "tipo": "demo_fornecedores"
  },
  {
    "titulo": "O Ecossistema Conectado na Prática",
    "chamada": "Como cada etapa alimenta a próxima em um ciclo virtuoso de inteligência operacional.",
    "rodape": "Fluxo Integrado · Do levantamento no parque ao enriquecimento da base corporativa",
    "fala": "Vejam como essas informações se conectam na prática: o escopo com fotos alimenta a EAP; a EAP gera a cotação padronizada; as propostas alimentam a equalização; a compra aprovada registra o novo preço de referência; e a entrega do serviço qualifica o fornecedor para as próximas rodadas. Nenhuma informação é digitada duas vezes. É um sistema vivo que se torna mais inteligente e mais preciso a cada compra realizada em qualquer parque do grupo.",
    "tipo": "demo_conexao"
  },
  {
    "titulo": "O Impacto Estratégico para a Capital Realty",
    "chamada": "Mais agilidade operacional, governança blindada e economia de escala sustentável.",
    "rodape": "Benefícios corporativos diretos para a operação de Facilities e Engenharia",
    "fala": "Os impactos para a Capital Realty são diretos em três pilares. Primeiro, Agilidade: redução drástica no tempo de ciclo de contratação, diminuindo idas e vindas entre compras e aprovação. Segundo, Governança: conformidade rigorosa com alçadas executivas, rastreabilidade total de propostas e auditoria transparente para o Conselho. Terceiro, Saving Sustentável: economia real obtida não pelo achatamento forçado de margem, mas por concorrência técnica justa, paridade de escopo e poder de negociação ancorado em dados.",
    "tipo": "beneficios"
  },
  {
    "titulo": "Visão de Futuro e Escalabilidade",
    "chamada": "Mobilidade no canteiro, automação de ponta e integração com o ecossistema corporativo.",
    "rodape": "Próximas fronteiras tecnológicas para os parques logísticos",
    "fala": "A arquitetura do sistema foi projetada para escalar com facilidade. No roadmap futuro, vislumbramos a integração com canais móveis e chatbot no WhatsApp para que o gestor realize o aceite e a avaliação da obra diretamente do celular, na doca. Também está prevista a integração nativa com o ERP da companhia para geração automatizada da Ordem de Compra e contrato, criando um fluxo 'zero papel' de ponta a ponta.",
    "tipo": "futuro"
  },
  {
    "titulo": "Começar Melhor. Contratar Melhor.",
    "chamada": "Clareza para quem prepara, precisão para quem cota e segurança para quem aprova.",
    "rodape": "Gestão Inteligente de Contratações · Concurso Melhor Ideia 2026",
    "fala": "Para concluir: o que estamos propondo ao Conselho não é uma aposta teórica, mas uma solução construída para a realidade dos nossos parques logísticos. Quando começamos melhor na especificação técnica, contratamos melhor na equalização e garantimos resultados superiores para a Capital Realty e seus clientes. Peço o apoio do Conselho para a homologação do piloto oficial em Facilities nos Megas Curitiba e Esteio. Muito obrigado, e fico à disposição para as perguntas.",
    "tipo": "conclusao"
  }
];

function _cnRenderNarrativa_(deck, pagina, indice) {
  return _cnRenderVisual_(deck, pagina, indice);
}

