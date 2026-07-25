import { GameState } from './state';
import { GAME_CONFIG } from './config';
import { getDayNightFactor, lerpColor } from './utils';

export const drawDragon = (ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number) => {
  const horizonY = height * GAME_CONFIG.HORIZON_RATIO;
  const t = getDayNightFactor(state.score);
  const dw = GAME_CONFIG.DRAGON_W;
  let dh = GAME_CONFIG.DRAGON_H;
  
  if (state.dragon.isDucking) {
    dh = GAME_CONFIG.DRAGON_DUCK_HEIGHT;
  }
  
  const dx = width * 0.15;
  const dy = horizonY - dh - state.dragon.y;
  
  ctx.save();
  ctx.translate(dx, dy);
  
  // Ink colors adapting slightly to night mode
  const mainColor = lerpColor('#2C1810', '#E8E0D0', t * 0.7); 
  const eyeWhite = lerpColor('#F5F0E8', '#1A1410', t);
  const eyePupil = lerpColor('#1A1410', '#F5F0E8', t);
  const accentColor = '#E34234';
  
  ctx.fillStyle = mainColor;
  ctx.strokeStyle = mainColor;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  const frame = state.dragon.frame;
  const bobY = (!state.dragon.isJumping && !state.dragon.isDucking) ? (frame % 2 === 0 ? 0 : 3) : 0;
  
  // Body Arc
  ctx.beginPath();
  ctx.lineWidth = 10;
  if (state.dragon.isJumping) {
    ctx.moveTo(0, dh); 
    ctx.quadraticCurveTo(dw * 0.4, dh * 0.1, dw, dh * 0.3); 
  } else if (state.dragon.isDucking) {
    ctx.moveTo(0, dh); 
    ctx.quadraticCurveTo(dw * 0.5, dh * 0.7, dw, dh * 0.8); 
  } else {
    ctx.moveTo(0, dh - 5 + bobY);
    ctx.quadraticCurveTo(dw * 0.5, dh * 0.2 + bobY, dw, dh * 0.5 + bobY);
  }
  ctx.stroke();
  
  // Head
  ctx.beginPath();
  const headX = dw;
  const headY = state.dragon.isJumping ? dh * 0.3 : (state.dragon.isDucking ? dh * 0.8 : dh * 0.5 + bobY);
  ctx.arc(headX, headY, 14, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye
  ctx.fillStyle = eyeWhite;
  ctx.beginPath();
  ctx.arc(headX + 4, headY - 4, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = eyePupil;
  ctx.beginPath();
  ctx.arc(headX + 5, headY - 4, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Horns
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(headX - 5, headY - 12);
  ctx.quadraticCurveTo(headX - 15, headY - 30, headX - 5, headY - 40);
  ctx.moveTo(headX + 2, headY - 14);
  ctx.quadraticCurveTo(headX - 8, headY - 25, headX + 5, headY - 35);
  ctx.stroke();
  
  // Whiskers
  const whiskerSway = (frame % 4) * 2;
  ctx.beginPath();
  ctx.moveTo(headX + 12, headY + 5);
  ctx.quadraticCurveTo(headX + 30 + whiskerSway, headY + 20, headX + 40, headY + 10);
  ctx.stroke();
  
  // Legs
  ctx.lineWidth = 5;
  ctx.strokeStyle = mainColor;
  
  if (state.dragon.isJumping) {
    ctx.beginPath(); ctx.moveTo(dw * 0.7, headY + 5); ctx.lineTo(dw * 0.85, headY + 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(dw * 0.3, headY + 10); ctx.lineTo(dw * 0.1, headY + 30); ctx.stroke();
  } else if (state.dragon.isDucking) {
    ctx.beginPath(); ctx.moveTo(dw * 0.7, headY); ctx.lineTo(dw * 0.7, dh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(dw * 0.3, dh * 0.8); ctx.lineTo(dw * 0.3, dh); ctx.stroke();
  } else {
    const f = frame % 4;
    ctx.beginPath();
    ctx.moveTo(dw * 0.7, headY + 5);
    ctx.lineTo(dw * 0.7 + (f===0||f===1 ? 12 : -5), dh);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dw * 0.3, headY + 5);
    ctx.lineTo(dw * 0.3 + (f===2||f===3 ? 12 : -5), dh);
    ctx.stroke();
  }
  
  // Accents (Pearl)
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(headX + 25, headY + 18 + bobY/2, 5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
};
