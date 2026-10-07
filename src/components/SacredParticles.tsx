// ==========================================================
// SACRED PARTICLES ENGINE — HUYỀN PHONG PHẬT ĐẠO
// Hạt Kim Sa Bát Nhã, Ánh Sao Linh Thiêng & Bụi Vàng Khai Quang
// Lightweight 60FPS Canvas Particle Animation with Auto-Pause
// ==========================================================

import React, { useEffect, useRef } from 'react';

interface Props {
  density?: 'subtle' | 'medium' | 'rich';
  className?: string;
  speed?: number;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  vy: number;
  vx: number;
  pulseSpeed: number;
  color: string;
}

export const SacredParticles: React.FC<Props> = ({
  density = 'medium',
  className = '',
  speed = 1.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const count = density === 'subtle' ? 22 : density === 'medium' ? 42 : 65;
    const particles: Particle[] = [];

    const colors = [
      'rgba(245, 158, 11, ', // Golden amber
      'rgba(251, 191, 36, ', // Warm gold
      'rgba(244, 208, 111, ', // Light golden aura
      'rgba(217, 119, 6, ', // Deep bronze gold
      'rgba(45, 212, 191, '  // Celestial teal accent
    ];

    for (let i = 0; i < count; i++) {
      const baseAlpha = 0.15 + Math.random() * 0.55;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.8 + Math.random() * 2.2,
        alpha: baseAlpha,
        baseAlpha,
        vy: -(0.25 + Math.random() * 0.6) * speed,
        vx: (Math.random() - 0.5) * 0.3 * speed,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y += p.vy;
        p.x += p.vx + Math.sin(time + i) * 0.2; // Gentle sinusoidal floating drift

        // Re-wrap when offscreen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Soft breathing pulsation
        p.alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(time * 3 + i));

        // Draw glowing particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = p.radius * 4;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
};
