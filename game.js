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
  sound: true,
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

// ---------- Sound (tiny WebAudio synth) ----------
let audio;
function tone(freq, { dur = 0.15, type = 'sine', vol = 0.15, delay = 0, slide = 0 } = {}) {
  if (!state.sound) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const t = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(audio.destination);
    osc.start(t);
    osc.stop(t + dur);
  } catch (e) { /* audio unavailable */ }
}
const sfx = {
  charge: (step) => tone(260 * Math.pow(1.26, step), { dur: 0.25, type: 'triangle', slide: 1.2 }),
  crack: () => tone(900, { dur: 0.08, type: 'square', vol: 0.06 }),
  pop: () => tone(180, { dur: 0.35, type: 'sawtooth', vol: 0.12, slide: 0.3 }),
  reveal: (tier) => [0, 4, 7, 12, 16].slice(0, 2 + tier).forEach((semi, i) =>
    tone(523 * Math.pow(2, semi / 12), { dur: 0.5, type: 'triangle', vol: 0.12, delay: i * 0.09 })),
  flip: (tier) => tone(600 + tier * 180, { dur: 0.1, type: 'sine', vol: 0.08 }),
};

// ---------- Pull animation ----------
const stage = $('#stage');
let skipping = false;
let wakeUp = null;

function wait(ms) {
  if (skipping) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => { clearTimeout(timer); wakeUp = null; resolve(); };
    const timer = setTimeout(done, ms);
    wakeUp = done;
  });
}

function waitTap(autoMs) {
  return new Promise((resolve) => {
    let timer;
    const done = () => { clearTimeout(timer); stage.onclick = null; resolve(); };
    // brief delay so the tap that skipped the intro doesn't also dismiss the reveal
    setTimeout(() => { stage.onclick = done; }, 250);
    if (autoMs) timer = setTimeout(done, autoMs);
  });
}

function burst(tier) {
  const box = stage.querySelector('.particles');
  box.innerHTML = '';
  const count = 18 + tier * 16;
  const symbols = ['✨', '⭐', '💫', '🌟'];
  const confetti = ['#ff4f8b', '#ffb52e', '#7dff6a', '#4aa8ff', '#c063ff'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    const angle = Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * (160 + tier * 70);
    const isStar = tier >= 2 && Math.random() < 0.45;
    p.className = isStar ? 'particle' : 'particle dot';
    if (isStar) p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    if (!isStar && tier === 4) p.style.setProperty('--c', confetti[i % confetti.length]);
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    p.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    p.style.setProperty('--size', isStar ? `${16 + Math.random() * 18}px` : `${5 + Math.random() * 7}px`);
    p.style.setProperty('--dur', `${0.7 + Math.random() * 0.7}s`);
    box.appendChild(p);
  }
}

function resetStage() {
  stage.className = 'stage-overlay';
  stage.dataset.glow = 'common';
  stage.style.setProperty('--amp', 3);
  stage.querySelector('.particles').innerHTML = '';
  stage.querySelector('.stage-pet').innerHTML = '';
  stage.querySelector('.flash').classList.remove('go');
  stage.querySelector('.stage-hint').textContent = 'Tap to skip';
}

async function playStage(best, count) {
  const tier = RARITY_ORDER.indexOf(best.pet.rarity);
  skipping = false;
  resetStage();
  stage.onclick = () => { skipping = true; if (wakeUp) wakeUp(); };

  // 1. Charge up: the glow climbs one rarity at a time until it reaches the best pull
  stage.classList.add('charging');
  for (let step = 0; step <= Math.max(tier, 1); step++) {
    const shown = Math.min(step, tier);
    stage.dataset.glow = RARITY_ORDER[shown];
    stage.style.setProperty('--amp', 3 + step * 3);
    stage.classList.toggle('rays-on', shown >= 2);
    if (!skipping) {
      sfx.charge(step);
      // little hop each time the egg "upgrades"
      stage.classList.remove('hop'); void stage.offsetWidth;
      if (step > 0 && shown === step) stage.classList.add('hop');
    }
    await wait(step === 0 ? 650 : 520);
    stage.classList.remove('hop');
  }

  // 2. Crack (with a dramatic hold + quake for Legendary/Mythic)
  stage.classList.add('cracking');
  if (!skipping) sfx.crack();
  if (tier >= 3) {
    stage.classList.add('quake');
    await wait(tier === 4 ? 1100 : 700);
  } else {
    await wait(450);
  }

  // 3. Burst open
  stage.classList.remove('charging', 'quake');
  stage.classList.add('open');
  const flash = stage.querySelector('.flash');
  flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
  burst(tier);
  sfx.pop();
  sfx.reveal(tier);

  // 4. Show the best pet
  const { pet } = best;
  stage.querySelector('.stage-pet').innerHTML = `
    <div class="big ${tier >= 3 ? 'float' : ''}">${pet.emoji}</div>
    <div class="label">${RARITIES[pet.rarity].label.toUpperCase()}${tier >= 3 ? '!' : ''}</div>
    <div class="pname">${pet.name}</div>
    <div class="sub">${count > 1 ? `Best of ${count} · ` : ''}Lv ${best.level}</div>
    ${best.isNew ? '<div class="new">NEW!</div>' : ''}
  `;
  stage.querySelector('.stage-hint').textContent = count > 1 ? 'Tap to see all pets' : 'Tap to continue';
  await waitTap(tier <= 1 ? 1800 : null);

  stage.classList.add('closing');
  await new Promise((r) => setTimeout(r, 250));
  stage.classList.add('hidden');
}

function dealCards(results, fast) {
  const box = $('#results');
  box.innerHTML = '';
  const cards = results.map((r, i) => {
    const extra = r.isNew ? 'NEW' : r.levelUp ? 'LV UP' : r.refund ? `+${r.refund}🪙` : '';
    const wrap = document.createElement('div');
    wrap.className = 'flip deal';
    wrap.style.animationDelay = `${i * 0.04}s`;
    const inner = document.createElement('div');
    inner.className = 'flip-inner';
    const back = document.createElement('div');
    back.className = `card-back ${r.pet.rarity}`;
    back.textContent = '🥚';
    inner.append(back, petCard(r.pet, { level: r.level, extra }));
    wrap.appendChild(inner);
    box.appendChild(wrap);
    return wrap;
  });

  // Flip one by one; save the rarest for last so the row ends on a high note
  const order = cards.map((c, i) => i)
    .sort((a, b) => RARITY_ORDER.indexOf(results[a].pet.rarity) - RARITY_ORDER.indexOf(results[b].pet.rarity));
  const step = fast ? 60 : 170;
  order.forEach((idx, n) => {
    setTimeout(() => {
      cards[idx].classList.add('flipped');
      sfx.flip(RARITY_ORDER.indexOf(results[idx].pet.rarity));
    }, 400 + n * step);
  });
  return 400 + order.length * step;
}

async function playHatch(results) {
  hatching = true;
  updateHud();
  $('#results').innerHTML = '';

  const best = results.reduce((a, b) =>
    RARITY_ORDER.indexOf(b.pet.rarity) > RARITY_ORDER.indexOf(a.pet.rarity) ? b : a);
  await playStage(best, results.length);

  const dealTime = results.length > 1 ? dealCards(results, skipping) : (dealCards(results, true), 0);
  setTimeout(() => {
    hatching = false;
    renderAll();
  }, dealTime);
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

$('#sound').onclick = () => {
  state.sound = !state.sound;
  $('#sound').textContent = state.sound ? '🔊' : '🔇';
  save();
};
$('#sound').textContent = state.sound ? '🔊' : '🔇';

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
