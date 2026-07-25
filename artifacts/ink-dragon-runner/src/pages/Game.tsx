import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useGameControls } from '../hooks/useGameControls';
import { useGameLoop } from '../hooks/useGameLoop';
import { useAudio } from '../hooks/useAudio';

interface ScoreEntry {
  name: string;
  score: number;
  date: string;
}

const API_BASE = '/api';

async function fetchLeaderboard(): Promise<ScoreEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/scores`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function submitScore(name: string, score: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { stateRef, uiState, startGame, setGameOver } = useGameState();
  const { playJump, playHit, toggleMute, isMuted, ensureCtx } = useAudio(stateRef);
  const { onTouchStart, onTouchEnd } = useGameControls(stateRef, startGame, playJump, ensureCtx);

  useGameLoop(canvasRef, stateRef, setGameOver, playHit);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('ink-dragon-playername') || '');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Fetch leaderboard when game ends
  useEffect(() => {
    if (uiState.mode === 'DEAD') {
      setSubmitted(false);
      setShowLeaderboard(false);
      fetchLeaderboard().then(setLeaderboard);
    }
  }, [uiState.mode]);

  const handleSubmit = useCallback(async () => {
    const name = playerName.trim();
    if (!name || submitting) return;
    setSubmitting(true);
    localStorage.setItem('ink-dragon-playername', name);
    const ok = await submitScore(name, uiState.score);
    if (ok) {
      const updated = await fetchLeaderboard();
      setLeaderboard(updated);
      setSubmitted(true);
      setShowLeaderboard(true);
    }
    setSubmitting(false);
  }, [playerName, uiState.score, submitting]);

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

  const isNewRecord = uiState.isNewRecord;

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

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        title={isMuted ? '開啟音效' : '靜音'}
        className="absolute top-3 right-3 z-50 w-10 h-10 flex items-center justify-center rounded-full border border-[#3D2B1F]/30 bg-[#F5F0E8]/70 text-[#3D2B1F] hover:bg-[#F5F0E8] transition-colors shadow-sm backdrop-blur-sm"
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
        )}
      </button>

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
        <div
          className="absolute inset-0 bg-[#1A1410]/70 flex flex-col items-center justify-center text-center backdrop-blur-sm z-50 overflow-y-auto py-6"
          onClick={(e) => {
            // Only restart if clicking the backdrop, not interactive elements
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') return;
            if (!showLeaderboard) startGame();
          }}
        >
          <div
            className="border-[3px] border-[#E34234] p-8 relative rotate-[-1deg] bg-[#F5F0E8] w-full mx-4 shadow-2xl"
            style={{ maxWidth: '22rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* New record badge */}
            {isNewRecord && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E34234] text-white text-sm font-bold px-4 py-1 rounded-full shadow-md tracking-widest whitespace-nowrap">
                🏆 新紀錄！
              </div>
            )}

            <h1 className="text-4xl text-[#E34234] font-brush tracking-widest mb-6 border-b-2 border-[#E34234]/30 pb-3">
              遊戲結束
            </h1>

            {/* Score comparison */}
            <div className="mb-6 space-y-2">
              <p className="text-3xl text-[#2C1810] font-sans font-bold">
                {uiState.score}
                <span className="text-base font-normal ml-2 text-[#5A3E30]">本次距離</span>
              </p>
              <p className="text-lg text-[#2C1810]/70 font-sans">
                個人最佳：<span className={`font-bold ${isNewRecord ? 'text-[#E34234]' : ''}`}>{uiState.highScore}</span>
              </p>
            </div>

            {/* Submit to leaderboard */}
            {!submitted ? (
              <div className="mb-5 space-y-2" onClick={(e) => e.stopPropagation()}>
                <p className="text-sm text-[#5A3E30] mb-2">上傳成績到排行榜</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="你的名字"
                    maxLength={20}
                    className="flex-1 min-w-0 px-3 py-2 text-sm border border-[#3D2B1F]/30 rounded bg-white text-[#2C1810] placeholder:text-[#9A8070] focus:outline-none focus:border-[#E34234]"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!playerName.trim() || submitting}
                    className="px-4 py-2 text-sm bg-[#E34234] text-white rounded disabled:opacity-40 hover:bg-[#c73228] transition-colors whitespace-nowrap"
                  >
                    {submitting ? '…' : '送出'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#5A3E30] mb-5">✓ 成績已上傳！</p>
            )}

            {/* Toggle leaderboard */}
            <button
              onClick={() => setShowLeaderboard(v => !v)}
              className="text-sm text-[#E34234] underline mb-4 block mx-auto"
            >
              {showLeaderboard ? '收起排行榜' : '查看排行榜 Top 10'}
            </button>

            {/* Leaderboard table */}
            {showLeaderboard && leaderboard.length > 0 && (
              <div className="mb-5 w-full text-left border-t border-[#E34234]/20 pt-3">
                <p className="text-xs font-bold text-[#5A3E30] mb-2 tracking-widest text-center">🏅 排行榜</p>
                <table className="w-full text-xs text-[#2C1810]">
                  <tbody>
                    {leaderboard.map((entry, i) => (
                      <tr
                        key={i}
                        className={`border-b border-[#E34234]/10 last:border-0 ${
                          entry.name === playerName.trim() && entry.score === uiState.score
                            ? 'font-bold text-[#E34234]'
                            : ''
                        }`}
                      >
                        <td className="py-1 pr-2 w-6 text-center font-bold">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                        </td>
                        <td className="py-1 flex-1 truncate max-w-[120px]">{entry.name}</td>
                        <td className="py-1 pl-2 text-right font-mono">{entry.score}</td>
                        <td className="py-1 pl-2 text-right text-[#9A8070]">{entry.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {showLeaderboard && leaderboard.length === 0 && (
              <p className="text-xs text-[#9A8070] mb-4">還沒有人上傳成績，搶第一！</p>
            )}

            <p
              className="text-[#E34234] text-sm animate-pulse cursor-pointer border border-[#E34234]/20 inline-block px-6 py-2 rounded"
              onClick={startGame}
            >
              點擊重新開始
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
