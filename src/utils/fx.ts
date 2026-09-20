const PIXEL_COLORS = ['#f6c833', '#d93876', '#26c281', '#45b7d1', '#ef4444', '#f3eeff'];

export function spawnPixelBurst(x?: number, y?: number, count = 8) {
  if (typeof window === 'undefined') return;
  const targetX = x ?? window.innerWidth / 2;
  const targetY = y ?? window.innerHeight / 2;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'pixel-particle';
    const size = Math.floor(Math.random() * 6) + 5;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.backgroundColor = PIXEL_COLORS[Math.floor(Math.random() * PIXEL_COLORS.length)];
    p.style.left = `${targetX}px`;
    p.style.top = `${targetY}px`;
    document.body.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 50 + 35;
    const destX = Math.cos(angle) * speed;
    const destY = Math.sin(angle) * speed - 10;

    const anim = p.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 },
      ],
      {
        duration: 500,
        easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
        fill: 'forwards',
      }
    );

    anim.onfinish = () => {
      p.remove();
    };
  }
}

export function spawnFlyingHeart(x?: number, y?: number) {
  if (typeof window === 'undefined') return;
  const targetX = x ?? window.innerWidth / 2;
  const targetY = y ?? window.innerHeight / 2;
  spawnPixelBurst(targetX, targetY, 8);
}
