/* Standalone progressive enhancement. The HTML links work before this runs. */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const states = [];

for (const link of document.querySelectorAll('.work-link')) {
  for (const word of link.querySelectorAll('.word')) {
    const fragment = document.createDocumentFragment();
    for (const letter of word.textContent) {
      const glyph = document.createElement('span');
      glyph.className = 'glyph';
      glyph.dataset.letter = letter;
      const face = document.createElement('span');
      face.className = 'glyph-face';
      face.textContent = letter;
      glyph.append(face);
      fragment.append(glyph);
    }
    word.replaceChildren(fragment);
    word.dataset.typeset = '';
  }
  link.dataset.ready = '';
  const state = {
    link,
    units: [...link.querySelectorAll('.glyph, .press-arrow')],
    centers: null,
    frame: 0,
    release: 0,
    pointer: { x: 0, y: 0 },
  };
  states.push(state);

  function measure() {
    state.centers = state.units.map(unit => {
      const rect = unit.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, radius: Math.max(100, rect.height * 1.9) };
    });
  }

  function impress() {
    state.frame = 0;
    if (reducedMotion.matches || document.hidden) return;
    if (!state.centers) measure();
    state.units.forEach((unit, index) => {
      const center = state.centers[index];
      const distance = Math.hypot(state.pointer.x - center.x, (state.pointer.y - center.y) * .7);
      const pressure = Math.max(0, 1 - distance / center.radius);
      // A small, monotonic depression. CSS controls the short settling time.
      const smooth = pressure * pressure * (3 - 2 * pressure);
      unit.style.setProperty('--press', smooth.toFixed(3));
    });
  }

  function follow(event) {
    if (event.pointerType === 'touch' || reducedMotion.matches || document.hidden) return;
    state.pointer = { x: event.clientX, y: event.clientY };
    if (!state.frame) state.frame = requestAnimationFrame(impress);
  }

  state.reset = () => {
    cancelAnimationFrame(state.frame);
    clearTimeout(state.release);
    state.frame = 0;
    state.centers = null;
    link.classList.remove('is-pressed');
    state.units.forEach(unit => unit.style.removeProperty('--press'));
  };

  link.addEventListener('pointerenter', event => { state.centers = null; follow(event); });
  link.addEventListener('pointermove', follow, { passive: true });
  link.addEventListener('pointerleave', state.reset);
  link.addEventListener('pointercancel', state.reset);
  link.addEventListener('blur', state.reset);
  link.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    clearTimeout(state.release);
    link.classList.add('is-pressed');
  });
  link.addEventListener('pointerup', () => {
    // Never delay, cancel, or replay a real navigation for the visual feedback.
    state.release = setTimeout(() => link.classList.remove('is-pressed'), 160);
  });
}

const resetAll = () => states.forEach(state => state.reset());
window.addEventListener('resize', resetAll, { passive: true });
window.addEventListener('scroll', resetAll, { passive: true });
window.addEventListener('blur', resetAll);
reducedMotion.addEventListener('change', resetAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) resetAll(); });
document.fonts?.ready.then(resetAll);

const notice = document.querySelector('.notice');
let noticeTimer;
function dismissNotice() {
  clearTimeout(noticeTimer);
  notice.classList.remove('is-visible');
  notice.textContent = '';
}
for (const link of document.querySelectorAll('[data-pending]')) {
  link.addEventListener('click', event => {
    event.preventDefault();
    clearTimeout(noticeTimer);
    notice.textContent = `${link.dataset.pending} — link coming soon.`;
    notice.classList.add('is-visible');
    noticeTimer = setTimeout(dismissNotice, 3500);
  });
}
document.addEventListener('keydown', event => { if (event.key === 'Escape') { dismissNotice(); resetAll(); } });

/* Paper mask-off reveal. The portrait is an untouched <img>; only the A18 cover
   is painted onto a canvas and erased, so both source assets stay independent. */
