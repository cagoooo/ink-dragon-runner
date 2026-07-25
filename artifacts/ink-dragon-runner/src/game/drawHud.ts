import { GameState } from './state';
import { getDayNightFactor, lerpColor } from './utils';

export const drawHud = (ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number) => {
  if (state.mode !== 'PLAYING') return;

  const t = getDayNightFactor(state.score);
  const textColor = lerpColor('#1A1410', '#E8E0D0', t);
  
  ctx.save();
  // Responsive positioning for HUD
  const isMobile = width < 768;
  const paddingRight = isMobile ? 20 : 40;
  const hudWidth = 140;
  ctx.translate(width - hudWidth - paddingRight, 30);
  
  // Semi-transparent stamp background
  ctx.fillStyle = `rgba(227, 66, 52, ${0.05 + 0.1 * t})`;
  ctx.strokeStyle = `rgba(227, 66, 52, ${0.5 + 0.3 * t})`;
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.roundRect(0, 0, hudWidth, 44, 4);
  ctx.fill();
  ctx.stroke();
  
  // Inner dash
  ctx.beginPath();
  ctx.roundRect(-4, -4, hudWidth + 8, 52, 6);
  ctx.strokeStyle = `rgba(227, 66, 52, 0.25)`;
  ctx.stroke();
  
  // Text
  ctx.font = '24px "Ma Shan Zheng", cursive';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`距離：${Math.floor(state.score)}`, hudWidth / 2, 22);
  
  ctx.restore();
};
