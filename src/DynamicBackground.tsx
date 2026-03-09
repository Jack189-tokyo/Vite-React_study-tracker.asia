import { useEffect, useRef } from 'react';

export default function DynamicBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const symbols: { text: string; emphasis?: boolean }[] = [
      { text: '+' }, { text: '−' }, { text: '×' }, { text: '÷' }, { text: '=' }, { text: '≈' },
      { text: '∑' }, { text: '∫' }, { text: '√' }, { text: '∞' }, { text: 'π' }, { text: '≠' }, { text: '≤' }, { text: '≥' },
      { text: 'α' }, { text: 'β' }, { text: 'γ' }, { text: 'θ' }, { text: 'λ' },
      { text: '1+1=2' }, { text: '2×3=6' }, { text: '7−4=3' }, { text: '3²=9' }, { text: 'a²+b²=c²' },
      { text: 'P(A|B)' }, { text: 'f(x)' }, { text: 'y=kx+b' },
      // 物理等式（重点放大加粗）
      { text: 'E=mc²', emphasis: true },
      { text: 'F=ma', emphasis: true },
      { text: 'V=IR', emphasis: true }
    ];
    const elements: { el: HTMLElement, x: number, y: number, vx: number, vy: number, size: number }[] = [];

    for (let i = 0; i < 50; i++) {
      const el = document.createElement('span');
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      el.innerText = symbol.text;
      el.style.position = 'absolute';
      el.style.color = 'rgba(124, 58, 237, 0.26)'; // 更明显的主题紫色
      container.appendChild(el);

      const baseSize = Math.random() * 18 + 18; // 18 - 36 像素，更大更直观
      const size = symbol.emphasis ? baseSize + 10 : baseSize;
      elements.push({
        el,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: Math.random() * 0.5 - 0.25,
        vy: Math.random() * 0.5 - 0.25,
        size: size,
      });
      el.style.fontSize = `${size}px`;
    }

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        if (!e.touches.length) return;
        const t = e.touches[0];
        mouseRef.current = { x: t.clientX, y: t.clientY };
      } else {
        mouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: true });

    let animationFrameId: number;
    const animate = () => {
      elements.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        const mouse = mouseRef.current;
        if (mouse) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const influenceRadius = 140;
          if (distSq < influenceRadius * influenceRadius) {
            const dist = Math.sqrt(distSq) || 1;
            const force = (influenceRadius - dist) / influenceRadius; // 0-1
            const ux = dx / dist;
            const uy = dy / dist;
            p.x += ux * force * 8;
            p.y += uy * force * 8;
          }
        }
        if (p.x < -p.size || p.x > window.innerWidth || p.y < -p.size || p.y > window.innerHeight) {
          p.x = Math.random() * window.innerWidth;
          p.y = -p.size;
        }
        p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      cancelAnimationFrame(animationFrameId);
      container.innerHTML = ''; // 清理 DOM
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
}