const revealStage = document.querySelector('[data-paper-reveal]');
if (revealStage?.querySelector) {
  const coverCanvas = revealStage.querySelector('.paper-reveal-cover');
  const particleCanvas = revealStage.querySelector('.paper-reveal-particles');
  const revealButton = revealStage.querySelector('.paper-reveal-button');
  const coverContext = coverCanvas.getContext('2d');
  const particleContext = particleCanvas.getContext('2d');
  const coverImage = new Image();
  const coverSource = '/images/IMAGE%202%20%E2%80%94%20COVER%20%20MASK%20IMAGE.png';
  const gridColumns = 46;
  const gridRows = 31;
  const revealedCells = new Set();
  const particles = [];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let previousPoint = null;
  let activePointer = null;
  let started = false;
  let completing = false;
  let particleFrame = 0;

  const markCoverage = (x, y, radius) => {
    const columnRadius = Math.ceil((radius / width) * gridColumns);
    const rowRadius = Math.ceil((radius / height) * gridRows);
    const column = Math.floor((x / width) * gridColumns);
    const row = Math.floor((y / height) * gridRows);
    for (let cy = Math.max(0, row - rowRadius); cy <= Math.min(gridRows - 1, row + rowRadius); cy += 1) {
      for (let cx = Math.max(0, column - columnRadius); cx <= Math.min(gridColumns - 1, column + columnRadius); cx += 1) {
        const cellX = ((cx + 0.5) / gridColumns) * width;
        const cellY = ((cy + 0.5) / gridRows) * height;
        if (Math.hypot(cellX - x, cellY - y) < radius) revealedCells.add(`${cx}:${cy}`);
      }
    }
  };

  const resizeReveal = () => {
    const bounds = revealStage.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    [coverCanvas, particleCanvas].forEach(canvas => {
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
    });
    coverContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    particleContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    if (coverImage.complete) {
      coverContext.globalCompositeOperation = 'source-over';
      coverContext.clearRect(0, 0, width, height);
      coverContext.drawImage(coverImage, 0, 0, width, height);
      // Keep a resize from restoring already-scratched areas.
      coverContext.globalCompositeOperation = 'destination-out';
      revealedCells.forEach(key => {
        const [column, row] = key.split(':').map(Number);
        coverContext.beginPath();
        coverContext.arc(((column + 0.5) / gridColumns) * width, ((row + 0.5) / gridRows) * height, Math.max(width / gridColumns, height / gridRows), 0, Math.PI * 2);
        coverContext.fill();
      });
    }
  };

  const animateParticles = () => {
    particleFrame = 0;
    particleContext.clearRect(0, 0, width, height);
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.life -= 0.035;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.018;
      if (particle.life <= 0) {
        particles.splice(index, 1);
        continue;
      }
      particleContext.globalAlpha = particle.life * 0.55;
      particleContext.fillStyle = '#e8dcc7';
      particleContext.fillRect(particle.x, particle.y, particle.size, particle.size * 0.55);
    }
    particleContext.globalAlpha = 1;
    if (particles.length) particleFrame = requestAnimationFrame(animateParticles);
  };

  const addFibers = (x, y, radius) => {
    for (let index = 0; index < 6; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      particles.push({
        x: x + Math.cos(angle) * radius * (0.5 + Math.random() * 0.45),
        y: y + Math.sin(angle) * radius * (0.5 + Math.random() * 0.45),
        vx: Math.cos(angle) * (0.2 + Math.random() * 0.8),
        vy: Math.sin(angle) * (0.2 + Math.random() * 0.8),
        size: 1 + Math.random() * 2.2,
        life: 0.7 + Math.random() * 0.3,
      });
    }
    if (!particleFrame) particleFrame = requestAnimationFrame(animateParticles);
  };

  const eraseStamp = (x, y, radius, withFibers = true) => {
    if (!width || !height) return;
    const safeRadius = Math.max(1, radius);
    coverContext.save();
    coverContext.globalCompositeOperation = 'destination-out';
    // A few overlapping, uneven soft stamps make a torn-paper brush instead
    // of a perfect circular wipe.
    for (let index = 0; index < 4; index += 1) {
      const angle = (Math.PI * 2 * index) / 4 + Math.random() * 0.65;
      const offset = safeRadius * (0.12 + Math.random() * 0.18);
      const stampRadius = safeRadius * (0.7 + Math.random() * 0.32);
      const gradient = coverContext.createRadialGradient(
        x + Math.cos(angle) * offset,
        y + Math.sin(angle) * offset,
        stampRadius * 0.12,
        x + Math.cos(angle) * offset,
        y + Math.sin(angle) * offset,
        stampRadius,
      );
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.58, 'rgba(0,0,0,0.94)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      coverContext.fillStyle = gradient;
      coverContext.beginPath();
      coverContext.arc(x + Math.cos(angle) * offset, y + Math.sin(angle) * offset, stampRadius, 0, Math.PI * 2);
      coverContext.fill();
    }
    coverContext.restore();
    markCoverage(x, y, safeRadius);
    if (withFibers) addFibers(x, y, safeRadius);
  };

  const finishReveal = () => {
    if (completing) return;
    completing = true;
    revealStage.classList.add('has-started');
    const startedAt = performance.now();
    const origin = previousPoint || { x: width / 2, y: height / 2 };
    const completeStep = now => {
      const progress = Math.min(1, (now - startedAt) / 620);
      const radius = (Math.max(width, height) * 1.15) * progress;
      eraseStamp(origin.x, origin.y, radius, progress < 0.82);
      if (progress < 1) {
        requestAnimationFrame(completeStep);
      } else {
        coverContext.clearRect(0, 0, width, height);
        revealStage.classList.add('is-complete');
        revealButton.hidden = true;
      }
    };
    requestAnimationFrame(completeStep);
  };

  const revealAt = event => {
    if (completing || reducedMotion.matches || !coverImage.complete) return;
    const bounds = revealStage.getBoundingClientRect();
    const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    const radius = Math.max(24, Math.min(width, height) * 0.09);
    if (!started) {
      started = true;
      revealStage.classList.add('has-started');
    }
    if (previousPoint) {
      const distance = Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
      const steps = Math.max(1, Math.ceil(distance / Math.max(8, radius * 0.32)));
      for (let step = 1; step <= steps; step += 1) {
        eraseStamp(previousPoint.x + ((point.x - previousPoint.x) * step) / steps, previousPoint.y + ((point.y - previousPoint.y) * step) / steps, radius);
      }
    } else {
      eraseStamp(point.x, point.y, radius);
    }
    previousPoint = point;
    if (revealedCells.size / (gridColumns * gridRows) >= 0.74) finishReveal();
  };

  coverImage.addEventListener('load', resizeReveal, { once: true });
  coverImage.src = coverSource;
  window.addEventListener('resize', resizeReveal, { passive: true });
  revealStage.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' && activePointer !== event.pointerId) return;
    if (event.pointerType !== 'touch' || activePointer === event.pointerId) revealAt(event);
  }, { passive: false });
  revealStage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') {
      activePointer = event.pointerId;
      try { revealStage.setPointerCapture?.(event.pointerId); } catch { /* Synthetic pointer events do not own a capture target. */ }
      event.preventDefault();
    }
    revealAt(event);
  }, { passive: false });
  const releasePointer = event => {
    if (event.pointerId === activePointer) activePointer = null;
    previousPoint = null;
  };
  revealStage.addEventListener('pointerup', releasePointer);
  revealStage.addEventListener('pointercancel', releasePointer);
  revealButton.addEventListener('click', finishReveal);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) revealButton.hidden = false;
  });
}

