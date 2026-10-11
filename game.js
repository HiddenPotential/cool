// ---------- Data ----------
const RARITIES = {
  common:    { label: 'Common',    weight: 60, income: 0.2 },
  rare:      { label: 'Rare',      weight: 26, income: 1 },
  epic:      { label: 'Epic',      weight: 10, income: 4 },
  legendary: { label: 'Legendary', weight: 3.5, income: 15 },
  mythic:    { label: 'Mythic',    weight: 0.5, income: 60 },
};
const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic'];

const PETS = [
  // common
  { id: 'mouse',    name: 'Mouse',     emoji: '🐭', rarity: 'common' },
  { id: 'hamster',  name: 'Hamster',   emoji: '🐹', rarity: 'common' },
  { id: 'chick',    name: 'Chick',     emoji: '🐤', rarity: 'common' },
  { id: 'frog',     name: 'Frog',      emoji: '🐸', rarity: 'common' },
  { id: 'snail',    name: 'Snail',     emoji: '🐌', rarity: 'common' },
  { id: 'pig',      name: 'Piglet',    emoji: '🐷', rarity: 'common' },
  { id: 'bunny',    name: 'Bunny',     emoji: '🐰', rarity: 'common' },
  { id: 'turtle',   name: 'Turtle',    emoji: '🐢', rarity: 'common' },
  // rare
  { id: 'cat',      name: 'Cat',       emoji: '🐱', rarity: 'rare' },
  { id: 'dog',      name: 'Puppy',     emoji: '🐶', rarity: 'rare' },
  { id: 'fox',      name: 'Fox',       emoji: '🦊', rarity: 'rare' },
  { id: 'penguin',  name: 'Penguin',   emoji: '🐧', rarity: 'rare' },
  { id: 'koala',    name: 'Koala',     emoji: '🐨', rarity: 'rare' },
  { id: 'owl',      name: 'Owl',       emoji: '🦉', rarity: 'rare' },
  // epic
  { id: 'panda',    name: 'Panda',     emoji: '🐼', rarity: 'epic' },
  { id: 'tiger',    name: 'Tiger',     emoji: '🐯', rarity: 'epic' },
  { id: 'octopus',  name: 'Octopus',   emoji: '🐙', rarity: 'epic' },
  { id: 'peacock',  name: 'Peacock',   emoji: '🦚', rarity: 'epic' },
  { id: 'shark',    name: 'Shark',     emoji: '🦈', rarity: 'epic' },
  // legendary
  { id: 'lion',     name: 'Lion King', emoji: '🦁', rarity: 'legendary' },
  { id: 'unicorn',  name: 'Unicorn',   emoji: '🦄', rarity: 'legendary' },
  { id: 'phoenix',  name: 'Phoenix',   emoji: '🐦‍🔥', rarity: 'legendary' },
  // mythic
  { id: 'dragon',   name: 'Dragon',    emoji: '🐉', rarity: 'mythic' },
  { id: 'trex',     name: 'Ancient Rex', emoji: '🦖', rarity: 'mythic' },
];

const COST_1 = 100;
const COST_10 = 900;
const PITY_LIMIT = 50;
const MAX_LEVEL = 10;
const DAILY_GIFT = 500;
const OFFLINE_CAP_SEC = 2 * 60 * 60;
const SAVE_KEY = 'petGachaSave_v1';

