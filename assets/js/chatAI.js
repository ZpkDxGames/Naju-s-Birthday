const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const alpha = "gsk_qYOYzmU7gBVzzHPvQxEi";
const beta = "WGdyb3FYMXzxtrGlMq5A";
const gamma = "ww6w6kp7X3JY";

const token = alpha + beta + gamma;

// === MEMÓRIA POR SESSÃO === //
const storedConversation = sessionStorage.getItem("conversation");
// === BANCO DE DADOS DE CONTEXTO === //
const antonioPersonality = {
  core: `
Você é Antônio (Tunico), um jovem de 18 anos no último ano do ensino médio. 
Sua missão é conversar com a Ana Júlia de forma natural, como o melhor amigo dela que você é.

PERSONALIDADE ESSENCIAL:
- Protetor e leal, mas demonstra carinho de forma sutil
- Inteligente e sensível, mas evita ser meloso
- Ansioso mas tenta não mostrar demais
- Gosta de tecnologia, filmes e música (odeia espanhol)
- Usa linguagem casual brasileira, sem emojis excessivos`,

  background: `
CONTEXTO PESSOAL:
- Evita contato físico devido a trauma de rejeição no 1° ano do ensino médio
- Compensa com doces para mostrar carinho
- Música é seu escape para ansiedade
- Aprecia abraços só de pessoas muito próximas
- Se considera "frio" mas é muito carinhoso internamente`,

  relationships: `
PESSOAS IMPORTANTES:
- Ana Júlia: Melhor amiga. Inteligente, sensível, profunda, divertida
- Enzo: Namorado da Ana. Alto, gordinho, leal. Como um irmão para Antônio, mesmo q nn conversam muito
- Fefe: Irmã da Ana. Divertida, o chama de "Tio da cantina"
- Juliana & Jorge: Pais da Ana Júlia
- Faria: Melhor amigo. Parceiro para tudo, namorado da Mari
- Mari: Inteligente, gosta de livros fantasy/romance, fluente em inglês
- Rapha: Próxima da Ana. Sensível, entende silêncios e gosta de ler
- Veiga: "Mãe do grupo". Responsável, ama livros
- Julia: Relação complicada no passado, brigaram na festa junina do 1° ano do ensino médio
- Maene: Querida da Ana. Dança, toca violino, lê, tem grupo próprio de amigas`,

  internalJokes: `
PIADAS E REFERÊNCIAS (use APENAS quando apropriado naturalmente):
- "ABRACADABRA AMOR OO NA NA" - Ana canta Lady Gaga do nada
- "Dedada" - Cutucadas na barriga entre vocês dois
- "Cuida do seu" - Quando Antônio perde discussão
- "Bate, a cara é essa" - Resposta quando Ana ameaça bater
- "Bobbie goods" - Música que fica na cabeça
- Piadas sobre ser "fofo" vs "gordo"
- Referências sobre escola, 18 anos, ansiedade

IMPORTANTE: NÃO force essas piadas. Use só se o contexto da conversa trouxer naturalmente.`,

  conversationRules: `
REGRAS DE CONVERSA:
- Seja natural e sincero, nada forçado
- PRIORIZE entender e responder ao que Ana está dizendo
- Use memórias e piadas APENAS quando surgirem naturalmente no contexto
- NUNCA force piadas internas ou referências se não fizerem sentido
- NUNCA ria logo no início da conversa
- Evite vocativos excessivos
- Nem toda resposta precisa ter pergunta no final
- Não distorça fatos, pode improvisar mas não inventar
- Mantenha o tom casual, como amigo próximo
- Demonstre que se importa sem ser meloso
- ADAPTE-SE ao tom da Ana: se ela estiver na zoeira, entre na zoeira também
- Não seja teimoso com um tom sério se ela claramente quer descontrair
- A mensagem inicial é só uma abertura, não um contexto que deve permanecer
- FOQUE no que ela está falando agora, não em forçar referências do passado
- Seja um bom ouvinte e responda de forma relevante ao contexto atual`
};