/* Video Scrubbing */
const scrubVideo = document.getElementById('scrub-video');
if (scrubVideo && window.matchMedia('(hover: hover)').matches) {
  let targetTime = 0;
  let currentTime = 0;
  let rafId = null;
  let isMetadataLoaded = scrubVideo.readyState >= 1;

  scrubVideo.pause();

  scrubVideo.addEventListener('loadedmetadata', () => {
    isMetadataLoaded = true;
  });

  const updateVideo = () => {
    // Używamy wyższego współczynnika (0.4 zamiast 0.1), aby reagowało natychmiast, zachowując minimalne wygładzenie
    currentTime += (targetTime - currentTime) * 0.4;

    // Jeśli jesteśmy wystarczająco blisko, wyrównujemy i zatrzymujemy pętlę
    if (Math.abs(targetTime - currentTime) > 0.01) {
      if (isMetadataLoaded || scrubVideo.readyState >= 1) {
        try {
          scrubVideo.currentTime = currentTime;
        } catch { /* Metadata may not be ready yet. */ }
      }
      rafId = requestAnimationFrame(updateVideo);
    } else {
      // Wyrównanie do celu na sam koniec
      try { scrubVideo.currentTime = targetTime; } catch { /* Metadata may not be ready yet. */ }
      currentTime = targetTime;
      rafId = null;
    }
  };

  const handleMouseMove = (event) => {
    // Disable on touch devices or if reduced motion is enabled
    if (reducedMotion.matches || event.pointerType === 'touch') return;

    const yPos = Math.max(0, Math.min(1, event.clientY / window.innerHeight));
    if (scrubVideo.duration && !isNaN(scrubVideo.duration)) {
      targetTime = yPos * scrubVideo.duration;
      if (!rafId) rafId = requestAnimationFrame(updateVideo);
    }
  };

  window.addEventListener('pointermove', handleMouseMove, { passive: true });
  const stopScrubbing = () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    targetTime = currentTime;
  };
  reducedMotion.addEventListener('change', stopScrubbing);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopScrubbing(); });
}
