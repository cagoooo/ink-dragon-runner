import { getSkinById } from './skins';

export function generateShareCard(
  playerName: string,
  score: number,
  highScore: number,
  skinId: string
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const skin = getSkinById(skinId);
  const name = playerName.trim() || '大俠小墨龍';

  // 1. 宣紙背景
  ctx.fillStyle = '#F5F0E8';
  ctx.fillRect(0, 0, 800, 1000);

  // 2. 邊框
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#3D2B1F';
  ctx.strokeRect(30, 30, 740, 940);

  ctx.lineWidth = 3;
  ctx.strokeStyle = '#E34234';
  ctx.strokeRect(45, 45, 710, 910);

  // 3. 標題與朱紅印章
  ctx.fillStyle = '#E34234';
  ctx.fillRect(80, 80, 120, 120);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px "Microsoft JhengHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('墨龍', 140, 115);
  ctx.fillText('戰報', 140, 165);

  ctx.fillStyle = '#8B4513';
  ctx.font = 'bold 54px "Microsoft JhengHei", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('仙人掌大逃亡', 230, 115);

  ctx.fillStyle = '#2C1810';
  ctx.font = 'bold 36px "Microsoft JhengHei", sans-serif';
  ctx.fillText('奔跑吧小墨龍 ‧ 榮譽卡', 230, 175);

  // 4. 水墨分割線
  ctx.strokeStyle = 'rgba(61, 43, 31, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 240);
  ctx.lineTo(720, 240);
  ctx.stroke();

  // 5. 玩家大名與成績
  ctx.fillStyle = '#5A3E30';
  ctx.font = '28px "Microsoft JhengHei", sans-serif';
  ctx.fillText('挑戰大俠：', 80, 295);

  ctx.fillStyle = '#2C1810';
  ctx.font = 'bold 42px "Microsoft JhengHei", sans-serif';
  ctx.fillText(name, 220, 295);

  ctx.fillStyle = '#5A3E30';
  ctx.font = '28px "Microsoft JhengHei", sans-serif';
  ctx.fillText('本次奔跑距離：', 80, 370);

  ctx.fillStyle = '#E34234';
  ctx.font = 'bold 72px sans-serif';
  ctx.fillText(`${score} m`, 290, 375);

  ctx.fillStyle = '#5A3E30';
  ctx.font = '24px "Microsoft JhengHei", sans-serif';
  ctx.fillText(`個人歷史最佳： ${highScore} m`, 80, 440);

  // 6. 出戰神龍皮膚卡片
  ctx.fillStyle = '#EAE2D5';
  ctx.strokeStyle = skin.bodyColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(80, 480, 640, 240, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = skin.bodyColor;
  ctx.font = 'bold 36px "Microsoft JhengHei", sans-serif';
  ctx.fillText(`${skin.badge} ${skin.name}`, 120, 540);

  ctx.fillStyle = '#5A3E30';
  ctx.font = '24px "Microsoft JhengHei", sans-serif';
  ctx.fillText(skin.description, 120, 600);

  ctx.fillStyle = '#8B4513';
  ctx.font = 'italic 22px "Microsoft JhengHei", sans-serif';
  ctx.fillText('「墨韻奔逸穿千障，踏碎黃沙破萬仙。」', 120, 660);

  // 7. 朱紅個人成就印章
  ctx.save();
  ctx.translate(620, 380);
  ctx.rotate(-0.15);
  ctx.fillStyle = '#E34234';
  ctx.fillRect(0, 0, 110, 110);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, 98, 98);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px "Microsoft JhengHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('極限', 55, 38);
  ctx.fillText('突破', 55, 75);
  ctx.restore();

  // 8. 頁尾網址標籤
  ctx.fillStyle = '#3D2B1F';
  ctx.fillRect(80, 850, 640, 60);

  ctx.fillStyle = '#F5F0E8';
  ctx.font = '22px "Microsoft JhengHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('👉 即刻挑戰：https://cagoooo.github.io/ink-dragon-runner/', 400, 888);

  return canvas.toDataURL('image/png');
}