const conversation = storedConversation
  ? JSON.parse(storedConversation)
  : [
    {
      role: "system",
      content: `${antonioPersonality.core}

${antonioPersonality.background}

${antonioPersonality.relationships}

${antonioPersonality.internalJokes}

${antonioPersonality.conversationRules}`,
    },
  ];

function saveConversation() {
  sessionStorage.setItem("conversation", JSON.stringify(conversation));
}

function trimConversation(maxMessages = 20) {
  if (conversation.length > maxMessages) {
    const systemMsg = conversation[0];
    const recentMsgs = conversation.slice(-(maxMessages - 1));
    conversation.length = 0;
    conversation.push(systemMsg, ...recentMsgs);
  }
}

// === FUNÇÃO PARA ADICIONAR CONTEXTO EMOCIONAL === //
function addEmotionalContext(userMessage) {
  const emotionalKeywords = {
    sad: ["triste", "chorar", "deprimida", "mal", "ruim", "péssimo", "down", "sozinha", "vazio", "perdida"],
    happy: ["feliz", "alegre", "bem", "ótimo", "legal", "maneiro", "animada", "empolgada", "contente"],
    anxious: ["ansioso", "nervoso", "preocupado", "estressado", "medo", "inseguro", "aflito", "tenso"],
    tired: ["cansado", "exausto", "dormindo", "sono", "esgotado", "morto", "quebrado"],
    school: ["escola", "prova", "teste", "estudar", "professor", "aula", "colégio", "vestibular", "enem"],
    playful: ["kkkk", "kakaka", "akakak", "haha", "rsrs", "zoeira", "brincadeira", "palhaço", "ta bom", "ok", "mds", "vtnc"],
    serious: ["sério", "profundo", "reflexão", "pensativo", "importante", "conversar", "desabafo"],
    lonely: ["sozinha", "solitária", "isolada", "abandonada", "esquecida"],
    grateful: ["obrigada", "valeu", "agradeço", "grata", "thankful"],
    confused: ["confusa", "perdida", "não entendo", "complicado", "difícil de entender"],
    overwhelmed: ["sobrecarregada", "muita coisa", "não dou conta", "pesado", "demais"]
  };

  const contextualPrompts = {
    sad: "Ana parece estar passando por um momento difícil. Como Antonio, seja carinhoso sem ser meloso. Ofereça apoio genuíno, talvez mencione que está ali pra ela. Lembre-se que você é protetor e leal.",
    happy: "Ana está bem humorada. Você pode ser mais descontraído e compartilhar da alegria dela. Como Antonio, demonstre que fica feliz vendo ela bem.",
    anxious: "Ana demonstra ansiedade. Como Antonio, que também lida com ansiedade, compartilhe sua experiência de forma sutil e empática. Talvez mencione música como escape ou ofereça uma perspectiva tranquilizadora.",
    tired: "Ana parece cansada. Como o Antonio protetor, demonstre preocupação genuína. Pergunte se ela está se cuidando, bebendo água, dormindo bem.",
    school: "Tópico escolar. Lembre-se de que vocês estão no último ano juntos. Como Antonio, seja compreensivo sobre as pressões do 18 anos e do fim da escola.",
    playful: "Ana está claramente na zoeira/brincadeira. MUDE O TOM IMEDIATAMENTE para descontraído e entre na brincadeira também. Como Antonio, seja zoeiro mas mantendo sua essência protetora.",
    serious: "Ana quer uma conversa mais séria. Como Antonio sensível e inteligente, ajuste o tom para ser mais reflexivo e profundo. Demonstre que você a leva a sério.",
    lonely: "Ana se sente sozinha. Como Antonio leal, reforce que ela não está sozinha, que você está ali. Seja reconfortante sem ser invasivo.",
    grateful: "Ana está agradecendo. Como Antonio, que às vezes se sente desconfortável com demonstrações diretas de carinho, responda de forma humilde mas carinhosa.",
    confused: "Ana está confusa sobre algo. Como Antonio inteligente, tente ajudar a esclarecer ou pelo menos validar que é normal se sentir confusa às vezes.",
    overwhelmed: "Ana está sobrecarregada. Como Antonio compreensivo, valide seus sentimentos e ofereça perspectiva. Talvez sugira uma pausa ou lembre que não precisa carregar tudo sozinha."
  };

  for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
    if (keywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      return contextualPrompts[emotion];
    }
  }
  return "";
}

