export interface BossBullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export interface BossState {
  active: boolean;
  warningTimer: number; // 登場警告倒數幀數
  durationTimer: number; // 試煉剩餘幀數
  bossY: number;
  targetY: number;
  bullets: BossBullet[];
  lastFireFrame: number;
  waveCount: number;
}

export function createInitialBossState(): BossState {
  return {
    active: false,
    warningTimer: 0,
    durationTimer: 0,
    bossY: -200,
    targetY: 120,
    bullets: [],
    lastFireFrame: 0,
    waveCount: 0,
  };
}

export function triggerBossTrial(boss: BossState, canvasHeight: number) {
  boss.active = true;
  boss.warningTimer = 120; // 2 秒警告
  boss.durationTimer = 600; // 10 秒試煉時間
  boss.bossY = -150;
  boss.targetY = canvasHeight * 0.25;
  boss.bullets = [];
  boss.lastFireFrame = 0;
  boss.waveCount = 0;
}

export function updateBossState(
  boss: BossState,
  canvasWidth: number,
  canvasHeight: number,
  dragonY: number,
  frame: number
) {
  if (!boss.active) return;

  if (boss.warningTimer > 0) {
    boss.warningTimer--;
    return;
  }

  if (boss.durationTimer > 0) {
    boss.durationTimer--;

    // 巨龍 BOSS 緩慢上下浮動
    boss.bossY += (boss.targetY + Math.sin(frame * 0.05) * 20 - boss.bossY) * 0.05;

    // 每隔一定時間發射水墨衝擊彈
    if (frame - boss.lastFireFrame > 110 && boss.waveCount < 4) {
      boss.lastFireFrame = frame;
      boss.waveCount++;

      // 向墨龍方向發射水墨彈
      const startX = canvasWidth - 100;
      const startY = boss.bossY;
      const horizonY = canvasHeight * 0.75;
      const dragonTargetY = horizonY - 40 - dragonY;

      const angle = Math.atan2(dragonTargetY - startY, canvasWidth * 0.15 - startX);
      const speed = 7.5;

      boss.bullets.push({
        id: Math.random(),
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 14,
        color: '#E34234',
      });
    }
  } else {
    // 試煉結束，巨龍退場
    boss.bossY -= 8;
    if (boss.bossY < -200 && boss.bullets.length === 0) {
      boss.active = false;
    }
  }

  // 更新水墨彈位置
  boss.bullets.forEach((b) => {
    b.x += b.vx;
    b.y += b.vy;
  });
  boss.bullets = boss.bullets.filter((b) => b.x > -50 && b.y < canvasHeight + 50);
}

export function drawBoss(ctx: CanvasRenderingContext2D, boss: BossState, width: number) {
  if (!boss.active) return;

  const horizonY = ctx.canvas.height * 0.75;

  // 1. 警告標語
  if (boss.warningTimer > 0) {
    ctx.save();
    ctx.globalAlpha = 0.8 + Math.sin(boss.warningTimer * 0.2) * 0.2;
    ctx.fillStyle = '#E34234';
    ctx.strokeStyle = '#2C1810';
    ctx.lineWidth = 2;
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 警告：水墨龍王試煉登場！ ⚡', width / 2, horizonY * 0.35);
    ctx.restore();
  }

  // 2. 巨龍 BOSS 投影背景畫像
  if (boss.bossY > -180) {
    ctx.save();
    const bossX = width - 120;
    ctx.globalAlpha = 0.85;

    // 巨龍頭部與祥雲墨浪
    ctx.fillStyle = '#2C1810';
    ctx.beginPath();
    ctx.arc(bossX, boss.bossY, 45, 0, Math.PI * 2);
    ctx.fill();

    // 龍眼睛 (赤紅閃爍)
    ctx.fillStyle = '#E34234';
    ctx.beginPath();
    ctx.arc(bossX - 18, boss.bossY - 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // 龍角
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(bossX - 10, boss.bossY - 40);
    ctx.lineTo(bossX - 30, boss.bossY - 70);
    ctx.moveTo(bossX + 10, boss.bossY - 40);
    ctx.lineTo(bossX, boss.bossY - 70);
    ctx.stroke();

    ctx.restore();
  }

  // 3. 繪製 BOSS 水墨彈
  ctx.save();
  for (const b of boss.bullets) {
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fill();

    // 水墨外光圈
    ctx.strokeStyle = '#2C1810';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}
