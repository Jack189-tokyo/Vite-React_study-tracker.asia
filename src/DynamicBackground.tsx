import { useEffect, useRef } from 'react';

export default function DynamicBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const symbols = ['+', '−', '×', '÷', '∑', '∫', '√', '∞', 'π', '≠', '≤', '≥'];
    const elements: { el: HTMLElement, x: number, y: number, vx: number, vy: number, size: number }[] = [];

    for (let i = 0; i < 50; i++) {
      const el = document.createElement('span');
      el.innerText = symbols[Math.floor(Math.random() * symbols.length)];
      el.style.position = 'absolute';
      el.style.color = 'rgba(128, 128, 128, 0.2)';
      container.appendChild(el);

      const size = Math.random() * 20 + 10;
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

    let animationFrameId: number;
    const animate = () => {
      elements.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
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
      cancelAnimationFrame(animationFrameId);
      container.innerHTML = ''; // 清理 DOM
    };
  }, []);

  return <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, overflow: 'hidden' }} />;
}