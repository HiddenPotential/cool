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
  whoosh: () => tone(1400, { dur: 0.7, type: 'sawtooth', vol: 0.05, slide: 0.12 }),
  thud: () => tone(140, { dur: 0.4, type: 'sine', vol: 0.25, slide: 0.4 }),
  zap: () => tone(1800 + Math.random() * 800, { dur: 0.05, type: 'square', vol: 0.03 }),
  glitch: () => [0, 1, 2, 3, 4, 5].forEach((i) =>
    tone(200 + Math.random() * 1500, { dur: 0.07, type: 'square', vol: 0.05, delay: i * 0.1 })),
  boom: () => tone(110, { dur: 0.5, type: 'triangle', vol: 0.15, slide: 0.35 }),
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

const FX_COLORS = { common: '#ffffff', rare: '#4aa8ff', epic: '#c063ff', legendary: '#ffb52e', mythic: 'rainbow' };
const rainbowColor = () => `hsl(${Math.floor(Math.random() * 360)},100%,70%)`;

function eggCenter() {
  const r = stage.querySelector('.stage-egg').getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function resetStage() {
  stage.className = 'stage-overlay';
  stage.dataset.glow = 'common';
  stage.style.setProperty('--amp', 3);
  stage.querySelector('.stage-pet').innerHTML = '';
  stage.querySelector('.flash').classList.remove('go');
  stage.querySelector('.stage-hint').textContent = 'Tap to skip';
}

async function playStage(best, count) {
  const tier = RARITY_ORDER.indexOf(best.pet.rarity);
  // A Mythic pretends to be a Legendary until the very end
  const tease = tier === 4 ? 3 : tier;
  const effects = [];
  const stopEffects = () => { effects.forEach((e) => e.stop()); effects.length = 0; };

  skipping = false;
  FX.clear();
  FX.mount(stage, stage.querySelector('.stage-pet'));
  resetStage();
  stage.onclick = () => { skipping = true; if (wakeUp) wakeUp(); };

  // 1. A shooting star crashes in and drops the egg
  stage.classList.add('pre');
  await new Promise((r) => setTimeout(r, 30));
  const c = eggCenter();
  const starColor = FX_COLORS[RARITY_ORDER[Math.min(tease, 2)]];
  if (!skipping) {
    sfx.whoosh();
    await Promise.race([FX.meteor(FX.size().W + 60, -80, c.x, c.y, starColor, 0.75), wait(900)]);
    FX.ring(c.x, c.y, { color: starColor, maxR: 200, width: 8 });
    FX.burst(c.x, c.y, { color: starColor, count: 45, speed: 320, gravity: 400 });
    sfx.thud();
  }
  stage.classList.remove('pre');
  stage.classList.add('landed');
  await wait(450);
  stage.classList.remove('landed');

  // 2. Charge up: energy spirals in, and the glow climbs one rarity at a time
  let orbRate = 0;
  let orbColor = '#ffffff';
  let acc = 0;
  effects.push(FX.emitter((dt) => {
    acc += dt * orbRate;
    while (acc > 1) { acc--; FX.orb(c.x, c.y, orbColor); }
  }));

  stage.classList.add('charging');
  for (let step = 0; step <= Math.max(tease, 1); step++) {
    const shown = Math.min(step, tease);
    stage.dataset.glow = RARITY_ORDER[shown];
    stage.style.setProperty('--amp', 3 + step * 3);
    stage.classList.toggle('rays-on', shown >= 2);
    orbColor = FX_COLORS[RARITY_ORDER[shown]];
    orbRate = 25 + step * 35;
    if (!skipping) {
      sfx.charge(step);
      stage.classList.remove('hop'); void stage.offsetWidth;
      if (step > 0 && shown === step) {
        stage.classList.add('hop');
        FX.ring(c.x, c.y, { color: orbColor, maxR: 230, width: 6, life: 0.6 });
        FX.glitter(c.x, c.y, { color: orbColor, count: 12 + step * 6, spread: 160 });
      }
    }
    await wait(step === 0 ? 650 : 560);
    stage.classList.remove('hop');
  }

  // 3. Crack, with lightning and a quake for Legendary/Mythic
  stage.classList.add('cracking');
  if (!skipping) sfx.crack();
  if (tease >= 3) {
    stage.classList.add('quake');
    let boltColor = () => (Math.random() < 0.5 ? '#ffe08a' : '#fff6d8');
    let next = 0;
    effects.push(FX.emitter((dt) => {
      next -= dt;
      if (next > 0) return;
      next = FX.rand(0.06, 0.18);
      const a = FX.rand(0, Math.PI * 2);
      const r = FX.rand(160, 340);
      FX.lightning(c.x, c.y, c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, boltColor());
      if (Math.random() < 0.4) sfx.zap();
    }));
    await wait(900);

    // 3b. Mythic fake-out: the gold egg glitches... and turns rainbow
    if (tier === 4) {
      orbRate = 0;
      stage.classList.add('glitch');
      if (!skipping) sfx.glitch();
      await wait(750);
      stage.classList.remove('glitch');
      stage.dataset.glow = 'mythic';
      boltColor = rainbowColor;
      orbColor = 'rainbow';
      orbRate = 160;
      FX.ring(c.x, c.y, { color: 'rainbow', maxR: 420, width: 16, life: 0.9 });
      if (!skipping) { sfx.charge(5); sfx.charge(6); }
      await wait(900);
    }
  } else {
    await wait(450);
  }
  stopEffects();

  // 4. Burst open
  stage.classList.remove('charging', 'quake');
  stage.classList.add('open');
  const flash = stage.querySelector('.flash');
  flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
  const col = FX_COLORS[best.pet.rarity];
  FX.burst(c.x, c.y, { color: col, count: 80 + tier * 70, speed: 380 + tier * 110, size: 2.5 + tier * 0.4 });
  FX.glitter(c.x, c.y, { color: col, count: 30 + tier * 25, spread: 260 + tier * 60, life: 2.5 });
  FX.ring(c.x, c.y, { color: col, maxR: 320 + tier * 90, width: 14 });
  if (tier >= 2) setTimeout(() => FX.ring(c.x, c.y, { color: col, maxR: 260 + tier * 70, width: 8, life: 0.9 }), 160);
  if (tier >= 3) FX.confetti(tier === 4 ? 240 : 130);
  sfx.pop();
  sfx.reveal(tier);

  // Keep the party going behind the reveal
  if (tier >= 3) {
    let next = 0.5;
    effects.push(FX.emitter((dt) => {
      next -= dt;
      if (next > 0) return;
      next = FX.rand(0.35, 0.7);
      const { W, H } = FX.size();
      FX.firework(FX.rand(W * 0.12, W * 0.88), FX.rand(H * 0.08, H * 0.45), col);
      sfx.boom();
    }));
  } else if (tier === 2) {
    let next = 0.3;
    effects.push(FX.emitter((dt) => {
      next -= dt;
      if (next > 0) return;
      next = 0.35;
      FX.glitter(c.x + FX.rand(-80, 80), c.y + FX.rand(-60, 60), { color: col, count: 6, spread: 90 });
    }));
  }

  // 5. Show the best pet
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

  stopEffects();
  stage.classList.add('closing');
  await new Promise((r) => setTimeout(r, 250));
  stage.classList.add('hidden');
  FX.clear();
  FX.mount(document.body);
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
      const card = cards[idx];
      const tier = RARITY_ORDER.indexOf(results[idx].pet.rarity);
      card.classList.add('flipped');
      sfx.flip(tier);
      if (tier >= 1) {
        const r = card.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        const col = FX_COLORS[results[idx].pet.rarity];
        FX.burst(x, y, { color: col, count: 10 + tier * 14, speed: 120 + tier * 70, gravity: 300, size: 2 });
        if (tier >= 2) FX.glitter(x, y, { color: col, count: 8 + tier * 6, spread: 100 });
        if (tier >= 3) FX.ring(x, y, { color: col, maxR: 120, width: 6 });
      }
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
