const steps = [
  { src: "1.png", alt: "Cadeau encore emballe" },
  { src: "2.png", alt: "Cadeau legerement ouvert" },
  { src: "3.png", alt: "Cadeau a moitie ouvert" },
  { src: "4.png", alt: "Cadeau presque ouvert" },
  { src: "5.jpg", alt: "Cadeau totalement ouvert" }
];

const giftButton = document.getElementById("giftButton");
const currentPhoto = document.getElementById("currentPhoto");
const incomingPhoto = document.getElementById("incomingPhoto");
const flashLayer = document.getElementById("flashLayer");
const sparkLayer = document.getElementById("sparkLayer");
const tapHint = document.getElementById("tapHint");
const loadingScreen = document.getElementById("loadingScreen");

const fxCanvas = document.getElementById("fxCanvas");
const fx = fxCanvas.getContext("2d");

const state = {
  index: 0,
  isAnimating: false,
  isComplete: false,
  stormFrames: 0
};

const particles = [];

function preloadImages() {
  steps.forEach((step) => {
    const img = new Image();
    img.src = step.src;
  });
}

function resizeCanvas() {
  fxCanvas.width = window.innerWidth;
  fxCanvas.height = window.innerHeight;
}

function applyCurrentStep() {
  const step = steps[state.index];
  currentPhoto.src = step.src;
  currentPhoto.alt = step.alt;
}

function updateTapHint() {
  const remaining = steps.length - 1 - state.index;
  if (state.isComplete) {
    tapHint.textContent = "SURPRISE DEBLOQUEE";
  } else if (remaining <= 1) {
    tapHint.textContent = "DERNIER CLIC";
  } else {
    tapHint.textContent = `CLIQUE (${remaining})`;
  }
}

function activateFlashEffects(isFinal = false) {
  flashLayer.classList.remove("active", "final-active");
  sparkLayer.classList.remove("active", "final-active");
  void flashLayer.offsetWidth;
  flashLayer.classList.add("active");
  sparkLayer.classList.add("active");

  if (isFinal) {
    flashLayer.classList.add("final-active");
    sparkLayer.classList.add("final-active");
  }
}

function createBurst(x, y, count, speedScale, shapes = ["star", "rect"]) {
  const colors = ["#ffd95d", "#68e8ff", "#ffffff", "#ffa316", "#7fafff", "#ff6ec7"];

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (2 + Math.random() * 5) * speedScale;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.4,
      size: 2 + Math.random() * 5,
      life: 45 + Math.random() * 55,
      rotation: Math.random() * Math.PI * 2,
      vr: -0.24 + Math.random() * 0.48,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)]
    });
  }
}

function createGiftCenterBurst(count, speedScale) {
  const rect = giftButton.getBoundingClientRect();
  createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, count, speedScale);
}

function createSideCannons() {
  const yBase = fxCanvas.height * (0.28 + Math.random() * 0.34);
  createBurst(-20, yBase, 40, 1.2, ["rect", "rect", "star"]);
  createBurst(fxCanvas.width + 20, yBase, 40, 1.2, ["rect", "rect", "star"]);
}

function createRainConfetti(count) {
  const colors = ["#ffd95d", "#68e8ff", "#ffffff", "#ffa316", "#7fafff", "#ff6ec7"];
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: Math.random() * fxCanvas.width,
      y: -20 - Math.random() * 120,
      vx: -1.4 + Math.random() * 2.8,
      vy: 2.2 + Math.random() * 4.8,
      size: 2 + Math.random() * 4,
      life: 110 + Math.random() * 70,
      rotation: Math.random() * Math.PI,
      vr: -0.3 + Math.random() * 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.2 ? "rect" : "star"
    });
  }
}

function drawStarParticle(particle) {
  fx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const outer = particle.size;
    const inner = particle.size * 0.5;
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const b = a + Math.PI / 5;
    fx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
    fx.lineTo(Math.cos(b) * inner, Math.sin(b) * inner);
  }
  fx.closePath();
  fx.fill();
}

function drawRectParticle(particle) {
  const w = particle.size * 1.15;
  const h = particle.size * 2.1;
  fx.fillRect(-w / 2, -h / 2, w, h);
}

function drawParticle(particle) {
  fx.save();
  fx.translate(particle.x, particle.y);
  fx.rotate(particle.rotation);
  fx.fillStyle = particle.color;

  if (particle.shape === "star") {
    drawStarParticle(particle);
  } else {
    drawRectParticle(particle);
  }

  fx.restore();
}

function animateParticles() {
  fx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

  if (state.stormFrames > 0) {
    createRainConfetti(18);
    if (state.stormFrames % 14 === 0) {
      createSideCannons();
    }
    state.stormFrames -= 1;
  }

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.rotation += p.vr;
    p.life -= 1;
    drawParticle(p);

    if (p.life <= 0 || p.y > fxCanvas.height + 50) {
      particles.splice(i, 1);
    }
  }

  requestAnimationFrame(animateParticles);
}

function launchFinalCelebration() {
  if (state.isComplete) {
    return;
  }

  state.isComplete = true;
  giftButton.classList.add("complete", "ultimate");
  updateTapHint();

  activateFlashEffects(true);
  createGiftCenterBurst(520, 1.5);
  createSideCannons();
  createBurst(fxCanvas.width * 0.2, fxCanvas.height * 0.2, 80, 1.2, ["star"]);
  createBurst(fxCanvas.width * 0.8, fxCanvas.height * 0.2, 80, 1.2, ["star"]);
  state.stormFrames = 260;
}

function goToNextStep() {
  if (state.isAnimating) {
    return;
  }

  if (state.isComplete) {
    createGiftCenterBurst(120, 1.1);
    return;
  }

  if (state.index >= steps.length - 1) {
    launchFinalCelebration();
    return;
  }

  state.isAnimating = true;
  const nextIndex = state.index + 1;
  const nextStep = steps[nextIndex];

  giftButton.classList.remove("opening");
  void giftButton.offsetWidth;
  giftButton.classList.add("opening");

  incomingPhoto.classList.remove("reveal");
  incomingPhoto.src = nextStep.src;
  incomingPhoto.alt = nextStep.alt;
  void incomingPhoto.offsetWidth;
  incomingPhoto.classList.add("reveal");

  activateFlashEffects(false);
  createGiftCenterBurst(85, 0.95);

  incomingPhoto.addEventListener(
    "animationend",
    () => {
      state.index = nextIndex;
      applyCurrentStep();
      incomingPhoto.classList.remove("reveal");
      incomingPhoto.style.opacity = "0";
      state.isAnimating = false;
      updateTapHint();

      if (state.index >= steps.length - 1) {
        launchFinalCelebration();
      }
    },
    { once: true }
  );
}

giftButton.addEventListener("click", goToNextStep);
window.addEventListener("resize", resizeCanvas);

preloadImages();
resizeCanvas();
applyCurrentStep();
updateTapHint();
createGiftCenterBurst(90, 0.9);
requestAnimationFrame(animateParticles);

window.addEventListener("load", () => {
  if (!loadingScreen) {
    return;
  }

  window.setTimeout(() => {
    loadingScreen.classList.add("hide");
  }, 850);
});
