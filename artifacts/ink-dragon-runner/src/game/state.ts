import { GAME_CONFIG } from './config';
import { InkParticle } from './particles';
import { PowerUpItem } from './powerups';

export type GameMode = 'IDLE' | 'PLAYING' | 'DEAD';

export interface Obstacle {
  id: number;
  type: 'cactus' | 'bird';
  x: number;
  y: number; // For cactus: height. For bird: altitude above horizon.
  width: number;
  height: number; // Same as y for cactus, hitbox height for bird.
  frame: number;
  passed: boolean;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  flicker: number;
}

export interface GameState {
  mode: GameMode;
  score: number;
  highScore: number;
  speed: number;
  dragon: {
    y: number;
    vy: number;
    isJumping: boolean;
    isDucking: boolean;
    frame: number;
    hasShield: boolean;
    boostTimer: number; // 神龍無敵衝刺剩餘幀數
    doubleScoreTimer: number; // 雙倍得分剩餘幀數
    invincibleTimer: number; // 護盾破裂短暫無敵幀數
  };
  obstacles: Obstacle[];
  powerUps: PowerUpItem[];
  particles: InkParticle[];
  bgOffsets: number[];
  stars: Star[];
  width: number;
  height: number;
  isNewRecord?: boolean;
}

export const createInitialState = (): GameState => ({
  mode: 'IDLE',
  score: 0,
  highScore: parseInt(localStorage.getItem('ink-dragon-highscore') || '0', 10),
  speed: GAME_CONFIG.BASE_SPEED,
  dragon: {
    y: 0,
    vy: 0,
    isJumping: false,
    isDucking: false,
    frame: 0,
    hasShield: false,
    boostTimer: 0,
    doubleScoreTimer: 0,
    invincibleTimer: 0,
  },
  obstacles: [],
  powerUps: [],
  particles: [],
  bgOffsets: [0, 0, 0],
  stars: Array.from({ length: 30 }).map(() => ({
    x: Math.random(),
    y: Math.random() * 0.6,
    size: 1 + Math.random() * 2,
    alpha: Math.random(),
    flicker: 0.01 + Math.random() * 0.02
  })),
  width: window.innerWidth,
  height: window.innerHeight,
});
