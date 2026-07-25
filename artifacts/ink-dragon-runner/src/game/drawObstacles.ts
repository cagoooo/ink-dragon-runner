import { GameState } from './state';
import { GAME_CONFIG } from './config';
import { getDayNightFactor, lerpColor } from './utils';

export const drawObstacles = (ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number) => {
  const horizonY = height * GAME_CONFIG.HORIZON_RATIO;
  const t = getDayNightFactor(state.score);
  
  state.obstacles.forEach(obs => {
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
      
      // Main trunk
      ctx.lineWidth = obs.width * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx + obs.width/2, horizonY);
      ctx.lineTo(cx + obs.width/2, cy + obs.width/2);
      ctx.stroke();
      
      // Left branch
      ctx.lineWidth = obs.width * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx + obs.width/2, horizonY - obs.height * 0.4);
      ctx.quadraticCurveTo(cx, horizonY - obs.height * 0.4, cx, horizonY - obs.height * 0.7);
      ctx.stroke();
      
      // Right branch
      if (obs.height > 40) {
        ctx.beginPath();
        ctx.moveTo(cx + obs.width/2, horizonY - obs.height * 0.6);
        ctx.quadraticCurveTo(cx + obs.width, horizonY - obs.height * 0.6, cx + obs.width, horizonY - obs.height * 0.85);
        ctx.stroke();
      }
      
    } else if (obs.type === 'bird') {
      const birdColorDay = '#1A1410';
      const birdColorNight = '#E8E0D0';
      ctx.strokeStyle = lerpColor(birdColorDay, birdColorNight, t);
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      
      // obs.y is altitude
      const bx = obs.x;
      const by = horizonY - obs.y;
      
      // Flap wings every 15 frames roughly (handled in game loop via obs.frame)
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
  });
};
