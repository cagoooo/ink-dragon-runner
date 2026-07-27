export interface DragonSkin {
  id: string;
  name: string;
  badge: string;
  bodyColor: string;
  bellyColor: string;
  hornColor: string;
  eyeColor: string;
  trailColor: string;
  description: string;
  unlockScore: number;
}

export const DRAGON_SKINS: DragonSkin[] = [
  {
    id: 'classic',
    name: '經典水墨龍',
    badge: '🐉',
    bodyColor: '#2C1810',
    bellyColor: '#F5F0E8',
    hornColor: '#8B4513',
    eyeColor: '#E34234',
    trailColor: '#2C1810',
    description: '傳承古法宣紙韻味，剛柔相濟的水墨經典。',
    unlockScore: 0,
  },
  {
    id: 'red_flame',
    name: '赤炎墨龍',
    badge: '🔥',
    bodyColor: '#8B0000',
    bellyColor: '#FFE4E1',
    hornColor: '#E34234',
    eyeColor: '#FFD700',
    trailColor: '#E34234',
    description: '蘊含烈火墨氣，翱翔天際如赤紅流星。',
    unlockScore: 300,
  },
  {
    id: 'gold_dragon',
    name: '尊爵金龍',
    badge: '👑',
    bodyColor: '#DAA520',
    bellyColor: '#FFF8DC',
    hornColor: '#B8860B',
    eyeColor: '#8B0000',
    trailColor: '#FFD700',
    description: '輝煌金墨筆觸，彰顯王者風範與祥雲吉兆。',
    unlockScore: 600,
  },
  {
    id: 'cyan_sea',
    name: '碧海青龍',
    badge: '🌊',
    bodyColor: '#2E8B57',
    bellyColor: '#E0FFFF',
    hornColor: '#006400',
    eyeColor: '#1E90FF',
    trailColor: '#20B2AA',
    description: '如青浪出海、靈動奔逸，自帶江海清流墨痕。',
    unlockScore: 1000,
  },
];

export function getSkinById(id: string): DragonSkin {
  return DRAGON_SKINS.find((s) => s.id === id) || DRAGON_SKINS[0];
}
