import { useRef, useCallback, useState } from 'react';
import { GameState, createInitialState } from '../game/state';

export const useGameState = () => {
  const stateRef = useRef<GameState>(createInitialState());
  const [uiState, setUiState] = useState({
    mode: stateRef.current.mode,
    score: stateRef.current.score,
    highScore: stateRef.current.highScore,
  });

  const syncUiState = useCallback(() => {
    setUiState({
      mode: stateRef.current.mode,
      score: Math.floor(stateRef.current.score),
      highScore: Math.floor(stateRef.current.highScore),
    });
  }, []);

  const resetGame = useCallback(() => {
    const highScore = stateRef.current.highScore;
    stateRef.current = createInitialState();
    stateRef.current.highScore = highScore;
    stateRef.current.mode = 'PLAYING';
    syncUiState();
  }, [syncUiState]);

  const startGame = useCallback(() => {
    if (stateRef.current.mode === 'IDLE' || stateRef.current.mode === 'DEAD') {
      resetGame();
    }
  }, [resetGame]);

  const setGameOver = useCallback(() => {
    stateRef.current.mode = 'DEAD';
    if (stateRef.current.score > stateRef.current.highScore) {
      stateRef.current.highScore = stateRef.current.score;
      localStorage.setItem('ink-dragon-highscore', Math.floor(stateRef.current.score).toString());
    }
    syncUiState();
  }, [syncUiState]);

  return { stateRef, uiState, startGame, setGameOver, syncUiState };
};
