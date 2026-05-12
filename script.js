// Sustain 16 - game logic

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.getElementById('play-btn-overlay').addEventListener('click', function () {
  showScreen('screen-mode');
});

document.querySelector('.mode-single').addEventListener('click', function () {
  showScreen('screen-topic');
});
