document.addEventListener("DOMContentLoaded", () => {
    const messages = [
        "Eu ia pedir pra uma IA escrever umas mensagenszinhas clichès de conforto e bla bla bla... mas vou ser mais autêntico nessa parte de \"demonstrar carinho\"...",
        "Tem gnt que chega e vira rotina, mas vc chegou e virou lar. Mesmo quando a gnt nn se fala tanto, sua presença pesa de um jeito bom... tipo aquele silencio confortável que só existe com quem a gnt confia de vdd",
        "Talvez eu nn diga sempre, ou quase nunca, mas vc é um dos pontos altos da minha vida. Com vc, tudo fica mais leve, mais seguro... mais real",
        "Vc é aquela pessoa que me entende no olhar, nas pausas, até nos dias em que nn to bem... sem dizer uma palavra se quer. E isso... isso é raro pra krl",
        "Real nn sou muito de falar, mas se existe um jeito meu de demonstrar afeto, é esse aqui, criando algo pra vc, pensando em cada detalhe, como se cada parte dissesse 'vc é importante pra mim' algo que é verdade, algo que é original",
        "Eu admiro sua coragem, sua sensibilidade, sua forma de enxergar o mundo. E por mais que o mundo mude, eu espero continuar fazendo parte do seu universo, mesmo que em silencio",
        "Tem gente que a gente conhece e passa. E tem vc, que ficou... mesmo quando eu nem soube como agradecer por isso",
        "Nn é sobre estar todo dia, é sobre saber que mesmo longe, vc é aquele tipo de pessoa que deixa tudo mais bonito só por existir",
        "Vc é aquela parte da minha vida que nn tem como apagar, porque marcou de um jeito sincero",
        "Se algum dia eu pareci distante, nunca foi falta de carinho. É que as vezes o que sinto por vc é tão grande que nn pode ser quantificado em palavras",
        "Eu sou melhor desde que te conheci. Nn pq vc tentou me mudar, mas porque me aceitou como eu sou",
        "Se vc soubesse o quanto eu me importo, talvez se surpreendesse. Mas a real é que me importo mais do que sei demonstrar",
        "Depois vou querer saber com detalhes oq achou disso tudo, pq genuinamente nn sei se mandei bem ou se fui chiclè demais 😅",
        "Desde q nn pense q sou maluco, tudo é válido kakakakaka"
    ];

    const container = document.querySelector(".message-container");

    messages.forEach((msg, index) => {
        const card = document.createElement("div");
        card.classList.add("message-card");
        card.textContent = msg;
        container.appendChild(card);
    });
});

window.addEventListener("load", () => {
  const duration = 2 * 1000; // 2 seconds
  const end = Date.now() + duration;

  (function frame() {
    // Medium speed, scattered confetti
    confetti({
      particleCount: 8,
      angle: 90,
      spread: 180,
      origin: { y: 0 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
});