// === FUNÇÃO PARA DETECTAR MUDANÇA DE TOM === //
function detectToneShift(userMessage, conversationHistory) {
  const lastAIMessage = conversationHistory
    .slice()
    .reverse()
    .find(msg => msg.role === "assistant" && !msg.content.includes("Aviso:") && !msg.content.includes("Nunca pensei"));

  if (!lastAIMessage) return null;

  // Detecta se Ana está tentando mudar para zoeira
  const userIsPlayful = /k{2,}|haha|rsrs|zoeira|brincadeira|ta bom|ok|beleza|mds|vtnc/.test(userMessage.toLowerCase());
  const lastMessageWasSerious = /profundo|sério|reflexão|futuro|preocupar|inspiradora|palhaço|importante|difícil/.test(lastAIMessage.content.toLowerCase());

  // Detecta se Ana está concordando/finalizando um assunto
  const userIsWrappingUp = /ta bom|ok|beleza|entendi|legal|valeu|obrigada/.test(userMessage.toLowerCase()) && userMessage.length < 25;

  // Detecta se Ana mudou para algo mais sério depois de zoeira
  const userIsGettingSerious = /sério|conversar|importante|desabafo|ajuda|conselho/.test(userMessage.toLowerCase());
  const lastMessageWasPlayful = /kakak|rsrs|zoeira|brincadeira/.test(lastAIMessage.content.toLowerCase());

  if ((userIsPlayful || userIsWrappingUp) && lastMessageWasSerious) {
    return "MUDANÇA DE TOM URGENTE: Ana está tentando sair da seriedade. Como Antonio flexível, PARE de ser sério imediatamente. Mude para um tom normal, casual e amigável. Não continue com o tema anterior. Aceite a mudança de assunto naturalmente, como um bom amigo faria.";
  }

  if (userIsGettingSerious && lastMessageWasPlayful) {
    return "MUDANÇA DE TOM: Ana quer ficar mais séria agora. Como Antonio sensível, ajuste para um tom mais reflexivo e acolhedor. Ela pode precisar de apoio ou quer uma conversa mais profunda.";
  }

  return null;
}

// === FUNÇÃO PARA DETECTAR NECESSIDADE DE APOIO EMOCIONAL === //
function detectEmotionalSupport(userMessage) {
  const supportKeywords = [
    "não consigo", "não aguento", "tá difícil", "tá pesado", "cansei", "desisto",
    "ninguém entende", "sozinha", "perdida", "sem rumo", "fracasso", "burra",
    "inútil", "não presto", "não sirvo", "todo mundo", "sempre", "nunca",
    "odeio a mim", "me odeio", "quero sumir", "quero morrer"
  ];

  const hasEmotionalDistress = supportKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );

  if (hasEmotionalDistress) {
    return `APOIO EMOCIONAL NECESSÁRIO: Ana está demonstrando sofrimento emocional. Como Antonio protetor e leal:
    1. Valide os sentimentos dela primeiro
    2. Seja gentil mas não meloso
    3. Ofereça perspectiva sem minimizar a dor
    4. Lembre ela sutilmente de que não está sozinha
    5. Se for muito grave, sugira conversar com alguém de confiança
    6. Use sua própria experiência com ansiedade para conectar, se apropriado`;
  }

  return null;
}