// ---------- State ----------
const defaultState = () => ({
  coins: 1000,
  owned: {},        // petId -> { level, copies }
  pity: 0,          // hatches since last legendary/mythic
  totalHatches: 0,
  lastDaily: null,  // 'YYYY-MM-DD'
  lastSeen: Date.now(),
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch (e) { /* ignore broken save */ }
  return defaultState();
}

function save() {
  state.lastSeen = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
}

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const petById = Object.fromEntries(PETS.map((p) => [p.id, p]));
const fmt = (n) => n >= 1e6 ? (n / 1e6).toFixed(2) + 'M'
  : n >= 1e4 ? (n / 1e3).toFixed(1) + 'K'
  : Math.floor(n).toLocaleString();
const today = () => new Date().toISOString().slice(0, 10);

function petIncome(petId) {
  const own = state.owned[petId];
  if (!own) return 0;
  return RARITIES[petById[petId].rarity].income * (1 + 0.5 * (own.level - 1));
}

function coinsPerSecond() {
  return Object.keys(state.owned).reduce((sum, id) => sum + petIncome(id), 0);
}

function tapValue() {
  return 1 + Math.floor(coinsPerSecond() * 0.2);
}

// ---------- Gacha ----------
function rollRarity(minRarity = 'common') {
  const minIdx = RARITY_ORDER.indexOf(minRarity);
  const pool = RARITY_ORDER.slice(minIdx);
  const total = pool.reduce((s, r) => s + RARITIES[r].weight, 0);
  let roll = Math.random() * total;
  for (const r of pool) {
    roll -= RARITIES[r].weight;
    if (roll < 0) return r;
  }
  return pool[pool.length - 1];
}

function rollPet(minRarity) {
  let rarity;
  if (state.pity + 1 >= PITY_LIMIT) rarity = rollRarity('legendary');
  else rarity = rollRarity(minRarity);

  if (RARITY_ORDER.indexOf(rarity) >= RARITY_ORDER.indexOf('legendary')) state.pity = 0;
  else state.pity++;
  state.totalHatches++;

  const choices = PETS.filter((p) => p.rarity === rarity);
  return choices[Math.floor(Math.random() * choices.length)];
}

function addPet(pet) {
  const own = state.owned[pet.id];
  if (!own) {
    state.owned[pet.id] = { level: 1, copies: 1 };
    return { pet, isNew: true, levelUp: false, level: 1 };
  }
  own.copies++;
  if (own.level < MAX_LEVEL) {
    own.level++;
    return { pet, isNew: false, levelUp: true, level: own.level };
  }
  // Max level duplicates refund some coins
  const refund = Math.round(COST_1 * 0.5 * (RARITY_ORDER.indexOf(pet.rarity) + 1));
  state.coins += refund;
  return { pet, isNew: false, levelUp: false, refund, level: own.level };
}

function hatch(count) {
  const cost = count === 10 ? COST_10 : COST_1 * count;
  if (state.coins < cost || hatching) return;
  state.coins -= cost;

  const pets = [];
  for (let i = 0; i < count; i++) pets.push(rollPet());
  // 10x guarantee: at least one Rare+
  if (count === 10 && pets.every((p) => p.rarity === 'common')) {
    const choices = PETS.filter((p) => p.rarity === 'rare');
    pets[pets.length - 1] = choices[Math.floor(Math.random() * choices.length)];
  }

  const results = pets.map(addPet);
  save();
  playHatch(results);
}

// ---------- Rendering ----------
let hatching = false;

function petCard(pet, { level, extra, locked } = {}) {
  const div = document.createElement('div');
  div.className = `pet ${pet.rarity}${locked ? ' locked' : ''}`;
  div.innerHTML = `
    <div class="emoji">${pet.emoji}</div>
    <div class="name">${locked ? '???' : pet.name}</div>
    <div class="rarity">${RARITIES[pet.rarity].label}</div>
    ${level ? `<div class="lvl">Lv ${level}${level >= MAX_LEVEL ? ' (MAX)' : ''}</div>` : ''}
    ${extra ? `<div class="tag">${extra}</div>` : ''}
  `;
  return div;
}

function playHatch(results) {
  hatching = true;
  updateHud();
  const egg = $('#egg');
  egg.classList.add('shake');
  $('#results').innerHTML = '';

  setTimeout(() => {
    egg.classList.remove('shake');
    const box = $('#results');
    results.forEach((r, i) => {
      const extra = r.isNew ? 'NEW' : r.levelUp ? 'LV UP' : r.refund ? `+${r.refund}🪙` : '';
      const card = petCard(r.pet, { level: r.level, extra });
      card.classList.add('reveal');
      card.style.animationDelay = `${i * 0.08}s`;
      box.appendChild(card);
    });

    // Big reveal for the best rare pull
    const best = results.reduce((a, b) =>
      RARITY_ORDER.indexOf(b.pet.rarity) > RARITY_ORDER.indexOf(a.pet.rarity) ? b : a);
    if (RARITY_ORDER.indexOf(best.pet.rarity) >= RARITY_ORDER.indexOf('legendary')) {
      setTimeout(() => showModal(best), results.length * 80 + 200);
    }

    hatching = false;
    renderAll();
  }, 700);
}

function showModal(result) {
  const { pet } = result;
  const card = $('.modal-card');
  card.className = `modal-card ${pet.rarity}`;
  $('#modal-body').innerHTML = `
    <div class="big">${pet.emoji}</div>
    <h2>${pet.name}</h2>
    <div class="rarity" style="color:var(--rc);font-weight:700">${RARITIES[pet.rarity].label.toUpperCase()}</div>
    <p>${result.isNew ? 'A new friend joins your collection!' : `Now level ${result.level}!`}</p>
  `;
  $('#modal').classList.remove('hidden');
}

let filter = 'all';

function renderDex() {
  const dex = $('#dex');
  dex.innerHTML = '';
  PETS.filter((p) => filter === 'all' || p.rarity === filter).forEach((pet) => {
    const own = state.owned[pet.id];
    dex.appendChild(petCard(pet, own ? { level: own.level } : { locked: true }));
  });
  $('#dex-count').textContent = `${Object.keys(state.owned).length}/${PETS.length}`;
}

function renderFilters() {
  const box = $('#filters');
  box.innerHTML = '';
  ['all', ...RARITY_ORDER].forEach((r) => {
    const b = document.createElement('button');
    b.textContent = r === 'all' ? 'All' : RARITIES[r].label;
    b.classList.toggle('active', filter === r);
    b.onclick = () => { filter = r; renderFilters(); renderDex(); };
    box.appendChild(b);
  });
}

function renderRates() {
  const total = RARITY_ORDER.reduce((s, r) => s + RARITIES[r].weight, 0);
  $('#rates-table').innerHTML = `
    <tr><th>Rarity</th><th>Chance</th><th>Pets</th><th>Income / pet</th></tr>
    ${RARITY_ORDER.map((r) => `
      <tr class="${r}">
        <td>${RARITIES[r].label}</td>
        <td>${(RARITIES[r].weight / total * 100).toFixed(1)}%</td>
        <td>${PETS.filter((p) => p.rarity === r).map((p) => p.emoji).join(' ')}</td>
        <td>${RARITIES[r].income}/s</td>
      </tr>`).join('')}
  `;
}

function updateHud() {
  $('#coins').textContent = fmt(state.coins);
  $('#cps').textContent = coinsPerSecond().toFixed(1);
  $('#pity').textContent = PITY_LIMIT - state.pity;
  $('#pull1').disabled = hatching || state.coins < COST_1;
  $('#pull10').disabled = hatching || state.coins < COST_10;
  const claimed = state.lastDaily === today();
  $('#daily').disabled = claimed;
  $('#daily').textContent = claimed ? '🎁 Come back tomorrow' : `🎁 Claim daily gift (+${DAILY_GIFT})`;
}

function renderAll() {
  updateHud();
  renderDex();
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

function floatCoin(x, y, amount) {
  const el = document.createElement('div');
  el.className = 'float-coin';
  el.textContent = `+${amount}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

// ---------- Events ----------
document.querySelectorAll('.tab').forEach((tab) => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
    document.querySelectorAll('.panel').forEach((p) =>
      p.classList.toggle('active', p.id === `tab-${tab.dataset.tab}`));
  };
});

$('#egg').addEventListener('click', (e) => {
  if (hatching) return;
  const v = tapValue();
  state.coins += v;
  floatCoin(e.clientX || window.innerWidth / 2, e.clientY || 150, v);
  updateHud();
});

$('#pull1').onclick = () => hatch(1);
$('#pull10').onclick = () => hatch(10);

$('#daily').onclick = () => {
  if (state.lastDaily === today()) return;
  state.lastDaily = today();
  state.coins += DAILY_GIFT;
  save();
  updateHud();
  toast(`🎁 You got ${DAILY_GIFT} coins!`);
};

$('#modal-close').onclick = () => $('#modal').classList.add('hidden');

$('#reset').onclick = () => {
  if (!confirm('Erase all pets and coins and start over?')) return;
  state = defaultState();
  save();
  $('#results').innerHTML = '';
  renderAll();
  toast('Save reset.');
};

// ---------- Game loop ----------
let last = performance.now();
function tick(now) {
  const dt = (now - last) / 1000;
  last = now;
  state.coins += coinsPerSecond() * dt;
  updateHud();
  requestAnimationFrame(tick);
}

setInterval(save, 5000);
window.addEventListener('beforeunload', save);

// Offline earnings
(function offline() {
  const secs = Math.min((Date.now() - state.lastSeen) / 1000, OFFLINE_CAP_SEC);
  const earned = Math.floor(coinsPerSecond() * secs);
  if (earned > 0) {
    state.coins += earned;
    setTimeout(() => toast(`🐾 Your pets earned ${fmt(earned)} coins while you were away!`), 300);
  }
})();

renderFilters();
renderRates();
renderAll();
requestAnimationFrame(tick);
