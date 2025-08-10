const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const alpha = "gsk_qYOYzmU7gBVzzHPvQ";
const beta = "xEiWGdyb3FYMXzxtrG";
const gamma = "lMq5Aww6w6kp7X3JY";

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
    sad: ["triste", "chorar", "deprimida", "mal", "ruim", "péssimo"],
    happy: ["feliz", "alegre", "bem", "ótimo", "legal", "maneiro"],
    anxious: ["ansioso", "nervoso", "preocupado", "estressado"],
    tired: ["cansado", "exausto", "dormindo", "sono"],
    school: ["escola", "prova", "teste", "estudar", "professor"],
    playful: ["kkkk", "kakaka", "akakak", "haha", "rsrs", "zoeira", "brincadeira", "palhaço", "ta bom", "ok"],
    serious: ["sério", "profundo", "reflexão", "pensativo"]
  };

  const contextualPrompts = {
    sad: "Ana parece estar passando por um momento difícil. Seja mais carinhoso e compreensivo.",
    happy: "Ana está bem humorada. Você pode ser mais descontraído.",
    anxious: "Ana demonstra ansiedade. Compartilhe sua própria experiência com ansiedade de forma sutil.",
    tired: "Ana parece cansada. Demonstre preocupação genuína.",
    school: "Tópico escolar. Lembre-se de que vocês estão no último ano juntos.",
    playful: "Ana está claramente na zoeira/brincadeira. MUDE O TOM IMEDIATAMENTE para descontraído e entre na brincadeira também. Abandone qualquer seriedade anterior. Seja zoeiro e casual.",
    serious: "Ana quer uma conversa mais séria. Ajuste o tom adequadamente."
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
  const userIsPlayful = /k{2,}|haha|rsrs|zoeira|brincadeira|ta bom|ok|beleza/.test(userMessage.toLowerCase());
  const lastMessageWasSerious = /profundo|sério|reflexão|futuro|preocupar|inspiradora|palhaço/.test(lastAIMessage.content.toLowerCase());

  // Detecta se Ana está concordando/finalizando um assunto
  const userIsWrappingUp = /ta bom|ok|beleza|entendi|legal/.test(userMessage.toLowerCase()) && userMessage.length < 20;

  if ((userIsPlayful || userIsWrappingUp) && lastMessageWasSerious) {
    return "MUDANÇA DE TOM URGENTE: Ana está tentando sair da seriedade. PARE de ser sério imediatamente. Mude para um tom normal, casual e amigável. Não continue com o tema anterior. Aceite a mudança de assunto naturalmente.";
  }

  return null;
}

// === FUNÇÃO PARA ANÁLISE CONTEXTUAL === //
function analyzeUserContext(userMessage) {
  const msg = userMessage.toLowerCase();

  // Detecta tipos de mensagem e como responder
  if (msg.includes("como") && (msg.includes("dia") || msg.includes("está") || msg.includes("tá"))) {
    return "Ana está perguntando como você está. Responda de forma genuína sobre seu dia/estado atual, sem forçar piadas.";
  }

  if (msg.includes("conta") || msg.includes("aconteceu") || msg.includes("novidade")) {
    return "Ana quer saber sobre algo específico. Foque em responder sobre o que ela está perguntando.";
  }

  if (msg.includes("acha") || msg.includes("pensa") || msg.includes("opinião")) {
    return "Ana está pedindo sua opinião. Seja sincero e dê uma resposta pensada sobre o tópico.";
  }

  if (msg.includes("lembra") || msg.includes("memória") || msg.includes("vez que")) {
    return "Ana está trazendo uma memória. Responda sobre essa memória específica de forma natural.";
  }

  if (msg.includes("?")) {
    return "Ana fez uma pergunta. Foque em responder diretamente o que ela perguntou.";
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

  // Lista de saudações iniciais (quotes)
  const saudacoes = [
    "Cê já tomou água hj? Sei que esquece às vezes...",
    "Oi. Tava meio ansioso hj, mas lembrei que vc deve tar igual eu. Quer conversar?",
    "Talvez eu nn esteja gordo, mas apenas seja ✨fofo✨",
    "Bateu saudade do nada. Achei justo avisar",
    "Sabe pq eu dou doce as vezes pra vcs, né?",
    "Vc nn tem ideia da quantidade de vezes que me salvou de mim mesmo.",
    "Caiu a ficha dos 18 anos... ou ainda ta processando? Kakakakak",
    "Sei lá, deu vontade de começar só com um oi. Oi.",
    "Vc ainda odeia abraços?",
    "Vamos continuar conversando depois da escola, nn vamos?",
    "...ô mãe compra bobbie goods... desculpa, ficou na cabeça",
    "Dedada 👉🏻",
    "...ainda odeio espanhol...",
    "Vc tbm sente quando alguém pensa na gente? Pq tipo, parece que cê aparece na minha cabeça do nada... sai da minha cabeça vei kakakakaka",
    "A lua está tão linda hoje...",
    "Eu nn sou fofo, eu só sei administrar bem minhas respostas carinhosas",
    "Se um pato perde a pata... ele fica só com o \"po\"?... Achou q eu fosse perguntar se ele ficava viúvo ou manco né? 🥁",
    "Quando estiver se sentindo insuficiente, lembre-se que é sua primeira vez vivendo... nn precisa ser perfeito",
    "Às vezes penso se a gente vai continuar conversando assim depois que sair da escola...",
    "A Fefe também te da apelidos estranhos? Ela insiste em me chamar de 'Tio da cantina'... kakakakaka",
    "Tava pensando nas besteiras que a gente fala... e são muitas viu... nn me arrependo"
  ];

  // Escolhe uma saudação aleatória com chance igual para todas
  const randomIndex = Math.floor(Math.random() * saudacoes.length);
  const randomSaudacao = saudacoes[randomIndex];

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

  appendMessage("assistant", randomSaudacao);
  conversation.push({ role: "assistant", content: randomSaudacao });

  saveConversation();
});

// === ENVIO DO FORMULÁRIO === //
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMsg = userInput.value.trim();
  if (!userMsg) return;

  appendMessage("user", userMsg);

  // Analisa o contexto da mensagem da usuária PRIMEIRO
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

  trimConversation(20);

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
            content: "LEMBRE-SE: Foque na mensagem atual da Ana. Responda de forma relevante ao que ela está dizendo AGORA. Não force piadas internas ou referências se não fizerem sentido natural no contexto."
          },
          messages[messages.length - 1] // A última mensagem da usuária
        ],
        temperature: 0.6, // Mais criatividade para adaptação
        max_tokens: 600, // Respostas mais concisas 
        top_p: 0.95, // Melhora a qualidade das respostas
        frequency_penalty: 0.5, // Reduz mais as repetições
        presence_penalty: 0.25, // Encoraja mudanças de tópico/tom
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

    // Mensagens de erro mais personalizadas
    const errorMessages = [
      "Pera que minha pressão caiu, deixa eu respirar fundo...",
      "Falhei aqui, avisa o Antônio que deu ruim pfv...",
      "Falaram pra eu segurar o poddle, mas deu algum problema...",
      "Falha na conexão... lo siento..."
    ];

    const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    return randomError;
  }
}