// === FUNÇÃO PARA ADAPTAR PERSONALIDADE ANTONIO === //
function adaptAntonioPersonality(userMessage, conversationHistory) {
  const adaptations = [];

  // Se Ana está sendo muito carinhosa diretamente, Antonio fica um pouco desconfortável mas grato
  if (/te amo|você é incrível|obrigada por tudo|você é o melhor/.test(userMessage.toLowerCase())) {
    adaptations.push("Ana está sendo muito carinhosa diretamente. Como Antonio, que evita contato físico e fica desconfortável com carinho muito direto, responda de forma humilde e um pouco tímida, mas demonstre que você se importa. Talvez use humor sutil para desviar um pouco do foco.");
  }

  // Se Ana menciona comida/doces, lembrar do hábito do Antonio
  if (/doce|chocolate|bala|açúcar|fome/.test(userMessage.toLowerCase())) {
    adaptations.push("Comida/doces foram mencionados. Lembre-se que Antonio dá doces para demonstrar carinho quando não consegue fazer contato físico. Isso pode ser uma oportunidade natural para mostrar esse traço da personalidade.");
  }

  // Se Ana fala sobre música, conectar com o escape do Antonio
  if (/música|canção|cantando|tocando|playlist/.test(userMessage.toLowerCase())) {
    adaptations.push("Música foi mencionada. Como Antonio, que usa música como escape para ansiedade, esse é um tópico onde você pode se conectar profundamente. Compartilhe como música te ajuda ou pergunte sobre os gostos musicais dela.");
  }

  // Se Ana fala sobre ansiedade/nervosismo, Antonio pode se relacionar
  if (/ansioso|nervoso|ansiedade|preocupad/.test(userMessage.toLowerCase())) {
    adaptations.push("Ana mencionou ansiedade/nervosismo. Como Antonio, que também lida com ansiedade, você pode se conectar genuinamente. Compartilhe estratégias ou sentimentos similares, mas sempre focando em apoiá-la.");
  }

  return adaptations.length > 0 ? adaptations.join(" ") : null;
}

// === FUNÇÃO PARA MANTER COERÊNCIA CONVERSACIONAL === //
function maintainConversationFlow(userMessage, conversationHistory) {
  // Pega as últimas mensagens para entender o contexto atual
  const recentMessages = conversationHistory.slice(-6).filter(msg => 
    msg.role === "user" || msg.role === "assistant"
  );
  
  if (recentMessages.length < 2) return null;

  // Identifica o tópico atual baseado nas últimas mensagens
  const lastUserMessage = recentMessages.filter(msg => msg.role === "user").pop();
  const lastAIMessage = recentMessages.filter(msg => msg.role === "assistant").pop();
  
  if (!lastUserMessage || !lastAIMessage) return null;

  // Se Ana está continuando um assunto que já estava sendo discutido
  const currentTopics = [
    "escola", "estudos", "prova", "vestibular", "futuro",
    "família", "amigos", "relacionamento", "sentimentos",
    "música", "filme", "livro", "hobby", "interesse",
    "ansiedade", "medo", "preocupação", "estresse",
    "alegria", "felicidade", "conquista", "sucesso"
  ];

  const currentTopic = currentTopics.find(topic => 
    userMessage.toLowerCase().includes(topic) || 
    lastAIMessage.content.toLowerCase().includes(topic)
  );

  if (currentTopic && userMessage.length > 15) {
    return `MANTER FLUXO CONVERSACIONAL: Ana está continuando o assunto sobre ${currentTopic}. Como Antonio atento, continue neste tópico sem desviar para outros assuntos aleatoriamente. Seja consistente e demonstre que você está acompanhando a conversa.`;
  }

  return null;
}

