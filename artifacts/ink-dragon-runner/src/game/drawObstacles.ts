import { GameState } from './state';
import { GAME_CONFIG } from './config';
import { getDayNightFactor, lerpColor } from './utils';
import { drawBoss } from './boss';

export const drawObstacles = (
  ctx: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number
) => {
  const horizonY = height * GAME_CONFIG.HORIZON_RATIO;
  const t = getDayNightFactor(state.score);
  const strokeColor = lerpColor('#2C1810', '#E8E0D0', t * 0.7);

  ctx.save();

  // 繪製巨龍 BOSS 及其攻擊波
  drawBoss(ctx, state.boss, width);

  for (const obs of state.obstacles) {
    ctx.save();
    if (obs.type === 'cactus') {
      const cactusColorDay = '#2D5016';
      const cactusColorNight = '#7BA35B';
      const color = lerpColor(cactusColorDay, cactusColorNight, t);

      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const cx = obs.x;
      const cy = horizonY - obs.height;

      // 主幹
      ctx.lineWidth = obs.width * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx + obs.width / 2, horizonY);
      ctx.lineTo(cx + obs.width / 2, cy + obs.width / 2);
      ctx.stroke();

      // 分枝
      ctx.lineWidth = obs.width * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx + obs.width / 2, horizonY - obs.height * 0.4);
      ctx.quadraticCurveTo(cx, horizonY - obs.height * 0.4, cx, horizonY - obs.height * 0.7);
      ctx.stroke();

      if (obs.height > 40) {
        ctx.beginPath();
        ctx.moveTo(cx + obs.width / 2, horizonY - obs.height * 0.6);
        ctx.quadraticCurveTo(cx + obs.width, horizonY - obs.height * 0.6, cx + obs.width, horizonY - obs.height * 0.85);
        ctx.stroke();
      }

    } else if (obs.type === 'thundercloud') {
      // 水墨雷雲
      const x = obs.x;
      const y = horizonY - obs.y;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = strokeColor;
      ctx.beginPath();
      ctx.arc(x + 12, y + 10, 12, 0, Math.PI * 2);
      ctx.arc(x + 24, y + 5, 15, 0, Math.PI * 2);
      ctx.arc(x + 36, y + 10, 12, 0, Math.PI * 2);
      ctx.fill();

      // 閃電
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 22, y + 18);
      ctx.lineTo(x + 18, y + 26);
      ctx.lineTo(x + 24, y + 26);
      ctx.lineTo(x + 20, y + 34);
      ctx.stroke();

    } else if (obs.type === 'bird') {
      const birdColorDay = '#1A1410';
      const birdColorNight = '#E8E0D0';
      ctx.strokeStyle = lerpColor(birdColorDay, birdColorNight, t);
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      const bx = obs.x;
      const by = horizonY - obs.y;
      const isWingUp = Math.floor(obs.frame / 20) % 2 === 0;
      const flap = isWingUp ? 1 : -1;

      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + 15, by - 12 * flap, bx + 20, by + 5);
      ctx.moveTo(bx + 20, by + 5);
      ctx.quadraticCurveTo(bx + 25, by - 12 * flap, bx + 40, by);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore();
};
