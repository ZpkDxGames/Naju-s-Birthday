const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-content');
const closeBtn = document.querySelector('.close');
const galleryItems = document.querySelectorAll('.gallery-item img');

galleryItems.forEach(img => {
    img.addEventListener('click', () => {
        lightbox.classList.remove('hidden');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
    });
});

closeBtn.addEventListener('click', () => {
    lightbox.classList.add('hidden');
});

lightbox.addEventListener('click', (e) => {
    if (!lightboxImg.contains(e.target)) {
        lightbox.classList.add('hidden');
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