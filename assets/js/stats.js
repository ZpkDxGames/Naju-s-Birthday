function animateStat(id, endValue, duration = 2000) {
  const element = document.getElementById(id);
  let startValue = 0;
  const frameRate = 1000 / 60;
  const totalFrames = Math.round(duration / frameRate);
  const increment = endValue / totalFrames;

  let frame = 0;
  const counter = setInterval(() => {
    startValue += increment;
    frame++;
    if (frame >= totalFrames) {
      clearInterval(counter);
      element.textContent = endValue.toLocaleString();

      element.classList.add("pop");

      setTimeout(() => {
        element.classList.remove("pop");
      }, 500);
    } else {
      element.textContent = Math.round(startValue).toLocaleString();
    }
  }, frameRate);
}

function setupStatAnimation(statId, endValue) {
  const card = document.querySelector(`#${statId}`)?.closest(".stat-card");
  let animated = false;

  if (card) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            animated = true;
            setTimeout(() => {
              animateStat(statId, endValue);
            }, 300);
          }
        });
      },
      {
        threshold: 0.6
      }
    );

    observer.observe(card);
  }
}

// Calculate days since June 04, 2018
function calculateDaysSince(startDateStr) {
  const startDate = new Date(startDateStr);
  const now = new Date();
  // Zero out time for both dates to avoid partial days
  startDate.setHours(0,0,0,0);
  now.setHours(0,0,0,0);
  const diffTime = now - startDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

setupStatAnimation("humilhados", 48194);
setupStatAnimation("surtos", 42958);
setupStatAnimation("xingamos", 39237);
setupStatAnimation("mal-de-alguem", 32529);
setupStatAnimation("fizemos-besteira", 29825);
setupStatAnimation("salvos-de-besteira", 18644);
setupStatAnimation("bate", 16923);
setupStatAnimation("fofoca", 14932);
setupStatAnimation("dedada", 13989);
setupStatAnimation("mandar-se-matar", 12640);
setupStatAnimation("consolo", 2523);
setupStatAnimation("desabafo", 1075);
setupStatAnimation("abraços", 35);
setupStatAnimation("casa", 7);
setupStatAnimation("choro", 4);
setupStatAnimation("mal-do-outro", 0);
setupStatAnimation("dias", calculateDaysSince("2018-06-04"));

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