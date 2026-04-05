/* =============================================
   QUANTUM PORTFOLIO — Garrv Sipani
   JS: Particle canvas, cursor, counters, reveals
   ============================================= */

// ─── CUSTOM CURSOR ───────────────────────────
(function () {
  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursor-trail');
  if (!cursor || !trail) return;

  let mx = -100, my = -100, tx = -100, ty = -100;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function animTrail() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animTrail);
  })();
})();

// ─── PARTICLE CANVAS (quantum field) ─────────
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, frame = 0;
  const COUNT = 120;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.6 + 0.1,
      hue: Math.random() > 0.5 ? 190 : 270,   // cyan or purple
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.12;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = p.hue === 190
            ? `rgba(0,212,255,${alpha})`
            : `rgba(123,47,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      p.pulse += 0.02;
      const pAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.hue === 190
        ? `rgba(0,212,255,${pAlpha})`
        : `rgba(123,47,255,${pAlpha})`;
      ctx.fill();

      // Glow
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
      grd.addColorStop(0, p.hue === 190
        ? `rgba(0,212,255,${pAlpha * 0.3})`
        : `rgba(123,47,255,${pAlpha * 0.3})`);
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Move
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  draw();

  // Mouse repel
  document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    particles.forEach(p => {
      const dx = p.x - mx, dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100 * 0.8;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
        // Clamp velocity
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2) { p.vx = p.vx / speed * 2; p.vy = p.vy / speed * 2; }
      }
    });
  });
})();

// ─── SCROLL REVEAL ───────────────────────────
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
})();

// ─── ANIMATED COUNTERS ───────────────────────
(function () {
  const nums = document.querySelectorAll('.hero-stat-num[data-count]');
  if (!nums.length) return;

  let done = false;

  function animate() {
    if (done) return;
    done = true;
    nums.forEach(el => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const isFloat = target % 1 !== 0;
      let current = 0;
      const duration = 1400;
      const start = performance.now();

      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 4);
        current = target * ease;
        el.textContent = isFloat
          ? current.toFixed(1) + suffix
          : Math.floor(current) + suffix;
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
      }
      requestAnimationFrame(step);
    });
  }

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { animate(); obs.disconnect(); }
  }, { threshold: 0.5 });

  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) obs.observe(statsEl);
  else animate();
})();

// ─── SKILL BARS ──────────────────────────────
(function () {
  const fills = document.querySelectorAll('.skill-bar-fill');
  if (!fills.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('animate');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(f => obs.observe(f));
})();

// ─── NAV SCROLL EFFECT ───────────────────────
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 60
      ? 'rgba(5,5,8,0.95)'
      : 'rgba(5,5,8,0.7)';
  }, { passive: true });
})();

// ─── MOBILE NAV ──────────────────────────────
(function () {
  const btn = document.getElementById('nav-hamburger');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display = open ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '64px';
    links.style.left = '0';
    links.style.right = '0';
    links.style.background = 'rgba(5,5,8,0.98)';
    links.style.padding = '1.5rem';
    links.style.gap = '1.5rem';
    links.style.borderBottom = '1px solid rgba(255,255,255,0.07)';
    links.style.zIndex = '100';
    if (open) links.style.display = 'none';
  });
})();

// ─── HERO TEXT GLITCH (subtle) ───────────────
(function () {
  const lines = document.querySelectorAll('.hero-name-line');
  if (!lines.length) return;

  function glitch(el) {
    const chars = '01アイウエオクサタ∑∆Ω';
    const original = el.dataset.text;
    if (!original) return;
    let iter = 0;
    const interval = setInterval(() => {
      el.textContent = original.split('').map((c, i) => {
        if (i < iter) return original[i];
        if (c === ' ') return ' ';
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (iter >= original.length) { clearInterval(interval); el.textContent = original; }
      iter += 0.4;
    }, 40);
  }

  // Trigger once on load
  setTimeout(() => lines.forEach(el => glitch(el)), 600);

  // Re-trigger on hover
  lines.forEach(el => {
    el.addEventListener('mouseenter', () => glitch(el));
  });
})();
