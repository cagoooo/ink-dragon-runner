import { useEffect, useRef } from 'react';
import { GameState } from '../game/state';
import { GAME_CONFIG } from '../game/config';
import { drawBackground } from '../game/drawBackground';
import { drawDragon } from '../game/drawDragon';
import { drawObstacles } from '../game/drawObstacles';
import { drawHud } from '../game/drawHud';

const checkCollision = (state: GameState, width: number, height: number) => {
  const horizonY = height * GAME_CONFIG.HORIZON_RATIO;
  const dx = width * 0.15;
  const dw = GAME_CONFIG.DRAGON_W;
  const dh = state.dragon.isDucking ? GAME_CONFIG.DRAGON_DUCK_HEIGHT : GAME_CONFIG.DRAGON_H;
  const dy = horizonY - dh - state.dragon.y;
  
  // Dragon Hitbox (70% size, shifted center)
  const dragonRect = {
    x: dx + dw * 0.15,
    y: dy + dh * 0.15,
    w: dw * 0.7,
    h: dh * 0.7
  };

  for (const obs of state.obstacles) {
    let obsRect;
    if (obs.type === 'cactus') {
      obsRect = {
        x: obs.x + 8,
        y: horizonY - obs.height + 10,
        w: obs.width - 16,
        h: obs.height - 10
      };
    } else {
      obsRect = {
        x: obs.x + 5,
        y: horizonY - obs.y + 5,
        w: 30, 
        h: 15
      };
    }

    if (
      dragonRect.x < obsRect.x + obsRect.w &&
      dragonRect.x + dragonRect.w > obsRect.x &&
      dragonRect.y < obsRect.y + obsRect.h &&
      dragonRect.y + dragonRect.h > obsRect.y
    ) {
      return true;
    }
  }
  return false;
};

export const useGameLoop = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  stateRef: React.MutableRefObject<GameState>,
  setGameOver: () => void
) => {
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();
    let frameAccumulator = 0;

    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;
      
      // Skip huge delta times (e.g. tab was inactive)
      if (dt > 100) {
        requestRef.current = requestAnimationFrame(loop);
        return;
      }
      
      const width = canvas.width;
      const height = canvas.height;
      const state = stateRef.current;

      if (state.mode === 'PLAYING') {
        state.score += GAME_CONFIG.SCORE_INC;
        state.speed = Math.min(GAME_CONFIG.MAX_SPEED, state.speed + GAME_CONFIG.SPEED_INC);
        
        if (state.dragon.isJumping) {
          state.dragon.vy += GAME_CONFIG.GRAVITY;
          state.dragon.y -= state.dragon.vy;
          
          if (state.dragon.y <= 0) {
            state.dragon.y = 0;
            state.dragon.isJumping = false;
            state.dragon.vy = 0;
          }
        }
        
        frameAccumulator += dt;
        if (frameAccumulator > 150) {
          state.dragon.frame = (state.dragon.frame + 1) % 4;
          frameAccumulator = 0;
        }

        // Animate birds smoothly using frames
        state.obstacles.forEach(o => { if (o.type === 'bird') o.frame++; });

        state.bgOffsets[0] += state.speed * 0.05;
        state.bgOffsets[1] += state.speed * 0.12;
        state.bgOffsets[2] += state.speed * 0.25;

        state.obstacles.forEach(obs => {
          obs.x -= state.speed;
        });
        
        state.obstacles = state.obstacles.filter(obs => obs.x + obs.width > -50);

        const lastObs = state.obstacles[state.obstacles.length - 1];
        const distFromLast = lastObs ? (width - lastObs.x) : 9999;
        
        // Calculate safe jump distance to ensure obstacles don't spawn unavoidably close
        const jumpFrames = (Math.abs(GAME_CONFIG.JUMP_VY) * 2) / GAME_CONFIG.GRAVITY; 
        const jumpDistance = jumpFrames * state.speed;
        const minGap = jumpDistance + 100;
        
        if (distFromLast > minGap && Math.random() < 0.02) {
           const isBird = state.score > 300 && Math.random() < 0.35; 
           if (isBird) {
             const altitude = 110 + Math.random() * 40; // High enough to force duck
             state.obstacles.push({
               id: Math.random(),
               type: 'bird',
               x: width + 50,
               y: altitude,
               width: 40,
               height: 20,
               frame: 0,
               passed: false
             });
           } else {
             const group = Math.random() < 0.15 ? 2 : 1;
             for (let i=0; i<group; i++) {
               state.obstacles.push({
                 id: Math.random(),
                 type: 'cactus',
                 x: width + 50 + (i * 35),
                 y: 0,
                 width: GAME_CONFIG.CACTUS_W + Math.random() * 8,
                 height: 45 + Math.random() * 40,
                 frame: 0,
                 passed: false
               });
             }
           }
        }

        if (checkCollision(state, width, height)) {
          setGameOver();
        }

      } else if (state.mode === 'IDLE') {
        frameAccumulator += dt;
        if (frameAccumulator > 200) {
          state.dragon.frame = (state.dragon.frame + 1) % 4;
          frameAccumulator = 0;
        }
        state.bgOffsets[0] += 0.5;
        state.bgOffsets[1] += 1.2;
        state.bgOffsets[2] += 2.5;
      }

      // Draw Sequence
      ctx.clearRect(0, 0, width, height);
      drawBackground(ctx, state, width, height);
      drawObstacles(ctx, state, width, height);
      drawDragon(ctx, state, width, height);
      drawHud(ctx, state, width, height);

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [canvasRef, stateRef, setGameOver]);
};
