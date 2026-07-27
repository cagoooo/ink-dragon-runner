import { useEffect, useRef } from 'react';
import { GameState } from '../game/state';
import { GAME_CONFIG } from '../game/config';
import { drawBackground } from '../game/drawBackground';
import { drawDragon } from '../game/drawDragon';
import { drawObstacles } from '../game/drawObstacles';
import { drawHud } from '../game/drawHud';
import {
  updateParticles,
  drawParticles,
  spawnJumpParticles,
  spawnLandParticles,
  spawnCollisionParticles,
  spawnPowerUpCollectParticles,
  createParticle,
} from '../game/particles';
import { createPowerUp, drawPowerUp } from '../game/powerups';
import { triggerBossTrial, updateBossState } from '../game/boss';

export const useGameLoop = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  stateRef: React.MutableRefObject<GameState>,
  setGameOver: () => void,
  playHit: () => void,
  playPowerUpCollect?: () => void,
  playShieldBreak?: () => void,
  playBoost?: () => void,
) => {
  const requestRef = useRef<number>(0);
  const wasJumpingRef = useRef<boolean>(false);

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

      if (dt > 100) {
        requestRef.current = requestAnimationFrame(loop);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const state = stateRef.current;
      const horizonY = height * GAME_CONFIG.HORIZON_RATIO;
      const dragonX = width * 0.15;

      if (state.mode === 'PLAYING') {
        // 得分與速度計算 (包含 2x 得分靈芝增益)
        const scoreMultiplier = state.dragon.doubleScoreTimer > 0 ? 2.0 : 1.0;
        state.score += GAME_CONFIG.SCORE_INC * scoreMultiplier;
        state.speed = Math.min(GAME_CONFIG.MAX_SPEED, state.speed + GAME_CONFIG.SPEED_INC);

        // 倒數計時器更新
        if (state.dragon.boostTimer > 0) state.dragon.boostTimer--;
        if (state.dragon.doubleScoreTimer > 0) state.dragon.doubleScoreTimer--;
        if (state.dragon.invincibleTimer > 0) state.dragon.invincibleTimer--;

        // 墨龍物理運動
        if (state.dragon.isJumping) {
          if (!wasJumpingRef.current) {
            // 剛起跳：產生起跳水墨粒子
            state.particles.push(...spawnJumpParticles(dragonX + GAME_CONFIG.DRAGON_W / 2, horizonY));
            wasJumpingRef.current = true;
          }

          state.dragon.vy += GAME_CONFIG.GRAVITY;
          state.dragon.y -= state.dragon.vy;

          if (state.dragon.y <= 0) {
            state.dragon.y = 0;
            state.dragon.isJumping = false;
            state.dragon.vy = 0;
            wasJumpingRef.current = false;
            // 剛落地：產生落地水墨粒子
            state.particles.push(...spawnLandParticles(dragonX + GAME_CONFIG.DRAGON_W / 2, horizonY));
          }
        }

        // 奔跑時沿途滴落墨點殘影
        if (!state.dragon.isJumping && Math.random() < 0.3) {
          state.particles.push(
            createParticle(
              dragonX + 15 + Math.random() * 20,
              horizonY - 2,
              -state.speed * 0.2,
              -0.5,
              2 + Math.random() * 3,
              '#2C1810',
              15
            )
          );
        }

        frameAccumulator += dt;
        if (frameAccumulator > 150) {
          state.dragon.frame = (state.dragon.frame + 1) % 4;
          frameAccumulator = 0;
        }

        // 移動背景與障礙物
        state.bgOffsets[0] += state.speed * 0.05;
        state.bgOffsets[1] += state.speed * 0.12;
        state.bgOffsets[2] += state.speed * 0.25;

        state.obstacles.forEach((obs) => {
          obs.x -= state.speed;
          if (obs.type === 'bird') obs.frame++;
        });
        state.obstacles = state.obstacles.filter((obs) => obs.x + obs.width > -50);

        // 道具生成與運動
        state.powerUps.forEach((p) => {
          p.x -= state.speed;
          p.pulseFrame++;
        });
        state.powerUps = state.powerUps.filter((p) => p.x + p.width > -50 && !p.collected);

        // 每 500 分觸發一次巨龍 BOSS 試煉關卡
        if (!state.boss.active && Math.floor(state.score) > 0 && Math.floor(state.score) % 500 === 0) {
          triggerBossTrial(state.boss, height);
        }

        // 更新 BOSS 巨龍狀態與彈道
        updateBossState(state.boss, width, height, state.dragon.y, Math.floor(state.score * 10));

        // 隨機生成障礙物 (包含水墨雷雲)
        const lastObs = state.obstacles[state.obstacles.length - 1];
        const distFromLastObs = lastObs ? width - lastObs.x : 9999;
        const minGap = (Math.abs(GAME_CONFIG.JUMP_VY) * 2 / GAME_CONFIG.GRAVITY) * state.speed + 100;

        if (distFromLastObs > minGap && Math.random() < 0.02) {
          const rand = Math.random();
          if (state.score > 250 && rand < 0.25) {
            // 生成水墨雷雲 (需要俯衝或抓精準落點)
            state.obstacles.push({
              id: Math.random(),
              type: 'thundercloud',
              x: width + 50,
              y: 85 + Math.random() * 30,
              width: 50,
              height: 35,
              frame: 0,
              passed: false,
            });
          } else if (state.score > 300 && rand < 0.5) {
            state.obstacles.push({
              id: Math.random(),
              type: 'bird',
              x: width + 50,
              y: 110 + Math.random() * 40,
              width: 40,
              height: 20,
              frame: 0,
              passed: false,
            });
          } else {
            const group = Math.random() < 0.15 ? 2 : 1;
            for (let i = 0; i < group; i++) {
              state.obstacles.push({
                id: Math.random(),
                type: 'cactus',
                x: width + 50 + i * 35,
                y: 0,
                width: GAME_CONFIG.CACTUS_W + Math.random() * 8,
                height: 45 + Math.random() * 40,
                frame: 0,
                passed: false,
              });
            }
          }
        }

        // 隨機生成水墨道具 (每隔一定距離有機率出現)
        const lastPowerUp = state.powerUps[state.powerUps.length - 1];
        const distFromLastPowerUp = lastPowerUp ? width - lastPowerUp.x : 9999;
        if (distFromLastPowerUp > 400 && Math.random() < 0.008) {
          state.powerUps.push(createPowerUp(Math.random(), width, horizonY));
        }

        // 小墨龍 Hitbox 計算
        const dh = state.dragon.isDucking ? GAME_CONFIG.DRAGON_DUCK_HEIGHT : GAME_CONFIG.DRAGON_H;
        const dy = horizonY - dh - state.dragon.y;
        const dragonRect = {
          x: dragonX + GAME_CONFIG.DRAGON_W * 0.15,
          y: dy + dh * 0.15,
          w: GAME_CONFIG.DRAGON_W * 0.7,
          h: dh * 0.7,
        };

        // 檢測道具碰撞吃取
        for (const item of state.powerUps) {
          if (!item.collected) {
            const itemRect = { x: item.x, y: item.y, w: item.width, h: item.height };
            if (
              dragonRect.x < itemRect.x + itemRect.w &&
              dragonRect.x + dragonRect.w > itemRect.x &&
              dragonRect.y < itemRect.y + itemRect.h &&
              dragonRect.y + dragonRect.h > itemRect.y
            ) {
              item.collected = true;
              if (playPowerUpCollect) playPowerUpCollect();

              let particleColor = '#DAA520';
              if (item.type === 'shield') {
                state.dragon.hasShield = true;
                particleColor = '#4682B4';
              } else if (item.type === 'boost') {
                state.dragon.boostTimer = 300; // 5 秒無敵衝刺
                if (playBoost) playBoost();
                particleColor = '#E34234';
              } else if (item.type === 'double_score') {
                state.dragon.doubleScoreTimer = 480; // 8 秒 2x 分數
                particleColor = '#DAA520';
              }

              state.particles.push(
                ...spawnPowerUpCollectParticles(item.x + item.width / 2, item.y + item.height / 2, particleColor)
              );
            }
          }
        }

        // 檢測障礙物碰撞
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
          const obs = state.obstacles[i];
          const obsRect =
            obs.type === 'cactus'
              ? { x: obs.x + 8, y: horizonY - obs.height + 10, w: obs.width - 16, h: obs.height - 10 }
              : { x: obs.x + 5, y: horizonY - obs.y + 5, w: 30, h: 15 };

          const isCollided =
            dragonRect.x < obsRect.x + obsRect.w &&
            dragonRect.x + dragonRect.w > obsRect.x &&
            dragonRect.y < obsRect.y + obsRect.h &&
            dragonRect.y + dragonRect.h > obsRect.y;

          if (isCollided) {
            if (state.dragon.boostTimer > 0) {
              // 在神龍無敵衝刺狀態下：直接撞碎障礙物！
              state.particles.push(...spawnCollisionParticles(obsRect.x + obsRect.w / 2, obsRect.y + obsRect.h / 2));
              state.obstacles.splice(i, 1);
            } else if (state.dragon.invincibleTimer > 0) {
              // 無敵防禦冷卻中，忽略傷害
            } else if (state.dragon.hasShield) {
              // 消耗護盾：觸發護盾碎裂粒子與音效，開啟 0.5 秒防禦冷卻
              state.dragon.hasShield = false;
              state.dragon.invincibleTimer = 30; // 30 幀無敵
              if (playShieldBreak) playShieldBreak();
              state.particles.push(...spawnCollisionParticles(obsRect.x + obsRect.w / 2, obsRect.y + obsRect.h / 2));
            } else {
              // 無護盾且無衝刺：撞擊死亡
              state.particles.push(...spawnCollisionParticles(dragonRect.x + dragonRect.w / 2, dragonRect.y + dragonRect.h / 2));
              playHit();
              setGameOver();
              break;
            }
          }
        }

        // 更新所有粒子運動
        state.particles = updateParticles(state.particles, state.speed);

      } else if (state.mode === 'IDLE') {
        frameAccumulator += dt;
        if (frameAccumulator > 200) {
          state.dragon.frame = (state.dragon.frame + 1) % 4;
          frameAccumulator = 0;
        }
        state.bgOffsets[0] += 0.5;
        state.bgOffsets[1] += 1.2;
        state.bgOffsets[2] += 2.5;
        state.particles = updateParticles(state.particles, 1);
      }

      // 畫面繪製序列
      ctx.clearRect(0, 0, width, height);
      drawBackground(ctx, state, width, height);

      // 繪製道具
      state.powerUps.forEach((item) => drawPowerUp(ctx, item));

      drawObstacles(ctx, state, width, height);

      // 繪製水墨粒子 (在墨龍與障礙物之間/上方)
      drawParticles(ctx, state.particles);

      drawDragon(ctx, state, width, height);
      drawHud(ctx, state, width, height);

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [canvasRef, stateRef, setGameOver, playHit, playPowerUpCollect, playShieldBreak, playBoost]);
};
