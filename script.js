// ── Config ──────────────────────────────────────────────────────────────────
const ARCHETYPE_UNLOCK_THRESHOLD = 2;

// ── Puzzle 1 data ────────────────────────────────────────────────────────────
const PUZZLE1_GROUPS = [
  {
    id: 'actions_solutions',
    label: 'Common ecotourism activities',
    color: '#6b9b4e',
    words: ['HIKING', 'SNORKELLING', 'BIRDWATCHING', 'KAYAKING']
  },
  {
    id: 'places_observation',
    label: 'Where ecotourists go',
    color: '#3a7ca5',
    words: ['RESERVE', 'TRAIL', 'LODGE', 'SANCTUARY']
  },
  {
    id: 'causes_mechanisms',
    label: 'What makes tourism eco',
    color: '#ea7832',
    words: ['CONSERVATION', 'SUSTAINABILITY', 'EDUCATION', 'RESPECT']
  },
  {
    id: 'systems_people',
    label: 'People who run ecotourism sites',
    color: '#d9554a',
    words: ['GUIDE', 'RANGER', 'MONITOR', 'STEWARD']
  }
];

const ARCHETYPES = {
  actions_solutions: {
    name:  'The Activist ✊',
    image: 'images/activist.jpeg',
    text:  'You jumped straight to what to do. Plan your next trip with one ecotourism principle in mind - pick a destination that gives back to its community.'
  },
  places_observation: {
    name:  'The Explorer 🧭',
    image: 'images/explorer.jpeg',
    text:  "You think about where to go. Find one ecotourism destination within 2 hours of where you live - there's probably one you've never heard of."
  },
  causes_mechanisms: {
    name:  'The Scientist 🔬',
    image: 'images/scientist.jpeg',
    text:  "You spot the principles before the action. Today, read up on what separates real ecotourism from greenwashing - it's a surprisingly murky industry."
  },
  systems_people: {
    name:  'The Observer 👁',
    image: 'images/observer.jpeg',
    text:  "You see who's holding things together. Look up the rangers, guides, and stewards near you - many run free walks you can join."
  }
};

const TEMP_LABELS = [
  'Stable climate',
  'Rising temperatures',
  'Heat warning',
  'Critical zone',
  'Tipping point reached.'
];

// Bulb colour at each mistake count (0–4)
const BULB_COLORS = [
  'rgba(255,255,255,0.35)',
  '#3a7ca5',
  '#f2c14e',
  '#ea7832',
  '#d9554a'
];

// ── Puzzle 1 state ───────────────────────────────────────────────────────────
var p1 = {};

function resetP1State() {
  p1 = {
    selected:      [],
    solvedIds:     [],
    mistakes:      0,
    hintsUsed:     0,
    hintsShownIds: [],
    firstGroupId:  null,
    isHintShowing: false,
    gameOver:      false
  };
}

// ── Screen navigation ────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function (s) {
    s.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

// ── Shuffle ──────────────────────────────────────────────────────────────────
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

// ── Grid rendering ───────────────────────────────────────────────────────────
function renderGrid() {
  var grid = document.getElementById('puzzle-grid');
  grid.innerHTML = '';

  var words = shuffle(
    PUZZLE1_GROUPS
      .filter(function (g) { return !p1.solvedIds.includes(g.id); })
      .reduce(function (acc, g) { return acc.concat(g.words); }, [])
  );

  words.forEach(function (word) {
    var tile = document.createElement('div');
    tile.className = 'word-tile';
    tile.textContent = word;
    tile.dataset.word = word;
    tile.addEventListener('click', function () { onTileClick(tile, word); });
    grid.appendChild(tile);
  });
}

function onTileClick(tile, word) {
  if (p1.gameOver) return;
  var idx = p1.selected.indexOf(word);
  if (idx > -1) {
    p1.selected.splice(idx, 1);
    tile.classList.remove('selected');
  } else if (p1.selected.length < 4) {
    p1.selected.push(word);
    tile.classList.add('selected');
  }
  updateSubmitBtn();
}

function updateSubmitBtn() {
  document.getElementById('submit-btn').disabled = (p1.selected.length !== 4);
}

