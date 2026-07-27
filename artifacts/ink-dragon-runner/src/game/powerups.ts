export type PowerUpType = 'shield' | 'boost' | 'double_score';

export interface PowerUpItem {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  pulseFrame: number;
  collected: boolean;
}

export function createPowerUp(id: number, canvasWidth: number, horizonY: number): PowerUpItem {
  const types: PowerUpType[] = ['shield', 'boost', 'double_score'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  // 道具懸浮在地面上方 60 ~ 140 px 處
  const altitude = 60 + Math.random() * 80;

  return {
    id,
    type,
    x: canvasWidth + 100,
    y: horizonY - altitude,
    width: 36,
    height: 36,
    pulseFrame: 0,
    collected: false,
  };
}

export function drawPowerUp(ctx: CanvasRenderingContext2D, item: PowerUpItem) {
  if (item.collected) return;

  ctx.save();
  const floatOffset = Math.sin(item.pulseFrame * 0.08) * 6;
  const drawY = item.y + floatOffset;
  const centerX = item.x + item.width / 2;
  const centerY = drawY + item.height / 2;

  // 外圈水墨光暈
  ctx.globalAlpha = 0.6 + Math.sin(item.pulseFrame * 0.1) * 0.2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);

  if (item.type === 'shield') {
    ctx.fillStyle = 'rgba(70, 130, 180, 0.25)'; // 墨玉藍
    ctx.strokeStyle = '#4682B4';
  } else if (item.type === 'boost') {
    ctx.fillStyle = 'rgba(227, 66, 52, 0.25)'; // 朱紅金
    ctx.strokeStyle = '#E34234';
  } else {
    ctx.fillStyle = 'rgba(218, 165, 32, 0.25)'; // 金赭墨
    ctx.strokeStyle = '#DAA520';
  }
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  // 內圈宣紙古印底座
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = '#F5F0E8';
  ctx.strokeStyle = '#3D2B1F';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 繪製水墨道具符號
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '16px sans-serif';

  if (item.type === 'shield') {
    ctx.fillText('🛡️', centerX, centerY + 1);
  } else if (item.type === 'boost') {
    ctx.fillText('⚡', centerX, centerY + 1);
  } else {
    ctx.fillText('🍄', centerX, centerY + 1);
  }

  ctx.restore();
}