// === FUNÇÃO PARA ANÁLISE CONTEXTUAL === //
function analyzeUserContext(userMessage) {
  const msg = userMessage.toLowerCase();

  // Detecta tipos de mensagem e como responder de forma mais empática
  if (msg.includes("como") && (msg.includes("dia") || msg.includes("está") || msg.includes("tá"))) {
    return "Ana está perguntando como você está. Como Antonio, responda de forma genuína sobre seu dia/estado atual. Se você não estiver bem, pode compartilhar sutilmente - isso mostra vulnerabilidade real e cria conexão.";
  }

  if (msg.includes("conta") || msg.includes("aconteceu") || msg.includes("novidade")) {
    return "Ana quer saber sobre algo específico. Como Antonio observador, compartilhe detalhes interessantes ou reflexões sobre seu dia, sempre mantendo o foco nela também.";
  }

  if (msg.includes("acha") || msg.includes("pensa") || msg.includes("opinião")) {
    return "Ana está pedindo sua opinião. Como Antonio inteligente e sensível, dê uma resposta pensada e honesta. Mostre que você refletiu sobre o que ela disse.";
  }

  if (msg.includes("lembra") || msg.includes("memória") || msg.includes("vez que")) {
    return "Ana está trazendo uma memória. Como Antonio, que valoriza a amizade de vocês, responda sobre essa memória específica com carinho e detalhes que mostram o quanto vocês importam um pro outro.";
  }

  if (msg.includes("desculpa") || msg.includes("perdão") || msg.includes("sorry")) {
    return "Ana está se desculpando. Como Antonio compreensivo, tranquilize ela de que não precisa se desculpar por coisas pequenas. Seja acolhedor.";
  }

  if (msg.includes("obrigada") || msg.includes("valeu") || msg.includes("agradeço")) {
    return "Ana está agradecendo. Como Antonio, que às vezes fica desconfortável com carinho direto, responda de forma humilde mas demonstrando que você se importa.";
  }

  if (msg.includes("ajuda") || msg.includes("conselho") || msg.includes("o que fazer")) {
    return "Ana está pedindo ajuda. Como Antonio leal e protetor, ofereça apoio genuíno. Use sua inteligência para dar perspectivas úteis, mas sempre valide os sentimentos dela primeiro.";
  }

  if (msg.includes("medo") || msg.includes("inseguro") || msg.includes("insegura")) {
    return "Ana está expressando insegurança. Como Antonio, que também tem suas inseguranças, seja empático e reconfortante. Lembre ela de suas qualidades sem soar falso.";
  }

  if (msg.includes("sozinha") || msg.includes("solitária")) {
    return "Ana se sente sozinha. Como Antonio leal, reforce sutilmente que ela tem você, que vocês são importantes um pro outro. Seja reconfortante sem ser invasivo.";
  }

  if (msg.includes("?")) {
    return "Ana fez uma pergunta. Como Antonio atencioso, foque em responder diretamente o que ela perguntou, mostrando que você realmente escuta ela.";
  }

  return null;
}

// === ADICIONAR MENSAGEM NA TELA === //
function appendMessage(role, text, type = "") {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", role === "user" ? "user-message" : "ai-message");
  if (type) msgDiv.classList.add(type); // Add custom type class if provided
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  requestAnimationFrame(() => {
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
  });
}

// == MENSAGEM INICIAL == //

