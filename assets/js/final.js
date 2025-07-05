const hugBtn = document.getElementById('hugBtn');

document.addEventListener("DOMContentLoaded", () => {
  const msgBtn = document.getElementById("msgBtn");
  const popup = document.getElementById("finalMsgPopup");
  const closeBtn = document.getElementById("closePopup");

  if (msgBtn && popup && closeBtn) {
    msgBtn.addEventListener("click", () => {
      popup.classList.remove("hidden");
    });

    function closePopup() {
      popup.classList.add("hidden");
    }

    closeBtn.addEventListener("click", closePopup);

    popup.addEventListener("click", (e) => {
      if (e.target === popup) closePopup();
    });
  }
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