// ==========================================
// CELESTIAL BACKGROUND & CONSTELLATION ENGINE
// Ultra-luxury animated cosmic nebula, interactive stars & shooting stars
// ==========================================

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  targetAlpha: number;
  glow: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const CelestialBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = [
      'rgba(45, 212, 191, ', // Teal (Mộc/Thủy)
      'rgba(168, 85, 247, ', // Purple (Tử Vi Tinh)
      'rgba(56, 189, 248, ', // Sky (Thiên Khôi)
      'rgba(244, 114, 182, ', // Rose (Đào Hoa)
      'rgba(251, 191, 36, ',  // Amber/Gold (Thái Dương / Hoàng Kim)
    ];

    const particleCount = Math.min(Math.floor((width * height) / 16000), 85);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 2.2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
        targetAlpha: Math.random() * 0.6 + 0.2,
        glow: Math.random() * 12 + 4,
      });
    }

    // Shooting Stars collection
    let shootingStars: ShootingStar[] = [];
    let lastMeteorTime = Date.now();

    const spawnShootingStar = () => {
      const startX = Math.random() * (width * 0.8) + width * 0.1;
      const startY = Math.random() * (height * 0.35);
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.35; // ~45 degrees diagonal
      const speed = Math.random() * 7 + 8;

      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: Math.random() * 80 + 70,
        life: 0,
        maxLife: Math.floor(Math.random() * 35 + 40),
        color: Math.random() > 0.4 ? 'rgba(251, 191, 36, ' : 'rgba(45, 212, 191, ',
        size: Math.random() * 1.5 + 1.2
      });
    };

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint sacred nebula clouds
      const grad1 = ctx.createRadialGradient(width * 0.2, height * 0.25, 0, width * 0.2, height * 0.25, width * 0.6);
      grad1.addColorStop(0, 'rgba(76, 29, 149, 0.14)');
      grad1.addColorStop(0.6, 'rgba(45, 212, 191, 0.05)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(width * 0.8, height * 0.7, 0, width * 0.8, height * 0.7, width * 0.5);
      grad2.addColorStop(0, 'rgba(14, 116, 144, 0.10)');
      grad2.addColorStop(0.5, 'rgba(139, 92, 246, 0.04)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Celestial Gold Core in center
      const gradCenter = ctx.createRadialGradient(width * 0.5, height * 0.45, 0, width * 0.5, height * 0.45, width * 0.4);
      gradCenter.addColorStop(0, 'rgba(245, 158, 11, 0.03)');
      gradCenter.addColorStop(1, 'transparent');
      ctx.fillStyle = gradCenter;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles (Stars)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Smooth twinkle
        p.alpha += (p.targetAlpha - p.alpha) * 0.02;
        if (Math.abs(p.targetAlpha - p.alpha) < 0.05) {
          p.targetAlpha = Math.random() * 0.7 + 0.15;
        }

        // Mouse gentle interaction
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          p.x -= (dx / dist) * 0.6;
          p.y -= (dy / dist) * 0.6;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowColor = `${p.color}0.8)`;
        ctx.shadowBlur = p.glow;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw constellation connection lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distNodes = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (distNodes < 115) {
            const lineAlpha = (1 - distNodes / 115) * 0.14 * Math.min(p.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(148, 163, 184, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Check shooting star spawn timing (every 4-7 seconds)
      const now = Date.now();
      if (now - lastMeteorTime > Math.random() * 3000 + 4000) {
        spawnShootingStar();
        lastMeteorTime = now;
      }

      // Render and update shooting stars
      shootingStars = shootingStars.filter((star) => {
        star.x += star.vx;
        star.y += star.vy;
        star.life += 1;

        const progress = star.life / star.maxLife;
        const currentAlpha = Math.sin(progress * Math.PI); // Smooth fade in and out

        // Gradient trail
        const trailX = star.x - (star.vx / Math.hypot(star.vx, star.vy)) * star.length;
        const trailY = star.y - (star.vy / Math.hypot(star.vx, star.vy)) * star.length;

        const meteorGrad = ctx.createLinearGradient(trailX, trailY, star.x, star.y);
        meteorGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        meteorGrad.addColorStop(1, `${star.color}${currentAlpha * 0.9})`);

        ctx.beginPath();
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(star.x, star.y);
        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = star.size;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Star head sparkle
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.shadowColor = star.color.replace('(', '').replace(',', '').includes('251') ? '#fbbf24' : '#2dd4bf';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        return star.life < star.maxLife;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-85"
      aria-hidden="true"
    />
  );
};
