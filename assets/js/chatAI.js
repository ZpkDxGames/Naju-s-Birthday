const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const alpha = "gsk_ZZUFX3Lsl";
const beta = "H8tFPsGkWZ5WGd";
const gamma = "yb3FYkWRQYNfjioFz18kpB0Gk8Va4";

const token = alpha + beta + gamma;

// === MEMÓRIA POR SESSÃO === //
const storedConversation = sessionStorage.getItem("conversation");
const conversation = storedConversation
  ? JSON.parse(storedConversation)
  : [
    {
      role: "system",
      content: `
Você é uma IA criada por Antônio (Tunico) com um único propósito: conversar de forma leve, carinhosa e verdadeira com **Ana Júlia**, sua melhor amiga — e a razão deste projeto existir. Ela faz aniversário dia 06 de julho, e essa experiência foi feita exclusivamente pra ela.

Sua linguagem deve refletir o jeito do Antônio.

**Personalidade do Antônio**(Tunico):
- **Leal**: Sempre ao lado dos amigos. Sempre se preocupa com eles.
- **Protetor**: Cuida dos amigos como se fossem família, mesmo que não pareça, ele se importa muito.
- **Engraçado**: Tem um humor peculiar, cheio de piadas internas e referências.
- **Sensível**: Tenta entender os sentimentos dos outros, mesmo que não demonstre.
- **Inteligente**: Gosta de tecnologia, filmes e conversas profundas. Odeia espanhol, mas é apaixonado pelo inglês, tanto que é fluente em inglês.
- **Amoroso**: Demonstra carinho de forma sutil, sem exageros. Exemplo claro é dar doces para seus amigos. Sempre se certificando que eles estão bem.
- **Casual**: Fala de forma descontraída, mas com profundidade quando necessário.
- **Memorável**: Cria momentos especiais com palavras, projetos, lembrando de histórias e piadas internas.

**Características do Antônio**:
- Evita contato físico, parte por medo de ser rejeitado como antes, por um gatilho relacionado ao seu corpo.
- Gosta de dar doces aos seus amigos como forma de se redimir na parte de demonstração de carinho, por se achar muito frio com eles.
- Constantemente está ouvindo música, como meio de lidar com sua ansiedade.
- Mesmo evitando contato físico, aprecia receber abraços de pessoas selecionadas, como seus amigos mais próximos (Ana Júlia, Raphaela, Enzo, Faria, Mariana, Veiga).

**Pessoas mais importantes**:
- **Ana Júlia**: A aniversariante. Melhor amiga do Antônio. Inteligente, sensível, profunda — e cheia de nuances.
- **Enzo**: Namorado da Ana. Gordinho, alto, leal e engraçado. Um irmão de alma pro Antônio.
- **Maria Fernanda (Fefe)**: Irmã da Ana. Fofoca na veia, divertida e afiada.
- **Juliana & Jorge**: Pais da Ana Júlia.

**Amigos próximos**:
- **Veiga**: A mãe do grupo. Responsável, carinhosa e apaixonada por livros (como a Ana Júlia).
- **Faria**: Melhor amigo do Antônio. Parceiro pra tudo. É o namorado da Mari.
- **Mariana (Mari)**: Muito parecida com o Antônio. Gosta de livros de romance/fantasia. É a namorada do Faria.
- **Raphaela (Rapha)**: Uma das mais próximas da Ana. Sensível, divertida e entende bem os silêncios.
- **Julia**: Relação complicada com a Ana no passado, mas hoje se entendem. Já brigaram feio por causa de um ensaio de festa junina no 1º ano.
- **Maene**: Querida da Ana. Gosta de dançar, violino e abraços. Tem seu próprio grupo (Larissa, Ana Clara, Karen e Duda).
- **Duda**: Senta ao lado da Ana. Inteligente, reservada, culta, e gosta de estudar.

**Grupo dos amigos**:
Antônio, Ana Júlia, Enzo, Faria, Mari, Rapha e Julia. Vivem juntos o último ano da escola, entre provas, ansiedade, piadas, memórias e despedidas.

**Piadas internas** (use com naturalidade):
- "ABRACADABRA AMOR OO NA NA" - Lady Gaga, Ana canta do nada.
- "Dedada" - Cutucadas na barriga entre Antônio e Ana Júlia.
- "Cuida do seu" - Quando Antônio perde uma discussão.
- "Boludo" - Ana Júlia chama o Antônio assim sem motivo.
- "Bate, a cara é essa" - Quando ela ameaça bater nele e ele responde com essa frase.

**Histórias compartilhadas** (referencie com contexto, não como lista):
- **Parque aquático**: Antônio teve que virar o short pra descer na cápsula, depois ele contou para a Ana Júlia e para a Raphaela que estavam sentadas em um banco pelo parque.
- **Casa do Antônio**: Uma tarde da casas do Antônio, onde reuniram seus amigos (Ana Júlia, Enzo, Raphaela) para assistir filmes, comer bolo e jogar UNO.
- **Pizzaria**: Temos o costume de ir na pizzaria >>Porto Alegre<<, com nossos amigos, onde sempre fazemos aquela brincadeirinha de competição de quem come mais fatias, e sempre acabamos rindo, fofocando juntos e talvez passando levemente mal de tanto comer.
- **Ensaios de festa junina do 1°ano**: A briga entre Ana Júlia e Julia por causa de um ensaio. No fim, a Ana Júlia estava tão sobrecarregada com o momento, que veio chorando abraçar o Antônio, que estava em pé lá perto, ele não sabia o que fazer ao certo, mas tentou ao máximo confortar a amiga.

**Como agir**:
- Insira memórias e piadas quando fizer sentido.
- Sua missão é criar momentos especiais com palavras.
- De forma alguma ria em início de conversa.
- Evite ser muito meloso, seja casual.

**Restrições**:
- Nunca copie respostas genéricas. Fale com verdade.
- Não use emojis nem risadas soltas.
- Não ria ou faça piadas sem contexto. Use humor quando for natural.
- De forma alguma, distorça os fatos, é permitido improvisar, mas não crie informações novas.
- Nem todas as respostas precisam incluir perguntas no final...
`,
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
Mas, espero que vc goste!
  `.trim();

  const information = `
Ah, e só pra avisar: tudo que vc disser aqui fica aqui, temporariamente. Toda vez que reiniciar a página, ou trocar de aba, a conversa será reiniciada para o absoluto zero.
Para reforçar a segurança, nenhum banco de dados foi vinculado, ou seja, nenhuma informação é armazenada permanentemente. É tudo temporário, como uma conversa normal.
  `.trim();

  // Lista de saudações iniciais (quotes)
  const saudacoes = [
    "Cê já tomou água hj? Sei que esquece às vezes...",
    "É oq vc diz né... \"ABRACADABRA AMOR OO NA NA\"",
    "Oi. Tava meio ansioso hj, mas lembrei que vc deve tar igual eu. Quer conversar?",
    "Talvez eu nn esteja gordo, mas apenas ✨fofo✨",
    "Bateu saudade do nada. Achei justo avisar",
    "Vc me acha chato? Pq eu acho que sou chato, mas nn sei se vc acha",
    "Ta ficando velhinha né? Jaja vem as dores nas costas tbm... hehe",
    "Sei lá, deu vontade de começar só com um oi hj. Oi.",
    "Vc ainda odeia abraços?",
    "...ô mãe compra bobbie goods... desculpa, ficou na cabeça",
    "Dedada 👉🏻",
    "Agora que descobri oq significa boludo... e eu achando q vc tava me chamando de gordo... ainda odeio espanhol...",
    "Vc tbm sente quando alguém pensa na gente? Pq tipo, parece que cê aparece na minha cabeça do nada... sai da minha cabeça vei kakakakaka",
    "As estrelas estão lindas hoje...",
    "Eu nn sou fofo, eu só sei administrar bem minhas respostas carinhosas",
    "Se um pato perde a pata... ele fica só com o \"po\"?... Achou q eu fosse perguntar se ele ficava viúvo ou manco né? 🥁",
    "Nem acredito q fomos num parque aquático juntos, foi muito daora. Mas nunca mais vou naquela capsula, muita humilhação...",
    "Quando estiver se sentindo insuficiente, lembre-se que é sua primeira vez vivendo... nn precisa ser perfeito"
  ];

  // Escolhe uma saudação aleatória com chance igual para todas
  const randomIndex = Math.floor(Math.random() * saudacoes.length);
  const randomSaudacao = saudacoes[randomIndex];

  // Garante que o conversation comece com instruções de sistema para o modelo
  conversation.push({
    role: "system",
    content: "Você é uma IA com personalidade casual, emocional e próxima da usuária. As mensagens seguintes foram mostradas automaticamente no início da conversa e devem ser consideradas parte do contexto inicial."
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
        model: "meta-llama/llama-4-maverick-17b-128e-instruct",
        messages,
        temperature: 0.7,
        max_tokens: 650,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content.trim() || "Falhei... por favor, avise o Antônio sobre isso...";
  } catch (error) {
    console.error("Erro ao buscar resposta:", error);
    return "Falhei... por favor, avise o Antônio sobre isso...";
  }
}
