import { useRef, useCallback, useState } from 'react';
import { GameState, createInitialState } from '../game/state';

export const useGameState = () => {
  const stateRef = useRef<GameState>(createInitialState());
  const [uiState, setUiState] = useState({
    mode: stateRef.current.mode,
    score: stateRef.current.score,
    highScore: stateRef.current.highScore,
    isNewRecord: false,
  });

  const syncUiState = useCallback((isNewRecord = false) => {
    setUiState({
      mode: stateRef.current.mode,
      score: Math.floor(stateRef.current.score),
      highScore: Math.floor(stateRef.current.highScore),
      isNewRecord,
    });
  }, []);

  const resetGame = useCallback(() => {
    const highScore = stateRef.current.highScore;
    stateRef.current = createInitialState();
    stateRef.current.highScore = highScore;
    stateRef.current.mode = 'PLAYING';
    syncUiState(false);
  }, [syncUiState]);

  const startGame = useCallback(() => {
    if (stateRef.current.mode === 'IDLE' || stateRef.current.mode === 'DEAD') {
      resetGame();
    }
  }, [resetGame]);

  const setGameOver = useCallback(() => {
    stateRef.current.mode = 'DEAD';
    let isNewRecord = false;
    if (stateRef.current.score > stateRef.current.highScore) {
      isNewRecord = true;
      stateRef.current.highScore = stateRef.current.score;
      localStorage.setItem('ink-dragon-highscore', Math.floor(stateRef.current.score).toString());
    }
    syncUiState(isNewRecord);
  }, [syncUiState]);

  return { stateRef, uiState, startGame, setGameOver, syncUiState };
};