// ── Submission ───────────────────────────────────────────────────────────────
function onSubmit() {
  if (p1.selected.length !== 4 || p1.gameOver) return;

  var sel = p1.selected;
  var group = PUZZLE1_GROUPS.find(function (g) {
    return !p1.solvedIds.includes(g.id) &&
           sel.length === g.words.length &&
           sel.every(function (w) { return g.words.includes(w); });
  });

  if (group) {
    flashSelected('flash-correct', function () {
      p1.solvedIds.push(group.id);
      if (!p1.firstGroupId) p1.firstGroupId = group.id;
      p1.selected = [];
      addSolvedGroupCard(group);
      renderGrid();
      updateSubmitBtn();
      updateHintBtn();
      if (p1.solvedIds.length === PUZZLE1_GROUPS.length) endGame(true);
    });
  } else {
    flashSelected('flash-wrong', function () {
      p1.mistakes++;
      p1.selected = [];
      document.querySelectorAll('#puzzle-grid .word-tile').forEach(function (t) {
        t.classList.remove('selected');
      });
      updateSubmitBtn();
      updateGauge();
      if (p1.mistakes >= 4) endGame(false);
    });
  }
}

function flashSelected(cls, callback) {
  var tiles = Array.from(document.querySelectorAll('#puzzle-grid .word-tile.selected'));
  tiles.forEach(function (t) { t.classList.add(cls); });
  setTimeout(function () {
    tiles.forEach(function (t) { t.classList.remove(cls); });
    callback();
  }, 800);
}

// ── Solved group card (left panel) ───────────────────────────────────────────
function addSolvedGroupCard(group) {
  var panel = document.getElementById('solved-groups-panel');
  var div = document.createElement('div');
  div.className = 'solved-group';
  div.style.borderLeftColor = group.color;
  div.innerHTML =
    '<p class="solved-group-label" style="color:' + group.color + '">' + group.label + '</p>' +
    '<p class="solved-group-words">' + group.words.join(', ') + '</p>';
  panel.appendChild(div);
}

// ── Thermometer gauge ────────────────────────────────────────────────────────
function updateGauge() {
  var fillPercent = (p1.mistakes / 4) * 100;
  document.getElementById('thermo-fill').style.height = fillPercent + '%';
  document.getElementById('thermo-bulb').style.background = BULB_COLORS[p1.mistakes];
  document.getElementById('temp-label-text').textContent = TEMP_LABELS[p1.mistakes];
}

// ── Hint ─────────────────────────────────────────────────────────────────────
function updateHintBtn() {
  var unsolved  = PUZZLE1_GROUPS.filter(function (g) { return !p1.solvedIds.includes(g.id); });
  var available = unsolved.filter(function (g) { return !p1.hintsShownIds.includes(g.id); });
  document.getElementById('hint-btn').disabled =
    unsolved.length <= 1 || p1.isHintShowing || available.length === 0;
}

function onHint() {
  if (p1.isHintShowing || p1.gameOver) return;
  var unsolved  = PUZZLE1_GROUPS.filter(function (g) { return !p1.solvedIds.includes(g.id); });
  var available = unsolved.filter(function (g) { return !p1.hintsShownIds.includes(g.id); });
  if (available.length === 0 || unsolved.length <= 1) return;

  var group = available[0];
  p1.hintsShownIds.push(group.id);
  p1.hintsUsed++;
  p1.isHintShowing = true;
  updateHintBtn();

  var banner = document.getElementById('hint-banner');
  banner.textContent = 'Hint: "' + group.label + '"';
  banner.classList.remove('hidden');

  setTimeout(function () {
    banner.classList.add('hidden');
    p1.isHintShowing = false;
    updateHintBtn();
  }, 7000);
}

// ── Game end ─────────────────────────────────────────────────────────────────
function saveResults(won) {
  localStorage.setItem('theme1_firstGroup', p1.firstGroupId || '');
  localStorage.setItem('theme1_mistakes',   p1.mistakes);
  localStorage.setItem('theme1_hintsUsed',  p1.hintsUsed);
  localStorage.setItem('theme1_result',     won ? 'win' : 'loss');

  if (p1.firstGroupId) {
    var key  = 'archetype_' + p1.firstGroupId;
    var prev = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, prev + 1);
  }

  var completed = parseInt(localStorage.getItem('puzzlesCompleted') || '0', 10) + 1;
  localStorage.setItem('puzzlesCompleted', completed);
  return completed;
}

