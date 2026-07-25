import { useEffect, useCallback } from 'react';
import { GameState } from '../game/state';
import { GAME_CONFIG } from '../game/config';

export const useGameControls = (
  stateRef: React.MutableRefObject<GameState>,
  startGame: () => void,
  playJump: () => void,
  ensureAudioCtx: () => void,
) => {
  
  const handleJump = useCallback(() => {
    if (stateRef.current.mode !== 'PLAYING') {
      ensureAudioCtx();
      startGame();
      return;
    }
    if (!stateRef.current.dragon.isJumping) {
      stateRef.current.dragon.isJumping = true;
      stateRef.current.dragon.vy = GAME_CONFIG.JUMP_VY;
      stateRef.current.dragon.isDucking = false;
      playJump();
    }
  }, [stateRef, startGame, playJump, ensureAudioCtx]);

  const handleDuck = useCallback((isDucking: boolean) => {
    if (stateRef.current.mode === 'PLAYING') {
      if (!stateRef.current.dragon.isJumping) {
        stateRef.current.dragon.isDucking = isDucking;
      }
    }
  }, [stateRef]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleDuck(true);
      }
    };
    
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleDuck(false);
      }
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleJump, handleDuck]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (stateRef.current.mode !== 'PLAYING') {
      ensureAudioCtx();
      startGame();
      return;
    }
    const touchY = e.touches[0].clientY;
    if (touchY < window.innerHeight / 2) {
      handleJump();
    } else {
      handleDuck(true);
    }
  }, [stateRef, startGame, handleJump, handleDuck, ensureAudioCtx]);

  const onTouchEnd = useCallback((_e: React.TouchEvent) => {
    handleDuck(false);
  }, [handleDuck]);

  return { onTouchStart, onTouchEnd, handleJump };
};
