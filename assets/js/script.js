const giftBtn = document.getElementById('giftButton');
const popup = document.getElementById('popup');
const popupContainer = document.querySelector('.popup-container');

giftBtn.addEventListener('click', () => {
  popup.classList.remove('hidden');
});

// Dismiss popup when clicking outside
popup.addEventListener('click', (e) => {
  if (!popupContainer.contains(e.target)) {
    popup.classList.add('hidden');
  }
});