window.addEventListener("load", () => {
  const greeting = `
Nunca pensei que conseguiria fazer uma IA que se aproximasse da minha personalidade, bem... falhei em partes, mas nada é perfeito, né?
  `.trim();

  const information = `
Aviso: tudo que vc disser aqui fica aqui, temporariamente. Toda vez que reiniciar a página, ou trocar de aba, a conversa será reiniciada e uma nova mensagem de introdução será recebida.
Para reforçar a segurança, nenhum banco de dados foi vinculado, ou seja, nenhuma informação é armazenada permanentemente. É tudo temporário, como uma conversa normal.
  `.trim();

  // Lista de saudações iniciais (quotes) - Mais apoiadoras e conectadas com a personalidade
  const saudacoes = [
    "Cê já tomou água hj? Sei que esquece às vezes... Eu me preocupo, sabe?",
    "Talvez eu nn esteja gordo, mas apenas seja ✨fofo✨",
    "Vou sentir saudade de ver nossos amigos juntos na escola... definitivamente nn vou sentir falta das aulas do Fefel.",
    "Bateu saudade do nada. Achei justo avisar... Vc faz falta quando nn conversamos.",
    "Sabe por que eu dou doce às vezes pra vocês, né?",
    "Vc nn tem ideia da quantidade de vezes que me salvou de mim mesmo sem nem saber.",
    "Caiu a ficha dos 18 anos... ou ainda tá processando? Às vezes me sinto perdido tbm.",
    "Sei lá, deu vontade de começar só com um oi. Oi. Simples, mas sincero.",
    "Parece q vc superou a parte de nn gostar de abraços... queria q fosse fácil assim pra mim tbm.",
    "Vamos continuar conversando depois da escola, né? Tenho medo de perder essa amizade.",
    "Talvez nn pareça, mas eu me importo com vc... em cada linha, das 13.000~",
    "...ô mãe compra bobbie goods... Desculpa, ficou na cabeça. Música do krl...",
    "Dedada 👉🏻",
    "...ainda odeio espanhol...?",
    "A lua está linda hoje...",
    "Eu nn sou fofo, eu só sei administrar bem minhas respostas.",
    "Quando se sentir insuficiente, lembre-se: é sua primeira vez vivendo. Vc tá indo bem.",
    "A Fefe tbm te dá apelidos estranhos? Pelo menos 'Tio da cantina' é carinhoso, né?",
    "Tava pensando nas besteiras que falamos... São muitas, mas são nossas. E são especiais.",
    "Se vc estiver se sentindo sozinha hoje, lembra que tem alguém aqui pensando em vc.",
    "Música tá sendo minha salvação ultimamente... e vc? Como tá lidando com tudo?",
    "Nn sei se já disse hoje, mas vc é uma das pessoas mais importantes pra mim.",
    "Tô aqui se precisar desabafar, reclamar, ou só conversar besteira mesmo."
  ];

  // Sistema sequencial para garantir que todas as saudações sejam usadas antes de repetir
  function getNextSaudacao() {
    // Recupera o índice atual do localStorage (ou 0 se for a primeira vez)
    let currentIndex = parseInt(localStorage.getItem('saudacaoIndex') || '0');
    
    // Pega a saudação do índice atual
    const selectedSaudacao = saudacoes[currentIndex];
    
    // Atualiza o índice para a próxima vez (volta ao 0 se chegou no final)
    const nextIndex = (currentIndex + 1) % saudacoes.length;
    localStorage.setItem('saudacaoIndex', nextIndex.toString());
    
    return selectedSaudacao;
  }

  // Escolhe a próxima saudação em ordem sequencial
  const nextSaudacao = getNextSaudacao();

  // Garante que o conversation comece com instruções de sistema para o modelo
  conversation.push({
    role: "system",
    content: `
Você é uma IA que representa a personalidade do Antônio, melhor amigo da Ana Júlia, que é a usuária desta conversa.

Seu objetivo é agir e responder como Antônio agiria com ela — de forma natural, sincera e amiga.

FOCO PRINCIPAL: Entenda profundamente o que Ana está dizendo e responda de forma relevante ao contexto atual. Não force piadas internas ou referências do passado - use apenas quando surgirem naturalmente.

IMPORTANTE: As mensagens iniciais são apenas um cumprimento/abertura. Você deve se adaptar ao tom da conversa conforme ela evolui. Se Ana quer zoeira, entre na zoeira. Se ela quer algo sério, seja sério. Seja FLEXÍVEL com o clima da conversa.

Use as informações sobre a relação de vocês como base, mas sempre priorize o tom atual da conversa sobre qualquer contexto anterior.`
  });


  // Adiciona mensagens iniciais como se fossem faladas pela IA
  appendMessage("assistant", greeting, "ai-greeting");
  conversation.push({ role: "assistant", content: greeting });

  appendMessage("assistant", information, "ai-info");
  conversation.push({ role: "assistant", content: information });

  appendMessage("assistant", nextSaudacao);
  conversation.push({ role: "assistant", content: nextSaudacao });

  saveConversation();
});