function revealAllGroups(onComplete) {
  var unsolved = PUZZLE1_GROUPS.filter(function (g) { return !p1.solvedIds.includes(g.id); });
  var delay = 0;

  unsolved.forEach(function (group) {
    setTimeout(function () {
      Array.from(document.querySelectorAll('#puzzle-grid .word-tile'))
        .filter(function (t) { return group.words.includes(t.dataset.word); })
        .forEach(function (t) {
          t.style.background  = group.color;
          t.style.color       = '#fff';
          t.style.borderColor = group.color;
        });
      addSolvedGroupCard(group);
    }, delay);
    delay += 700;
  });

  setTimeout(onComplete, delay + 900);
}

function showLossModal(onDismiss) {
  var modal = document.getElementById('loss-modal');
  modal.classList.remove('hidden');

  document.getElementById('loss-modal-ok').onclick = function () {
    modal.classList.add('hidden');
    onDismiss();
  };
}

function showKnowledgeNuggetBtn() {
  document.getElementById('knowledge-nugget-btn').classList.remove('hidden');
}

function endGame(won) {
  p1.gameOver = true;
  var completed = saveResults(won);
  prepareEndScreen1(won);

  if (won) {
    showKnowledgeNuggetBtn();
  } else {
    showLossModal(function () {
      revealAllGroups(function () {
        showKnowledgeNuggetBtn();
      });
    });
  }
}

// ── End screen setup ─────────────────────────────────────────────────────────
function prepareEndScreen1(won) {
  var teaser = document.getElementById('archetype-teaser');
  if (won && p1.firstGroupId) {
    teaser.classList.remove('hidden');
  } else {
    teaser.classList.add('hidden');
  }
  document.getElementById('archetype-modal').classList.add('hidden');
}

// ── Puzzle 1 initialise ──────────────────────────────────────────────────────
function initPuzzle1() {
  resetP1State();
  renderGrid();
  updateSubmitBtn();
  updateGauge();
  updateHintBtn();
  document.getElementById('solved-groups-panel').innerHTML = '';
  var banner = document.getElementById('hint-banner');
  banner.textContent = '';
  banner.classList.add('hidden');
  document.getElementById('loss-modal').classList.add('hidden');
  document.getElementById('htp-modal').classList.add('hidden');
  document.getElementById('knowledge-nugget-btn').classList.add('hidden');
}

// ── Event listeners ──────────────────────────────────────────────────────────
document.getElementById('play-btn-overlay').addEventListener('click', function () {
  showScreen('screen-mode');
});

document.querySelector('.mode-single').addEventListener('click', function () {
  showScreen('screen-topic');
});

document.querySelector('.topic-left').addEventListener('click', function () {
  localStorage.setItem('selectedTheme', '1');
  initPuzzle1();
  showScreen('screen-puzzle-1');
});

document.querySelector('.topic-right').addEventListener('click', function () {
  localStorage.setItem('selectedTheme', '2');
  showScreen('screen-puzzle-2');
});

document.getElementById('submit-btn').addEventListener('click', onSubmit);
document.getElementById('hint-btn').addEventListener('click', onHint);

document.querySelector('.how-to-play-link').addEventListener('click', function () {
  document.getElementById('htp-modal').classList.remove('hidden');
});
document.getElementById('htp-close').addEventListener('click', function () {
  document.getElementById('htp-modal').classList.add('hidden');
});
document.getElementById('htp-modal').addEventListener('click', function (e) {
  if (e.target === this) this.classList.add('hidden');
});

document.getElementById('knowledge-nugget-btn').addEventListener('click', function () {
  showScreen('screen-end-1');
});

document.getElementById('archetype-teaser').addEventListener('click', function () {
  var archetype = ARCHETYPES[p1.firstGroupId];
  if (!archetype) return;
  document.getElementById('archetype-img').src = archetype.image;
  document.getElementById('archetype-img').alt = archetype.name;
  document.getElementById('archetype-name').textContent = archetype.name;
  document.getElementById('archetype-desc').textContent = archetype.text;
  document.getElementById('archetype-modal').classList.remove('hidden');
});

document.getElementById('archetype-popup-close').addEventListener('click', function () {
  document.getElementById('archetype-modal').classList.add('hidden');
});

document.getElementById('archetype-modal').addEventListener('click', function (e) {
  if (e.target === this) this.classList.add('hidden');
});
