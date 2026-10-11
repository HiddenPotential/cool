// Canvas particle effects used by the hatch animation.
const FX = (() => {
  const canvas = document.createElement('canvas');
  canvas.id = 'fx';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const MAX = 1800;
  let parts = [];
  let rings = [];
  let bolts = [];
  let emitters = [];
  let running = false;
  let last = 0;

  const rand = (a, b) => a + Math.random() * (b - a);
  // A color can be a string or 'rainbow'
  const pick = (c) => (c === 'rainbow' ? `hsl(${Math.floor(rand(0, 360))},100%,65%)` : c);

  function add(p) {
    if (parts.length >= MAX) parts.shift();
    parts.push({ age: 0, drag: 0.98, gravity: 0, size: 2, alpha: 1, kind: 'spark', ...p });
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    emitters.forEach((e) => e.tick(dt));

    // Particles
    parts = parts.filter((p) => {
      p.age += dt;
      if (p.age >= p.life) return false;
      const k = 1 - p.age / p.life;

      if (p.kind === 'orb') {
        // spiral inward toward a target
        p.angle += p.spin * dt;
        p.radius *= Math.pow(0.08, dt / p.life);
        p.x = p.tx + Math.cos(p.angle) * p.radius;
        p.y = p.ty + Math.sin(p.angle) * p.radius;
      } else {
        p.vx *= Math.pow(p.drag, dt * 60);
        p.vy = p.vy * Math.pow(p.drag, dt * 60) + p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }

      if (p.kind === 'confetti') {
        p.rot += p.vr * dt;
        p.x += Math.sin(p.age * 4 + p.phase) * 30 * dt;
        ctx.globalCompositeOperation = 'source-over';
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.age * 8 + p.phase));
        ctx.globalAlpha = Math.min(1, k * 3);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
        ctx.restore();
        ctx.globalCompositeOperation = 'lighter';
        return true;
      }

      let a = p.alpha * k;
      let size = p.size;
      if (p.kind === 'glitter') {
        a *= 0.5 + 0.5 * Math.sin(p.age * p.twinkle + p.phase);
        size *= 0.6 + 0.4 * k;
      }
      ctx.globalAlpha = Math.max(0, a);

      if (p.trail) {
        // streak from where it was a moment ago
        ctx.strokeStyle = p.color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * p.trail, p.y - p.vy * p.trail);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
        g.addColorStop(0, '#fff');
        g.addColorStop(0.25, p.color);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    });

    // Shockwave rings
    rings = rings.filter((r) => {
      r.age += dt;
      if (r.age >= r.life) return false;
      const t = r.age / r.life;
      const ease = 1 - Math.pow(1 - t, 3);
      ctx.globalAlpha = (1 - t) * 0.9;
      ctx.strokeStyle = pick(r.color);
      ctx.lineWidth = r.width * (1 - t) + 1;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r0 + (r.maxR - r.r0) * ease, 0, Math.PI * 2);
      ctx.stroke();
      return true;
    });

    // Lightning
    bolts = bolts.filter((b) => {
      b.age += dt;
      if (b.age >= b.life) return false;
      ctx.globalAlpha = (1 - b.age / b.life) * (Math.random() < 0.3 ? 0.4 : 1);
      ctx.strokeStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 18;
      [3, 1].forEach((w, i) => {
        ctx.lineWidth = w;
        ctx.strokeStyle = i ? '#fff' : b.color;
        ctx.beginPath();
        b.points.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
      });
      ctx.shadowBlur = 0;
      return true;
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    if (parts.length || rings.length || bolts.length || emitters.length) {
      requestAnimationFrame(frame);
    } else {
      running = false;
      ctx.clearRect(0, 0, W, H);
    }
  }

  // ---------- Public effects ----------
  function burst(x, y, { color = '#fff', count = 60, speed = 420, gravity = 260, trail = 0.05, size = 2.5, life = 1.4 } = {}) {
    for (let i = 0; i < count; i++) {
      const ang = rand(0, Math.PI * 2);
      const v = speed * (0.3 + 0.7 * Math.sqrt(Math.random()));
      add({
        x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v,
        color: pick(color), gravity, trail, size: rand(size * 0.5, size * 1.3),
        life: rand(life * 0.5, life), drag: 0.96,
      });
    }
    start();
  }

  function glitter(x, y, { color = '#fff', count = 30, spread = 200, life = 2 } = {}) {
    for (let i = 0; i < count; i++) {
      const ang = rand(0, Math.PI * 2);
      const v = rand(20, spread);
      add({
        kind: 'glitter', x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v - 40,
        gravity: 40, drag: 0.94, color: pick(color), size: rand(1.5, 3.5),
        life: rand(life * 0.6, life), twinkle: rand(10, 25), phase: rand(0, 6),
      });
    }
    start();
  }

  function confetti(count = 120) {
    const colors = ['#ff4f8b', '#ffb52e', '#7dff6a', '#4aa8ff', '#c063ff', '#ffffff'];
    for (let i = 0; i < count; i++) {
      add({
        kind: 'confetti', x: rand(0, W), y: rand(-H * 0.5, -10),
        vx: rand(-30, 30), vy: rand(80, 220), gravity: 30, drag: 0.995,
        color: colors[i % colors.length], size: rand(4, 8), life: rand(3, 5),
        rot: rand(0, 6), vr: rand(-6, 6), phase: rand(0, 6),
      });
    }
    start();
  }

  function ring(x, y, { color = '#fff', maxR = 260, width = 10, life = 0.7, r0 = 10 } = {}) {
    rings.push({ x, y, color, maxR, width, life, r0, age: 0 });
    start();
  }

  function firework(x, y, color) {
    burst(x, y, { color, count: 70, speed: 260, gravity: 120, trail: 0.06, size: 2, life: 1.3 });
    glitter(x, y, { color, count: 20, spread: 120, life: 1.6 });
  }

  function lightning(x1, y1, x2, y2, color = '#cfe3ff') {
    const points = [[x1, y1]];
    const segs = 9;
    for (let i = 1; i < segs; i++) {
      const t = i / segs;
      const off = (1 - Math.abs(t - 0.5) * 2) * 40;
      points.push([x1 + (x2 - x1) * t + rand(-off, off), y1 + (y2 - y1) * t + rand(-off, off)]);
    }
    points.push([x2, y2]);
    bolts.push({ points, color, age: 0, life: 0.35 });
    start();
  }

  // A shooting star from (x1,y1) to (x2,y2); resolves when it lands
  function meteor(x1, y1, x2, y2, color, dur = 0.8) {
    return new Promise((resolve) => {
      let t = 0;
      const em = emitter((dt) => {
        t += dt / dur;
        const e = Math.min(1, t * t);
        const x = x1 + (x2 - x1) * e;
        const y = y1 + (y2 - y1) * e;
        add({ x, y, vx: 0, vy: 0, color: '#fff', size: 7, life: 0.08 });
        for (let i = 0; i < 4; i++) {
          add({ x: x + rand(-4, 4), y: y + rand(-4, 4), vx: rand(-40, 40), vy: rand(-40, 40),
            color: pick(color), size: rand(2, 4.5), life: rand(0.3, 0.7), drag: 0.9 });
        }
        if (t >= 1) { em.stop(); resolve(); }
      });
    });
  }

  // Calls fn(dt) every frame until stopped
  function emitter(fn) {
    const e = { tick: fn, stop: () => { emitters = emitters.filter((x) => x !== e); } };
    emitters.push(e);
    start();
    return e;
  }

  // Energy orbs that spiral into (x, y)
  function orb(x, y, color) {
    const angle = rand(0, Math.PI * 2);
    add({
      kind: 'orb', tx: x, ty: y, angle, radius: rand(140, 260), spin: rand(2, 4) * (Math.random() < 0.5 ? -1 : 1),
      x, y, vx: 0, vy: 0, color: pick(color), size: rand(1.5, 3.2), life: rand(0.6, 1), alpha: 0.9,
    });
    start();
  }

  function clear() {
    parts = []; rings = []; bolts = []; emitters = [];
  }

  // Move the canvas into a container (e.g. the hatch stage) so its layers can sit above it
  function mount(parent = document.body, before = null) {
    parent.insertBefore(canvas, before);
  }

  return { mount, burst, glitter, confetti, ring, firework, lightning, meteor, emitter, orb, clear, rand, size: () => ({ W, H }) };
})();