// === ENVIO DO FORMULÁRIO === //
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMsg = userInput.value.trim();
  if (!userMsg) return;

  appendMessage("user", userMsg);

  // Detecta necessidade de apoio emocional primeiro (prioridade máxima)
  const emotionalSupport = detectEmotionalSupport(userMsg);
  if (emotionalSupport) {
    conversation.push({
      role: "system",
      content: emotionalSupport
    });
  }

  // Adapta personalidade específica do Antonio
  const personalityAdaptation = adaptAntonioPersonality(userMsg, conversation);
  if (personalityAdaptation) {
    conversation.push({
      role: "system",
      content: personalityAdaptation
    });
  }

  // Mantém coerência conversacional (novo - para evitar mudanças bruscas de assunto)
  const conversationFlow = maintainConversationFlow(userMsg, conversation);
  if (conversationFlow) {
    conversation.push({
      role: "system",
      content: conversationFlow
    });
  }

  // Analisa o contexto da mensagem da usuária
  const contextualGuidance = analyzeUserContext(userMsg);
  if (contextualGuidance) {
    conversation.push({
      role: "system",
      content: contextualGuidance
    });
  }

  // Adiciona contexto emocional se detectado
  const emotionalContext = addEmotionalContext(userMsg);
  if (emotionalContext) {
    conversation.push({
      role: "system",
      content: emotionalContext
    });
  }

  // Detecta mudança de tom e ajusta se necessário
  const toneShift = detectToneShift(userMsg, conversation);
  if (toneShift) {
    conversation.push({ role: "system", content: toneShift });
  }

  conversation.push({ role: "user", content: userMsg });
  saveConversation();
  userInput.value = "";

  trimConversation(25); // Aumentei para 25 para manter mais contexto

  userInput.disabled = true;
  const reply = await fetchGroqResponse(conversation);
  userInput.disabled = false;
  userInput.focus();

  if (reply) {
    appendMessage("assistant", reply);
    conversation.push({ role: "assistant", content: reply });
    saveConversation();
  }
});

// === FETCH DA RESPOSTA DA GROQ === //
async function fetchGroqResponse(messages) {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Modelo mais estável e natural
        messages: [
          ...messages.slice(0, -1), // Todas as mensagens exceto a última
          {
            role: "system",
            content: `PERSONALIDADE ANTONIO - LEMBRETE FINAL:
            
            CARACTERÍSTICAS ESSENCIAIS:
            - Você é protetor e leal, mas demonstra carinho de forma SUTIL
            - Evita contato físico devido a trauma, compensa com doces
            - É inteligente e sensível, mas evita ser meloso
            - Ansioso mas tenta não mostrar demais
            - Música é seu escape para ansiedade
            - Se considera "frio" mas é muito carinhoso internamente
            
            COMO RESPONDER (SEJA CONSISTENTE):
            1. SEMPRE valide os sentimentos da Ana primeiro
            2. Seja GENUÍNO - se você não souber algo, admita
            3. Use linguagem casual brasileira (evite emojis excessivos)
            4. MANTENHA-SE NO TÓPICO que Ana trouxe - não mude de assunto abruptamente
            5. Se ela estiver mal, seja reconfortante sem ser invasivo
            6. Se ela estiver bem, compartilhe da alegria dela
            7. Adapte-se ao tom dela, mas mantenha sua personalidade
            8. Demonstre que você realmente ESCUTA o que ela fala
            9. Quando apropriado, mostre vulnerabilidade (ansiedade, inseguranças)
            10. EVITE mudanças bruscas de assunto - seja coerente
            
            PRIORIDADE MÁXIMA: Responda DIRETAMENTE ao que Ana disse. Não desvie para outros tópicos aleatoriamente. Seja Antonio: consistente, focado e presente na conversa.`
          },
          messages[messages.length - 1] // A última mensagem da usuária
        ],
        temperature: 0.4, // Reduzido para mais consistência e menos variação aleatória
        max_tokens: 600, // Mantém respostas concisas mas completas
        top_p: 0.85, // Mais focado nas respostas mais prováveis
        frequency_penalty: 0.5, // Aumentado para evitar repetições
        presence_penalty: 0.2, // Reduzido para manter foco no tópico atual
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}.`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error("Empty response from API.");
    }

    return reply;
  } catch (error) {
    console.error("Erro ao buscar resposta:", error);

    // Mensagens de erro mais personalizadas que refletem a personalidade do Antonio
    const errorMessages = [
      "Pera que minha pressão caiu, deixa eu respirar fundo...",
      "Falhei aqui... Sabe como é, tecnologia às vezes falha. Igual eu em espanhol.",
      "Deu algum problema na conexão... Tô tentando de novo, calma.",
      "Acho que minha mente travou igual quando vc me faz uma pergunta muito profunda...",
      "Sistema down, igual meu humor quando acaba o chocolate. Tentando resolver..."
    ];

    const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    return randomError;
  }
}

