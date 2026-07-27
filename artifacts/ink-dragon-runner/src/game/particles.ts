export interface InkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
  shape: 'circle' | 'splash' | 'ring';
}

export function createParticle(
  x: number,
  y: number,
  vx: number,
  vy: number,
  size: number,
  color: string = '#2C1810',
  maxLife: number = 30,
  shape: 'circle' | 'splash' | 'ring' = 'circle'
): InkParticle {
  return {
    x,
    y,
    vx,
    vy,
    size,
    alpha: 1,
    maxLife,
    life: maxLife,
    color,
    shape,
  };
}

export function spawnJumpParticles(x: number, y: number): InkParticle[] {
  const particles: InkParticle[] = [];
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI / 6) + (Math.random() * (Math.PI * 2 / 3));
    const speed = 2 + Math.random() * 5;
    particles.push(
      createParticle(
        x + (Math.random() * 20 - 10),
        y,
        -Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        -Math.sin(angle) * speed,
        3 + Math.random() * 5,
        '#2C1810',
        25 + Math.floor(Math.random() * 15),
        Math.random() > 0.4 ? 'splash' : 'circle'
      )
    );
  }
  return particles;
}

export function spawnLandParticles(x: number, y: number): InkParticle[] {
  const particles: InkParticle[] = [];
  for (let i = 0; i < 10; i++) {
    const speed = 3 + Math.random() * 4;
    const dir = Math.random() > 0.5 ? 1 : -1;
    particles.push(
      createParticle(
        x + (Math.random() * 30 - 15),
        y,
        dir * speed,
        -(1 + Math.random() * 3),
        2.5 + Math.random() * 4,
        '#3D2B1F',
        20 + Math.floor(Math.random() * 10),
        'splash'
      )
    );
  }
  return particles;
}

export function spawnCollisionParticles(x: number, y: number): InkParticle[] {
  const particles: InkParticle[] = [];
  // 朱紅墨汁爆裂
  for (let i = 0; i < 24; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 8;
    const isRed = Math.random() > 0.3;
    particles.push(
      createParticle(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        4 + Math.random() * 7,
        isRed ? '#E34234' : '#2C1810',
        35 + Math.floor(Math.random() * 20),
        'splash'
      )
    );
  }
  return particles;
}

export function spawnPowerUpCollectParticles(x: number, y: number, color: string): InkParticle[] {
  const particles: InkParticle[] = [];
  particles.push(createParticle(x, y, 0, 0, 15, color, 25, 'ring'));
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const speed = 4 + Math.random() * 3;
    particles.push(
      createParticle(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        3 + Math.random() * 4,
        color,
        30,
        'circle'
      )
    );
  }
  return particles;
}

export function updateParticles(particles: InkParticle[], speed: number): InkParticle[] {
  return particles
    .map((p) => {
      p.x += p.vx - speed * 0.2;
      p.y += p.vy;
      p.vy += 0.15; // 輕微重力
      p.life -= 1;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.shape === 'ring') p.size += 2;
      return p;
    })
    .filter((p) => p.life > 0);
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: InkParticle[]) {
  ctx.save();
  for (const p of particles) {
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.strokeStyle = p.color;

    if (p.shape === 'ring') {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.shape === 'splash') {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size * 1.3, p.size * 0.7, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
