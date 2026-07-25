import { GameState } from './state';
import { GAME_CONFIG } from './config';
import { lerpColor, getDayNightFactor } from './utils';

const MOUNTAIN_LAYERS = [
  { speed: 0.05, colorDay: '#C8B8A2', alphaDay: 0.15, colorNight: '#FFFFFF', alphaNight: 0.15, scale: 0.6, yOffset: 0.1 },
  { speed: 0.12, colorDay: '#C8B8A2', alphaDay: 0.25, colorNight: '#FFFFFF', alphaNight: 0.25, scale: 0.8, yOffset: 0.2 },
  { speed: 0.25, colorDay: '#C8B8A2', alphaDay: 0.40, colorNight: '#FFFFFF', alphaNight: 0.40, scale: 1.0, yOffset: 0.35 }
];

export const drawBackground = (ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number) => {
  const t = getDayNightFactor(state.score);
  const horizonY = height * GAME_CONFIG.HORIZON_RATIO;
  
  // Base sky
  const bgColor = lerpColor('#F5F0E8', '#1A1410', t);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Day paper texture noise
  if (t < 1) {
    ctx.fillStyle = `rgba(139, 69, 19, ${0.02 * (1 - t)})`;
    ctx.beginPath();
    for(let i=0; i<30; i++) {
       const x = (i * 137) % width;
       const y = (i * 211) % height;
       ctx.arc(x, y, (i * 17) % 100 + 50, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Night Stars
  if (t > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${t})`;
    state.stars.forEach(star => {
      star.alpha += star.flicker;
      if (star.alpha > 1) { star.alpha = 1; star.flicker *= -1; }
      if (star.alpha < 0.2) { star.alpha = 0.2; star.flicker *= -1; }
      
      ctx.globalAlpha = star.alpha * t;
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * horizonY, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // Mountains
  MOUNTAIN_LAYERS.forEach((layer, index) => {
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    
    const offset = state.bgOffsets[index] % (width * layer.scale);
    
    for (let x = 0; x <= width + 50; x += 20) {
       const mx = x + offset;
       const y = horizonY - height * layer.yOffset - Math.sin(mx * 0.005 / layer.scale) * 40 * layer.scale - Math.sin(mx * 0.015 / layer.scale) * 20 * layer.scale;
       ctx.lineTo(x, y);
    }
    ctx.lineTo(width, horizonY);
    ctx.closePath();
    
    if (t < 1) {
      ctx.fillStyle = `rgba(200, 184, 162, ${layer.alphaDay * (1-t)})`;
      ctx.fill();
    }
    if (t > 0) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${layer.alphaNight * t})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

  // Horizon Ground line
  const groundColor = lerpColor('#3D2B1F', '#E8E0D0', t);
  ctx.strokeStyle = groundColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(width, horizonY);
  ctx.stroke();
  
  // Fill ground below horizon
  if (t < 1) {
    const gradient = ctx.createLinearGradient(0, horizonY, 0, height);
    gradient.addColorStop(0, `rgba(180, 130, 90, ${0.1 * (1-t)})`);
    gradient.addColorStop(1, `rgba(180, 130, 90, ${0.25 * (1-t)})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, horizonY, width, height - horizonY);
  }
};
