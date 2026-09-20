import React, { useEffect, useRef } from 'react';

interface PixelParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  color: string;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

const PIXEL_PALETTE = [
  '#f6c833', // gold/yellow
  '#d93876', // magenta pink
  '#26c281', // arcade green
  '#45b7d1', // cyber cyan
  '#eaddff', // soft pixel lavender
  '#ff89bb', // pastel pink
  '#ffd166', // warm sunflower
];

export const PixelCanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Number of floating pixel dust particles based on screen size
    const particleCount = Math.min(80, Math.max(35, Math.floor(width / 25)));
    const particles: PixelParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() > 0.85 ? 6 : Math.random() > 0.5 ? 4 : 3, // crisp retro square sizes
        speedY: -(Math.random() * 0.45 + 0.15), // gently float upwards
        speedX: (Math.random() - 0.5) * 0.3, // subtle horizontal drift
        color: PIXEL_PALETTE[Math.floor(Math.random() * PIXEL_PALETTE.length)],
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.015,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;

        // Wrap around screen boundaries
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Subtle 8-bit twinkle effect
        const alpha = Math.max(
          0.15,
          Math.min(0.85, p.opacity + Math.sin(frame * p.twinkleSpeed + p.twinkleOffset) * 0.25)
        );

        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;

        // Render crisp sharp pixel block (no anti-aliasing blur)
        const snapX = Math.round(p.x);
        const snapY = Math.round(p.y);
        ctx.fillRect(snapX, snapY, p.size, p.size);

        // Optional tiny cross/sparkle for larger particles
        if (p.size >= 5 && Math.sin(frame * p.twinkleSpeed + p.twinkleOffset) > 0.6) {
          ctx.globalAlpha = alpha * 0.6;
          ctx.fillRect(snapX - 2, snapY + 1, 2, 2);
          ctx.fillRect(snapX + p.size, snapY + 1, 2, 2);
          ctx.fillRect(snapX + 1, snapY - 2, 2, 2);
          ctx.fillRect(snapX + 1, snapY + p.size, 2, 2);
        }
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-1 pixelated-render"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
