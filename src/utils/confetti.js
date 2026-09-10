const COLORS = ["#ff2e88", "#b026ff", "#05d9e8", "#ffd60a", "#39ff6a", "#ff5d7a"];

export function runConfetti(canvas, { duration = 2600, particleCount = 140 } = {}) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const width = () => canvas.clientWidth;
  const height = () => canvas.clientHeight;

  const particles = Array.from({ length: particleCount }, () => ({
    x: width() / 2 + (Math.random() - 0.5) * width() * 0.4,
    y: height() * 0.3,
    vx: (Math.random() - 0.5) * 8,
    vy: Math.random() * -8 - 4,
    size: Math.random() * 6 + 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.3,
    gravity: 0.25 + Math.random() * 0.15,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));

  let raf;
  const start = performance.now();

  function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, width(), height());
    for (const p of particles) {
      p.vy += p.gravity * 0.15;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - t / duration);
      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (t < duration) {
      raf = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, width(), height());
    }
  }
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    ctx.clearRect(0, 0, width(), height());
  };
}
