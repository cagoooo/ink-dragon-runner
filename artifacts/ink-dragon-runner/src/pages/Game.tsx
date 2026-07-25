import React, { useRef, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useGameControls } from '../hooks/useGameControls';
import { useGameLoop } from '../hooks/useGameLoop';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { stateRef, uiState, startGame, setGameOver } = useGameState();
  const { onTouchStart, onTouchEnd } = useGameControls(stateRef, startGame);
  
  useGameLoop(canvasRef, stateRef, setGameOver);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      className="relative w-full h-[100dvh] overflow-hidden select-none bg-background transition-colors duration-1000"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
      />

      {/* IDLE Screen Overlay */}
      {uiState.mode === 'IDLE' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <h1 className="text-6xl md:text-8xl text-[#8B4513] font-brush tracking-widest drop-shadow-md mb-4" style={{textShadow: '3px 3px 0px rgba(200,184,162,0.5)'}}>
            仙人掌大逃亡
          </h1>
          <h2 className="text-2xl md:text-4xl text-[#2C1810] font-sans tracking-widest mb-16 opacity-90">
            奔跑吧小墨龍
          </h2>
          <p className="text-[#3D2B1F] animate-pulse text-lg md:text-2xl border border-[#3D2B1F]/30 px-8 py-3 rounded bg-[#F5F0E8]/70 backdrop-blur-sm shadow-sm">
            點擊螢幕或按空白鍵開始
          </p>
        </div>
      )}

      {/* GAME OVER Screen Overlay */}
      {uiState.mode === 'DEAD' && (
        <div className="absolute inset-0 bg-[#1A1410]/70 flex flex-col items-center justify-center text-center backdrop-blur-sm z-50">
          <div className="border-[3px] border-[#E34234] p-10 relative rotate-[-2deg] stamp-container bg-[#F5F0E8] max-w-sm w-full mx-4 shadow-2xl">
            <h1 className="text-5xl text-[#E34234] font-brush tracking-widest mb-8 border-b-2 border-[#E34234]/30 pb-4 inline-block px-4">
              遊戲結束
            </h1>
            <p className="text-2xl text-[#2C1810] font-sans mb-3">
              最遠距離：<span className="font-bold">{Math.floor(uiState.highScore)}</span>
            </p>
            <p className="text-xl text-[#2C1810]/80 font-sans mb-10">
              本次距離：<span className="font-bold">{Math.floor(uiState.score)}</span>
            </p>
            <p className="text-[#E34234] text-lg animate-pulse cursor-pointer border border-[#E34234]/20 inline-block px-6 py-2 rounded">
              點擊螢幕重新開始
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
